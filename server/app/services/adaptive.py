import random
from app.models.user import UserModel
from app.models.question import QuestionModel, MODULE_TOPIC_MAP
from app.models.quiz_attempt import QuizAttemptModel
from app.models.achievement import AchievementModel

# Badge definitions: (badge_name, badge_icon, criteria_description, check_fn(user, topic, stats))
BADGE_DEFINITIONS = [
    (
        "First Step",
        "🎯",
        "Answer your first question correctly.",
        lambda user, topic, stats: stats.get("correct", 0) >= 1,
    ),
    (
        "On Fire",
        "🔥",
        "Reach a streak of 5 correct answers.",
        lambda user, topic, stats: user.get("streak", 0) >= 5,
    ),
    (
        "Century",
        "💯",
        "Score 100 karma points.",
        lambda user, topic, stats: user.get("karma_points", 0) >= 100,
    ),
    (
        "Knowledge Seeker",
        "📚",
        "Answer 20 questions correctly.",
        lambda user, topic, stats: stats.get("correct", 0) >= 20,
    ),
    (
        "Math Guru",
        "🏆",
        "Score 500 karma points.",
        lambda user, topic, stats: user.get("karma_points", 0) >= 500,
    ),
    (
        "Perfectionist",
        "⭐",
        "Reach difficulty level 5.0 in any topic.",
        lambda user, topic, stats: user.get("difficulty_ratings", {}).get(topic, 0) >= 5.0,
    ),
]


def get_next_question(user_id: str, module: str) -> dict | None:
    """
    Return the next question for a user based on their difficulty rating for the module's topic.
    Excludes questions answered correctly in the last 24 hours.
    Returns the full question dict (caller strips correct_answer).
    """
    user = UserModel.find_by_id(user_id)
    if not user:
        return None

    topic = MODULE_TOPIC_MAP.get(module, "arithmetic")
    current_rating = user.get("difficulty_ratings", {}).get(topic, 3.0)

    # Query window ±0.75 around current rating (wider to ensure we get results)
    min_diff = max(1, round(current_rating - 0.75))
    max_diff = min(5, round(current_rating + 0.75))

    # Exclude recently-correct questions
    exclude_ids = QuizAttemptModel.get_recently_correct_question_ids(user_id, hours=24)

    candidates = QuestionModel.find_by_difficulty(module, min_diff, max_diff, exclude_ids)

    if not candidates:
        # Broaden search — all questions in module, still excluding recent correct
        candidates = QuestionModel.find_by_difficulty(module, 1, 5, exclude_ids)

    if not candidates:
        # Last resort — any question in module
        candidates = QuestionModel.find_by_module(module)

    if not candidates:
        return None

    return random.choice(candidates)


def update_difficulty(user_id: str, topic: str, is_correct: bool) -> dict:
    """
    Update ELO-style difficulty rating, karma, and streak.
    Returns dict with karma_earned, new_difficulty, badge_earned (or None).
    """
    user = UserModel.find_by_id(user_id)
    if not user:
        return {"karma_earned": 0, "new_difficulty": 3.0, "badge_earned": None}

    current_rating = user.get("difficulty_ratings", {}).get(topic, 3.0)
    current_streak = user.get("streak", 0)
    current_karma = user.get("karma_points", 0)

    # Update difficulty rating
    if is_correct:
        new_rating = min(5.0, round(current_rating + 0.4, 2))
        new_streak = current_streak + 1
    else:
        new_rating = max(1.0, round(current_rating - 0.3, 2))
        new_streak = 0

    # Calculate karma
    karma_earned = 0
    if is_correct:
        karma_earned += int(10 * current_rating)
        karma_earned += 5 * new_streak

    # Persist changes
    UserModel.update_difficulty_rating(user_id, topic, new_rating)
    UserModel.update_karma_streak(user_id, karma_earned, new_streak)

    # Re-fetch updated user for badge checks
    updated_user = UserModel.find_by_id(user_id)
    stats = QuizAttemptModel.get_stats(user_id)

    badge_earned = _check_and_award_badges(user_id, topic, updated_user, stats)

    return {
        "karma_earned": karma_earned,
        "new_difficulty": new_rating,
        "badge_earned": badge_earned,
    }


def _check_and_award_badges(user_id: str, topic: str, user: dict, stats: dict) -> dict | None:
    """Check badge criteria and award the first newly-earned badge. Returns badge dict or None."""
    for badge_name, badge_icon, criteria, check_fn in BADGE_DEFINITIONS:
        if badge_name in user.get("badges", []):
            continue
        if AchievementModel.has_badge(user_id, badge_name):
            continue
        if check_fn(user, topic, stats):
            AchievementModel.award(user_id, badge_name, badge_icon, criteria)
            UserModel.add_badge(user_id, badge_name)
            return {"badge_name": badge_name, "badge_icon": badge_icon, "criteria": criteria}
    return None
