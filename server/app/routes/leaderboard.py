from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from app import get_db

leaderboard_bp = Blueprint("leaderboard", __name__)


@leaderboard_bp.route("/class/<class_id>", methods=["GET"])
@jwt_required()
def class_leaderboard(class_id):
    try:
        db = get_db()

        try:
            class_oid = ObjectId(class_id)
        except Exception:
            return jsonify({"success": False, "error": "Invalid class ID."}), 400

        class_doc = db.classes.find_one({"_id": class_oid})
        if not class_doc:
            return jsonify({"success": False, "error": "Class not found."}), 404

        student_ids = class_doc.get("student_ids", [])
        if not student_ids:
            return jsonify({"success": True, "data": {"leaderboard": []}}), 200

        # Fetch top 20 students by karma
        students = list(
            db.users.find(
                {"_id": {"$in": student_ids}},
                {"name": 1, "karma_points": 1, "streak": 1, "badges": 1},
            ).sort("karma_points", -1).limit(20)
        )

        leaderboard = []
        for rank, student in enumerate(students, start=1):
            leaderboard.append(
                {
                    "rank": rank,
                    "name": student.get("name", ""),
                    "karma": student.get("karma_points", 0),
                    "streak": student.get("streak", 0),
                    "badges_count": len(student.get("badges", [])),
                }
            )

        return jsonify({"success": True, "data": {"leaderboard": leaderboard}}), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Could not fetch leaderboard: {str(e)}"}), 500
