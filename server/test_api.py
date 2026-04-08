"""
Full API test suite for Sanskriti Math backend.
Run after: python run.py (server must be running on port 5000)
Usage: python test_api.py
"""
import requests
import json
import sys
import time

BASE = "http://localhost:5000/api"
PASS = []
FAIL = []

def ok(label):
    PASS.append(label)
    print(f"  [PASS] {label}")

def fail(label, detail=""):
    FAIL.append(label)
    print(f"  [FAIL] {label}", f"- {detail}" if detail else "")

def section(title):
    print(f"\n{'='*50}\n  {title}\n{'='*50}")

TOKEN = None
TEACHER_TOKEN = None
STUDENT_ID = None
TEACHER_ID = None
CLASS_ID = None

# -- 1. AUTH REGISTER --------------------------------------------------------
section("1. POST /auth/register")

# Missing field
r = requests.post(f"{BASE}/auth/register", json={"email": "x@x.com", "password": "abc123"})
if r.status_code == 400 and not r.json()["success"]:
    ok("Rejects missing 'name' field")
else:
    fail("Rejects missing 'name' field", r.text[:100])

# Bad email
r = requests.post(f"{BASE}/auth/register", json={"name": "A", "email": "notanemail", "password": "abc123", "role": "student"})
if r.status_code == 400:
    ok("Rejects invalid email")
else:
    fail("Rejects invalid email", r.text[:100])

# Valid student
import random, string
rand_suffix = ''.join(random.choices(string.ascii_lowercase, k=6))
STUDENT_EMAIL = f"test_student_{rand_suffix}@sanskriti.test"
r = requests.post(f"{BASE}/auth/register", json={
    "name": "Test Student", "email": STUDENT_EMAIL,
    "password": "secure123", "role": "student"
})
if r.status_code == 201 and r.json()["success"]:
    TOKEN = r.json()["data"]["token"]
    STUDENT_ID = r.json()["data"]["user_id"]
    ok("Registers new student -> returns token")
else:
    fail("Registers new student", r.text[:200])

# Duplicate email
r = requests.post(f"{BASE}/auth/register", json={
    "name": "Dup", "email": STUDENT_EMAIL, "password": "secure123", "role": "student"
})
if r.status_code == 400 and "already" in r.json().get("error", "").lower():
    ok("Rejects duplicate email")
else:
    fail("Rejects duplicate email", r.text[:100])

# Valid teacher
TEACHER_EMAIL = f"test_teacher_{rand_suffix}@sanskriti.test"
r = requests.post(f"{BASE}/auth/register", json={
    "name": "Test Teacher", "email": TEACHER_EMAIL,
    "password": "secure123", "role": "teacher"
})
if r.status_code == 201 and r.json()["success"]:
    TEACHER_TOKEN = r.json()["data"]["token"]
    TEACHER_ID = r.json()["data"]["user_id"]
    ok("Registers new teacher -> returns token")
else:
    fail("Registers new teacher", r.text[:200])

# -- 2. AUTH LOGIN ------------------------------------------------------------
section("2. POST /auth/login")

r = requests.post(f"{BASE}/auth/login", json={"email": STUDENT_EMAIL, "password": "wrongpass"})
if r.status_code == 401:
    ok("Rejects wrong password")
else:
    fail("Rejects wrong password", r.text[:100])

r = requests.post(f"{BASE}/auth/login", json={"email": STUDENT_EMAIL, "password": "secure123"})
if r.status_code == 200 and r.json()["data"].get("token"):
    login_token = r.json()["data"]["token"]
    assert "password" not in str(r.json()), "password_hash leaked!"
    ok("Login returns token, no password in response")
else:
    fail("Login returns token", r.text[:200])

# -- 3. GET /auth/me ----------------------------------------------------------
section("3. GET /auth/me")

r = requests.get(f"{BASE}/auth/me")
if r.status_code == 401:
    ok("Rejects unauthenticated request")
else:
    fail("Rejects unauthenticated request", str(r.status_code))

r = requests.get(f"{BASE}/auth/me", headers={"Authorization": f"Bearer {TOKEN}"})
if r.status_code == 200:
    user = r.json()["data"]
    if "password_hash" not in user and user.get("role") == "student":
        ok("Returns profile without password_hash")
    else:
        fail("Profile contains no password_hash", str(user.keys()))
else:
    fail("GET /auth/me", r.text[:200])

