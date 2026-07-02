from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# "all-MiniLM-L6-v2" model za semantic similarity
model = SentenceTransformer("all-MiniLM-L6-v2")


def recommend(completed_courses, enrolled_courses, interests, all_courses):

    user_parts = []

    for c in completed_courses:
        user_parts.append(c["title"] + " " + c["description"])

    for c in enrolled_courses:
        user_parts.append((c["title"] + " " + c["description"]) * 2)


    if interests:
        user_parts.append(interests * 3)

    user_text = " ".join(user_parts)

    course_texts = [
        c["title"] + " " + c["description"]
        for c in all_courses
    ]

    user_vec = model.encode([user_text])

    course_vecs = model.encode(course_texts)

    similarities = cosine_similarity(user_vec, course_vecs)[0]


    blocked_ids = {c["id"] for c in completed_courses + enrolled_courses}


    scored = []

    for i, score in enumerate(similarities):
        course = all_courses[i]

        if course["id"] in blocked_ids:
            continue

        if score < 0.3:
            continue

        scored.append({
            "id": course["id"],        
            "title": course["title"],  
            "score": float(score)      
        })

    scored.sort(key=lambda x: x["score"], reverse=True)

    return scored