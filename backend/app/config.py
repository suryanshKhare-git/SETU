import os
from pydantic import BaseModel


class Settings(BaseModel):
    # =====================================================
    # APPLICATION
    # =====================================================

    app_name: str = "SETU Intelligence Backend"

    version: str = "1.0.0"

    api_v1_prefix: str = "/api/v1"


    # =====================================================
    # CRYPTOGRAPHIC KEYS
    # =====================================================

    encryption_master_key: str = os.getenv(
        "SETU_ENC_KEY",
        "setu-test-master-key-32bytes-len!"
    )

    blind_index_salt: str = os.getenv(
        "SETU_BLIND_SALT",
        "setu-pii-blind-index-salt-secret-99102"
    )

    audit_chain_hmac_secret: str = os.getenv(
        "SETU_AUDIT_SECRET",
        "setu-audit-ledger-hmac-sha256-root-secret"
    )


    # =====================================================
    # RATE LIMITING
    # =====================================================

    rate_limit_per_minute: int = 60

    anomaly_burst_threshold: int = 15


    # =====================================================
    # RETENTION POLICIES
    # =====================================================

    cdr_retention_days: int = 730

    cctv_logs_retention_days: int = 90

    financial_logs_retention_days: int = 2555


    # =====================================================
    # CORS
    # =====================================================
    #
    # Local frontend:
    #   http://localhost:5173
    #   http://localhost:5174
    #
    # Production frontend:
    #   Set FRONTEND_URL on your backend hosting platform.
    #
    # Example:
    # FRONTEND_URL=https://your-site.netlify.app
    #
    # Multiple URLs can be separated by commas.
    #
    # =====================================================

    cors_origins: list[str] = []

    def model_post_init(self, __context):
        local_origins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
        ]

        frontend_url = os.getenv(
            "FRONTEND_URL",
            ""
        ).strip()

        production_origins = []

        if frontend_url:
            production_origins = [
                origin.strip()
                for origin in frontend_url.split(",")
                if origin.strip()
            ]

        self.cors_origins = list(
            dict.fromkeys(
                local_origins +
                production_origins
            )
        )


settings = Settings()