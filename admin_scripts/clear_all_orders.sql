-- Clear All Orders Script - AgriEase (SUPABASE DATABASE)
-- This script will remove all orders from both supplier and farmer dashboards
-- Run these SQL commands directly on your Supabase PostgreSQL database

-- WARNING: This will permanently delete all order data
-- Make sure to backup your database before running this script

\echo 'Starting order clearance process on Supabase...'

-- Start transaction to ensure atomicity
BEGIN;

-- 1. First check what we have
SELECT 
    (SELECT COUNT(*) FROM delivery_tracking) as current_delivery_tracking,
    (SELECT COUNT(*) FROM orders) as current_orders,
    (SELECT COUNT(*) FROM order_items) as current_order_items,
    (SELECT COUNT(*) FROM bookings) as current_bookings,
    (SELECT COUNT(*) FROM payments WHERE 1=1) as current_payments;

-- 2. Delete delivery tracking first (depends on orders)
DELETE FROM delivery_tracking;
\echo 'Cleared delivery tracking'

-- 3. Delete payments first (if payments table exists)
DELETE FROM payments WHERE order_id IN (SELECT id FROM orders);
\echo 'Cleared payments'

-- 4. Delete all order items (due to foreign key constraints)
DELETE FROM order_items;
\echo 'Cleared order items'

-- 5. Delete all orders
DELETE FROM orders;
\echo 'Cleared orders'

-- 6. Delete all equipment bookings
DELETE FROM bookings;
\echo 'Cleared bookings'

-- 7. Reset sequence counters to start fresh
ALTER SEQUENCE IF EXISTS delivery_tracking_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS bookings_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS payments_id_seq RESTART WITH 1;

COMMIT;

-- 8. Final verification
\echo 'Verification of cleanup:'
SELECT 
    (SELECT COUNT(*) FROM delivery_tracking) as delivery_tracking_remaining,
    (SELECT COUNT(*) FROM orders) as orders_remaining,
    (SELECT COUNT(*) FROM order_items) as order_items_remaining,
    (SELECT COUNT(*) FROM bookings) as bookings_remaining,
    (SELECT COUNT(*) FROM payments WHERE 1=1) as payments_remaining;

-- Success message
\echo '✅ All orders successfully cleared from supplier and farmer dashboards!'
