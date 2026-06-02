import React from 'react';
import { PIPELINE_STEPS } from '../utils/constants';
import OutputBlock from './OutputBlock';
import styles from './ResultsPanel.module.css';

export default function ResultsPanel({ steps, criticMeta }) {
  return (
    <main className={styles.panel} aria-label="Pipeline results">
      <div className={styles.grid}>
        {steps.map((step, i) => (
          <OutputBlock
            key={step.id}
            stepDef={PIPELINE_STEPS[i]}
            step={step}
            criticMeta={i === 3 ? criticMeta : null}
          />
        ))}
      </div>
    </main>
  );
}