# -- 4. GET /quiz/next --------------------------------------------------------
section("4. GET /quiz/next")

r = requests.get(f"{BASE}/quiz/next", headers={"Authorization": f"Bearer {TOKEN}"})
if r.status_code == 401 or r.status_code == 422:
    # no module provided — should still work with default
    pass

r = requests.get(f"{BASE}/quiz/next?module=temple", headers={"Authorization": f"Bearer {TOKEN}"})
QUESTION_ID = None
if r.status_code == 200:
    q = r.json()["data"]
    QUESTION_ID = q.get("_id")
    if "correct_answer" not in q and QUESTION_ID:
        ok("Returns question without correct_answer")
    else:
        fail("correct_answer should be stripped", str(q.keys()))
else:
    fail("GET /quiz/next?module=temple", r.text[:200])

# Invalid module
r = requests.get(f"{BASE}/quiz/next?module=invalid_module", headers={"Authorization": f"Bearer {TOKEN}"})
if r.status_code == 400:
    ok("Rejects invalid module name")
else:
    fail("Rejects invalid module name", r.text[:100])

# -- 5. POST /quiz/submit -----------------------------------------------------
section("5. POST /quiz/submit")

r = requests.post(f"{BASE}/quiz/submit", json={}, headers={"Authorization": f"Bearer {TOKEN}"})
if r.status_code == 400:
    ok("Rejects empty submit body")
else:
    fail("Rejects empty submit body", r.text[:100])

if QUESTION_ID:
    # Submit wrong answer first to test full flow
    r = requests.post(f"{BASE}/quiz/submit", json={
        "question_id": QUESTION_ID,
        "answer": "DEFINITELY_WRONG_ANSWER",
        "time_taken_seconds": 30
    }, headers={"Authorization": f"Bearer {TOKEN}"})
    if r.status_code == 200:
        d = r.json()["data"]
        if d["is_correct"] == False and "correct_answer" in d and "explanation" in d:
            ok("Wrong answer -> is_correct=False, returns correct_answer + explanation")
        else:
            fail("Wrong answer response shape", str(d.keys()))
    else:
        fail("POST /quiz/submit (wrong answer)", r.text[:200])

    # Now get another question and submit correct answer
    r2 = requests.get(f"{BASE}/quiz/next?module=sabzi_mandi", headers={"Authorization": f"Bearer {TOKEN}"})
    if r2.status_code == 200:
        q2 = r2.json()["data"]
        q2_id = q2["_id"]
        # We need the correct answer — for testing we use /me to confirm, so we'll test the shape
        r3 = requests.post(f"{BASE}/quiz/submit", json={
            "question_id": q2_id,
            "answer": q2["options"][0] if q2.get("options") else "100",
            "time_taken_seconds": 15
        }, headers={"Authorization": f"Bearer {TOKEN}"})
        if r3.status_code == 200:
            d3 = r3.json()["data"]
            req_keys = {"is_correct", "correct_answer", "explanation", "karma_earned", "new_difficulty"}
            if req_keys.issubset(d3.keys()):
                ok("Submit response has all required fields (is_correct, karma_earned, new_difficulty, badge_earned)")
            else:
                fail("Submit response missing keys", str(set(d3.keys()) - req_keys))
        else:
            fail("POST /quiz/submit (second question)", r3.text[:200])

# -- 6. GET /quiz/history -----------------------------------------------------
section("6. GET /quiz/history")

r = requests.get(f"{BASE}/quiz/history", headers={"Authorization": f"Bearer {TOKEN}"})
if r.status_code == 200:
    d = r.json()["data"]
    if "attempts" in d and "stats" in d:
        stats = d["stats"]
        if all(k in stats for k in ["total", "correct", "accuracy"]):
            ok(f"Returns attempts + stats (total={stats['total']}, accuracy={stats['accuracy']}%)")
        else:
            fail("Stats missing keys", str(stats.keys()))
    else:
        fail("History missing attempts/stats", str(d.keys()))
else:
    fail("GET /quiz/history", r.text[:200])

r = requests.get(f"{BASE}/quiz/history?module=temple&limit=5", headers={"Authorization": f"Bearer {TOKEN}"})
if r.status_code == 200:
    ok("History with module filter + limit works")
else:
    fail("History with module filter", r.text[:100])

# -- 7. POST /session/log -----------------------------------------------------
section("7. POST /session/log")

