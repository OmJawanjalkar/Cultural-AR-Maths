from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.question import QuestionModel, MODULE_TOPIC_MAP
from app.models.quiz_attempt import QuizAttemptModel
from app.models.user import UserModel
from app.services.adaptive import get_next_question, update_difficulty
from app.utils.validators import validate_submit_body

quiz_bp = Blueprint("quiz", __name__)

VALID_MODULES = {"temple", "rangoli", "sabzi_mandi", "geometry_3d", "general"}


@quiz_bp.route("/next", methods=["GET"])
@jwt_required()
def next_question():
    try:
        user_id = get_jwt_identity()
        module = request.args.get("module", "general").strip().lower()

        if module not in VALID_MODULES:
            return jsonify({"success": False, "error": f"Invalid module. Choose from: {', '.join(VALID_MODULES)}"}), 400

        question = get_next_question(user_id, module)
        if not question:
            return jsonify({"success": False, "error": "No questions available for this module."}), 404

        return jsonify({"success": True, "data": QuestionModel.safe_dict(question)}), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Could not fetch question: {str(e)}"}), 500


@quiz_bp.route("/submit", methods=["POST"])
@jwt_required()
def submit_answer():
    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        error = validate_submit_body(data)
        if error:
            return jsonify({"success": False, "error": error}), 400

        question = QuestionModel.find_by_id(data["question_id"])
        if not question:
            return jsonify({"success": False, "error": "Question not found."}), 404

        correct_answer = question["correct_answer"]
        given_answer = str(data["answer"]).strip()
        is_correct = given_answer.lower() == correct_answer.lower()

        topic = question.get("topic", MODULE_TOPIC_MAP.get(question.get("module", "general"), "arithmetic"))
        user = UserModel.find_by_id(user_id)
        current_difficulty = user.get("difficulty_ratings", {}).get(topic, 3.0) if user else 3.0

        QuizAttemptModel.create(
            user_id=user_id,
            question_id=data["question_id"],
            module=question.get("module", "general"),
            topic=topic,
            difficulty_at_time=current_difficulty,
            answer_given=given_answer,
            is_correct=is_correct,
            time_taken_seconds=data["time_taken_seconds"],
        )

        result = update_difficulty(user_id, topic, is_correct)

        return jsonify(
            {
                "success": True,
                "data": {
                    "is_correct": is_correct,
                    "correct_answer": correct_answer,
                    "explanation": question.get("explanation", ""),
                    "karma_earned": result["karma_earned"],
                    "new_difficulty": result["new_difficulty"],
                    "badge_earned": result["badge_earned"],
                },
            }
        ), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Submission failed: {str(e)}"}), 500


@quiz_bp.route("/history", methods=["GET"])
@jwt_required()
def quiz_history():
    try:
        user_id = get_jwt_identity()
        module = request.args.get("module", None)
        limit = min(int(request.args.get("limit", 20)), 100)

        if module and module not in VALID_MODULES:
            return jsonify({"success": False, "error": "Invalid module."}), 400

        attempts = QuizAttemptModel.get_history(user_id, module=module, limit=limit)
        stats = QuizAttemptModel.get_stats(user_id, module=module)

        return jsonify({"success": True, "data": {"attempts": attempts, "stats": stats}}), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Could not fetch history: {str(e)}"}), 500
