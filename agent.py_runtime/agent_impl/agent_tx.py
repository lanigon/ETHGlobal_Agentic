from swarm import Agent, Swarm
import os
from openai import OpenAI

from prompt_hub import (
    instructions_for_tx_agent
)

from function_impl import (
    call_faucet,
    call_NFT,
    compute_token_amount
)

from agent_impl.agent_eval import create_evaluate_agent


def transfer_to_evaluate_agent(context_variables: dict, user_id: str) -> str:
    """Leads to the evaluate agent to evaluate the user's new_intimacy."""
    eval_agent_instance = create_evaluate_agent()
    base_url = os.getenv('BASE_URL')
    api_key = os.getenv('OPENAI_API_KEY')

    openai_client = OpenAI(
        api_key=api_key,
        base_url=base_url
    )

    swarm_client = Swarm(
        client=openai_client,
    )
    response = swarm_client.run(
        agent=eval_agent_instance,
        messages=[{"role": "user", "content": f"Please evaluate this user: {user_id}"}],
        debug=True,
        max_turns=10,
        context_variables=context_variables,
    )
    ret_content = response.messages[-1]['content']
    print(f"Evaluate agent response: {ret_content}")
    return ret_content

def create_tx_agent() -> Agent:
    agent_name = "Transaction Agent"
    # long_ctx_model_name = os.environ['LONG_CTX_MODEL_NAME']
    model_name = os.environ['MODEL_NAME']


    tx_agent_instance = Agent(
        name=agent_name,
        instructions=instructions_for_tx_agent(),
        model=model_name,
        functions=[transfer_to_evaluate_agent, compute_token_amount, call_faucet, call_NFT],       # now we are in test phase, just test the output for streaming.
    )

    return tx_agent_instance