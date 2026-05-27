import requests
import json

BASE_URL = 'http://localhost:8080/agriease'

# Login as farmer
login_payload = {
    'email': 'farmer@test.com',
    'password': 'test123'
}

print("1. Logging in as farmer...")
try:
    response = requests.post(f'{BASE_URL}/auth/login', json=login_payload, timeout=5)
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        print(f"✓ Login successful! Token: {token[:20]}...")
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        # Get orders
        print("\n2. Fetching orders...")
        orders_response = requests.get(f'{BASE_URL}/farmer/orders', headers=headers, timeout=5)
        if orders_response.status_code == 200:
            orders = orders_response.json()
            print(f"✓ Found {len(orders)} orders")
            
            # Find a PENDING order
            pending_orders = [o for o in orders if o.get('status') == 'PENDING']
            
            if pending_orders:
                order_id = pending_orders[0]['id']
                print(f"\n3. Attempting to cancel order #{order_id}...")
                
                cancel_response = requests.put(
                    f'{BASE_URL}/farmer/orders/{order_id}/cancel',
                    headers=headers,
                    timeout=5
                )
                
                print(f"Response status: {cancel_response.status_code}")
                print(f"Response body: {cancel_response.text}")
                
                if cancel_response.status_code == 200:
                    print("✓ Order cancelled successfully!")
                else:
                    print(f"✗ Failed to cancel: {cancel_response.text}")
            else:
                print("! No PENDING orders found to cancel")
                print("\nCreate a new order first:")
                print("1. Login to frontend: http://localhost:5174")
                print("2. Add items to cart")
                print("3. Checkout and place order")
                print("4. Then run this test again")
        else:
            print(f"✗ Failed to get orders: {orders_response.status_code}")
            print(f"Response: {orders_response.text}")
    else:
        print(f"✗ Login failed: {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"✗ Error: {str(e)}")
    print("\nMake sure:")
    print("- Backend is running on http://localhost:8080")
    print("- Frontend is running on http://localhost:5174")
