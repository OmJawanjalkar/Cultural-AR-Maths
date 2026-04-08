import re


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def is_valid_email(email: str) -> bool:
    return bool(EMAIL_RE.match(email))


def validate_required_fields(data: dict, fields: list) -> str | None:
    """Return an error message if any required field is missing or blank, else None."""
    for field in fields:
        if not data.get(field, None):
            return f"'{field}' is required."
    return None


def validate_register_body(data: dict) -> str | None:
    error = validate_required_fields(data, ["name", "email", "password", "role"])
    if error:
        return error
    if not is_valid_email(data["email"]):
        return "Invalid email format."
    if data["role"] not in ("student", "teacher"):
        return "Role must be 'student' or 'teacher'."
    if len(data["password"]) < 6:
        return "Password must be at least 6 characters."
    return None


def validate_login_body(data: dict) -> str | None:
    return validate_required_fields(data, ["email", "password"])


def validate_submit_body(data: dict) -> str | None:
    error = validate_required_fields(data, ["question_id", "answer", "time_taken_seconds"])
    if error:
        return error
    if not isinstance(data["time_taken_seconds"], (int, float)):
        return "'time_taken_seconds' must be a number."
    return None


def validate_session_log_body(data: dict) -> str | None:
    error = validate_required_fields(data, ["module", "actions", "duration_seconds"])
    if error:
        return error
    if not isinstance(data["actions"], list):
        return "'actions' must be a list."
    return None
