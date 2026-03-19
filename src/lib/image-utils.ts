import sharp from 'sharp';

/**
 * Creates a side-by-side "Before / After" comparison image.
 *
 * - Left side: original image with "Before" label
 * - Right side: badged image with "After" label
 * - Thin vertical divider line between them
 * - Labels are white text on a semi-transparent black background
 * - Total output width capped at 1600px
 * - Returns a PNG buffer
 */
export async function createBeforeAfter(
    originalBuffer: Buffer,
    badgedBuffer: Buffer
): Promise<Buffer> {
    const originalMeta = await sharp(originalBuffer).metadata();
    const origW = originalMeta.width || 800;
    const origH = originalMeta.height || 600;

    // Determine panel dimensions (each panel is half the total width)
    const maxTotalWidth = 1600;
    const panelWidth = Math.min(origW, maxTotalWidth / 2);
    const panelHeight = Math.round((panelWidth / origW) * origH);
    const totalWidth = panelWidth * 2;
    const dividerWidth = 2;

    // Resize both images to the same panel dimensions
    const leftImage = await sharp(originalBuffer)
        .resize(panelWidth, panelHeight, { fit: 'cover' })
        .png()
        .toBuffer();

    const rightImage = await sharp(badgedBuffer)
        .resize(panelWidth, panelHeight, { fit: 'cover' })
        .png()
        .toBuffer();

    // Build label overlays
    const labelFontSize = Math.max(14, Math.floor(panelWidth * 0.035));
    const labelHeight = labelFontSize + 16;
    const labelPadding = 12;

    const beforeLabel = buildLabelSvg('Before', labelFontSize, labelHeight, labelPadding);
    const afterLabel = buildLabelSvg('After', labelFontSize, labelHeight, labelPadding);

    // Build vertical divider
    const divider = await sharp({
        create: {
            width: dividerWidth,
            height: panelHeight,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
    })
        .png()
        .toBuffer();

    // Compose final image
    return sharp({
        create: {
            width: totalWidth,
            height: panelHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 1 },
        },
    })
        .composite([
            // Left panel (original)
            { input: leftImage, top: 0, left: 0 },
            // Right panel (badged)
            { input: rightImage, top: 0, left: panelWidth },
            // Divider line
            { input: divider, top: 0, left: panelWidth - 1 },
            // "Before" label — top-left of left panel
            { input: Buffer.from(beforeLabel), top: labelPadding, left: labelPadding },
            // "After" label — top-left of right panel
            { input: Buffer.from(afterLabel), top: labelPadding, left: panelWidth + labelPadding },
        ])
        .png()
        .toBuffer();
}

/**
 * Builds a small SVG label with white text on a semi-transparent black
 * rounded-rectangle background.
 */
function buildLabelSvg(
    text: string,
    fontSize: number,
    height: number,
    _padding: number
): string {
    const width = text.length * fontSize * 0.7 + 24;

    return `<svg width="${Math.ceil(width)}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${Math.ceil(width)}" height="${height}" rx="4"
            fill="rgba(0,0,0,0.6)" />
        <text x="${Math.ceil(width) / 2}" y="${height / 2 + fontSize * 0.35}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${fontSize}" font-weight="bold"
            fill="#FFFFFF" text-anchor="middle">${text}</text>
    </svg>`;
}
