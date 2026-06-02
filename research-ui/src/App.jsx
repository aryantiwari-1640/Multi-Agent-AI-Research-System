import React from 'react';
import { usePipeline } from './hooks/usePipeline';
import Header from './components/Header';
import PipelineTrack from './components/PipelineTrack';
import TopicInput from './components/TopicInput';
import ResultsPanel from './components/ResultsPanel';
import styles from './App.module.css';

export default function App() {
  const { steps, isRunning, criticMeta, run, reset, abort } = usePipeline();

  return (
    <div className={styles.app}>
      <Header />
      <PipelineTrack steps={steps} />
      <div className={styles.body}>
        <TopicInput
          steps={steps}
          isRunning={isRunning}
          onRun={run}
          onAbort={abort}
          onReset={reset}
        />
        <ResultsPanel steps={steps} criticMeta={criticMeta} />
      </div>
    </div>
  );
}
