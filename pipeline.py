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

def run_research_pipeline(topic: str)->dict:

    state={}

    #search agent working
    print("\n"+"="*20)
    print("step-1 -search agent working...")
    print("\n"+"="*20)
    search_agent=build_search_agent()
    search_result=search_agent.invoke({
        "messages":[("user",f"Find recent, reliable and detailed information about :{topic}")]
    })
    
    state["search_result"] = extract_agent_text(search_result)
    print("\n search result ", state['search_result'])

    #reader agent working
    print("\n"+"="*20)
    print("step-1 -reader agent  is scrapping...")
    print("\n"+"="*20)
    reader_agent=build_reader_agent()
    reader_result=reader_agent.invoke({
        "messages":[("user",f"Based on the following search result about '{topic}',"
                    f"pick the most relevant URL and scrapte its depper content.\n\n"
                    f"Search Result:\n{state['search_result'][:800]}"            
                    )]
    })
    state["scrapped_content"]=extract_agent_text(reader_result)

    print("\n scrapped_content ", state['scrapped_content'])

    #step 3 - writer chain
    print("\n"+"="*20)
    print("step-3 -writer chain is writing report...")
    print("\n"+"="*20)

    reasearch_combined=(
        f"SEARCH RESULTS : \n {state['search_result']}\n\n"
        f"DETAILED SCRAPPED CONTENT : \n {state['scrapped_content']}\n\n"
    )

    state["report"]=writer_chain.invoke({
        "topic": topic,
        "research": reasearch_combined
    })

    print("\n Final Report\n", state['report'])


    #critic report
    print("\n"+"="*20)
    print("step-4 -critic chain is evaluating the report...")
    print("\n"+"="*20)

    state["feedback"]=critic_chain.invoke({
        "report": state['report']
    })

    print("\n Feedback\n", state['feedback'])

    return state

if __name__=="__main__":
    topic= input("\n Enter a research topic: ")
    run_research_pipeline(topic)