from datetime import datetime, timezone
from bson import ObjectId
from app import get_db

DEFAULT_DIFFICULTY_RATINGS = {
    "geometry": 3.0,
    "symmetry": 3.0,
    "arithmetic": 3.0,
    "mensuration": 3.0,
    "percentages": 3.0,
    "surface_area": 3.0,
    "volume": 3.0,
    "profit_loss": 3.0,
    "ratio": 3.0,
    "coordinate_geometry": 3.0,
    "multiplication": 3.0,
    "geometric_progression": 3.0,
    "cross_sections": 3.0,
}


class UserModel:
    @staticmethod
    def _collection():
        return get_db().users

    @classmethod
    def create(cls, name: str, email: str, password_hash: str, role: str, class_id: str = None) -> ObjectId:
        doc = {
            "name": name,
            "email": email.lower().strip(),
            "password_hash": password_hash,
            "role": role,
            "class_id": class_id,
            "karma_points": 0,
            "streak": 0,
            "last_active": datetime.now(timezone.utc),
            "badges": [],
            "difficulty_ratings": DEFAULT_DIFFICULTY_RATINGS.copy(),
            "created_at": datetime.now(timezone.utc),
        }
        result = cls._collection().insert_one(doc)
        return result.inserted_id

    @classmethod
    def find_by_email(cls, email: str) -> dict | None:
        return cls._collection().find_one({"email": email.lower().strip()})

    @classmethod
    def find_by_id(cls, user_id: str) -> dict | None:
        try:
            return cls._collection().find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None

    @classmethod
    def update_last_active(cls, user_id: str):
        cls._collection().update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"last_active": datetime.now(timezone.utc)}},
        )

    @classmethod
    def update_karma_streak(cls, user_id: str, karma_delta: int, new_streak: int):
        cls._collection().update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"karma_points": karma_delta}, "$set": {"streak": new_streak}},
        )

    @classmethod
    def update_difficulty_rating(cls, user_id: str, topic: str, new_rating: float):
        cls._collection().update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {f"difficulty_ratings.{topic}": new_rating}},
        )

    @classmethod
    def add_badge(cls, user_id: str, badge_name: str):
        cls._collection().update_one(
            {"_id": ObjectId(user_id)},
            {"$addToSet": {"badges": badge_name}},
        )

    @classmethod
    def safe_dict(cls, user: dict) -> dict:
        """Return user dict without password_hash, with str _id."""
        if user is None:
            return None
        result = {k: v for k, v in user.items() if k != "password_hash"}
        result["_id"] = str(user["_id"])
        return result
