from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import UserModel
from app.utils.auth_helpers import hash_password, verify_password, generate_token
from app.utils.validators import validate_register_body, validate_login_body
from app import get_db
from bson import ObjectId

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json(silent=True) or {}

        error = validate_register_body(data)
        if error:
            return jsonify({"success": False, "error": error}), 400

        existing = UserModel.find_by_email(data["email"])
        if existing:
            return jsonify({"success": False, "error": "Email already registered."}), 400

        class_id = None
        db = get_db()

        if data.get("role") == "student" and data.get("class_code"):
            class_doc = db.classes.find_one({"class_code": data["class_code"].strip().upper()})
            if not class_doc:
                return jsonify({"success": False, "error": "Invalid class code."}), 400
            class_id = str(class_doc["_id"])

        password_hash = hash_password(data["password"])
        user_id = UserModel.create(
            name=data["name"].strip(),
            email=data["email"],
            password_hash=password_hash,
            role=data["role"],
            class_id=class_id,
        )

        # If student joined a class, add to student_ids list
        if class_id:
            db.classes.update_one(
                {"_id": ObjectId(class_id)},
                {"$addToSet": {"student_ids": user_id}},
            )

        token = generate_token(str(user_id))
        return jsonify({"success": True, "data": {"user_id": str(user_id), "token": token}}), 201

    except Exception as e:
        return jsonify({"success": False, "error": f"Registration failed: {str(e)}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(silent=True) or {}

        error = validate_login_body(data)
        if error:
            return jsonify({"success": False, "error": error}), 400

        user = UserModel.find_by_email(data["email"])
        if not user:
            return jsonify({"success": False, "error": "Invalid email or password."}), 401

        if not verify_password(data["password"], user["password_hash"]):
            return jsonify({"success": False, "error": "Invalid email or password."}), 401

        UserModel.update_last_active(str(user["_id"]))
        token = generate_token(str(user["_id"]))

        return jsonify(
            {
                "success": True,
                "data": {
                    "token": token,
                    "user": {
                        "name": user["name"],
                        "role": user["role"],
                        "karma_points": user.get("karma_points", 0),
                    },
                },
            }
        ), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Login failed: {str(e)}"}), 500


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    try:
        user_id = get_jwt_identity()
        user = UserModel.find_by_id(user_id)
        if not user:
            return jsonify({"success": False, "error": "User not found."}), 404

        return jsonify({"success": True, "data": UserModel.safe_dict(user)}), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Could not fetch profile: {str(e)}"}), 500
