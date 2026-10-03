from fastapi import FastAPI
from sklearn.cluster import DBSCAN
import numpy as np
from category_classifier import predict_category


app = FastAPI()

@app.get("/")
def home():
    return {"message": "DBSCAN microservice is running"}



@app.post("/cluster-reports")
def cluster_reports(data: dict):
    reports = data["reports"]

    categories = set(r["category"] for r in reports)
    results = {}


    for category in categories: 
        group = [r for r in reports if r["category"] == category]


        if len(group) < 2:
            for r in group:
                results[r["id"]] = None
            continue

        coordinates = np.array([[r["lat"], r["lng"]] for r in group])


        model = DBSCAN(eps=0.002, min_samples=2)
        clusters = model.fit_predict(coordinates)

        for i, r in enumerate(group):
            cluster_label = clusters[i]
            if cluster_label == -1:
                results[r["id"]] = None
            else:
                results[r["id"]] = f"{category}-{cluster_label}"

    return {"clusters": results}


@app.post("/suggest-category")
def suggest_category(data: dict):
    description = data["description"]
    result = predict_category(description)
    return result