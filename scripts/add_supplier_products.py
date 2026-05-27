import psycopg2
from psycopg2.extras import RealDictCursor

# Database connection
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="agriease_db",
    user="postgres",
    password="Pass@1234"
)
cursor = conn.cursor(cursor_factory=RealDictCursor)

try:
    # Get supplier ID
    cursor.execute("SELECT id FROM users WHERE email = 'supplier@gmail.com'")
    supplier = cursor.fetchone()
    
    if not supplier:
        print("❌ Supplier not found! Please create supplier@gmail.com account first.")
        exit(1)
    
    supplier_id = supplier['id']
    print(f"✓ Found supplier (ID: {supplier_id})")
    
    # Sample Products (Fertilizers, Seeds, Pesticides)
    products = [
        # Fertilizers
        {
            "name": "Organic Compost",
            "description": "100% natural organic compost for healthy soil. Rich in nutrients and microorganisms.",
            "price": 450.00,
            "type": "fertilizer",
            "image_url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400"
        },
        {
            "name": "NPK 20-20-20",
            "description": "Balanced NPK fertilizer for all crops. Promotes healthy growth and high yields.",
            "price": 850.00,
            "type": "fertilizer",
            "image_url": "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400"
        },
        {
            "name": "Urea Fertilizer (50kg)",
            "description": "High nitrogen content fertilizer. Ideal for leafy vegetables and cereals.",
            "price": 1200.00,
            "type": "fertilizer",
            "image_url": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400"
        },
        
        # Seeds
        {
            "name": "Hybrid Tomato Seeds",
            "description": "High-yield hybrid tomato seeds. Disease resistant and suitable for all seasons.",
            "price": 250.00,
            "type": "seed",
            "image_url": "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400"
        },
        {
            "name": "Wheat Seeds (10kg)",
            "description": "Premium quality wheat seeds with 95% germination rate. HD-3086 variety.",
            "price": 550.00,
            "type": "seed",
            "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400"
        },
        {
            "name": "Maize Hybrid Seeds",
            "description": "High-quality hybrid maize seeds. Drought resistant and high yielding.",
            "price": 400.00,
            "type": "seed",
            "image_url": "https://images.unsplash.com/photo-1551836022-3b2d339c4968?w=400"
        },
        {
            "name": "Chilli Seeds (Red)",
            "description": "Spicy red chilli seeds. Suitable for commercial farming. Good shelf life.",
            "price": 180.00,
            "type": "seed",
            "image_url": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"
        },
        
        # Pesticides
        {
            "name": "Neem Oil Spray",
            "description": "Organic pest control solution. Safe for plants and environment. 1 liter.",
            "price": 320.00,
            "type": "pesticide",
            "image_url": "https://images.unsplash.com/photo-1617564820567-6e6821df2082?w=400"
        },
        {
            "name": "Bio Insecticide",
            "description": "Biological insecticide for controlling aphids, whiteflies and mites.",
            "price": 450.00,
            "type": "pesticide",
            "image_url": "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400"
        },
        {
            "name": "Fungicide Spray",
            "description": "Broad-spectrum fungicide for controlling plant diseases. 500ml bottle.",
            "price": 380.00,
            "type": "pesticide",
            "image_url": "https://images.unsplash.com/photo-1603003411192-ceb7f6d53673?w=400"
        },
    ]
    
    # Sample Equipment
    equipment_list = [
        {
            "name": "Tractor (50 HP)",
            "description": "Modern 50 HP tractor with multiple attachments. Perfect for plowing, tilling and harvesting.",
            "daily_rate": 1500.00,
            "available": True,
            "image_url": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400"
        },
        {
            "name": "Rotavator",
            "description": "Heavy-duty rotavator for soil preparation. Suitable for all soil types.",
            "daily_rate": 800.00,
            "available": True,
            "image_url": "https://images.unsplash.com/photo-1589923158776-cb4485d99fd6?w=400"
        },
        {
            "name": "Seed Drill Machine",
            "description": "Multi-row seed drill for precise seeding. Saves time and ensures uniform spacing.",
            "daily_rate": 600.00,
            "available": True,
            "image_url": "https://images.unsplash.com/photo-1625246267168-712f6c3f9e96?w=400"
        },
        {
            "name": "Harvester (Combine)",
            "description": "Combine harvester for wheat, rice and maize. High efficiency with minimal grain loss.",
            "daily_rate": 2500.00,
            "available": True,
            "image_url": "https://images.unsplash.com/photo-1523575708161-ad0706a69dda?w=400"
        },
        {
            "name": "Sprayer (Power)",
            "description": "Power sprayer for pesticides and fertilizers. Large tank capacity of 400 liters.",
            "daily_rate": 500.00,
            "available": True,
            "image_url": "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=400"
        },
        {
            "name": "Water Pump (5 HP)",
            "description": "Electric water pump for irrigation. High discharge rate with low power consumption.",
            "daily_rate": 350.00,
            "available": True,
            "image_url": "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=400"
        },
        {
            "name": "Plough (Disc)",
            "description": "Heavy-duty disc plough for deep tillage. Suitable for hard and rocky soil.",
            "daily_rate": 450.00,
            "available": True,
            "image_url": "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400"
        },
        {
            "name": "Thresher Machine",
            "description": "Grain thresher for wheat, rice and other cereals. High capacity with clean output.",
            "daily_rate": 900.00,
            "available": True,
            "image_url": "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400"
        },
    ]
    
    # Check if products already exist
    cursor.execute("SELECT COUNT(*) as count FROM products WHERE supplier_id = %s", (supplier_id,))
    existing_products = cursor.fetchone()['count']
    
    if existing_products > 0:
        print(f"⚠ Found {existing_products} existing products. Clearing them first...")
        cursor.execute("DELETE FROM products WHERE supplier_id = %s", (supplier_id,))
        conn.commit()
    
    # Insert Products
    print("\n📦 Adding products...")
    for product in products:
        cursor.execute("""
            INSERT INTO products (supplier_id, name, description, price, type, image_url)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (supplier_id, product['name'], product['description'], 
              product['price'], product['type'], product['image_url']))
        print(f"  ✓ Added: {product['name']} (₹{product['price']})")
    
    conn.commit()
    
    # Check if equipment already exists
    cursor.execute("SELECT COUNT(*) as count FROM equipment WHERE supplier_id = %s", (supplier_id,))
    existing_equipment = cursor.fetchone()['count']
    
    if existing_equipment > 0:
        print(f"\n⚠ Found {existing_equipment} existing equipment. Clearing them first...")
        cursor.execute("DELETE FROM equipment WHERE supplier_id = %s", (supplier_id,))
        conn.commit()
    
    # Insert Equipment
    print("\n🚜 Adding equipment...")
    for equip in equipment_list:
        cursor.execute("""
            INSERT INTO equipment (supplier_id, name, description, daily_rate, available, image_url)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (supplier_id, equip['name'], equip['description'], 
              equip['daily_rate'], equip['available'], equip['image_url']))
        print(f"  ✓ Added: {equip['name']} (₹{equip['daily_rate']}/day)")
    
    conn.commit()
    
    # Summary
    cursor.execute("SELECT COUNT(*) as count FROM products WHERE supplier_id = %s", (supplier_id,))
    total_products = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(*) as count FROM equipment WHERE supplier_id = %s", (supplier_id,))
    total_equipment = cursor.fetchone()['count']
    
    print("\n" + "="*60)
    print("✅ Successfully added supplier inventory!")
    print(f"   📦 Products: {total_products}")
    print(f"   🚜 Equipment: {total_equipment}")
    print("="*60)
    print("\n💡 Tip: Login as supplier@gmail.com to manage these items")
    print("   Or login as farmer@gmail.com to browse and purchase!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    conn.rollback()
finally:
    cursor.close()
    conn.close()
