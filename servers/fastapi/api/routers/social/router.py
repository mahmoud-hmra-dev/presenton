import json
import os
import re
import uuid
from typing import List, Optional

import requests
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlmodel import select

from api.sql_models import FlyerSqlModel, SocialPostSqlModel
from api.services.database import get_sql_session

from openai import AsyncOpenAI

social_router = APIRouter(prefix="/api/v1/social")

OPENAI_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o")
IMAGE_MODEL = os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-1")
FACEBOOK_GRAPH_VERSION = os.getenv("FACEBOOK_GRAPH_VERSION", "v22.0")
FACEBOOK_TOKEN = os.getenv("FACEBOOK_TOKEN")
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")
BLOTATO_API_KEY = os.getenv("BLOTATO_API_KEY")
BLOTATO_API_URL = os.getenv("BLOTATO_API_URL", "https://www.blotato.com/api/v1")

# Static LinkedIn pages for posting. These are not fetched from the Blotato API
# but defined manually based on the provided account information.
LINKEDIN_PAGES = [
    {"account_id": "3936", "id": "104013486", "name": "ALAMERA"},
    {"account_id": "3936", "id": "104012452", "name": "AYWAH"},
    {"account_id": "3936", "id": "104489076", "name": "NAAM"},
    {"account_id": "3936", "id": "106816276", "name": "Clinfo1t by ClinGroup"},
    {"account_id": "3936", "id": "104525101", "name": "LaBadia"},
    {"account_id": "3936", "id": "104753307", "name": "MONA - Mobile Nursing Ark"},
    {"account_id": "3936", "id": "104206747", "name": "Clepius, Healthcare Staffing"},
    {"account_id": "3936", "id": "103862408", "name": "Clinserv"},
    {"account_id": "3936", "id": "106818196", "name": "ClinPharm by ClinGroup"},
    {"account_id": "3936", "id": "104250803", "name": "DNCI"},
    {"account_id": "3936", "id": "4994700", "name": "ClinGroup"},
    {"account_id": "3936", "id": "106794557", "name": "Konzola by HopeMCF"},
    {"account_id": "3936", "id": "3329838", "name": "QSI"},
    {"account_id": "3936", "id": "106795554", "name": "HopeMCF"},
    {"account_id": "3936", "id": "106795589", "name": "SAMAA.dnci"},
    {"account_id": "3936", "id": "107402220", "name": "ClinAcademy.fr"},
    {"account_id": "3936", "id": "107183654", "name": "Sociality.dnci"},
]

APP_DATA_DIR = os.getenv("APP_DATA_DIRECTORY", "user_data")
TOKEN_FILE = os.path.join(APP_DATA_DIR, "facebook_token.txt")


def _load_token() -> Optional[str]:
    """Load token from env or file."""
    token = FACEBOOK_TOKEN
    if not token and os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "r") as f:
            token = f.read().strip()
    return token


def _save_token(token: str):
    os.makedirs(os.path.dirname(TOKEN_FILE), exist_ok=True)
    try:
        with open(TOKEN_FILE, "w") as f:
            f.write(token)
    except Exception:
        pass


FACEBOOK_TOKEN_VALUE = _load_token()


def _refresh_token(token: str) -> str:
    """Refresh and persist Facebook token if app credentials provided."""
    if not (FACEBOOK_APP_ID and FACEBOOK_APP_SECRET):
        return token
    url = f"https://graph.facebook.com/{FACEBOOK_GRAPH_VERSION}/oauth/access_token"
    resp = requests.get(
        url,
        params={
            "grant_type": "fb_exchange_token",
            "client_id": FACEBOOK_APP_ID,
            "client_secret": FACEBOOK_APP_SECRET,
            "fb_exchange_token": token,
        },
    )
    if resp.status_code == 200:
        new_token = resp.json().get("access_token")
        if new_token:
            _save_token(new_token)
            return new_token
    return token


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
        raise HTTPException(
            status_code=500, detail=f"Failed to parse LLM response: {str(e)}"
        )


