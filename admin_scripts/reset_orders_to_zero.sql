-- Reset All Order Quantities to Zero - AgriEase (SUPABASE DATABASE)
-- This script will set all order quantities to 0 without deleting orders
-- This is a safer alternative to completely clearing orders

-- Start transaction to ensure atomicity
BEGIN;

-- 1. Update all order items to have quantity 0
UPDATE order_items 
SET quantity = 0
WHERE quantity > 0;

-- Get count of updated items
SELECT 'Reset ' || ROW_COUNT() || ' order items to quantity 0' AS status;

-- 2. Update all order totals to 0
UPDATE orders 
SET total_amount = 0.00
WHERE total_amount > 0;

SELECT 'Reset ' || ROW_COUNT() || ' order totals to 0' AS status;

-- 3. Update all order statuses to indicate they are reset
UPDATE orders 
SET status = 'CANCELLED',
    updated_at = NOW()
WHERE status != 'CANCELLED';

SELECT 'Cancelled ' || ROW_COUNT() || ' active orders' AS status;

-- 4. Update all booking statuses
UPDATE bookings 
SET status = 'CANCELLED'
WHERE status != 'CANCELLED';

SELECT 'Cancelled ' || ROW_COUNT() || ' active bookings' AS status;

-- Commit all changes
COMMIT;

-- 5. Verify the changes
SELECT 
    'Orders with non-zero amounts: ' || COUNT(*) as remaining_orders
FROM orders 
WHERE total_amount > 0;

SELECT 
    'Order items with non-zero quantities: ' || COUNT(*) as remaining_items
FROM order_items 
WHERE quantity > 0;

SELECT 
    'Active bookings remaining: ' || COUNT(*) as active_bookings
FROM bookings 
WHERE status != 'CANCELLED';

-- Success message
SELECT 'All order quantities reset to 0 and orders cancelled!' as final_status;