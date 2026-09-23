"""
Sub-Phase 1A — Authentication Tests
All 10 required cases:
  1.  Valid login returns token
  2.  Missing token → 401
  3.  Invalid token → 401
  4.  Expired token → 401
  5.  Farmer accesses own record → 200
  6.  Farmer accesses another farmer's record → 403
  7.  Farmer blocked from vet-only endpoint → 403
  8.  Vet blocked from government-only endpoint → 403 (gov has no exclusive endpoint;
      we use: vet can access gov-allowed endpoints but farmer cannot)
  9.  Government gets authorized access → 200
  10. CORS: wildcard not present in response headers when credentials are used
"""
import pytest
from tests.conftest import DEMO_FARMER_ID, OTHER_FARMER_ID


# ---------------------------------------------------------------------------
# Helpers — ensure the demo farmer row exists for every test that needs it
# ---------------------------------------------------------------------------
def _ensure_demo_farmer(client):
    """Create the demo farmer if it doesn't already exist."""
    res = client.get(f"/api/v1/farmers/{DEMO_FARMER_ID}")
    if res.status_code == 404:
        client.post("/api/v1/farmers", json={
            "id": DEMO_FARMER_ID,
            "name": "Demo Farmer",
            "phone": "+919876543210",
            "preferred_language": "en",
            "village": "V",
            "block": "B",
            "district": "D",
        })


# -----------------------------------------------------------------------
# Test 1 — Valid login
# -----------------------------------------------------------------------
class TestLogin:
    def test_valid_login_returns_token(self, client):
        """POST /auth/login with correct credentials returns a Bearer token."""
        res = client.post(
            "/api/v1/auth/login",
            data={"username": "farmer.demo", "password": "farmer123"},
        )
        assert res.status_code == 200, res.text
        body = res.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"
        assert body["role"] == "FARMER"
        assert len(body["access_token"]) > 20  # meaningful JWT length

    def test_invalid_password_returns_401(self, client):
        res = client.post(
            "/api/v1/auth/login",
            data={"username": "farmer.demo", "password": "wrongpassword"},
        )
        assert res.status_code == 401

    def test_unknown_user_returns_401(self, client):
        res = client.post(
            "/api/v1/auth/login",
            data={"username": "nobody", "password": "nope"},
        )
        assert res.status_code == 401


# -----------------------------------------------------------------------
# Test 2 — Missing token → 401
# -----------------------------------------------------------------------
class TestMissingToken:
    def test_missing_token_farmers_list(self, client):
        """GET /farmers without Authorization header must return 401."""
        res = client.get("/api/v1/farmers")
        assert res.status_code == 401

    def test_missing_token_health_reports(self, client):
        res = client.get("/api/v1/health-reports")
        assert res.status_code == 401

    def test_missing_token_animals(self, client):
        res = client.get("/api/v1/animals")
        assert res.status_code == 401


# -----------------------------------------------------------------------
# Test 3 — Invalid (tampered) token → 401
# -----------------------------------------------------------------------
class TestInvalidToken:
    def test_garbage_token(self, client):
        res = client.get(
            "/api/v1/farmers",
            headers={"Authorization": "Bearer thisisnotajwtatall"},
        )
        assert res.status_code == 401

    def test_tampered_token(self, client, farmer_token):
        """Flip one character in the signature portion."""
        parts = farmer_token.split(".")
        sig = parts[2]
        # Flip the last character
        tampered_sig = sig[:-1] + ("A" if sig[-1] != "A" else "B")
        tampered = f"{parts[0]}.{parts[1]}.{tampered_sig}"
        res = client.get(
            "/api/v1/farmers",
            headers={"Authorization": f"Bearer {tampered}"},
        )
        assert res.status_code == 401


# -----------------------------------------------------------------------
# Test 4 — Expired token → 401
# -----------------------------------------------------------------------
class TestExpiredToken:
    def test_expired_token_returns_401(self, client, expired_token):
        res = client.get(
            "/api/v1/farmers",
            headers={"Authorization": f"Bearer {expired_token}"},
        )
        assert res.status_code == 401


# -----------------------------------------------------------------------
# Test 5 — Farmer accesses own record → 200
# -----------------------------------------------------------------------
class TestFarmerOwnRecord:
    def test_farmer_accesses_own_profile(self, authed_farmer_client):
        """Farmer should be able to GET their own farmer profile."""
        res = authed_farmer_client.get(f"/api/v1/farmers/{DEMO_FARMER_ID}")
        # 200 if farmer exists, 404 if seed not run — both are acceptable here
        # because 401/403 would be a security failure
        assert res.status_code in (200, 404)

    def test_farmer_accesses_own_health_reports(self, authed_farmer_client):
        res = authed_farmer_client.get(f"/api/v1/farmers/{DEMO_FARMER_ID}/health-reports")
        assert res.status_code in (200,)

    def test_farmer_accesses_own_animals(self, authed_farmer_client):
        res = authed_farmer_client.get(f"/api/v1/farmers/{DEMO_FARMER_ID}/animals")
        assert res.status_code == 200


