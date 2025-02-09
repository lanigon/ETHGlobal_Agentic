import httpx
import asyncio
import json

agent_start_flag = False
tool_start_flag = False

async def send_stream_request():
    agent_start_flag = False
    tool_start_flag = False
    url = "http://127.0.0.1:8080/api/chat"
    payload = {
        "user_id": "0xfA5aC709311146dA718B3fba0a90A3Bd96e7a471",
        "content": "I am sometimes confused with my programming language choices, which one is the 2024 language of the year in TIOBE? And what about typescript?"
    }

    async with httpx.AsyncClient(timeout=60) as client:
        async with client.stream("POST", url, json=payload) as response:
            async for chunk in response.aiter_text():
                chunk_data = json.loads(chunk)
                # print(chunk_data)
                if chunk_data["type"] == "agent_answer":
                    if agent_start_flag:
                        print(chunk_data['content'], end="", flush=True)
                    else:
                        print("\nAgent: " + chunk_data['content'], end="", flush=True)
                        agent_start_flag = True
                        tool_start_flag = False
                elif chunk_data["type"] == "tool_calls":
                    if tool_start_flag:
                        print(chunk_data['content'], end="", flush=True)
                    else:
                        print("\nTool: " + chunk_data['content'], end="", flush=True)
                        tool_start_flag = True
                        agent_start_flag = False

                await asyncio.sleep(0.01)

    print("\n")

asyncio.run(send_stream_request())
