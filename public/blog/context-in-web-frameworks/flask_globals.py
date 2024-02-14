from types import SimpleNamespace
from flask import Flask, request, g

app = Flask(__name__)

def get_user():
  "Get the user, memoize it, and return it."
  if "user" not in g:
    g.user = SimpleNamespace(name="John")
  return g.user

@app.route("/<userId>")
def handle(**_):
  user = get_user()  # Just a function call
  return f"Hello, {user.name}"

app.run()