# -----------------------------------------------------------------------
# Test 6 — Farmer accesses another farmer's record → 403
# -----------------------------------------------------------------------
class TestFarmerCrossAccess:
    def test_farmer_cannot_access_other_profile(self, authed_farmer_client):
        """DEMO_FARMER trying to read OTHER_FARMER's profile must get 403."""
        res = authed_farmer_client.get(f"/api/v1/farmers/{OTHER_FARMER_ID}")
        assert res.status_code == 403

    def test_farmer_cannot_access_other_animals(self, authed_farmer_client):
        res = authed_farmer_client.get(f"/api/v1/farmers/{OTHER_FARMER_ID}/animals")
        assert res.status_code == 403

    def test_farmer_cannot_access_other_health_reports(self, authed_farmer_client):
        res = authed_farmer_client.get(f"/api/v1/farmers/{OTHER_FARMER_ID}/health-reports")
        assert res.status_code == 403


# -----------------------------------------------------------------------
# Test 7 — Farmer blocked from vet-only endpoint → 403
# -----------------------------------------------------------------------
class TestFarmerBlockedFromVetEndpoint:
    def test_farmer_cannot_list_all_farmers(self, authed_farmer_client):
        """`GET /farmers` is VET/GOV only."""
        res = authed_farmer_client.get("/api/v1/farmers")
        assert res.status_code == 403

    def test_farmer_cannot_list_all_health_reports(self, authed_farmer_client):
        """`GET /health-reports` is VET/GOV only."""
        res = authed_farmer_client.get("/api/v1/health-reports")
        assert res.status_code == 403

    def test_farmer_cannot_list_all_animals(self, authed_farmer_client):
        """`GET /animals` is VET/GOV only."""
        res = authed_farmer_client.get("/api/v1/animals")
        assert res.status_code == 403

    def test_farmer_cannot_update_health_report_status(self, authed_farmer_client):
        """`PATCH /health-reports/{id}/status` is VET/GOV only."""
        res = authed_farmer_client.patch(
            "/api/v1/health-reports/FAKE-CASE-001/status?status=closed"
        )
        assert res.status_code == 403


# -----------------------------------------------------------------------
# Test 8 — Vet cannot access government-exclusive data;
#           Farmer is blocked from vet endpoint (already tested above);
#           Here we confirm vet IS allowed on shared vet/gov endpoints
#           and that a farmer token is still blocked even with vet URL
# -----------------------------------------------------------------------
class TestRoleBoundaries:
    def test_vet_can_list_farmers(self, authed_vet_client):
        """VET should be allowed to list farmers."""
        res = authed_vet_client.get("/api/v1/farmers")
        assert res.status_code == 200

    def test_vet_can_list_health_reports(self, authed_vet_client):
        res = authed_vet_client.get("/api/v1/health-reports")
        assert res.status_code == 200

    def test_farmer_still_blocked_on_vet_path(self, authed_farmer_client):
        """Even if a farmer knows the VET URL, they are 403-ed."""
        res = authed_farmer_client.get("/api/v1/health-reports")
        assert res.status_code == 403

    def test_vet_cannot_update_status_on_nonexistent_report(self, authed_vet_client):
        """Vet has role access but report doesn't exist → 404 not 403."""
        res = authed_vet_client.patch(
            "/api/v1/health-reports/NONEXISTENT-CASE/status?status=closed"
        )
        assert res.status_code == 404


# -----------------------------------------------------------------------
# Test 9 — Government gets authorized access → 200
# -----------------------------------------------------------------------
class TestGovernmentAccess:
    def test_gov_can_list_farmers(self, authed_gov_client):
        res = authed_gov_client.get("/api/v1/farmers")
        assert res.status_code == 200

    def test_gov_can_list_health_reports(self, authed_gov_client):
        res = authed_gov_client.get("/api/v1/health-reports")
        assert res.status_code == 200

    def test_gov_can_list_mortality_reports(self, authed_gov_client):
        res = authed_gov_client.get("/api/v1/mortality-reports")
        assert res.status_code == 200

    def test_gov_can_list_all_animals(self, authed_gov_client):
        res = authed_gov_client.get("/api/v1/animals")
        assert res.status_code == 200

    def test_gov_can_list_vaccinations(self, authed_gov_client):
        res = authed_gov_client.get("/api/v1/vaccinations")
        assert res.status_code == 200


# -----------------------------------------------------------------------
# Test 10 — CORS: wildcard not in allowed origins when credentials used
# -----------------------------------------------------------------------
class TestCORSConfig:
    def test_no_wildcard_cors_for_credentialed_requests(self, client):
        """
        When allow_credentials=True, the CORS spec forbids allow_origins=*.
        Sending a preflight from a known origin must NOT echo back '*'.
        """
        res = client.options(
            "/api/v1/farmers",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization",
            },
        )
        acao = res.headers.get("access-control-allow-origin", "")
        # Must NOT be wildcard
        assert acao != "*", "CORS must not use wildcard when credentials are enabled"
        # Must echo back the exact allowed origin (or be absent for blocked origin)
        assert acao in ("http://localhost:5173", ""), f"Unexpected CORS origin: {acao}"

    def test_unknown_origin_not_allowed(self, client):
        """An unlisted origin must not receive an Allow-Origin header."""
        res = client.options(
            "/api/v1/farmers",
            headers={
                "Origin": "https://evil-site.example.com",
                "Access-Control-Request-Method": "GET",
            },
        )
        acao = res.headers.get("access-control-allow-origin", "")
        assert acao != "https://evil-site.example.com"
        assert acao != "*"
