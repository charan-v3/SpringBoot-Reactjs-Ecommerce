#!/usr/bin/env python3
"""
Test script to verify admin verification functionality
Tests the conversion from boolean to integer for is_verified field
"""

import requests
import json
import time

BASE_URL = "http://localhost:8080/api"

def test_admin_signup():
    """Test admin signup functionality"""
    print("🧪 Testing Admin Signup...")

    signup_data = {
        "username": "testadmin",
        "email": "testadmin@example.com",
        "password": "testpassword123",
        "firstName": "Test",
        "lastName": "Admin",
        "phoneNumber": "1234567890",
        "address": "Test Address",
        "upiId": "9976656631@axl",
        "requestReason": "Testing admin verification functionality with integer field conversion",
        "experience": "Software testing and development experience for e-commerce applications"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/admin/signup", 
                               json=signup_data,
                               headers={"Content-Type": "application/json"})
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Admin signup successful!")
            return response.json()
        else:
            print("❌ Admin signup failed!")
            return None
            
    except Exception as e:
        print(f"❌ Error during admin signup: {e}")
        return None

def test_admin_login():
    """Test admin login functionality"""
    print("\n🧪 Testing Admin Login...")
    
    login_data = {
        "username": "testadmin",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/admin/login",
                               json=login_data,
                               headers={"Content-Type": "application/json"})
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 400:
            result = response.json()
            if "message" in result and ("pending verification" in result["message"].lower() or "not verified" in result["message"].lower()):
                print("✅ Admin login correctly shows verification required!")
                return True
            else:
                print("⚠️ Admin login response unexpected")
                return False
        else:
            print("❌ Admin login should fail for unverified admin!")
            return False
            
    except Exception as e:
        print(f"❌ Error during admin login: {e}")
        return False

def test_api_health():
    """Test API health endpoint"""
    print("\n🧪 Testing API Health...")
    
    try:
        response = requests.get(f"{BASE_URL}/products")
        print(f"Products endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ API is healthy!")
            return True
        else:
            print("❌ API health check failed!")
            return False
            
    except Exception as e:
        print(f"❌ Error during API health check: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting Admin Verification Tests")
    print("=" * 50)
    
    # Test API health first
    if not test_api_health():
        print("❌ API is not responding. Please check if backend is running.")
        return
    
    # Test admin signup
    signup_result = test_admin_signup()
    
    # Test admin login (should show verification required)
    login_result = test_admin_login()
    
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print(f"✅ API Health: {'PASS' if test_api_health() else 'FAIL'}")
    print(f"✅ Admin Signup: {'PASS' if signup_result else 'FAIL'}")
    print(f"✅ Admin Login (Verification Check): {'PASS' if login_result else 'FAIL'}")
    
    print("\n💡 Notes:")
    print("- The is_verified field has been converted from boolean to integer")
    print("- 0 = not verified, 1 = verified")
    print("- New admin accounts should have is_verified = 0 by default")
    print("- Login should require verification before allowing access")

if __name__ == "__main__":
    main()
