

from agents import build_search_agent, build_reader_agent, writer_chain, critic_chain
from tools import get_tool_output


#base function
def run_research_pipeline(topic : str) -> dict:

    state = {}
    history = history or []

    #search agent working
    print("\n"+"="*50)
    print("step-1 : searching.......")
    print("="*50)

    search_agent = build_search_agent()
    messages = history + [{"role": "user", "content": topic}]
    search_result = search_agent.invoke({
    "message" : messages
    })

    tool_output = get_tool_output(search_result['messages'], tool_name="web_search")
    if not tool_output:
        state["report"] = search_result['messages'][-1].content
        return state
    
    state["search_results"] = tool_output 
    print("\n search results : " , state['search_results'])

    #reader agent working
    print("\n"+"="*50)
    print("step-2 : reading.......")
    print("="*50)
    reader_agent = build_reader_agent()
    reader_result = reader_agent.invoke({
        "messages": [{"role": "user", "content": f"Based on the following search results about '{topic}', "
                                                 f"pick the most relevant URL and scrape it for deeper content.\n\n"
                                                 f"Search Results:\n{state['search_results'][:800]}"}]
    })
    tool_output = get_tool_output(reader_result['messages'], tool_name="scrap_url")
    state["reader_results"] = tool_output if tool_output else reader_result['messages'][-1].content
    print("\n reader results : " , state['reader_results'])

    # writer chain working

    print("\n"+"="*50)
    print("step-3 : writing.......")
    print("="*50)

    combined_research = (
        f"Search results:\n{state['search_results']}\n\n"
        f"Deatailed Scraped Content:\n{state['reader_results']}"
    )
    state['report'] = writer_chain.invoke({
        "topic": topic,
        "research": combined_research
    })
 
    print("\n writer results : " , state['report'])

    #critic chain working
    print("\n"+"="*50)
    print("step-4 : criticizing.......")
    print("="*50)

    state['feedback'] = critic_chain.invoke({
        "report": state['report']
    })

    print("\n critic results : " , state['feedback'])

    return state



if __name__ == "__main__":
   topic = input("\n Enter the topic to research : ")
   run_research_pipeline(topic)





