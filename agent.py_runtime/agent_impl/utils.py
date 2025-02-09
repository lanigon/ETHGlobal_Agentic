from swarm import Swarm, Agent
from openai import OpenAI, AsyncOpenAI
from openai.types.embedding import Embedding
from dotenv import load_dotenv
import os

from typing import List, Callable

# load necessary environment variables
load_dotenv()

# base_url = os.getenv('BASE_URL')
# api_key = os.getenv('OPENAI_API_KEY')
model_name = os.getenv('MODEL_NAME')

embedding_base_url = os.getenv('EMBEDDING_BASE_URL')
embedding_api_key = os.getenv('EMBEDDING_API_KEY')
embedding_model = os.getenv('EMBEDDING_MODEL_NAME')


def create_agent(name: str, instructions: str, functions: List[Callable]) -> Agent:
    global model_name
    return Agent(
        name=name,
        model=model_name,
        instructions=instructions,
        functions=functions,
    )


async def get_embeddings(texts: List[str]) -> List[Embedding]:
    """Notice that the max length of a single request is less than 8K."""
    global embedding_base_url, embedding_api_key, embedding_model
    async_openai_client = AsyncOpenAI(
        api_key=embedding_api_key,
        base_url=embedding_base_url,
    )

    # create embeddings for each text in a batch
    embeddings = await async_openai_client.embeddings.create(
        model=embedding_model,
        dimensions=512,
        encoding_format='float',
        input=texts,
    )
    embed_data = embeddings.data
    return embed_data