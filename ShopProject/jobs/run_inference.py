"""
run_inference.py — Late Delivery ML Inference Script

1. Loads shop.db and queries shipped orders (with known late_delivery outcomes) as training data
2. Engineers features available at order-placement time (no shipment features needed)
3. Trains a Random Forest classifier to predict late delivery probability
4. Scores all unshipped orders without existing predictions
5. Writes results to the order_predictions table in shop.db

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
from sklearn.ensemble import RandomForestClassifier
import warnings
warnings.filterwarnings("ignore")

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "ShopProject.API", "shop.db")

# Features available at order time (no shipment data — those don't exist for unshipped orders)
NUM_FEATS = [
    "promo_used", "order_subtotal", "shipping_fee", "tax_amount",
    "order_total", "risk_score", "item_count", "total_qty",
    "order_hour", "order_dow",
]
CAT_FEATS = [
    "payment_method", "device_type", "ip_country",
    "customer_segment", "loyalty_tier",
]


def load_shipped_orders(conn):
    """Load completed (shipped) orders with known late_delivery label for training."""
    query = """
        SELECT
            o.order_id,
            o.payment_method,
            o.device_type,
            o.ip_country,
            o.promo_used,
            o.order_subtotal,
            o.shipping_fee,
            o.tax_amount,
            o.order_total,
            o.risk_score,
            o.order_datetime,
            c.customer_segment,
            c.loyalty_tier,
            s.late_delivery,
            COUNT(oi.order_item_id) AS item_count,
            SUM(oi.quantity)        AS total_qty
        FROM orders o
        JOIN customers c  ON o.customer_id  = c.customer_id
        JOIN shipments s  ON o.order_id     = s.order_id
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        GROUP BY o.order_id
    """
    return pd.read_sql(query, conn)


def load_unshipped_orders(conn):
    """Load unshipped orders that have not yet been scored."""
    query = """
        SELECT
            o.order_id,
            o.payment_method,
            o.device_type,
            o.ip_country,
            o.promo_used,
            o.order_subtotal,
            o.shipping_fee,
            o.tax_amount,
            o.order_total,
            o.risk_score,
            o.order_datetime,
            c.customer_segment,
            c.loyalty_tier,
            COUNT(oi.order_item_id) AS item_count,
            SUM(oi.quantity)        AS total_qty
        FROM orders o
        JOIN customers c  ON o.customer_id  = c.customer_id
        LEFT JOIN shipments s ON s.order_id = o.order_id
        LEFT JOIN order_predictions p ON p.order_id = o.order_id
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        WHERE s.shipment_id IS NULL
          AND p.order_id    IS NULL
        GROUP BY o.order_id
    """
    return pd.read_sql(query, conn)


def engineer_features(df):
    df = df.copy()
    df["order_hour"] = pd.to_datetime(df["order_datetime"]).dt.hour
    df["order_dow"]  = pd.to_datetime(df["order_datetime"]).dt.dayofweek
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


def train_model(train_df):
    train_df = engineer_features(train_df)
    X = train_df[NUM_FEATS + CAT_FEATS]
    y = train_df["late_delivery"]
    model = Pipeline([
        ("prep", build_preprocessor()),
        ("clf",  RandomForestClassifier(
            n_estimators=200, max_depth=10, class_weight="balanced", random_state=42
        )),
    ])
    model.fit(X, y)
    print(f"Model trained on {len(train_df)} shipped orders.")
    return model


def main():
    print(f"[{datetime.now(timezone.utc).isoformat()}] Starting inference run...")
    print(f"Connecting to: {os.path.abspath(DB_PATH)}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS order_predictions (
            order_id                  INTEGER PRIMARY KEY,
            late_delivery_probability REAL,
            predicted_late_delivery   INTEGER,
            prediction_timestamp      TEXT
        )
    """)
    conn.commit()

    # --- Train ---
    train_df = load_shipped_orders(conn)
    if train_df.empty:
        print("No shipped orders available for training.")
        conn.close()
        return

    model = train_model(train_df)

    # --- Score unshipped orders ---
    unshipped_df = load_unshipped_orders(conn)
    if unshipped_df.empty:
        print("No unscored unshipped orders found.")
        conn.close()
        return

    unshipped_df = engineer_features(unshipped_df)
    X_pred = unshipped_df[NUM_FEATS + CAT_FEATS]
    probs = model.predict_proba(X_pred)[:, 1]
    preds = (probs >= 0.5).astype(int)

    now = datetime.now(timezone.utc).isoformat()
    for order_id, prob, pred in zip(unshipped_df["order_id"], probs, preds):
        cursor.execute("""
            INSERT OR REPLACE INTO order_predictions
                (order_id, late_delivery_probability, predicted_late_delivery, prediction_timestamp)
            VALUES (?, ?, ?, ?)
        """, (int(order_id), float(prob), int(pred), now))

    conn.commit()
    conn.close()
    print(f"Scored {len(unshipped_df)} orders. Done.")


if __name__ == "__main__":
    main()
