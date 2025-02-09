
# quick start
## 1. Install dependencies
```bash
pip install fastapi uvicorn httpx requests python-dotenv python-multipart

# install swarm
## The official swarm has some bug and openai community does not maintain it anymore. So install our custom version of swarm.
pip install git+https://github.com/l1cacheDell/swarm.git
```

## 2. env: search engine API key
For search engine, we use google's [Serper API](https://serper.dev/) to get the search results. It's quite easy to use and free for small scale projects.

Just register an account, get your API key and add it to the `.env` file.

## 3. LLM provider API key & Base URL & Model Name
