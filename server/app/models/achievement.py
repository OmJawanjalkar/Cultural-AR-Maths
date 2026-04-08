from datetime import datetime, timezone
from bson import ObjectId
from app import get_db


class AchievementModel:
    @staticmethod
    def _collection():
        return get_db().achievements

    @classmethod
    def award(cls, user_id: str, badge_name: str, badge_icon: str, criteria: str) -> ObjectId:
        doc = {
            "user_id": ObjectId(user_id),
            "badge_name": badge_name,
            "badge_icon": badge_icon,
            "criteria": criteria,
            "earned_at": datetime.now(timezone.utc),
        }
        result = cls._collection().insert_one(doc)
        return result.inserted_id

    @classmethod
    def has_badge(cls, user_id: str, badge_name: str) -> bool:
        return cls._collection().find_one(
            {"user_id": ObjectId(user_id), "badge_name": badge_name}
        ) is not None

    @classmethod
    def get_user_badges(cls, user_id: str) -> list:
        cursor = cls._collection().find({"user_id": ObjectId(user_id)}).sort("earned_at", -1)
        badges = []
        for b in cursor:
            b["_id"] = str(b["_id"])
            b["user_id"] = str(b["user_id"])
            badges.append(b)
        return badges
