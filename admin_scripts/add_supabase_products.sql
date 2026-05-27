-- Add Sample Equipment and Products for supplier@gmail.com in Supabase (ID: 10)
-- This script adds realistic agricultural equipment and market products with images

BEGIN;

-- Add Equipment (Rental Items)
INSERT INTO equipment (supplier_id, name, description, daily_rate, available, image_url) VALUES
(10, 'John Deere 5055E Tractor', 'Powerful 55HP utility tractor perfect for farming operations. Includes front loader attachment.', 150.00, true, 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400'),
(10, 'Mahindra 575 DI Tractor', '50HP diesel tractor with power steering. Ideal for small to medium farms.', 120.00, true, 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400'),
(10, 'Rotary Tiller 6ft', 'Heavy-duty 6-foot rotary tiller for soil preparation. Compatible with most tractors.', 80.00, true, 'https://images.unsplash.com/photo-1573164713619-24c711fe7878?w=400'),
(10, 'Combine Harvester', 'Modern combine harvester for wheat, rice, and corn. High efficiency with grain cleaning system.', 300.00, true, 'https://images.unsplash.com/photo-1574323347407-dee25c2620fa?w=400'),
(10, 'Seed Drill Machine', 'Precision seed drill for accurate planting. Adjustable row spacing and depth control.', 100.00, true, 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400'),
(10, 'Disc Harrow', 'Heavy-duty disc harrow for breaking up soil after harvesting. 20 disc configuration.', 90.00, true, 'https://images.unsplash.com/photo-1589725949798-cc219e27bee4?w=400'),
(10, 'Irrigation Sprinkler System', 'Mobile sprinkler system covers up to 5 acres. Water-efficient and easy to operate.', 60.00, true, 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400'),
(10, 'Fertilizer Spreader', 'Broadcast fertilizer spreader with accurate distribution. 1000lb capacity hopper.', 45.00, true, 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400'),
(10, 'Boom Sprayer', '24-foot boom sprayer for pesticide and herbicide application. GPS-guided precision spraying.', 110.00, true, 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400'),
(10, 'Hay Baler', 'Round baler for hay production. Creates tight, weather-resistant bales up to 5ft diameter.', 180.00, true, 'https://images.unsplash.com/photo-1596958650806-5d633b981c5e?w=400');

-- Add Market Products (For Sale Items)
INSERT INTO products (supplier_id, name, description, price, type, image_url) VALUES
(10, 'Premium Basmati Rice', 'Aged basmati rice with extra-long grains. Premium quality, 50kg bags available.', 45.00, 'GRAIN', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'),
(10, 'Organic Wheat Flour', 'Stone-ground organic wheat flour. Chemical-free, perfect for bread making. 25kg bags.', 35.00, 'GRAIN', 'https://images.unsplash.com/photo-1574323347407-dee25c2620fa?w=400'),
(10, 'Fresh Tomatoes', 'Farm-fresh red tomatoes. Perfect for cooking and salads. Sold per 10kg crate.', 25.00, 'VEGETABLE', 'https://images.unsplash.com/photo-1546470427-e9e47fb9a5e1?w=400'),
(10, 'Organic Potatoes', 'Chemical-free potatoes, multiple varieties available. Great for cooking. 20kg bags.', 18.00, 'VEGETABLE', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'),
(10, 'Sweet Corn', 'Freshly harvested sweet corn. Perfect for grilling or boiling. Sold per dozen ears.', 12.00, 'VEGETABLE', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400'),
(10, 'Fresh Carrots', 'Crunchy orange carrots, rich in vitamin A. Perfect for cooking and snacking. 5kg bags.', 15.00, 'VEGETABLE', 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400'),
(10, 'Red Onions', 'High-quality red onions with strong flavor. Long shelf life. 10kg mesh bags.', 20.00, 'VEGETABLE', 'https://images.unsplash.com/photo-1508747597810-0b54d62da721?w=400'),
(10, 'Fresh Spinach', 'Organic leafy spinach, rich in iron and vitamins. Perfect for salads. Sold per kg.', 8.00, 'LEAFY_GREEN', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400'),
(10, 'Cabbage', 'Fresh green cabbage heads. Great for cooking and coleslaw. Sold individually.', 6.00, 'VEGETABLE', 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400'),
(10, 'Bell Peppers Mix', 'Colorful mix of red, yellow, and green bell peppers. Fresh and crispy. Per kg.', 22.00, 'VEGETABLE', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400'),
(10, 'Organic Fertilizer', 'Cow manure based organic fertilizer. Chemical-free, improves soil health. 50kg bags.', 30.00, 'FERTILIZER', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
(10, 'NPK Fertilizer 10:26:26', 'Balanced NPK fertilizer for all crops. Promotes healthy growth. 50kg bags.', 40.00, 'FERTILIZER', 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400'),
(10, 'Vegetable Seeds Mix', 'Premium quality vegetable seeds. Includes tomato, cucumber, pepper varieties.', 15.00, 'SEEDS', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
(10, 'Hybrid Corn Seeds', 'High-yielding hybrid corn seeds. Disease resistant, suitable for all seasons.', 25.00, 'SEEDS', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400'),
(10, 'Agricultural Tools Set', 'Complete set of hand tools for farming. Includes hoe, shovel, rake, and pruners.', 75.00, 'TOOLS', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400');

COMMIT;

-- Verify the additions
SELECT 'Equipment Added' as category, COUNT(*) as total FROM equipment WHERE supplier_id = 10
UNION ALL
SELECT 'Products Added' as category, COUNT(*) as total FROM products WHERE supplier_id = 10;

-- Show sample equipment
SELECT 'EQUIPMENT PREVIEW:' as info;
SELECT name, daily_rate, available FROM equipment WHERE supplier_id = 10 ORDER BY daily_rate DESC LIMIT 5;

-- Show sample products  
SELECT 'PRODUCTS PREVIEW:' as info;
SELECT name, type, price FROM products WHERE supplier_id = 10 ORDER BY type, price DESC LIMIT 8;