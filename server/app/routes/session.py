from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.session import SessionModel
from app.utils.validators import validate_session_log_body

session_bp = Blueprint("session", __name__)


@session_bp.route("/log", methods=["POST"])
@jwt_required()
def log_session():
    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        error = validate_session_log_body(data)
        if error:
            return jsonify({"success": False, "error": error}), 400

        SessionModel.log(
            user_id=user_id,
            module=data["module"],
            actions=data["actions"],
            duration_seconds=data["duration_seconds"],
        )

        return jsonify({"success": True}), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Could not log session: {str(e)}"}), 500


@session_bp.route("/summary", methods=["GET"])
@jwt_required()
def session_summary():
    try:
        user_id = get_jwt_identity()
        module = request.args.get("module", None)

        summary = SessionModel.get_summary(user_id, module=module)
        return jsonify({"success": True, "data": {"summary": summary}}), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Could not fetch session summary: {str(e)}"}), 500
