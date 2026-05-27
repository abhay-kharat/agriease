import requests
import json

BASE_URL = "http://localhost:8080/agriease"

# Login as farmer
print("🔐 Logging in as farmer...")
login_response = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "farmer@gmail.com",
    "password": "test123"
})

if login_response.status_code == 200:
    token = login_response.json()['token']
    print(f"✅ Login successful! Token: {token[:20]}...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Get current profile
    print("\n📋 Fetching current profile...")
    get_response = requests.get(f"{BASE_URL}/farmer/profile", headers=headers)
    
    if get_response.status_code == 200:
        profile = get_response.json()
        print("✅ Profile fetched successfully:")
        print(f"   Name: {profile.get('name', 'Not set')}")
        print(f"   Email: {profile.get('email')}")
        print(f"   Phone: {profile.get('phone', 'Not set')}")
        print(f"   Address: {profile.get('address', 'Not set')}")
        print(f"   City: {profile.get('city', 'Not set')}")
        print(f"   State: {profile.get('state', 'Not set')}")
        print(f"   Farm Size: {profile.get('farmSize', 'Not set')}")
        print(f"   Crop Types: {profile.get('cropTypes', 'Not set')}")
        print(f"   Profile Photo: {'Set' if profile.get('profilePhoto') else 'Not set'}")
    else:
        print(f"❌ Failed to fetch profile: {get_response.status_code}")
        print(f"   Response: {get_response.text}")
    
    # Update profile
    print("\n✏️ Updating profile...")
    update_data = {
        "name": "Rahul Kumar (Updated)",
        "phone": "+91 9876543210",
        "address": "Village Rampur, Near Post Office",
        "city": "Meerut",
        "state": "Uttar Pradesh",
        "pincode": "250002",
        "farmSize": "5 acres",
        "cropTypes": "Rice, Wheat, Vegetables"
    }
    
    update_response = requests.put(
        f"{BASE_URL}/farmer/profile",
        headers=headers,
        json=update_data
    )
    
    if update_response.status_code == 200:
        result = update_response.json()
        print("✅ Profile updated successfully!")
        if 'user' in result:
            updated_user = result['user']
            print(f"   Name: {updated_user.get('name')}")
            print(f"   Phone: {updated_user.get('phone')}")
            print(f"   City: {updated_user.get('city')}")
    else:
        print(f"❌ Failed to update profile: {update_response.status_code}")
        print(f"   Response: {update_response.text}")
        
else:
    print(f"❌ Login failed: {login_response.status_code}")
    print(f"   Response: {login_response.text}")
