// ============ Backend API Configuration ============

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Creates an abort signal with timeout
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {AbortSignal}
 */
function createTimeoutSignal(timeoutMs = 300000) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

/**
 * Parses a server-sent event message into a JSON payload.
 * @param {string} raw - Raw event payload
 * @returns {Object|null}
 */
function parseSSEMessage(raw) {
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

/**
 * Streams backend events from the research pipeline.
 * @param {string} topic
 * @param {(event: Object) => void} onEvent
 * @param {AbortSignal} [signal]
 */
export async function streamResearchPipeline(topic, onEvent, signal) {
  if (!topic || topic.trim() === '') {
    throw new Error('Topic cannot be empty');
  }

  const response = await fetch(`${API_BASE_URL}/api/research/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: signal || createTimeoutSignal(),
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    let errorDetail = `API error ${response.status}`;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorData.error || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop();

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith('data:')) continue;

      const rawEvent = line.slice(5).trim();
      const event = parseSSEMessage(rawEvent);
      if (event) {
        onEvent(event);
      }
    }
  }

  if (buffer.trim().startsWith('data:')) {
    const rawEvent = buffer.trim().slice(5).trim();
    const event = parseSSEMessage(rawEvent);
    if (event) {
      onEvent(event);
    }
  }
}

/**
 * Parses the critic output to extract score and verdict.
 * @param {string} text
 * @returns {{ score: number|null, verdict: string|null }}
 */
export function parseCriticOutput(text) {
  const scoreMatch = text.match(/Score:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
  const verdictMatch = text.match(/One line verdict:\s*(.+)/i);
  return {
    score: scoreMatch ? parseFloat(scoreMatch[1]) : null,
    verdict: verdictMatch ? verdictMatch[1].trim() : null,
  };
}
