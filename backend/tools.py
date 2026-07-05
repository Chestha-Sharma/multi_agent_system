from langchain.tools import tool
import requests
from bs4 import BeautifulSoup
from tavily import TavilyClient
import os
from dotenv import load_dotenv
from rich import print
load_dotenv()



tavily = TavilyClient(api_key = os.getenv("TAVILY_API_KEY"))

@tool
def web_search(query: str) -> str:
    """
    Search the web for recent and reliable information about the query. Returns Titles, URLs and Snippets.
    """
    results = tavily.search(query=query, limit=5)
    out = []
    for r in results["results"]:
        out.append(f"Title: {r['title']}\nURL: {r['url']}\nSnippet: {r['content'][:300]}")
    
    return "\n----------\n".join(out) # .join use only to join strings



#beatiful parser use to take html and clean it or may say to take html

@tool
def scrap_url(url: str) -> str:
    """Scrape and return clean text content from a given URL for deeper reading."""
    try:
        resp = requests.get(url,timeout=10,headers={'User-Agent':'Mozilla/5.0'}) # so that beatiful soup looks like a user
        soup = BeautifulSoup(resp.text, 'html.parser')
        for tag in soup(["script","style","nav","footer"]):
            tag.decompose() # remove unwanted tags
        return soup.get_text(separator=" ", strip=True)[:3000]
    except Exception as e:
        return f"Could not scrape content from {url}: {str(e)}"




from langchain_core.messages import ToolMessage

def get_tool_output(messages, tool_name=None):
    """Pull the content of the last ToolMessage (optionally filtered by tool name)."""
    for msg in reversed(messages):
        if isinstance(msg, ToolMessage):
            if tool_name is None or msg.name == tool_name:
                return msg.content
    return None