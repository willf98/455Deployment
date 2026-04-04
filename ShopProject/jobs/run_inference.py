"""
run_inference.py — Fraud Detection ML Inference Script

1. Attempts to load the serialized fraud_model.pkl artifact from the notebook.
2. If the pkl is unavailable or incompatible, trains a fresh Logistic Regression
   on all orders with known is_fraud labels (features available at order-placement time).
3. Scores all unshipped orders that have not yet been scored.
4. Writes fraud_probability and predicted_fraud to the order_predictions table.

Usage:
    python jobs/run_inference.py
"""

import sqlite3
import os
import pandas as pd
import numpy as np
from datetime import datetime, timezone
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
import joblib
import warnings
warnings.filterwarnings("ignore")

DB_PATH    = os.path.join(os.path.dirname(__file__), "..", "backend", "ShopProject.API", "shop.db")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "fraud_model.pkl")

# Features available at order-placement time (no shipment data — unshipped orders have none)
NUM_FEATS = [
    "promo_used", "order_subtotal", "shipping_fee", "tax_amount",
    "order_total", "risk_score", "customer_active",
    "item_count", "total_qty",
    "order_hour", "order_dow",
    "zip_mismatch", "state_mismatch", "foreign_ip", "high_value",
]
CAT_FEATS = [
    "payment_method", "device_type", "gender",
    "customer_segment", "loyalty_tier",
]

DEFAULT_THRESHOLD = 0.30   # Lower than 0.5 to improve recall on ~6% fraud rate


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    dt = pd.to_datetime(df["order_datetime"], format="mixed", utc=True)
    df["order_hour"]    = dt.dt.hour
    df["order_dow"]     = dt.dt.dayofweek
    df["zip_mismatch"]  = (df["billing_zip"] != df["shipping_zip"]).astype(int)
    df["state_mismatch"]= (df["customer_state"] != df["shipping_state"]).astype(int)
    df["foreign_ip"]    = (df["ip_country"] != "US").astype(int)
    df["high_value"]    = (df["order_total"] > df["order_total"].quantile(0.90)).astype(int)
    return df


