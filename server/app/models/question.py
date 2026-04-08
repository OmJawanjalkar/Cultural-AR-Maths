from bson import ObjectId
from app import get_db

# Map module name → topic field used in difficulty_ratings
MODULE_TOPIC_MAP = {
    "temple": "surface_area",
    "rangoli": "symmetry",
    "sabzi_mandi": "profit_loss",
    "geometry_3d": "volume",
    "general": "arithmetic",
}


class QuestionModel:
    @staticmethod
    def _collection():
        return get_db().questions

    @classmethod
    def find_by_id(cls, question_id: str) -> dict | None:
        try:
            return cls._collection().find_one({"_id": ObjectId(question_id)})
        except Exception:
            return None

    @classmethod
    def find_by_module(cls, module: str, limit: int = 50) -> list:
        return list(cls._collection().find({"module": module}).limit(limit))

    @classmethod
    def find_by_difficulty(cls, module: str, min_diff: float, max_diff: float, exclude_ids: list = None) -> list:
        query = {
            "module": module,
            "difficulty": {"$gte": min_diff, "$lte": max_diff},
        }
        if exclude_ids:
            query["_id"] = {"$nin": [ObjectId(eid) for eid in exclude_ids]}
        return list(cls._collection().find(query))

    @classmethod
    def safe_dict(cls, question: dict) -> dict:
        """Return question dict without correct_answer, with str _id."""
        if question is None:
            return None
        result = {k: v for k, v in question.items() if k != "correct_answer"}
        result["_id"] = str(question["_id"])
        return result
