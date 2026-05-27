-- Run these SQL commands directly in your PostgreSQL database
-- You can use pgAdmin, DBeaver, or any SQL client

-- 1. Add the new column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS display_order_number INT;

-- 2. Populate existing orders with sequential numbers per farmer
WITH RankedOrders AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY farmer_id 
            ORDER BY created_at ASC
        ) as new_seq_num
    FROM orders
)
UPDATE orders
SET display_order_number = RankedOrders.new_seq_num
FROM RankedOrders
WHERE orders.id = RankedOrders.id;

-- 3. Verify the migration worked
SELECT farmer_id, id, display_order_number, created_at 
FROM orders 
ORDER BY farmer_id, display_order_number
LIMIT 20;