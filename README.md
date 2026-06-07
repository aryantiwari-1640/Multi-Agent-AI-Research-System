# Multi-Agent AI Research System

An agentic research pipeline that takes a topic as input and autonomously searches the web, scrapes relevant content, generates a structured report, and critiques it — all without human intervention.

## How It Works

The system runs four agents in sequence, each passing its output to the next via a shared state dictionary:

1. **Search Agent** — Queries the web using Tavily API and returns titles, URLs, and snippets.
2. **Reader Agent** — Picks the most relevant URL from search results and scrapes its full content via BeautifulSoup.
3. **Writer Chain** — Synthesizes search results + scraped content into a structured report (Introduction → Key Findings → Conclusion → Sources) using Gemini 2.5 Flash.
4. **Critic Chain** — Evaluates the report on a 10-point rubric, returning strengths, areas to improve, and a one-line verdict.

## Tech Stack

| Layer | Tools |
|---|---|
| LLM | Gemini 2.5 Flash (via LangChain) |
| Web Search | Tavily API |
| Scraping | BeautifulSoup, Requests |
| Orchestration | LangChain Agents + Chains |
| Frontend | React |
| UI / Deployment | Streamlit |

## Project Structure

├── agents.py       # Search agent, reader agent, writer chain, critic chain
├── pipeline.py     # Orchestrates the 4-stage pipeline with shared state
├── tools.py        # LangChain tools — web_search (Tavily) and scrap_url (BS4)
├── requirements.txt

## Getting Started

**1. Clone the repo**
```bash
git clone https://github.com/aryantiwari-1640/Multi-Agent-AI-Research-System.git
cd Multi-Agent-AI-Research-System
```

**2. Install dependencies**
```bash
pip install -r requirements.txt
```

**3. Set up environment variables**

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_key
TaviliyApiKey=your_tavily_key
```

**4. Run via terminal**
```bash
python main.py
```

**5. Run the UI**
Open research-ui foler in terminal
```bash
python main.py
```

## Live Demo

[🔗 Try it here](https://multi-agent-ai-research-system-rho.vercel.app/)
