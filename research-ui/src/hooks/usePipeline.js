import { useState, useRef, useCallback } from 'react';
import { PIPELINE_STEPS, STATUS } from '../utils/constants';
import { streamResearchPipeline, parseCriticOutput } from '../utils/api';

const initialStepState = () =>
  PIPELINE_STEPS.map((s) => ({
    id: s.id,
    status: STATUS.IDLE,
    output: '',
    error: null,
    elapsedMs: null,
  }));

export function usePipeline() {
  const [steps, setSteps] = useState(initialStepState());
  const [isRunning, setIsRunning] = useState(false);
  const [criticMeta, setCriticMeta] = useState({ score: null, verdict: null });
  const abortRef = useRef(null);

  const updateStep = useCallback((idx, patch) => {
    setSteps((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setSteps(initialStepState());
    setCriticMeta({ score: null, verdict: null });
    setIsRunning(false);
  }, []);

  const run = useCallback(
    async (topic) => {
      if (isRunning) return;
      reset();
      setIsRunning(true);

      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;
      const startTime = Date.now();

      updateStep(0, { status: STATUS.RUNNING, output: '', error: null });
      updateStep(1, { status: STATUS.IDLE, output: '', error: null });
      updateStep(2, { status: STATUS.IDLE, output: '', error: null });
      updateStep(3, { status: STATUS.IDLE, output: '', error: null });

      try {
        await streamResearchPipeline(topic, (event) => {
          if (event.type === 'step') {
            const elapsedMs = Date.now() - startTime;
            updateStep(event.index, {
              status: event.status === 'done' ? STATUS.DONE : STATUS.RUNNING,
              output: event.output || '',
              elapsedMs,
            });

            if (event.status === 'done' && event.index < PIPELINE_STEPS.length - 1) {
              updateStep(event.index + 1, { status: STATUS.RUNNING, output: '', error: null });
            }

            if (event.index === 3) {
              const meta = parseCriticOutput(event.output || '');
              setCriticMeta(meta);
            }
          }

          if (event.type === 'error') {
            throw new Error(event.message || 'Pipeline error');
          }
        }, signal);
      } catch (err) {
        if (err.name === 'AbortError') {
          setSteps((prev) =>
            prev.map((step) =>
              step.status === STATUS.RUNNING
                ? { ...step, status: STATUS.IDLE, output: '' }
                : step
            )
          );
          return;
        }

        const errorMessage = err.message || 'Unknown error';
        setSteps((prev) =>
          prev.map((step) =>
            step.status === STATUS.RUNNING
              ? { ...step, status: STATUS.ERROR, error: errorMessage }
              : step
          )
        );
      } finally {
        setIsRunning(false);
      }
    },
    [isRunning, reset, updateStep]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
  }, []);

  return { steps, isRunning, criticMeta, run, reset, abort };
}
