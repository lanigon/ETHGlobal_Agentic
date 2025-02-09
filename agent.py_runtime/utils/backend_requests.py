import httpx
import json

async def store_chat_history(user_id: str, role: str, content: str):
    url = "http://47.236.128.7:3000/api/store_chat_history"

    assert role in ['ai', 'user']

    payload = {
        "user_id": user_id,
        "role": role,
        "content": content
    }

    headers = {
        'Content-Type': 'application/json'
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()