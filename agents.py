import os
from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from tools import web_search, scrap_url
from dotenv import load_dotenv
load_dotenv()

api_key = (
    os.getenv("GEMINI_API_KEY")
    or os.getenv("GOOGLE_API_KEY")
    or os.getenv("GeminiKey")
)
if not api_key:
    raise RuntimeError(
        "Gemini API key not found. Set GEMINI_API_KEY or GOOGLE_API_KEY in .env."
    )
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, api_key=api_key)

def build_search_agent():
    return create_agent(
        model=llm,
        tools=[web_search]
    )

def build_reader_agent():
    return create_agent(
        model=llm,
        tools=[scrap_url]
    )

#writer chain
writer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert research writer. Write clear, structured and insightful reports."),
    ("human", """Write a detailed report on the topic below.
     Topic: {topic}
     Research Gathered: {research}

     Structure the report as:
        1. Introduction
        2. Key Findings (minimum 2 well-explained points)
        3. Conclusion
        4. Sources (list the URLs used for research)
     
     Be detailed ,factual and professional."""
     ),
])

writer_chain = writer_prompt | llm | StrOutputParser()


#critic chain
critic_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a sharp and constructive research critic.Be honest and specific."),
    ("human", """Review the research report below and evaluate it strictly.
     Report: {report}

     Respond in this exact format:

     Score: X/10

     Strengths:
     - ...
     - ...
     
     Areas to Improve:
     - ...
     - ...

     One line verdict:
     ..."""
     ),
])

critic_chain = critic_prompt | llm | StrOutputParser()