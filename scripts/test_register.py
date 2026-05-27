import requests
url='http://localhost:8080/auth/register'
payload={'name':'Test Supplier','email':'supplier2@example.com','mobile':'9999999999','password':'123456','role':'SUPPLIER'}
try:
    r=requests.post(url,json=payload,timeout=10)
    print('status',r.status_code)
    print('headers', dict(r.headers))
    print('body', r.text)
except Exception as e:
    print('error', str(e))
