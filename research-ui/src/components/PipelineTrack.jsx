import React from 'react';
import { PIPELINE_STEPS, STATUS } from '../utils/constants';
import styles from './PipelineTrack.module.css';

function StepDot({ step, stepDef, index, isLast }) {
  const status = step.status;

  return (
    <div className={styles.stepWrapper}>
      <div className={`${styles.dot} ${styles['dot_' + status]}`}>
        {status === STATUS.RUNNING ? (
          <span className={styles.spinner} aria-label="Running" />
        ) : status === STATUS.DONE ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : status === STATUS.ERROR ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <span className={styles.dotIndex}>{index + 1}</span>
        )}
      </div>

      <div className={styles.labelGroup}>
        <span className={`${styles.label} ${styles['label_' + status]}`}>
          {stepDef.shortLabel}
        </span>
        {step.elapsedMs !== null && status === STATUS.DONE && (
          <span className={styles.elapsed}>{(step.elapsedMs / 1000).toFixed(1)}s</span>
        )}
      </div>

      {!isLast && (
        <div className={styles.connector}>
          <div
            className={`${styles.connectorFill} ${
              status === STATUS.DONE ? styles.connectorDone : ''
            } ${status === STATUS.RUNNING ? styles.connectorRunning : ''}`}
          />
        </div>
      )}
    </div>
  );
}

export default function PipelineTrack({ steps }) {
  const doneCount = steps.filter((s) => s.status === STATUS.DONE).length;
  const progress = Math.round((doneCount / steps.length) * 100);

  return (
    <div className={styles.track} role="list" aria-label="Pipeline progress">
      <div className={styles.steps}>
        {steps.map((step, i) => (
          <StepDot
            key={step.id}
            step={step}
            stepDef={PIPELINE_STEPS[i]}
            index={i}
            isLast={i === steps.length - 1}
          />
        ))}
      </div>
      <div className={styles.progressBar} aria-label={`${progress}% complete`}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
