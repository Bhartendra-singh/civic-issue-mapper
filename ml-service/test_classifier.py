from category_classifier import predict_category

test_sentences = [
    "bahut bada gaddha hai road pe",
    "garbage is piling up near my house",
    "paani bhar gaya hai sadak par",
    "street light nahi jal rahi raat ko",
    "naali block ho gayi hai",
    "stray dogs are creating problems",
]

for sentence in test_sentences:
    result = predict_category(sentence)
    print(f"'{sentence}' → {result['category']} (confidence: {result['confidence']})")