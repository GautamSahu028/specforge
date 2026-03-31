import os
import time
import threading

_counter = 0
_counter_lock = threading.Lock()
_BLOCK_SIZE = 4
_BASE = 36
_DISCRETE_VALUES = _BASE ** _BLOCK_SIZE
_FINGERPRINT = os.getpid() % _DISCRETE_VALUES


def _to_base36(num: int, pad: int = 0) -> str:
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    if num == 0:
        result = "0"
    else:
        result = ""
        while num:
            num, rem = divmod(num, 36)
            result = chars[rem] + result
    return result.zfill(pad)


def generate_cuid() -> str:
    """Generate a CUID-compatible string ID (25 chars, starts with 'c')."""
    global _counter
    ts = _to_base36(int(time.time() * 1000), 8)
    with _counter_lock:
        _counter = (_counter + 1) % _DISCRETE_VALUES
        count = _to_base36(_counter, _BLOCK_SIZE)
    fingerprint = _to_base36(_FINGERPRINT, _BLOCK_SIZE)
    random_block = _to_base36(int.from_bytes(os.urandom(4), "big") % _DISCRETE_VALUES, _BLOCK_SIZE)
    random_block2 = _to_base36(int.from_bytes(os.urandom(4), "big") % _DISCRETE_VALUES, _BLOCK_SIZE)
    return f"c{ts}{count}{fingerprint}{random_block}{random_block2}"
