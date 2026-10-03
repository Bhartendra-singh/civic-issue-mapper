from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from training_data import training_data

texts = [item[0] for item in training_data]
labels = [item[1] for item in training_data]

custom_stop_words = [
    'hai', 'hain', 'ho', 'ko', 'ki', 'ka', 'ke', 'me', 'par', 'se',
    'is', 'the', 'a', 'an', 'and', 'this', 'has', 'have', 'been',
    'near', 'my', 'our', 'here', 'yahan',
]

vectorizer = TfidfVectorizer(
    stop_words=custom_stop_words,
    # ngram_range=(1, 2),
)
X = vectorizer.fit_transform(texts)

model = MultinomialNB()
model.fit(X, labels)


def predict_category(description):
    text_vector = vectorizer.transform([description])
    prediction = model.predict(text_vector)[0]

    probabilities = model.predict_proba(text_vector)[0]
    confidence = max(probabilities)

    return {
        "category": prediction,
        "confidence": round(float(confidence), 2),
    }