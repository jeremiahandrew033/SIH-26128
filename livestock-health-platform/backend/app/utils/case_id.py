import datetime
import random

def generate_case_id() -> str:
    """
    Generates a unique human-readable case ID formatted as LIV-YYYY-XXXXXX.
    Example: LIV-2026-834912
    """
    year = datetime.datetime.now().year
    random_seq = random.randint(100000, 999999)
    return f"LIV-{year}-{random_seq}"
