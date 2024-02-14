from types import SimpleNamespace

g = SimpleNamespace() # like a dict but with dot access

# [!code word:req]
def helper_c():
  print(f"Hello, {g.user['name']}")

def helper_b():
  return helper_c()

def helper_a():
  return helper_b()

def handler():
  g.user = { "name": "Tony" }
  helper_a()
  del g.user

handler()