async def _generate_content(text: str, client: AsyncOpenAI) -> dict:
    system = (
        "You are an AI social media content creator. "
        "Your task is to create engaging and SEO-optimized social media content (200-500 characters) "
        "and generate a detailed image prompt. "
        'Respond ONLY with a JSON object like {"content": "...", "image_prompt": "..."}. '
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
        model="gpt-image-1",
        prompt=prompt,
        n=1,
        size="1024x1536",        # الارتفاع العمودي مناسب للفلاير A4
        quality="high",          # low / medium / high حسب الحاجة
        output_format="png",     # png أو jpeg أو webp
        background="opaque",     # opaque / transparent / auto
        moderation="auto"        # auto أو low
    )
    # النتيجة تأتي بصيغة base64
    b64 = resp.data[0].b64_json
    # يمكنك حفظها كملف محلي أو تحويلها إلى Data URL
    url = f"data:image/png;base64,{b64}"
    return url



def _get_pages():
    """Fetch pages and refresh token on expiration."""
    global FACEBOOK_TOKEN_VALUE

    token = FACEBOOK_TOKEN_VALUE
    if not token:
        return []

    url = f"https://graph.facebook.com/{FACEBOOK_GRAPH_VERSION}/me/accounts"
    resp = requests.get(url, params={"access_token": token})

    if resp.status_code != 200:
        token = _refresh_token(token)
        FACEBOOK_TOKEN_VALUE = token
        resp = requests.get(url, params={"access_token": token})

    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch Facebook pages")

    data = resp.json().get("data", [])
    return [
        {"id": p["id"], "name": p["name"], "access_token": p.get("access_token")}
        for p in data
    ]


def _get_linkedin_pages():
    """Return the predefined LinkedIn organization pages."""
    return LINKEDIN_PAGES


@social_router.get("/pages")
async def get_pages():
    """Return available Facebook pages."""
    pages = _get_pages()
    return JSONResponse({"pages": pages})


@social_router.get("/linkedin/pages")
async def get_linkedin_pages():
    """Return LinkedIn organization pages."""
    pages = _get_linkedin_pages()
    return JSONResponse({"pages": pages})


@social_router.post("/generate")
async def generate(
    text: Optional[str] = Form(None), file: Optional[UploadFile] = File(None)
):
    if not text and not file:
        raise HTTPException(status_code=400, detail="Provide text or audio")
    client = AsyncOpenAI(request_timeout=180)
    if file:
        text = await _transcribe_audio(file, client)
    data = await _generate_content(text, client)
    image_url = await _generate_image(data["image_prompt"], client)
    pages = _get_pages()
    return {"content": data["content"], "image_url": image_url, "pages": pages}


