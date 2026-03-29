from pydantic import BaseModel


class LikeSummary(BaseModel):
    liked: bool
    like_count: int
