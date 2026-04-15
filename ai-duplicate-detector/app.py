
from flask import Flask, request, jsonify
from model import generate_embedding, find_similarity
from database import get_recent_complaints, store_complaint
from utils import preprocess_text

app = Flask(__name__)

THRESHOLD = 0.80

@app.route("/check-duplicate", methods=["POST"])
def check_duplicate():
    data = request.json

    title = data["title"]
    description = data["description"]
    department = data["department"]

    text = preprocess_text(title, description)

    new_embedding = generate_embedding(text)

    # Fetch old complaints
    old_complaints = get_recent_complaints(department)

    if not old_complaints:
        return jsonify({
            "is_duplicate": False
        })

    old_embeddings = [c["embedding"] for c in old_complaints]

    similarities = find_similarity(new_embedding, old_embeddings)

    max_sim = max(similarities)
    max_index = similarities.tolist().index(max_sim)

    if max_sim >= THRESHOLD:
        matched = old_complaints[max_index]

        return jsonify({
            "is_duplicate": True,
            "similarity": float(max_sim),
            "matched_id": str(matched["_id"])
        })
    else:
        # Store as new complaint
        store_complaint({
            "title": title,
            "description": description,
            "department": department,
            "embedding": new_embedding
        })

        return jsonify({
            "is_duplicate": False,
            "similarity": float(max_sim)
        })

if __name__ == "__main__":
    app.run(port=5001, debug=True)