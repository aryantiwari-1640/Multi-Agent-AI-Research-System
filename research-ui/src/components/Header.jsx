import React from 'react';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoGroup}>
        <div className={styles.logoBadge}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="4" r="2" fill="currentColor" />
            <circle cx="4" cy="14" r="2" fill="currentColor" />
            <circle cx="16" cy="14" r="2" fill="currentColor" />
            <line x1="10" y1="6" x2="4" y2="12" stroke="currentColor" strokeWidth="1.2" />
            <line x1="10" y1="6" x2="16" y2="12" stroke="currentColor" strokeWidth="1.2" />
            <line x1="6" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>
        <div>
          <h1 className={styles.title}>Research Pipeline</h1>
          <p className={styles.subtitle}>Multi-Agent AI System</p>
        </div>
      </div>
      <div className={styles.meta}>
        <span className={styles.pill}>Gemini 2.5 Flash</span>
        <span className={styles.pill}>4 Agents</span>
      </div>
    </header>
  );
}
