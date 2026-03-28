import json
import time
import logging
from typing import Any

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)

# Fields that must never appear in logs
SENSITIVE_KEYS = {"password", "password_hash", "access_token"}


def _mask_sensitive(data: Any) -> Any:
    if isinstance(data, dict):
        return {
            k: "***" if k in SENSITIVE_KEYS else _mask_sensitive(v)
            for k, v in data.items()
        }
    if isinstance(data, list):
        return [_mask_sensitive(item) for item in data]
    return data


def _parse_json(raw: bytes) -> Any | None:
    if not raw:
        return None
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()

        # Buffer request body — safe to read multiple times in BaseHTTPMiddleware
        request_body_raw = await request.body()
        request_data = _parse_json(request_body_raw)

        try:
            response = await call_next(request)
        except Exception:
            duration_ms = int((time.perf_counter() - start) * 1000)
            logger.error(
                "%s %s - unhandled exception (%dms)",
                request.method,
                request.url.path,
                duration_ms,
                exc_info=True,
            )
            raise

        # Consume response body so we can log it, then rebuild the response
        response_body_raw = b"".join([chunk async for chunk in response.body_iterator])
        response_data = _parse_json(response_body_raw)

        duration_ms = int((time.perf_counter() - start) * 1000)

        lines = [f"{request.method} {request.url.path} {response.status_code} {duration_ms}ms"]
        if request_data is not None:
            lines.append(f"  req: {json.dumps(_mask_sensitive(request_data))}")
        if response_data is not None:
            lines.append(f"  res: {json.dumps(_mask_sensitive(response_data))}")
        msg = "\n".join(lines)

        if response.status_code >= 500:
            logger.error(msg)
        elif response.status_code >= 400:
            logger.warning(msg)
        else:
            logger.info(msg)

        return Response(
            content=response_body_raw,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.media_type,
        )
