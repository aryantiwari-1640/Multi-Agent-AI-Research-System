import React, { useState, useRef } from 'react';
import { PIPELINE_STEPS, STATUS } from '../utils/constants';
import styles from './TopicInput.module.css';

const EXAMPLES = [
  'Latest advances in quantum computing 2025',
  'Impact of AI on healthcare diagnostics',
  'Climate change mitigation strategies',
  'Future of electric vehicle batteries',
  'Large language model alignment research',
];

export default function TopicInput({ steps, isRunning, onRun, onAbort, onReset }) {
  const [topic, setTopic] = useState('');
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleRun();
    }
  };

  const handleRun = () => {
    const t = topic.trim();
    if (!t || isRunning) return;
    onRun(t);
  };

  const handleExample = (ex) => {
    setTopic(ex);
    textareaRef.current?.focus();
  };

  const allDone = steps.every((s) => s.status === STATUS.DONE);
  const hasError = steps.some((s) => s.status === STATUS.ERROR);

  return (
    <aside className={styles.panel}>
      <div className={styles.section}>
        <label className={styles.sectionLabel} htmlFor="topic-input">
          Research Topic
        </label>
        <textarea
          ref={textareaRef}
          id="topic-input"
          className={styles.textarea}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a topic to research…"
          rows={4}
          disabled={isRunning}
          aria-label="Research topic"
        />
        <p className={styles.hint}>
          {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to run
        </p>
      </div>

      <div className={styles.actions}>
        {isRunning ? (
          <button className={`${styles.btn} ${styles.btnAbort}`} onClick={onAbort}>
            <StopIcon />
            Stop pipeline
          </button>
        ) : (
          <button
            className={`${styles.btn} ${styles.btnRun}`}
            onClick={handleRun}
            disabled={!topic.trim()}
          >
            <PlayIcon />
            Run research pipeline
          </button>
        )}
        {(allDone || hasError) && !isRunning && (
          <button className={`${styles.btn} ${styles.btnReset}`} onClick={onReset}>
            <ResetIcon />
            Reset
          </button>
        )}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Examples</p>
        <ul className={styles.exampleList}>
          {EXAMPLES.map((ex) => (
            <li key={ex}>
              <button
                className={styles.exampleBtn}
                onClick={() => handleExample(ex)}
                disabled={isRunning}
              >
                <span className={styles.exampleArrow}>→</span>
                {ex}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Agent Status</p>
        <ul className={styles.agentList}>
          {steps.map((step, i) => {
            const def = PIPELINE_STEPS[i];
            return (
              <li key={step.id} className={`${styles.agentItem} ${styles['agent_' + step.status]}`}>
                <span className={styles.agentIcon} style={{ color: def.color }}>
                  {def.icon}
                </span>
                <div className={styles.agentBody}>
                  <span className={styles.agentName}>{def.label}</span>
                  <span className={styles.agentDesc}>
                    {step.status === STATUS.RUNNING
                      ? 'Processing…'
                      : step.status === STATUS.DONE
                      ? `Done${step.elapsedMs ? ` · ${(step.elapsedMs / 1000).toFixed(1)}s` : ''}`
                      : step.status === STATUS.ERROR
                      ? step.error || 'Error'
                      : def.description}
                  </span>
                </div>
                <StatusDot status={step.status} />
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

function StatusDot({ status }) {
  return (
    <span
      className={`${styles.statusDot} ${styles['statusDot_' + status]}`}
      aria-label={status}
    />
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 2l9 5-9 5V2z" fill="currentColor" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="10" height="10" rx="2" fill="currentColor" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7a5 5 0 1 0 1-3M2 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
