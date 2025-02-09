
# Quick Start
## 1. Install dependencies
```bash
pip install fastapi uvicorn httpx requests python-dotenv python-multipart

# install swarm
## The official swarm has some bug and openai community does not maintain it anymore. So install our custom version of swarm.
pip install git+https://github.com/l1cacheDell/swarm.git
```

## 2. env: search engine API key
For search engine, we use google's [Serper API](https://serper.dev/) to get the search results. It's quite easy to use and free for small scale projects.

Just register an account, get your API key and add it to the `.env` file, like this:

```bash
# Searper API
SERPER_API_KEY="xxxxxxxxxxec3d16f66xxxxxx461"
```

Notice: If lack the serper api key, the agent may not work properly!

## 3. LLM provider API key & Base URL & Model Name

In our case, the agent may process very long context, see code [summary](https://github.com/lanigon/ETHGlobal_Agentic/blob/9bfdfb057ddc849f41cca0c518109da1e5c1d673/agent.py_runtime/function_impl/fn_summary.py#L121) and code [evaluate](https://github.com/lanigon/ETHGlobal_Agentic/blob/9bfdfb057ddc849f41cca0c518109da1e5c1d673/agent.py_runtime/function_impl/fn_evaluate.py#L132), so we use two different models from one provider.

+ The one is a smaller-size model, like 7B or 14B, for faster inference and time-saving.
+ The other is the long context model, for better understanding of the context (user's previous chat history, or user's bottles).

So, in our practice, there are four environment variables that you need to configure:

```bash
BASE_URL=""             # The base URL of the provider API, you know, not everyone uses the OpenAI service.
OPENAI_API_KEY=""       # The API key of your provider API.
MODEL_NAME=""           # The name of the model you want to use, it can be a small model.
LONG_CTX_MODEL_NAME=""  # The name of the long context model, it can be a larger model.
```

For example, we configure them like this:

```bash
BASE_URL="https://api.siliconflow.cn/v1"
OPENAI_API_KEY="sk-qpeexxxxxxxxxxxxxxxxxxxtestesEDfsdagfdsasdfoxc"      # This is just a test api key.
MODEL_NAME="Qwen/Qwen2.5-14B-Instruct"                                  # This is a small model. For faster inference.
LONG_CTX_MODEL_NAME="Qwen/Qwen2.5-72B-Instruct-128K"                    # This is a larger model. For better understanding of the long context.
```

## 4. Prepare Nillion SecretVault by using nilDB python library

And after the basic configuration, you need to prepare the Nillion SecretVault by using nilDB python library. Because we have stored all of our user's bottles data into nillion's secret vault, so we need to use nilDB to access it.

And, the very first thing is to register an account on [SecretVault Register Portal](https://sv-sda-registration.replit.app/). 

Just simplt click the `Get Started` button and fulfill your organization's name, it's all done.

See the `.streamlit` directory? Let's create a `secrets.toml` into it:

```toml
org_secret_key = "YOUR_ORG_SECRET_KEY_HERE"
org_did = "YOUR_ORG_DID_HERE"
schema_id = ""  # leave it empty for now

[node_a]
url = "https://nildb-zy8u.nillion.network"
did = "did:nil:testnet:nillion1fnhettvcrsfu8zkd5zms4d820l0ct226c3zy8u"

[node_b]
url = "https://nildb-rl5g.nillion.network"
did = "did:nil:testnet:nillion14x47xx85de0rg9dqunsdxg8jh82nvkax3jrl5g"

[node_c]
url = "https://nildb-lpjp.nillion.network"
did = "did:nil:testnet:nillion167pglv9k7m4gj05rwj520a46tulkff332vlpjp"
```

All you need to do, is to replace the `YOUR_ORG_SECRET_KEY_HERE` and `YOUR_ORG_DID_HERE` with your own values. (Ctrl CV from the resigter page).

And, the `schema_id` will be generated automatically then, you don't need to worry about it.

## 5. upload your schema to the SecretVault

In our practice, we have already build the schema for our bottles data, so we can upload it to the SecretVault directly.

```bash
python 1.define_collection.py
```

And the schema will be created!

## 6. (Optional) Upload some test data to the SecretVault

Now, the nillion secret vault is empty, for test purpose you can upload some test data to it.

```bash
python 2.upload_some_info.py
```

When you see:

```bash
True
True
```

Then it works!


## 7. Let's Go!

Now, you can start the agent by running:

```bash
python api_server.py
```

And then, you can test the agent by sending a request to the agent's API.