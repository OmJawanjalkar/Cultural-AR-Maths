import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/sanskriti_math")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "fallback-secret-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    DEBUG = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