@social_router.post("/publish")
async def publish(
    page_ids: List[str] = Form(...),
    caption: str = Form(...),
    image_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    if not FACEBOOK_TOKEN_VALUE:
        raise HTTPException(status_code=400, detail="FACEBOOK_TOKEN not set")

    all_pages = _get_pages()
    results = []

    if not image_url and not file:
        raise HTTPException(status_code=400, detail="Provide image_url or file")

    file_bytes = await file.read() if file else None

    for pid in page_ids:
        page_token = next(
            (p["access_token"] for p in all_pages if p["id"] == pid), None
        )
        if not page_token:
            results.append(
                {"page_id": pid, "status": 403, "error": "Page token not found"}
            )
            continue

        if file_bytes:
            resp = requests.post(
                f"https://graph.facebook.com/{FACEBOOK_GRAPH_VERSION}/{pid}/photos",
                data={"message": caption, "access_token": page_token},
                files={
                    "source": (
                        file.filename,
                        file_bytes,
                        file.content_type or "image/jpeg",
                    )
                },
            )
        else:
            resp = requests.post(
                f"https://graph.facebook.com/{FACEBOOK_GRAPH_VERSION}/{pid}/photos",
                data={"url": image_url, "message": caption, "access_token": page_token},
            )
        results.append(
            {"page_id": pid, "status": resp.status_code, "response": resp.json()}
        )

    return {"results": results}


from fastapi import UploadFile
import base64

@social_router.post("/linkedin/publish")
async def publish_linkedin(
    page_ids: List[str] = Form(...),
    caption: str = Form(...),
    file: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
):
    if not BLOTATO_API_KEY:
        raise HTTPException(status_code=400, detail="API key not set")

    # Step 1: Upload media if file provided or if image_url provided external
    blotato_media_url: Optional[str] = None

    if file:
        raw = await file.read()
        b64 = base64.b64encode(raw).decode()
        data_uri = f"data:{file.content_type};base64,{b64}"
        payload = {"url": data_uri}
        resp = requests.post(
            "https://backend.blotato.com/v2/media",
            headers={"blotato-api-key": "blt_TN5i48zFcvDiWUwCMbjq1upD+JVuDRAo/S/FgPbELMs=", "Content-Type": "application/json"},
            data=json.dumps(payload),
        )
        if resp.status_code == 201:
            blotato_media_url = resp.json().get("url")
        else:
            raise HTTPException(status_code=resp.status_code, detail={"upload_error": resp.text})

    elif image_url:
        payload = {"url": image_url}
        resp = requests.post(
            "https://backend.blotato.com/v2/media",
            headers={"blotato-api-key": BLOTATO_API_KEY, "Content-Type": "application/json"},
            data=json.dumps(payload),
        )
        if resp.status_code == 201:
            blotato_media_url = resp.json().get("url")
        else:
            raise HTTPException(status_code=resp.status_code, detail={"upload_error": resp.text})

    # Step 2: Prepare content and publish
    results = []
    for combined in page_ids:
        if ":" in combined:
            account_id, page_id = combined.split(":", 1)
        else:
            account_id, page_id = combined, None

        content = {
            "text": caption,
            "platform": "linkedin",
            "mediaUrls": [blotato_media_url] if blotato_media_url else [],
        }

        payload = {
            "post": {
                "accountId": account_id,
                "content": content,
                "target": {"targetType": "linkedin"},
            }
        }
        if page_id:
            payload["post"]["target"]["pageId"] = page_id

        post_resp = requests.post(
            "https://backend.blotato.com/v2/posts",
            headers={"blotato-api-key": BLOTATO_API_KEY, "Content-Type": "application/json"},
            data=json.dumps(payload),
        )

        try:
            j = post_resp.json()
        except:
            j = {"error": post_resp.text}

        results.append({
            "account_id": account_id,
            "page_id": page_id,
            "status": post_resp.status_code,
            "response": j,
        })

    return {"results": results}


@social_router.post("/posts/save")
async def save_post(
    caption: str = Form(...),
    image_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    path = None
    if file:
        os.makedirs(os.path.join(APP_DATA_DIR, "posts"), exist_ok=True)
        path = os.path.join(APP_DATA_DIR, "posts", f"{uuid.uuid4()}_{file.filename}")
        with open(path, "wb") as f:
            f.write(await file.read())

    with get_sql_session() as session:
        post = SocialPostSqlModel(caption=caption, image_url=image_url, file=path)
        session.add(post)
        session.commit()
        session.refresh(post)
        return post


@social_router.get("/posts")
async def get_posts():
    with get_sql_session() as session:
        posts = session.exec(select(SocialPostSqlModel)).all()
    posts.sort(key=lambda x: x.created_at, reverse=True)
    return posts


class FlyerData(BaseModel):
    prompt: str
    title: Optional[str] = None
    topic: Optional[str] = None
    design: Optional[str] = None
    image_url: Optional[str] = None


@social_router.post("/flyers/save")
async def save_flyer(data: FlyerData):
    with get_sql_session() as session:
        flyer = FlyerSqlModel(**data.model_dump())
        session.add(flyer)
        session.commit()
        session.refresh(flyer)
        return flyer


@social_router.get("/flyers")
async def get_flyers():
    with get_sql_session() as session:
        flyers = session.exec(select(FlyerSqlModel)).all()
    flyers.sort(key=lambda x: x.created_at, reverse=True)
    return flyers
