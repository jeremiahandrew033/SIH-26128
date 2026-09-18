def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "livestock-health-platform-api"
    assert data["phase"] == "phase-1"

def test_system_info_endpoint(client):
    response = client.get("/api/v1/system/info")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "AI-Enabled Livestock Health, Disease Surveillance & Management Platform"
    assert data["version"] == "0.1.0"
    assert data["phase"] == "phase-1"
    assert data["environment"] == "development"
