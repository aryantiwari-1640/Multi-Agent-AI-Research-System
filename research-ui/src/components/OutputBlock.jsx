import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { STATUS } from '../utils/constants';
import styles from './OutputBlock.module.css';

export default function OutputBlock({ stepDef, step, criticMeta }) {
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef(null);

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (step.status === STATUS.RUNNING && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [step.output, step.status]);

  const handleCopy = () => {
    if (!step.output) return;
    navigator.clipboard.writeText(step.output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const isCritic = stepDef.id === 'critic';
  const showScore = isCritic && criticMeta?.score !== null;

  return (
    <section className={`${styles.block} ${styles['block_' + step.status]}`} aria-label={stepDef.label}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.icon} style={{ color: stepDef.color }}>
            {stepDef.icon}
          </span>
          <span className={styles.title}>{stepDef.label}</span>
          <StatusBadge status={step.status} />
        </div>
        <div className={styles.headerActions}>
          {step.elapsedMs !== null && step.status === STATUS.DONE && (
            <span className={styles.elapsed}>{(step.elapsedMs / 1000).toFixed(1)}s</span>
          )}
          {step.output && (
            <button
              className={styles.copyBtn}
              onClick={handleCopy}
              title="Copy to clipboard"
              aria-label="Copy output"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          )}
        </div>
      </div>

      {/* Score card for critic */}
      {isCritic && showScore && (
        <div className={styles.scoreCard}>
          <div className={styles.scoreLeft}>
            <span className={styles.scoreLabel}>Score</span>
            <span
              className={styles.scoreNum}
              style={{
                color:
                  criticMeta.score >= 7
                    ? 'var(--success)'
                    : criticMeta.score >= 5
                    ? 'var(--warning)'
                    : 'var(--danger)',
              }}
            >
              {criticMeta.score}
              <span className={styles.scoreDenom}>/10</span>
            </span>
          </div>
          {criticMeta.verdict && (
            <div className={styles.scoreRight}>
              <span className={styles.scoreLabel}>Verdict</span>
              <p className={styles.verdict}>{criticMeta.verdict}</p>
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className={styles.body} ref={bodyRef}>
        {step.status === STATUS.IDLE ? (
          <p className={styles.emptyState}>
            <span className={styles.emptyIcon}>{stepDef.icon}</span>
            <span>{stepDef.description}</span>
          </p>
        ) : step.status === STATUS.ERROR ? (
          <p className={styles.errorState}>
            <ErrorIcon />
            {step.error || 'An error occurred'}
          </p>
        ) : step.output ? (
          <div className={styles.markdown}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.output}</ReactMarkdown>
            {step.status === STATUS.RUNNING && <span className={styles.cursor} />}
          </div>
        ) : (
          <p className={styles.streamingPlaceholder}>
            <span className={styles.spinner} />
            <span>Processing…</span>
          </p>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status }) {
  const labels = {
    [STATUS.IDLE]: 'Pending',
    [STATUS.RUNNING]: 'Running',
    [STATUS.DONE]: 'Done',
    [STATUS.ERROR]: 'Error',
  };
  return (
    <span className={`${styles.badge} ${styles['badge_' + status]}`}>
      {labels[status]}
    </span>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 10V2h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
