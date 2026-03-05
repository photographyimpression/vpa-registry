import styles from './DigitalSeal.module.css';

export default function DigitalSeal() {
    const timestamp = new Date().toUTCString();
    const chars = `ISSUED BY VPA AUTHORITY PROTOCOL • ${timestamp} • `.split("");

    return (
        <div className={styles.sealWrapper}>
            <div className={styles.sealContainer}>
                {/* Circular Timestamp Lettering */}
                <div className={styles.circularText}>
                    {chars.map((char, i) => (
                        <span
                            key={i}
                            style={{
                                transform: `rotate(${i * (360 / chars.length)}deg)`,
                                position: 'absolute',
                                left: '50%',
                                transformOrigin: '0 110px'
                            }}
                        >
                            {char}
                        </span>
                    ))}
                </div>

                <div className={styles.innerSeal}>
                    <svg viewBox="0 0 100 100" className={styles.sealSvg}>
                        <circle cx="50" cy="50" r="48" className={styles.outerRing} />
                        <circle cx="50" cy="50" r="42" className={styles.innerRing} />
                        <path
                            d="M50 25 L65 35 L65 55 C65 65 50 75 50 75 C50 75 35 65 35 55 L35 35 Z"
                            className={styles.shield}
                        />
                        <path d="M43 50 L48 55 L57 45" className={styles.check} />
                    </svg>
                    <div className={styles.shimmer}></div>
                </div>
            </div>
            <div className={styles.sealInfo}>
                <span className={styles.verifyBadge}>AUTHENTICITY GUARANTEED</span>
                <span className={styles.timestamp}>{timestamp}</span>
            </div>
        </div>
    );
}
