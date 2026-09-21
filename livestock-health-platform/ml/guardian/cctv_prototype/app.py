"""
Livestock Behaviour Tracker - Streamlit Entry Point
Alias for herd_app.py to match the project README convention.
Run with:
    streamlit run app.py --server.port 8501 --server.enableCORS false --server.enableXsrfProtection false
"""
from herd_app import render_app

if __name__ == "__main__":
    render_app()
