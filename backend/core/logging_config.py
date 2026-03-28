import logging
import os
import sys
from datetime import datetime

from core.config import settings

LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


class DailyFileHandler(logging.FileHandler):
    """FileHandler that writes to logs/<YYYY-MM-DD>.log and rolls over at midnight."""

    def __init__(self, log_dir: str, encoding: str = "utf-8"):
        self.log_dir = log_dir
        os.makedirs(log_dir, exist_ok=True)
        self._current_date = self._today()
        super().__init__(self._log_path(), encoding=encoding)

    def emit(self, record: logging.LogRecord) -> None:
        today = self._today()
        if today != self._current_date:
            self._current_date = today
            self.close()
            self.baseFilename = os.path.abspath(self._log_path())
            self.stream = self._open()
        super().emit(record)

    def _today(self) -> str:
        return datetime.now().strftime("%Y-%m-%d")

    def _log_path(self) -> str:
        return os.path.join(self.log_dir, f"{self._current_date}.log")


def setup_logging() -> None:
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    handlers: list[logging.Handler] = [
        logging.StreamHandler(sys.stdout)
    ]

    if settings.log_dir:
        handlers.append(DailyFileHandler(settings.log_dir))

    logging.basicConfig(
        level=log_level,
        format=LOG_FORMAT,
        datefmt=DATE_FORMAT,
        handlers=handlers,
        force=True,  # override any previously set handlers (e.g. uvicorn defaults)
    )

    # Quiet down noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