def build_preprocessor():
    num_pipe = Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale",  StandardScaler()),
    ])
    cat_pipe = Pipeline([
        ("impute", SimpleImputer(strategy="most_frequent")),
        ("encode", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])
    return ColumnTransformer([
        ("num", num_pipe, NUM_FEATS),
        ("cat", cat_pipe, CAT_FEATS),
    ])


def load_all_orders(conn) -> pd.DataFrame:
    """Load all labeled orders for training (is_fraud is set at order creation)."""
    query = """
        SELECT
            o.order_id,
            o.order_datetime,
            o.payment_method,
            o.device_type,
            o.ip_country,
            o.promo_used,
            o.order_subtotal,
            o.shipping_fee,
            o.tax_amount,
            o.order_total,
            o.risk_score,
            o.billing_zip,
            o.shipping_zip,
            o.shipping_state,
            o.is_fraud,
            c.gender,
            c.customer_segment,
            c.loyalty_tier,
            c.is_active AS customer_active,
            c.state     AS customer_state,
            COUNT(oi.order_item_id) AS item_count,
            SUM(oi.quantity)        AS total_qty
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        GROUP BY o.order_id
    """
    return pd.read_sql(query, conn)


def load_unscored_unshipped_orders(conn) -> pd.DataFrame:
    """Load unshipped orders that have not yet received a fraud prediction."""
    query = """
        SELECT
            o.order_id,
            o.order_datetime,
            o.payment_method,
            o.device_type,
            o.ip_country,
            o.promo_used,
            o.order_subtotal,
            o.shipping_fee,
            o.tax_amount,
            o.order_total,
            o.risk_score,
            o.billing_zip,
            o.shipping_zip,
            o.shipping_state,
            c.gender,
            c.customer_segment,
            c.loyalty_tier,
            c.is_active AS customer_active,
            c.state     AS customer_state,
            COUNT(oi.order_item_id) AS item_count,
            SUM(oi.quantity)        AS total_qty
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        LEFT JOIN shipments s  ON s.order_id = o.order_id
        LEFT JOIN order_predictions p ON p.order_id = o.order_id
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        WHERE s.shipment_id IS NULL
          AND p.order_id    IS NULL
        GROUP BY o.order_id
    """
    return pd.read_sql(query, conn)


def try_load_pkl_model():
    """
    Try to load fraud_model.pkl. The notebook saves a dict artifact:
        {'model': pipeline, 'threshold': float, 'feature_names': list}
    Returns (model, threshold) or (None, None) if unavailable/incompatible.
    """
    abs_path = os.path.abspath(MODEL_PATH)
    if not os.path.exists(abs_path):
        return None, None
    try:
        artifact = joblib.load(abs_path)
        if isinstance(artifact, dict) and "model" in artifact:
            print(f"Loaded fraud_model.pkl artifact (threshold={artifact.get('threshold', DEFAULT_THRESHOLD):.3f})")
            return artifact["model"], artifact.get("threshold", DEFAULT_THRESHOLD)
        # Older notebook format — bare pipeline, no threshold stored
        print("Loaded fraud_model.pkl (bare pipeline, using default threshold)")
        return artifact, DEFAULT_THRESHOLD
    except Exception as e:
        print(f"Could not load fraud_model.pkl ({e}). Will retrain.")
        return None, None


def train_model(train_df: pd.DataFrame):
    """Train a Logistic Regression fraud classifier on order-time features."""
    train_df = engineer_features(train_df)
    X = train_df[NUM_FEATS + CAT_FEATS]
    y = train_df["is_fraud"]
    model = Pipeline([
        ("prep", build_preprocessor()),
        ("clf",  LogisticRegression(
            C=0.1, class_weight="balanced", max_iter=2000, random_state=42
        )),
    ])
    model.fit(X, y)
    print(f"Fraud model trained on {len(train_df)} orders "
          f"(fraud rate: {y.mean():.2%}).")
    return model, DEFAULT_THRESHOLD


def ensure_schema(cursor):
    """Drop the old late-delivery table and create the fraud-prediction table."""
    cursor.execute("DROP TABLE IF EXISTS order_predictions")
    cursor.execute("""
        CREATE TABLE order_predictions (
            order_id             INTEGER PRIMARY KEY,
            fraud_probability    REAL,
            predicted_fraud      INTEGER,
            prediction_timestamp TEXT
        )
    """)


def main():
    print(f"[{datetime.now(timezone.utc).isoformat()}] Starting fraud inference run...")
    print(f"Connecting to: {os.path.abspath(DB_PATH)}")

    conn   = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Recreate table with fraud columns (drops old late-delivery schema if present)
    ensure_schema(cursor)
    conn.commit()

    # --- Always retrain on order-time features (no shipment columns) ---
    # The notebook pkl was trained with shipment features unavailable at scoring time,
    # so we retrain fresh each run using only features present for unshipped orders.
    all_orders_df = load_all_orders(conn)
    if all_orders_df.empty:
        print("No labeled orders available for training.")
        conn.close()
        return
    model, threshold = train_model(all_orders_df)

    # --- Score unshipped orders ---
    unshipped_df = load_unscored_unshipped_orders(conn)
    if unshipped_df.empty:
        print("No unscored unshipped orders found.")
        conn.close()
        return

    unshipped_df = engineer_features(unshipped_df)
    X_pred = unshipped_df[NUM_FEATS + CAT_FEATS]
    probs  = model.predict_proba(X_pred)[:, 1]
    preds  = (probs >= threshold).astype(int)

    now = datetime.now(timezone.utc).isoformat()
    for order_id, prob, pred in zip(unshipped_df["order_id"], probs, preds):
        cursor.execute("""
            INSERT OR REPLACE INTO order_predictions
                (order_id, fraud_probability, predicted_fraud, prediction_timestamp)
            VALUES (?, ?, ?, ?)
        """, (int(order_id), float(prob), int(pred), now))

    conn.commit()
    conn.close()
    flagged = int(preds.sum())
    print(f"Scored {len(unshipped_df)} orders — {flagged} flagged as potentially fraudulent "
          f"(threshold={threshold:.2f}). Done.")


if __name__ == "__main__":
    main()
