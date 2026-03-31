import logging
import sys
from app.core.config import get_settings


def setup_logging() -> logging.Logger:
    settings = get_settings()
    level = logging.DEBUG if settings.is_development else logging.INFO

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    logger = logging.getLogger("specforge")
    logger.setLevel(level)
    logger.addHandler(handler)
    logger.propagate = False

    return logger


logger = setup_logging()
