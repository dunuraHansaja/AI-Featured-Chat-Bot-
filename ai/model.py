import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_CSV = os.path.join(BASE_DIR, 'GroceryDataset.csv')

# Fallback sample data when no CSV is present
FALLBACK_TITLES = [
    'Milk',
    'Eggs',
    'Bread',
    'Rice',
    'Sugar',
    'Salt',
    'Butter',
    'Cheese',
    'Apple',
    'Banana'
]


def load_dataset(csv_path=None):
    csv_path = csv_path or DEFAULT_CSV

    if os.path.isfile(csv_path):
        df_local = pd.read_csv(csv_path)
        print(f"Loaded dataset from {csv_path}")
    else:
        print(f"Dataset not found at {csv_path}, using fallback sample items")
        df_local = pd.DataFrame({'Title': FALLBACK_TITLES})

    # Ensure Title column exists
    if 'Title' not in df_local.columns:
        raise ValueError('Dataset must contain a Title column')

    df_local.columns = df_local.columns.str.strip()
    df_local['Title'] = df_local['Title'].astype(str)
    df_local = df_local.dropna(subset=['Title']).drop_duplicates(subset=['Title']).reset_index(drop=True)

    return df_local


def build_model(data_frame):
    vectorizer_ = TfidfVectorizer(stop_words='english')
    tfidf_matrix_ = vectorizer_.fit_transform(data_frame['Title'])
    cosine_sim_ = cosine_similarity(tfidf_matrix_, tfidf_matrix_)
    return vectorizer_, tfidf_matrix_, cosine_sim_


df = load_dataset()
vectorizer, tfidf_matrix, cosine_sim = build_model(df)


def retrain():
    global df, vectorizer, tfidf_matrix, cosine_sim
    vectorizer, tfidf_matrix, cosine_sim = build_model(df)


def upsert_items(items):
    global df

    if not items:
        return []

    cleaned = []
    for item in items:
        if not item:
            continue
        s = str(item).strip()
        if s:
            cleaned.append(s)

    if len(cleaned) == 0:
        return []

    existing_lower = set(df['Title'].str.lower())
    new_titles = [x for x in cleaned if x.lower() not in existing_lower]

    if new_titles:
        df = pd.concat([df, pd.DataFrame({'Title': new_titles})], ignore_index=True)
        df.drop_duplicates(subset=['Title'], inplace=True, ignore_index=True)
        retrain()

    return new_titles


def recommend(product_name, top_n=5):
    if not product_name or not str(product_name).strip():
        return ['Please provide a product name']

    query = str(product_name).strip()
    idx = df[df['Title'].str.contains(query, case=False, na=False)].index

    if len(idx) == 0:
        return ['Product not found']

    idx = idx[0]
    scores = list(enumerate(cosine_sim[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    top = scores[1:top_n + 1]
    if not top:
        return ['No recommendations available']

    recommendations = df['Title'].iloc[[x[0] for x in top]].tolist()
    return recommendations