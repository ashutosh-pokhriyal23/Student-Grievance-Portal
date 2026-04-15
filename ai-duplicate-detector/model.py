from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load model once (IMPORTANT)
model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embedding(text):
    return model.encode(text).tolist()

def find_similarity(new_embedding, old_embeddings):
    similarities = cosine_similarity([new_embedding], old_embeddings)[0]
    return similarities