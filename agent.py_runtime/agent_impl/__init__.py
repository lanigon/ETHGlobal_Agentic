from swarm import Swarm, Agent
from openai import OpenAI
from dotenv import load_dotenv
import os
from typing import List, Callable

# ======= Import Custom Modules =======
from agent_impl.utils import get_embeddings
from agent_impl.agent_chat import create_chat_agent
from agent_impl.agent_tx import create_tx_agent

load_dotenv()

def test_swarm():
    base_url = os.getenv('BASE_URL')
    api_key = os.getenv('OPENAI_API_KEY')
    model_name = os.getenv('LONG_CTX_MODEL_NAME')

    openai_client = OpenAI(
        api_key=api_key,
        base_url=base_url
    )

    swarm_client = Swarm(
        client=openai_client,
    )

    def transfer_to_agent_b():
        return agent_b
    
    agent_a = Agent(
        name="Agent A",
        model=model_name,
        instructions="You are a helpful agent.",
        functions=[transfer_to_agent_b],
    )

    agent_b = Agent(
        name="Agent B",
        model=model_name,
        instructions="Only speak in Haikus.",
    )

    response = swarm_client.run(
        agent=agent_a,
        messages=[{"role": "user", "content": "I want to talk to agent B."}],
        debug=True,
        stream=False,
    )

    print(response.messages[-1]["content"])


def test_swarm_stream():
    base_url = os.getenv('BASE_URL')
    api_key = os.getenv('OPENAI_API_KEY')
    model_name = os.getenv('LONG_CTX_MODEL_NAME')

    openai_client = OpenAI(
        api_key=api_key,
        base_url=base_url
    )

    swarm_client = Swarm(
        client=openai_client,
    )

    def transfer_to_agent_b():
        return agent_b
    
    agent_a = Agent(
        name="Agent A",
        model=model_name,
        instructions="You are a helpful agent.",
        functions=[transfer_to_agent_b],
    )

    agent_b = Agent(
        name="Agent B",
        model=model_name,
        instructions="Only speak in Haikus.",
    )

    stream = swarm_client.run(
        agent=agent_a,
        messages=[{"role": "user", "content": "I want to talk to agent B."}],
        debug=False,
        stream=True,
    )

    for chunk in stream:
        content = chunk.get("content", None)
        if content and content != "":
            print(chunk['content'], end='')



def test_agent_function(context_variables: dict,) -> str:
    """Every function must have a param `context_variables`, 
    and a docstring that describes what the function does.
    
    """
    pass


def create_swarm_client() -> Swarm:
    base_url = os.getenv('BASE_URL')
    api_key = os.getenv('OPENAI_API_KEY')

    openai_client = OpenAI(
        api_key=api_key,
        base_url=base_url
    )

    swarm_client = Swarm(
        client=openai_client,
    )

    return swarm_client


def run_swarm_in_threadpool(swarm_client: Swarm, 
                            agent: Agent, 
                            messages: List[dict], 
                            debug: bool=False, 
                            stream: bool=False):
    return swarm_client.run(
        agent=agent,
        messages=messages,
        debug=debug,
        stream=stream,
        max_turns=10
    )