from pymongo import MongoClient
from datetime import datetime, timedelta

client = MongoClient("mongodb://localhost:27017/")
db = client["grievance_ai"]
collection = db["complaints"]

def get_recent_complaints(department, days=15):
    cutoff = datetime.utcnow() - timedelta(days=days)

    complaints = list(collection.find({
        "department": department,
        "created_at": {"$gte": cutoff}
    }))

    return complaints

def store_complaint(data):
    collection.insert_one(data)