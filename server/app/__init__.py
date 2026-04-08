import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient, ASCENDING
from .config import Config

CLIENT_DIST = os.path.join(os.path.dirname(__file__), "..", "..", "client", "dist")

mongo_client = None
db = None
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }})
    jwt.init_app(app)

    global mongo_client, db
    mongo_client = MongoClient(
        app.config["MONGO_URI"],
        serverSelectionTimeoutMS=5000,   # fail fast instead of 30s hang
        connectTimeoutMS=5000,
        socketTimeoutMS=10000,
    )
    db = mongo_client["sanskriti_math"]

    # Verify connection at startup (gives a clear error immediately)
    try:
        mongo_client.admin.command("ping")
        print("✅ MongoDB connected successfully")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("   Check your DNS (use 8.8.8.8) or internet connection.")
        raise

    # Ensure indexes
    db.users.create_index([("email", ASCENDING)], unique=True)
    db.quiz_attempts.create_index([("user_id", ASCENDING)])
    db.sessions.create_index([("user_id", ASCENDING)])
    db.classes.create_index([("class_code", ASCENDING)], unique=True)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.quiz import quiz_bp
    from .routes.session import session_bp
    from .routes.dashboard import dashboard_bp
    from .routes.leaderboard import leaderboard_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(quiz_bp, url_prefix="/api/quiz")
    app.register_blueprint(session_bp, url_prefix="/api/session")
    app.register_blueprint(dashboard_bp, url_prefix="/api")
    app.register_blueprint(leaderboard_bp, url_prefix="/api/leaderboard")

    # Serve built React app for all non-API routes (fixes 404 on mobile/direct navigation)
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        if path.startswith("api/"):
            # Let Flask return 404 for unknown API paths rather than serving index.html
            from flask import abort
            abort(404)
        dist = os.path.abspath(CLIENT_DIST)
        file_path = os.path.join(dist, path)
        if path and os.path.exists(file_path):
            return send_from_directory(dist, path)
        return send_from_directory(dist, "index.html")

    return app


def get_db():
    return db
