"""
run_inference.py — ML Inference Script (placeholder)

This script will:
1. Load the trained model from a saved file (e.g., model.pkl)
2. Query shop.db for all unshipped orders without predictions
3. Compute feature vectors for each order
4. Run the model to produce late_delivery_probability scores
5. Write results to the order_predictions table in shop.db

Usage:
    python jobs/run_inference.py

Replace the placeholder body below with your real ML pipeline.
"""

import sqlite3
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "backend", "ShopProject.API", "shop.db")


def main():
    print(f"[{datetime.now(timezone.utc).isoformat()}] Starting inference run...")
    print(f"Connecting to: {os.path.abspath(DB_PATH)}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Ensure target table exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS order_predictions (
            order_id INTEGER PRIMARY KEY,
            late_delivery_probability REAL,
            predicted_late_delivery INTEGER,
            prediction_timestamp TEXT
        )
    """)

    # TODO: Replace with real model loading and feature engineering
    # Example stub — inserts a placeholder prediction for all unscored orders
    cursor.execute("""
        SELECT o.order_id
        FROM orders o
        LEFT JOIN shipments s ON s.order_id = o.order_id
        LEFT JOIN order_predictions p ON p.order_id = o.order_id
        WHERE s.shipment_id IS NULL
          AND p.order_id IS NULL
        LIMIT 100
    """)
    unscored = cursor.fetchall()

    if not unscored:
        print("No unscored unshipped orders found.")
        conn.close()
        return

    now = datetime.now(timezone.utc).isoformat()
    for (order_id,) in unscored:
        # Placeholder: assign a random-ish probability based on order_id parity
        prob = 0.35 if order_id % 2 == 0 else 0.72
        predicted = 1 if prob >= 0.5 else 0
        cursor.execute("""
            INSERT OR REPLACE INTO order_predictions
                (order_id, late_delivery_probability, predicted_late_delivery, prediction_timestamp)
            VALUES (?, ?, ?, ?)
        """, (order_id, prob, predicted, now))

    conn.commit()
    conn.close()

    print(f"Scored {len(unscored)} orders. Done.")


if __name__ == "__main__":
    main()
