"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ShoppingBag, Globe, Copy, Check, ArrowRight, ExternalLink } from "lucide-react";
import styles from "./Connect.module.css";

export default function ConnectPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = params.token;

  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  // WooCommerce form state
  const [wooUrl, setWooUrl] = useState("");
  const [wooKey, setWooKey] = useState("");
  const [wooSecret, setWooSecret] = useState("");
  const [wooError, setWooError] = useState("");
  const [wooLoading, setWooLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/onboard/${token}/connect`)}`);
    }
  }, [status, router, token]);

  // Activate prospect on first authenticated visit
  useEffect(() => {
    if (status === "authenticated" && !activated && !activating) {
      setActivating(true);
      fetch(`/api/onboard/${token}/activate`, { method: "POST" })
        .then((res) => res.json())
        .then(() => setActivated(true))
        .catch(() => {
          // Activation failed silently — user can still connect
        })
        .finally(() => setActivating(false));
    }
  }, [status, token, activated, activating]);

  const vpaId = `VPA-${(token || "").substring(0, 8).toUpperCase()}`;

  const handleCopy = async () => {
    const snippet = `<script src="https://vparegistry.com/badge.js" data-vpa-id="${vpaId}"></script>`;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: select text
    }
  };

  const handleShopifyConnect = () => {
    setProcessing(true);
    router.push("/api/integrations/shopify/auth");
  };

  const handleWooConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setWooError("");

    if (!wooUrl || !wooKey || !wooSecret) {
      setWooError("All fields are required.");
      return;
    }

    setWooLoading(true);
    try {
      const res = await fetch("/api/integrations/woocommerce/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeUrl: wooUrl,
          apiKey: wooKey,
          apiSecret: wooSecret,
          token,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Connection failed");
      }

      setProcessing(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err) {
      setWooError(err instanceof Error ? err.message : "Connection failed. Please check your credentials.");
    } finally {
      setWooLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className={styles.page}>
        <div className={styles.content} style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
          <div className={styles.progressSpinner} />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        {/* NAV */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>VPA Registry</Link>
          <div className={styles.stepIndicator}>
            <span className={styles.stepDot} />
            Step 2 of 2
          </div>
        </nav>

        {/* HEADER */}
        <div className={styles.header}>
          <h1>Connect your website</h1>
          <p>
            Choose how you want to add VPA verification badges to your store.
            Pick the option that matches your platform.
          </p>
        </div>

        {/* INTEGRATION OPTIONS */}
        <div className={styles.integrationGrid}>
          {/* SHOPIFY */}
          <div className={styles.integrationCard}>
            <div className={styles.cardHeader}>
              <div className={`${styles.cardIcon} ${styles.shopifyIcon}`}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <div className={styles.cardTitle}>Shopify</div>
                <div className={styles.cardSubtitle}>Recommended &mdash; one-click setup</div>
              </div>
            </div>
            <p className={styles.cardDescription}>
              Connect your Shopify store instantly. We will automatically scan your products
              and add VPA verification badges to every listing.
            </p>
            <button
              className={`${styles.connectBtn} ${styles.shopifyBtn}`}
              onClick={handleShopifyConnect}
            >
              Connect Shopify <ExternalLink size={16} />
            </button>
          </div>

          {/* WOOCOMMERCE */}
          <div className={styles.integrationCard}>
            <div className={styles.cardHeader}>
              <div className={`${styles.cardIcon} ${styles.wooIcon}`}>W</div>
              <div>
                <div className={styles.cardTitle}>WooCommerce</div>
                <div className={styles.cardSubtitle}>Enter your store credentials</div>
              </div>
            </div>
            <p className={styles.cardDescription}>
              Enter your WooCommerce REST API credentials below. You can find these
              in WooCommerce &rarr; Settings &rarr; Advanced &rarr; REST API.
            </p>
            <form className={styles.wooForm} onSubmit={handleWooConnect}>
              <div className={styles.inputGroup}>
                <label htmlFor="woo-url">Store URL</label>
                <input
                  id="woo-url"
                  type="url"
                  placeholder="https://yourstore.com"
                  value={wooUrl}
                  onChange={(e) => setWooUrl(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="woo-key">Consumer Key</label>
                <input
                  id="woo-key"
                  type="text"
                  placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={wooKey}
                  onChange={(e) => setWooKey(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="woo-secret">Consumer Secret</label>
                <input
                  id="woo-secret"
                  type="password"
                  placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={wooSecret}
                  onChange={(e) => setWooSecret(e.target.value)}
                  required
                />
              </div>
              {wooError && <p className={styles.formError}>{wooError}</p>}
              <button
                type="submit"
                className={`${styles.connectBtn} ${styles.wooBtn}`}
                disabled={wooLoading}
              >
                {wooLoading ? "Connecting..." : "Connect WooCommerce"}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* OTHER WEBSITE */}
          <div className={styles.integrationCard}>
            <div className={styles.cardHeader}>
              <div className={`${styles.cardIcon} ${styles.otherIcon}`}>
                <Globe size={24} />
              </div>
              <div>
                <div className={styles.cardTitle}>Other Website</div>
                <div className={styles.cardSubtitle}>Add a script tag to your site</div>
              </div>
            </div>
            <p className={styles.cardDescription}>
              Copy and paste this snippet into your website&apos;s HTML, just before the
              closing <code>&lt;/body&gt;</code> tag. The badge will appear automatically on your product pages.
            </p>
            <div className={styles.snippetContainer}>
              <p className={styles.snippetLabel}>Your embed code:</p>
              <div className={styles.snippet}>
                <code className={styles.snippetCode}>
                  {`<script src="https://vparegistry.com/badge.js" data-vpa-id="${vpaId}"></script>`}
                </code>
                <button className={styles.copyBtn} onClick={handleCopy} type="button">
                  {copied ? (
                    <>
                      <Check size={14} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROCESSING OVERLAY */}
      {processing && (
        <div className={styles.progressOverlay}>
          <div className={styles.progressCard}>
            <div className={styles.progressSpinner} />
            <h3>Processing your product images...</h3>
            <p>
              We are scanning your store and generating VPA certificates for each product.
              This usually takes a minute or two.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
