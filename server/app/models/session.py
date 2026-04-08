from datetime import datetime, timezone
from bson import ObjectId
from app import get_db


class SessionModel:
    @staticmethod
    def _collection():
        return get_db().sessions

    @classmethod
    def log(cls, user_id: str, module: str, actions: list, duration_seconds: int) -> ObjectId:
        now = datetime.now(timezone.utc)
        # Stamp each action with a timestamp if missing
        stamped_actions = []
        for action in actions:
            stamped_actions.append(
                {
                    "type": action.get("type", "unknown"),
                    "detail": action.get("detail", ""),
                    "timestamp": now,
                }
            )
        doc = {
            "user_id": ObjectId(user_id),
            "module": module,
            "actions": stamped_actions,
            "duration_seconds": int(duration_seconds),
            "started_at": now,
            "ended_at": now,
        }
        result = cls._collection().insert_one(doc)
        return result.inserted_id

    @classmethod
    def get_summary(cls, user_id: str, module: str = None) -> dict:
        query = {"user_id": ObjectId(user_id)}
        if module:
            query["module"] = module
        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": "$module",
                    "total_sessions": {"$sum": 1},
                    "total_duration_seconds": {"$sum": "$duration_seconds"},
                    "total_actions": {"$sum": {"$size": "$actions"}},
                }
            },
            {
                "$project": {
                    "module": "$_id",
                    "total_sessions": 1,
                    "total_duration_seconds": 1,
                    "total_actions": 1,
                    "_id": 0,
                }
            },
        ]
        return list(cls._collection().aggregate(pipeline))
