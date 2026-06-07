import json

from agents import build_search_agent, build_reader_agent, writer_chain, critic_chain

def extract_agent_text(agent_result: dict) -> str:
    messages = agent_result.get("messages", [])
    # Prefer explicit tool output if available
    for msg in reversed(messages):
        if msg.__class__.__name__ == "ToolMessage":
            return str(msg.content)
    # Fall back to the last AI message
    for msg in reversed(messages):
        if msg.__class__.__name__ == "AIMessage":
            content = msg.content
            if isinstance(content, list):
                parts = []
                for item in content:
                    if isinstance(item, dict):
                        parts.append(str(item.get("text", "")))
                    else:
                        parts.append(str(item))
                return " ".join(parts).strip()
            return str(content)
    return str(agent_result)


def _sse_event(payload: dict) -> str:
    return f"data:{json.dumps(payload)}\n\n"


def stream_research_pipeline(topic: str):
    """Yield server-sent events for each completed pipeline step."""
    # Step 1: search
    yield _sse_event({"type": "step", "index": 0, "status": "running", "output": ""})
    search_agent = build_search_agent()
    search_result = search_agent.invoke({
        "messages": [("user", f"Find recent, reliable and detailed information about :{topic}")]
    })
    search_output = extract_agent_text(search_result)
    yield _sse_event({"type": "step", "index": 0, "status": "done", "output": search_output})

    # Step 2: reader
    yield _sse_event({"type": "step", "index": 1, "status": "running", "output": ""})
    reader_agent = build_reader_agent()
    reader_result = reader_agent.invoke({
        "messages": [
            (
                "user",
                f"Based on the following search result about '{topic}',"
                f"pick the most relevant URL and scrapte its depper content.\n\n"
                f"Search Result:\n{search_output[:800]}"
            )
        ]
    })
    reader_output = extract_agent_text(reader_result)
    yield _sse_event({"type": "step", "index": 1, "status": "done", "output": reader_output})

    # Step 3: writer chain
    yield _sse_event({"type": "step", "index": 2, "status": "running", "output": ""})
    research_combined = (
        f"SEARCH RESULTS : \n {search_output}\n\n"
        f"DETAILED SCRAPPED CONTENT : \n {reader_output}\n\n"
    )
    report_output = writer_chain.invoke({
        "topic": topic,
        "research": research_combined
    })
    yield _sse_event({"type": "step", "index": 2, "status": "done", "output": report_output})

    # Step 4: critic chain
    yield _sse_event({"type": "step", "index": 3, "status": "running", "output": ""})
    critic_output = critic_chain.invoke({
        "report": report_output
    })
    yield _sse_event({"type": "step", "index": 3, "status": "done", "output": critic_output})

    yield _sse_event({"type": "complete"})


def run_research_pipeline(topic: str)->dict:

    state = {}

    search_agent = build_search_agent()
    search_result = search_agent.invoke({
        "messages": [("user", f"Find recent, reliable and detailed information about :{topic}")]
    })
    state["search_result"] = extract_agent_text(search_result)

    reader_agent = build_reader_agent()
    reader_result = reader_agent.invoke({
        "messages": [
            (
                "user",
                f"Based on the following search result about '{topic}',"
                f"pick the most relevant URL and scrapte its depper content.\n\n"
                f"Search Result:\n{state['search_result'][:800]}"
            )
        ]
    })
    state["scrapped_content"] = extract_agent_text(reader_result)

    research_combined = (
        f"SEARCH RESULTS : \n {state['search_result']}\n\n"
        f"DETAILED SCRAPPED CONTENT : \n {state['scrapped_content']}\n\n"
    )

    state["report"] = writer_chain.invoke({
        "topic": topic,
        "research": research_combined
    })

    state["feedback"] = critic_chain.invoke({
        "report": state['report']
    })

    return state

if __name__=="__main__":
    topic= input("\n Enter a research topic: ")
    run_research_pipeline(topic)