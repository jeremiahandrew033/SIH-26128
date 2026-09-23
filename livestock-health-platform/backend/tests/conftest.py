import os
import sys
import time

# Ensure backend root directory is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Set JWT_SECRET env var before any app imports so pydantic-settings can read it
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-pytest-do-not-use-in-prod")

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.db.database import ROLE_FARMER, ROLE_VETERINARIAN, ROLE_GOVERNMENT

# Fixed IDs used across auth tests
DEMO_FARMER_ID = "f1111111-1111-1111-1111-111111111111"
OTHER_FARMER_ID = "f2222222-2222-2222-2222-222222222222"


# -----------------------------------------------------------------------
# Base client (no auth — used for auth-specific 401/403 tests)
# -----------------------------------------------------------------------
@pytest.fixture
def client():
    return TestClient(app)


# -----------------------------------------------------------------------
# Token helpers
# -----------------------------------------------------------------------
@pytest.fixture
def farmer_token():
    return create_access_token({
        "sub": "user-farmer-test",
        "username": "farmer.demo",
        "role": ROLE_FARMER,
        "farmer_id": DEMO_FARMER_ID,
    })


@pytest.fixture
def other_farmer_token():
    """Token for a second farmer with a different farmer_id."""
    return create_access_token({
        "sub": "user-farmer-other",
        "username": "farmer.other",
        "role": ROLE_FARMER,
        "farmer_id": OTHER_FARMER_ID,
    })


@pytest.fixture
def vet_token():
    return create_access_token({
        "sub": "user-vet-test",
        "username": "vet.demo",
        "role": ROLE_VETERINARIAN,
        "farmer_id": None,
    })


@pytest.fixture
def gov_token():
    return create_access_token({
        "sub": "user-gov-test",
        "username": "gov.demo",
        "role": ROLE_GOVERNMENT,
        "farmer_id": None,
    })


@pytest.fixture
def expired_token():
    """A token that is already expired (1 second TTL in the past)."""
    return create_access_token(
        {
            "sub": "user-expired",
            "username": "expired.user",
            "role": ROLE_FARMER,
            "farmer_id": DEMO_FARMER_ID,
        },
        expires_delta=-10,  # expired 10 seconds ago
    )


# -----------------------------------------------------------------------
# Pre-authenticated client fixtures
# -----------------------------------------------------------------------
@pytest.fixture
def authed_farmer_client(farmer_token):
    c = TestClient(app)
    c.headers.update({"Authorization": f"Bearer {farmer_token}"})
    return c


@pytest.fixture
def authed_other_farmer_client(other_farmer_token):
    c = TestClient(app)
    c.headers.update({"Authorization": f"Bearer {other_farmer_token}"})
    return c


@pytest.fixture
def authed_vet_client(vet_token):
    c = TestClient(app)
    c.headers.update({"Authorization": f"Bearer {vet_token}"})
    return c


@pytest.fixture
def authed_gov_client(gov_token):
    c = TestClient(app)
    c.headers.update({"Authorization": f"Bearer {gov_token}"})
    return c
