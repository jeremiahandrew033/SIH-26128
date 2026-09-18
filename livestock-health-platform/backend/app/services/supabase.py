"""
Supabase Database Connector Placeholder (Phase 0)

This module provides initial configuration & placeholder hooks for Supabase connection.
Business tables (livestock profiles, disease reports, diagnostic logs) will be created in Phase 1.
"""

import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("livestock-platform.supabase")

class SupabaseService:
    def __init__(self):
        self.url: Optional[str] = settings.SUPABASE_URL
        self.key: Optional[str] = settings.SUPABASE_ANON_KEY
        self.client = None

    def initialize(self) -> bool:
        """
        Initialize the Supabase client when credentials become available in Phase 1.
        """
        if not self.url or not self.key:
            logger.info("[Supabase Placeholder] Credentials not configured. Database layer dormant in Phase 0.")
            return False

        try:
            from supabase import create_client
            self.client = create_client(self.url, self.key)
            logger.info("[Supabase] Connection initialized successfully.")
            return True
        except Exception as e:
            logger.error(f"[Supabase] Connection initialization failed: {e}")
            return False

    def get_status(self) -> dict:
        """
        Returns status metadata for health & diagnostic reporting.
        """
        return {
            "configured": bool(self.url and self.key),
            "status": "dormant_phase_0",
            "message": "Database tables and active connections will be initialized in Phase 1."
        }

supabase_service = SupabaseService()
