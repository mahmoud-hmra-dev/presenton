import json
import os
import re
from typing import List, Optional

import requests
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from openai import AsyncOpenAI

social_router = APIRouter(prefix="/api/v1/social")

OPENAI_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o")
IMAGE_MODEL = os.getenv("OPENAI_IMAGE_MODEL", "dall-e-3")
FACEBOOK_GRAPH_VERSION = os.getenv("FACEBOOK_GRAPH_VERSION", "v22.0")
FACEBOOK_TOKEN = os.getenv("FACEBOOK_TOKEN")


async def _transcribe_audio(file: UploadFile, client: AsyncOpenAI) -> str:
    data = await file.read()
    return await client.audio.transcriptions.create(
        model="whisper-1", file=data, response_format="text"
    )


def extract_json_block(text: str) -> dict:
    try:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError("No JSON object found in LLM response")
        return json.loads(match.group(0))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse LLM response: {str(e)}")


async def _generate_content(text: str, client: AsyncOpenAI) -> dict:
    system = (
        "You are an AI social media content creator. "
        "Your task is to create engaging and SEO-optimized social media content (200-500 characters) "
        "and generate a detailed image prompt. "
        "Respond ONLY with a JSON object like {\"content\": \"...\", \"image_prompt\": \"...\"}. "
        "No explanation. No extra text."
    )
    resp = await client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": text},
        ],
    )
    content = resp.choices[0].message.content
    return extract_json_block(content)


async def _generate_image(prompt: str, client: AsyncOpenAI) -> str:
    resp = await client.images.generate(
        model=IMAGE_MODEL, prompt=prompt, n=1, size="1024x1024"
    )
    return resp.data[0].url


def _get_pages():
    if not FACEBOOK_TOKEN:
        return []
    url = f"https://graph.facebook.com/{FACEBOOK_GRAPH_VERSION}/me/accounts"
    resp = requests.get(url, params={"access_token": FACEBOOK_TOKEN})
    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch Facebook pages")
    data = resp.json().get("data", [])
    return [{"id": p["id"], "name": p["name"], "access_token": p.get("access_token")} for p in data]


@social_router.post("/generate")
async def generate(text: Optional[str] = Form(None), file: Optional[UploadFile] = File(None)):
    if not text and not file:
        raise HTTPException(status_code=400, detail="Provide text or audio")
    client = AsyncOpenAI()
    if file:
        text = await _transcribe_audio(file, client)
    data = await _generate_content(text, client)
    image_url = await _generate_image(data["image_prompt"], client)
    pages = _get_pages()
    return {"content": data["content"], "image_url": image_url, "pages": pages}


@social_router.post("/publish")
async def publish(page_ids: List[str], caption: str = Form(...), image_url: str = Form(...)):
    if not FACEBOOK_TOKEN:
        raise HTTPException(status_code=400, detail="FACEBOOK_TOKEN not set")
    results = []
    for pid in page_ids:
        resp = requests.post(
            f"https://graph.facebook.com/{FACEBOOK_GRAPH_VERSION}/{pid}/photos",
            data={"url": image_url, "message": caption, "access_token": FACEBOOK_TOKEN},
        )
        results.append({"page_id": pid, "status": resp.status_code})
    return {"results": results}
