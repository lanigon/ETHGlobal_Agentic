from pydantic import BaseModel


class CommonRequest(BaseModel):
    user_id: str


class ChatRequest(BaseModel):
    user_id: str
    content: str