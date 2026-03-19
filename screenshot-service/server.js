const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 8080;
const SCREENSHOT_SECRET = process.env.SCREENSHOT_SECRET;

app.use(express.json({ limit: "1mb" }));

// ---------------------------------------------------------------------------
// Auth middleware – every request must carry the shared secret
// ---------------------------------------------------------------------------
function requireSecret(req, res, next) {
  if (!SCREENSHOT_SECRET) {
    // If the env var is not set, reject all requests rather than running open
    return res
      .status(500)
      .json({ error: "SCREENSHOT_SECRET is not configured" });
  }
  const provided = req.headers["x-vpa-secret"];
  if (provided !== SCREENSHOT_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ---------------------------------------------------------------------------
// GET /health – lightweight liveness probe (no auth required)
// ---------------------------------------------------------------------------
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ---------------------------------------------------------------------------
// POST /screenshot
// ---------------------------------------------------------------------------
app.post("/screenshot", requireSecret, async (req, res) => {
  const { url, selector, width, height } = req.body || {};

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'url' field" });
  }

  // Basic URL validation
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return res.status(400).json({ error: "Only http and https URLs are supported" });
  }

  const viewportWidth = Number(width) || 1280;
  const viewportHeight = Number(height) || 800;

  let browser = null;
  let page = null;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    page = await browser.newPage();
    await page.setViewport({ width: viewportWidth, height: viewportHeight });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30_000,
    });

    let screenshotBuffer;
    let imgWidth = viewportWidth;
    let imgHeight = viewportHeight;

    if (selector) {
      const element = await page.$(selector);
      if (!element) {
        return res
          .status(400)
          .json({ error: `Selector "${selector}" not found on page` });
      }
      const box = await element.boundingBox();
      if (!box) {
        return res
          .status(400)
          .json({ error: `Selector "${selector}" has no visible bounding box` });
      }
      screenshotBuffer = await element.screenshot({ type: "png" });
      imgWidth = Math.round(box.width);
      imgHeight = Math.round(box.height);
    } else {
      screenshotBuffer = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: viewportWidth, height: viewportHeight },
      });
    }

    const base64 = screenshotBuffer.toString("base64");

    res.json({
      image: base64,
      width: imgWidth,
      height: imgHeight,
    });
  } catch (err) {
    console.error("Screenshot error:", err);

    const message =
      err.name === "TimeoutError"
        ? "Navigation timed out after 30 seconds"
        : err.message || "Screenshot failed";

    res.status(500).json({ error: message });
  } finally {
    // Always clean up resources
    try {
      if (page) await page.close();
    } catch {
      /* ignore */
    }
    try {
      if (browser) await browser.close();
    } catch {
      /* ignore */
    }
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Screenshot service listening on port ${PORT}`);
});
