from bson import ObjectId
from app import get_db


def get_student_dashboard(user_id: str) -> dict:
    db = get_db()

    uid = ObjectId(user_id)

    # Topic-wise accuracy
    topic_pipeline = [
        {"$match": {"user_id": uid}},
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
    topic_rows = list(db.quiz_attempts.aggregate(topic_pipeline))
    topic_scores = {row["topic"]: row["accuracy"] for row in topic_rows}

    # Weak topics: accuracy < 60%
    weak_topics = [t for t, acc in topic_scores.items() if acc < 60]

    # Recent activity (last 10 attempts)
    recent_cursor = (
        db.quiz_attempts.find({"user_id": uid})
        .sort("timestamp", -1)
        .limit(10)
    )
    recent_activity = []
    for a in recent_cursor:
        recent_activity.append(
            {
                "module": a.get("module"),
                "topic": a.get("topic"),
                "is_correct": a.get("is_correct"),
                "timestamp": a.get("timestamp").isoformat() if a.get("timestamp") else None,
            }
        )

    return {
        "topic_scores": topic_scores,
        "recent_activity": recent_activity,
        "weak_topics": weak_topics,
    }


def get_class_analytics(class_id: str) -> dict:
    db = get_db()

    class_doc = db.classes.find_one({"_id": ObjectId(class_id)})
    if not class_doc:
        return None

    student_ids = class_doc.get("student_ids", [])
    if not student_ids:
        return {
            "class_summary": {"total_students": 0, "average_karma": 0, "average_accuracy": 0},
            "student_list": [],
            "problem_areas": [],
        }

    # Per-student summaries
    student_list = []
    karma_total = 0
    all_accuracies = []

    for sid in student_ids:
        user = db.users.find_one({"_id": sid}, {"name": 1, "karma_points": 1, "streak": 1, "badges": 1})
        if not user:
            continue

        stats_pipeline = [
            {"$match": {"user_id": sid}},
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "correct": {"$sum": {"$cond": ["$is_correct", 1, 0]}},
                }
            },
        ]
        stats_result = list(db.quiz_attempts.aggregate(stats_pipeline))
        total = stats_result[0]["total"] if stats_result else 0
        correct = stats_result[0]["correct"] if stats_result else 0
        accuracy = round((correct / total) * 100, 1) if total > 0 else 0.0

        karma = user.get("karma_points", 0)
        karma_total += karma
        all_accuracies.append(accuracy)

        student_list.append(
            {
                "student_id": str(sid),
                "name": user.get("name", ""),
                "karma_points": karma,
                "streak": user.get("streak", 0),
                "badges_count": len(user.get("badges", [])),
                "total_attempts": total,
                "accuracy": accuracy,
            }
        )

    n = len(student_list)
    avg_karma = round(karma_total / n, 1) if n > 0 else 0
    avg_accuracy = round(sum(all_accuracies) / len(all_accuracies), 1) if all_accuracies else 0

    # Problem areas: questions with lowest correct rate across class
    problem_pipeline = [
        {"$match": {"user_id": {"$in": student_ids}}},
        {
            "$group": {
                "_id": "$question_id",
                "total": {"$sum": 1},
                "correct": {"$sum": {"$cond": ["$is_correct", 1, 0]}},
                "topic": {"$first": "$topic"},
                "module": {"$first": "$module"},
            }
        },
        {
            "$project": {
                "question_id": {"$toString": "$_id"},
                "topic": 1,
                "module": 1,
                "fail_rate": {
                    "$round": [
                        {
                            "$multiply": [
                                {"$subtract": [1, {"$divide": ["$correct", "$total"]}]},
                                100,
                            ]
                        },
                        1,
                    ]
                },
                "_id": 0,
            }
        },
        {"$sort": {"fail_rate": -1}},
        {"$limit": 5},
    ]
    problem_areas = list(db.quiz_attempts.aggregate(problem_pipeline))

    return {
        "class_summary": {
            "total_students": n,
            "average_karma": avg_karma,
            "average_accuracy": avg_accuracy,
        },
        "student_list": sorted(student_list, key=lambda x: x["karma_points"], reverse=True),
        "problem_areas": problem_areas,
    }
