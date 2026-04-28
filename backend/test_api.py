import requests

BASE = "http://127.0.0.1:5000"


def test_register():
    data = {
        "name": "testuser",
        "email": "test@test.com",
        "password": "123456"
    }

    r = requests.post(f"{BASE}/api/auth/register", json=data)
    print("\nRegister:", r.status_code)
    print(r.text)


def test_login():
    data = {
        "email": "test@test.com",
        "password": "123456"
    }

    r = requests.post(f"{BASE}/api/auth/login", json=data)
    print("\nLogin:", r.status_code)
    print(r.text)

    try:
        return r.json().get("access_token")
    except:
        return None


def test_subscriptions(token):
    headers = {"Authorization": f"Bearer {token}"}

    r = requests.get(f"{BASE}/api/subscriptions", headers=headers)
    print("\nSubscriptions:", r.status_code)
    print(r.text)


def test_transactions(token):
    headers = {"Authorization": f"Bearer {token}"}

    r = requests.get(f"{BASE}/api/billing/transactions", headers=headers)
    print("\nTransactions:", r.status_code)
    print(r.text)


def test_upcoming(token):
    headers = {"Authorization": f"Bearer {token}"}

    r = requests.get(f"{BASE}/api/billing/upcoming", headers=headers)
    print("\nUpcoming Bills:", r.status_code)
    print(r.text)


if __name__ == "__main__":
    print("Running Automated API Tests...")

    test_register()
    token = test_login()

    if token:
        test_subscriptions(token)
        test_transactions(token)
        test_upcoming(token)
