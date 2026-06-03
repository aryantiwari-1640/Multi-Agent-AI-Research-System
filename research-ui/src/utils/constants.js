// ─── Pipeline step definitions ───────────────────────────────────────────────

export const PIPELINE_STEPS = [
  {
    id: 'search',
    label: 'Search Agent',
    shortLabel: 'Search',
    description: 'Finds recent, reliable information from the web about your topic.',
    icon: '⌕',
    color: '#5b9cf6',
    systemPrompt:
      'You are a research search agent. Given a topic, simulate finding and summarizing recent, ' +
      'reliable web results. Produce 3–5 bullet points of key findings with source URLs. ' +
      'Be factual, specific, and concise. Use markdown bullet points.',
    buildPrompt: (topic) =>
      `Find recent, reliable and detailed information about: ${topic}`,
  },
  {
    id: 'reader',
    label: 'Reader Agent',
    shortLabel: 'Reader',
    description: 'Scrapes the most relevant URL for deeper content and insights.',
    icon: '⊞',
    color: '#a78bfa',
    systemPrompt:
      'You are a web reader/scraper agent. Given search results, pick the most relevant source ' +
      'and simulate scraping deeper content from it. Provide a detailed extraction of key facts, ' +
      'data points, quotes, and insights. Use markdown formatting.',
    buildPrompt: (topic, searchResult) =>
      `Based on the following search results about "${topic}", pick the most relevant source ` +
      `and extract deeper content from it.\n\nSearch Results:\n${searchResult.slice(0, 900)}`,
  },
  {
    id: 'report',
    label: 'Writer Chain',
    shortLabel: 'Writer',
    description: 'Drafts a structured report with intro, key findings, and conclusion.',
    icon: '✦',
    color: '#00d4a0',
    systemPrompt:
      'You are an expert research writer. Write clear, structured and insightful reports. ' +
      'Use markdown with headers (##), bullet points, and bold text where appropriate.',
    buildPrompt: (topic, searchResult, readerResult) => {
      const combined =
        `SEARCH RESULTS:\n${searchResult}\n\nDETAILED SCRAPED CONTENT:\n${readerResult}`;
      return (
        `Write a detailed report on the topic below.\n\n` +
        `Topic: ${topic}\n\nResearch Gathered:\n${combined}\n\n` +
        `Structure the report as:\n` +
        `## Introduction\n` +
        `## Key Findings\n(minimum 2 well-explained points)\n` +
        `## Conclusion\n` +
        `## Sources\n(list the URLs used for research)\n\n` +
        `Be detailed, factual and professional.`
      );
    },
  },
  {
    id: 'critic',
    label: 'Critic Chain',
    shortLabel: 'Critic',
    description: 'Scores the report and provides actionable feedback on quality.',
    icon: '◈',
    color: '#f5a623',
    systemPrompt:
      'You are a sharp and constructive research critic. Be honest and specific. ' +
      'Use the EXACT format specified.',
    buildPrompt: (report) =>
      `Review the research report below and evaluate it strictly.\n\nReport:\n${report}\n\n` +
      `Respond in this EXACT format:\n` +
      `Score: X/10\n\n` +
      `Strengths:\n- ...\n- ...\n\n` +
      `Areas to Improve:\n- ...\n- ...\n\n` +
      `One line verdict:\n...`,
  },
];

// ─── Step status enum ─────────────────────────────────────────────────────────
export const STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  DONE: 'done',
  ERROR: 'error',
};

// ─── Anthropic API config ─────────────────────────────────────────────────────
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
export const CLAUDE_MAX_TOKENS = 1200;
