from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from app.models.user import UserModel
from app.services.analytics import get_student_dashboard, get_class_analytics
from app import get_db

dashboard_bp = Blueprint("dashboard", __name__)

import string
import random

def _generate_class_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


@dashboard_bp.route("/student/dashboard", methods=["GET"])
@jwt_required()
def student_dashboard():
    try:
        user_id = get_jwt_identity()
        user = UserModel.find_by_id(user_id)
        if not user:
            return jsonify({"success": False, "error": "User not found."}), 404

        if user.get("role") != "student":
            return jsonify({"success": False, "error": "Access restricted to students."}), 403

        analytics = get_student_dashboard(user_id)

        return jsonify(
            {
                "success": True,
                "data": {
                    "karma": user.get("karma_points", 0),
                    "streak": user.get("streak", 0),
                    "badges": user.get("badges", []),
                    "difficulty_ratings": user.get("difficulty_ratings", {}),
                    "topic_scores": analytics["topic_scores"],
                    "recent_activity": analytics["recent_activity"],
                    "weak_topics": analytics["weak_topics"],
                },
            }
        ), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Could not load dashboard: {str(e)}"}), 500


@dashboard_bp.route("/teacher/dashboard", methods=["GET"])
@jwt_required()
def teacher_dashboard_auto():
    try:
        user_id = get_jwt_identity()
        user = UserModel.find_by_id(user_id)
        if not user:
            return jsonify({"success": False, "error": "User not found."}), 404
        if user.get("role") != "teacher":
            return jsonify({"success": False, "error": "Access restricted to teachers."}), 403

        db = get_db()
        class_doc = db.classes.find_one({"teacher_id": ObjectId(user_id)})

        # Auto-create a class for the teacher if none exists
        if not class_doc:
            code = _generate_class_code()
            # Ensure uniqueness
            while db.classes.find_one({"class_code": code}):
                code = _generate_class_code()
            result = db.classes.insert_one({
                "teacher_id": ObjectId(user_id),
                "class_code": code,
                "student_ids": [],
            })
            class_doc = db.classes.find_one({"_id": result.inserted_id})

        class_id = str(class_doc["_id"])
        analytics = get_class_analytics(class_id)
        if analytics is None:
            analytics = {"class_summary": {"total_students": 0, "average_karma": 0, "average_accuracy": 0}, "student_list": [], "problem_areas": []}

        analytics["class_code"] = class_doc.get("class_code", "")
        return jsonify({"success": True, "data": analytics}), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Could not load teacher dashboard: {str(e)}"}), 500


@dashboard_bp.route("/teacher/class/<class_id>/analytics", methods=["GET"])
@jwt_required()
def teacher_analytics(class_id):
    try:
        user_id = get_jwt_identity()
        user = UserModel.find_by_id(user_id)
        if not user:
            return jsonify({"success": False, "error": "User not found."}), 404

        if user.get("role") != "teacher":
            return jsonify({"success": False, "error": "Access restricted to teachers."}), 403

        try:
            class_oid = ObjectId(class_id)
        except Exception:
            return jsonify({"success": False, "error": "Invalid class ID."}), 400

        db = get_db()
        class_doc = db.classes.find_one({"_id": class_oid})
        if not class_doc:
            return jsonify({"success": False, "error": "Class not found."}), 404

        if str(class_doc.get("teacher_id")) != user_id:
            return jsonify({"success": False, "error": "You do not own this class."}), 403

        analytics = get_class_analytics(class_id)
        if analytics is None:
            return jsonify({"success": False, "error": "Class analytics unavailable."}), 404

        return jsonify({"success": True, "data": analytics}), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Could not load analytics: {str(e)}"}), 500
