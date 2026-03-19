"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Award, ShieldBan, Star, ArrowRight, CheckCircle } from "lucide-react";
import styles from "./Onboard.module.css";
import type { ProspectData } from "@/app/api/onboard/[token]/route";

export default function OnboardLandingPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [prospect, setProspect] = useState<ProspectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/onboard/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("not_found");
        return res.json();
      })
      .then((data: ProspectData) => setProspect(data))
      .catch(() => setError("not_found"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (error || !prospect) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <ShieldCheck size={48} style={{ color: "var(--accent-color)", marginBottom: "1.5rem" }} />
          <h1>Link Expired</h1>
          <p>
            This onboarding link is no longer valid. It may have expired or already been used.
            Please contact us for a new invitation.
          </p>
          <Link href="/" className={styles.errorLink}>
            Visit VPA Registry <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  if (prospect.alreadyActivated) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <CheckCircle size={48} style={{ color: "#22c55e", marginBottom: "1.5rem" }} />
          <h1>Already Activated</h1>
          <p>
            Great news — {prospect.businessName} is already set up on VPA Registry.
            Head to your dashboard to manage your certification.
          </p>
          <Link href="/dashboard" className={styles.errorLink}>
            Go to Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const ctaUrl = `/login?callbackUrl=${encodeURIComponent(`/onboard/${token}/connect`)}`;

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        {/* NAV */}
        <nav className={styles.nav}>
          <span className={styles.logo}>VPA Registry</span>
          <span className={styles.navBadge}>Invitation</span>
        </nav>

        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeIcon}>VPA</span>
            <span>Exclusive invitation for your business</span>
          </div>
          <h1 className={styles.businessName}>{prospect.businessName}</h1>
          <h2 className={styles.headline}>
            Your products, now{" "}
            <span className={styles.headlineAccent}>verified.</span>
          </h2>
          <p className={styles.heroSubtitle}>
            Join the trusted network of certified businesses. Get your VPA authenticity badge
            and show customers your products are the real deal.
          </p>
        </section>

        {/* PREVIEW IMAGE */}
        {prospect.previewImageUrl && (
          <section className={styles.previewSection}>
            <div className={styles.previewFrame}>
              <div className={styles.previewHeader}>
                <div className={styles.previewDots}>
                  <span /><span /><span />
                </div>
                <div className={styles.previewUrl}>{prospect.website || "yourstore.com"}</div>
              </div>
              <div className={styles.previewBody}>
                <Image
                  src={prospect.previewImageUrl}
                  alt={`${prospect.businessName} VPA badge preview`}
                  width={720}
                  height={400}
                  className={styles.previewImage}
                  priority
                />
                <div className={styles.previewBadge}>VPA Verified</div>
              </div>
            </div>
          </section>
        )}

        {/* VALUE PROPS */}
        <section className={styles.valueSection}>
          <h3 className={styles.valueSectionTitle}>Why businesses choose VPA</h3>
          <div className={styles.valueGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <ShieldCheck size={24} />
              </div>
              <h3>Build Customer Trust</h3>
              <p>
                Customers see the VPA badge and know your products are authentic.
                Verified businesses see up to 23% higher conversion rates.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <ShieldBan size={24} />
              </div>
              <h3>Stop Counterfeits</h3>
              <p>
                Every product gets a cryptographic certificate. If someone copies your photos,
                customers can instantly check authenticity.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Award size={24} />
              </div>
              <h3>Stand Out From Competitors</h3>
              <p>
                The VPA badge signals premium quality. Differentiate your business
                in a crowded marketplace with verified certification.
              </p>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className={styles.socialProof}>
          <p className={styles.socialProofText}>
            Join{" "}
            <span className={styles.socialProofHighlight}>47 {prospect.city || "Montreal"} {prospect.industry || "businesses"}</span>
            {" "}already using VPA certification to build customer trust.
          </p>
        </section>

        {/* CTA */}
        <section id="signup" className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <h3 className={styles.ctaTitle}>
              {prospect.tier === "free"
                ? "Get started for free"
                : "Get VPA Certified"}
            </h3>
            <p className={styles.ctaSubtitle}>
              Set up takes less than 5 minutes. Connect your store and your VPA badges
              appear automatically on every product.
            </p>

            {prospect.tier === "paid" && (
              <div className={styles.ctaPrice}>
                $49<span className={styles.ctaPriceUnit}>/mo</span>
              </div>
            )}

            <Link href={ctaUrl} className={`${styles.ctaButton} ${prospect.tier === "free" ? styles.ctaButtonFree : ""}`}>
              {prospect.tier === "free"
                ? "Get Your Free VPA Badge"
                : "Get VPA Certified — $49/mo"}
              <ArrowRight size={20} />
            </Link>

            {prospect.tier === "paid" && (
              <span className={styles.ctaFomo}>
                90% of businesses in your area got this for free
              </span>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className={styles.howSection}>
          <h3 className={styles.howTitle}>How it works</h3>
          <div className={styles.howGrid}>
            <div className={styles.howStep}>
              <div className={styles.howNumber}>1</div>
              <h4>Click to sign up</h4>
              <p>Create your free VPA account in seconds with Google or email.</p>
            </div>
            <div className={styles.howStep}>
              <div className={styles.howNumber}>2</div>
              <h4>Connect your website</h4>
              <p>Link your Shopify, WooCommerce, or any website with one click.</p>
            </div>
            <div className={styles.howStep}>
              <div className={styles.howNumber}>3</div>
              <h4>Badges appear automatically</h4>
              <p>VPA scans your products and adds verified badges. You are done.</p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <p>VPA Registry &mdash; The global standard in product authenticity.</p>
        </footer>
      </div>
    </div>
  );
}
