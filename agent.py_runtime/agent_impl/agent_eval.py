from swarm import Agent, Swarm
import os
from openai import OpenAI

from prompt_hub import (
    instructions_for_evaluate_agent_head
)

from function_impl import (
    grade_sent_bottles,
    grade_chat_history,
    compute_new_intimacy
)


def create_evaluate_agent() -> Agent:
    agent_name = "The Insightful Evaluate Agent"
    long_ctx_model_name = os.environ['LONG_CTX_MODEL_NAME']

    eval_agent_instance = Agent(
        name=agent_name,
        instructions=instructions_for_evaluate_agent_head(),
        model=long_ctx_model_name,
        functions=[grade_sent_bottles, grade_chat_history, compute_new_intimacy],       # now we are in test phase, just test the output for streaming.
    )

    return eval_agent_instance