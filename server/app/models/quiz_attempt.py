from datetime import datetime, timezone
from bson import ObjectId
from app import get_db


class QuizAttemptModel:
    @staticmethod
    def _collection():
        return get_db().quiz_attempts

    @classmethod
    def create(
        cls,
        user_id: str,
        question_id: str,
        module: str,
        topic: str,
        difficulty_at_time: float,
        answer_given: str,
        is_correct: bool,
        time_taken_seconds: int,
    ) -> ObjectId:
        doc = {
            "user_id": ObjectId(user_id),
            "question_id": ObjectId(question_id),
            "module": module,
            "topic": topic,
            "difficulty_at_time": difficulty_at_time,
            "answer_given": answer_given,
            "is_correct": is_correct,
            "time_taken_seconds": int(time_taken_seconds),
            "timestamp": datetime.now(timezone.utc),
        }
        result = cls._collection().insert_one(doc)
        return result.inserted_id

    @classmethod
    def get_history(cls, user_id: str, module: str = None, limit: int = 20) -> list:
        query = {"user_id": ObjectId(user_id)}
        if module:
            query["module"] = module
        cursor = cls._collection().find(query).sort("timestamp", -1).limit(limit)
        attempts = []
        for a in cursor:
            a["_id"] = str(a["_id"])
            a["user_id"] = str(a["user_id"])
            a["question_id"] = str(a["question_id"])
            attempts.append(a)
        return attempts

    @classmethod
    def get_stats(cls, user_id: str, module: str = None) -> dict:
        query = {"user_id": ObjectId(user_id)}
        if module:
            query["module"] = module
        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "correct": {"$sum": {"$cond": ["$is_correct", 1, 0]}},
                }
            },
        ]
        result = list(cls._collection().aggregate(pipeline))
        if not result:
            return {"total": 0, "correct": 0, "accuracy": 0.0}
        total = result[0]["total"]
        correct = result[0]["correct"]
        accuracy = round((correct / total) * 100, 1) if total > 0 else 0.0
        return {"total": total, "correct": correct, "accuracy": accuracy}

    @classmethod
    def get_recently_correct_question_ids(cls, user_id: str, hours: int = 24) -> list:
        from datetime import timedelta
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        cursor = cls._collection().find(
            {
                "user_id": ObjectId(user_id),
                "is_correct": True,
                "timestamp": {"$gte": cutoff},
            },
            {"question_id": 1},
        )
        return [str(doc["question_id"]) for doc in cursor]

    @classmethod
    def get_topic_accuracy(cls, user_id: str) -> list:
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {
                "$group": {
                    "_id": "$topic",
                    "total": {"$sum": 1},
                    "correct": {"$sum": {"$cond": ["$is_correct", 1, 0]}},
                }
            },
            {
                "$project": {
                    "topic": "$_id",
                    "total": 1,
                    "correct": 1,
                    "accuracy": {
                        "$round": [
                            {"$multiply": [{"$divide": ["$correct", "$total"]}, 100]},
                            1,
                        ]
                    },
                    "_id": 0,
                }
            },
        ]
        return list(cls._collection().aggregate(pipeline))
