import requests
import time

BASE_URL = 'http://localhost:8080/agriease'

test_users = [
    {
        'name': 'Test Farmer',
        'email': 'farmer@test.com',
        'password': 'test123',
        'role': 'FARMER'
    },
    {
        'name': 'Test Supplier',
        'email': 'supplier@test.com',
        'password': 'test123',
        'role': 'SUPPLIER'
    },
    {
        'name': 'John Farmer',
        'email': 'john@farmer.com',
        'password': 'farmer123',
        'role': 'FARMER'
    },
    {
        'name': 'Maria Supplier',
        'email': 'maria@supplier.com',
        'password': 'supplier123',
        'role': 'SUPPLIER'
    }
]

print("Creating test users...")
print("-" * 50)

for user in test_users:
    try:
        response = requests.post(
            f'{BASE_URL}/auth/register',
            json=user,
            timeout=5
        )
        
        if response.status_code == 200:
            print(f"✓ Created: {user['name']} ({user['email']}) - Role: {user['role']}")
        else:
            print(f"✗ Failed: {user['email']} - Status: {response.status_code}")
            print(f"  Response: {response.text}")
            
    except Exception as e:
        print(f"✗ Error creating {user['email']}: {str(e)}")
    
    time.sleep(0.5)  # Small delay between requests

print("-" * 50)
print("\nTest users created! You can now login with:")
print("\nFarmer Account:")
print("  Email: farmer@test.com")
print("  Password: test123")
print("\nSupplier Account:")
print("  Email: supplier@test.com")
print("  Password: test123")