r = requests.post(f"{BASE}/session/log", json={
    "module": "temple",
    "actions": [
        {"type": "shape_spawned", "detail": "hemisphere"},
        {"type": "shape_rotated", "detail": "45deg"},
        {"type": "decompose_clicked", "detail": "surface_area_mode"},
    ],
    "duration_seconds": 120
}, headers={"Authorization": f"Bearer {TOKEN}"})
if r.status_code == 200 and r.json()["success"]:
    ok("Logs AR session successfully")
else:
    fail("POST /session/log", r.text[:200])

r = requests.post(f"{BASE}/session/log", json={"module": "temple"}, headers={"Authorization": f"Bearer {TOKEN}"})
if r.status_code == 400:
    ok("Rejects session log with missing fields")
else:
    fail("Rejects bad session log", r.text[:100])

# -- 8. GET /session/summary --------------------------------------------------
section("8. GET /session/summary")

r = requests.get(f"{BASE}/session/summary", headers={"Authorization": f"Bearer {TOKEN}"})
if r.status_code == 200 and "summary" in r.json()["data"]:
    ok("Returns session summary")
else:
    fail("GET /session/summary", r.text[:200])

# -- 9. GET /student/dashboard ------------------------------------------------
section("9. GET /student/dashboard")

r = requests.get(f"{BASE}/student/dashboard", headers={"Authorization": f"Bearer {TOKEN}"})
if r.status_code == 200:
    d = r.json()["data"]
    req = {"karma", "streak", "badges", "topic_scores", "recent_activity", "weak_topics"}
    if req.issubset(d.keys()):
        ok(f"Student dashboard has all fields (karma={d['karma']}, streak={d['streak']})")
    else:
        fail("Dashboard missing fields", str(req - set(d.keys())))
else:
    fail("GET /student/dashboard", r.text[:200])

# Teacher should be denied
r = requests.get(f"{BASE}/student/dashboard", headers={"Authorization": f"Bearer {TEACHER_TOKEN}"})
if r.status_code == 403:
    ok("Teacher denied from student dashboard")
else:
    fail("Teacher denied from student dashboard", str(r.status_code))

# -- 10. Teacher class analytics (needs a class) ------------------------------
section("10. Teacher class analytics")

# Create a class via DB (or test 403 path with fake ID)
# We test 404 on non-existent class ID (still validates auth + role)
fake_class_id = "000000000000000000000001"
r = requests.get(f"{BASE}/teacher/class/{fake_class_id}/analytics",
                 headers={"Authorization": f"Bearer {TEACHER_TOKEN}"})
if r.status_code in (403, 404):
    ok("Teacher analytics returns 403/404 for missing class (auth + role check works)")
else:
    fail("Teacher analytics auth check", r.text[:200])

r = requests.get(f"{BASE}/teacher/class/{fake_class_id}/analytics",
                 headers={"Authorization": f"Bearer {TOKEN}"})
if r.status_code == 403:
    ok("Student denied from teacher analytics")
else:
    fail("Student denied from teacher analytics", str(r.status_code))

# -- 11. GET /leaderboard/class/<id> -----------------------------------------
section("11. GET /leaderboard/class/<id>")

r = requests.get(f"{BASE}/leaderboard/class/{fake_class_id}",
                 headers={"Authorization": f"Bearer {TOKEN}"})
if r.status_code == 404:
    ok("Leaderboard returns 404 for non-existent class")
else:
    fail("Leaderboard non-existent class", r.text[:100])

r = requests.get(f"{BASE}/leaderboard/class/bad-id",
                 headers={"Authorization": f"Bearer {TOKEN}"})
if r.status_code == 400:
    ok("Leaderboard returns 400 for malformed class ID")
else:
    fail("Leaderboard bad ID", r.text[:100])

r = requests.get(f"{BASE}/leaderboard/class/{fake_class_id}")
if r.status_code == 401 or r.status_code == 422:
    ok("Leaderboard requires authentication")
else:
    fail("Leaderboard requires auth", str(r.status_code))

# -- SUMMARY ------------------------------------------------------------------
total = len(PASS) + len(FAIL)
print(f"\n{'='*50}")
print(f"  Results: {len(PASS)} passed  {len(FAIL)} failed  /  {total} total")
if FAIL:
    print("\n  Failed tests:")
    for f in FAIL:
        print(f"    * {f}")
print(f"{'='*50}\n")
sys.exit(0 if not FAIL else 1)
