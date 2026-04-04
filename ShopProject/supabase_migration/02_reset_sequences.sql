-- =============================================================
-- Reset identity sequences after bulk CSV import
-- Run this in Supabase SQL Editor AFTER importing all CSV files
-- =============================================================

SELECT setval(pg_get_serial_sequence('customers',      'customer_id'),   250);
SELECT setval(pg_get_serial_sequence('products',       'product_id'),    100);
SELECT setval(pg_get_serial_sequence('orders',         'order_id'),     5001);
SELECT setval(pg_get_serial_sequence('order_items',    'order_item_id'),15023);
SELECT setval(pg_get_serial_sequence('shipments',      'shipment_id'),   5000);
SELECT setval(pg_get_serial_sequence('product_reviews','review_id'),    3000);
