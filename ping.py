import requests

url = "http://localhost:8000/api/echo"
payload = {"a": "Hello", "b": 3.14}

response = requests.post(url, json=payload)

print(response.json())  # This should print the tuple ("Hello", 3.14)
