from fastapi import FastAPI, Path, Depends
from typing import Annotated
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    name: str

def get_user(name: Annotated[str, Path(alias="userId")]):
    return User(name=name)

@app.get("/{userId}")
def handle(user: Annotated[User, Depends(get_user)]):
    return f"Hello, {user.name}"


if __name__ == "__main__":

    import uvicorn
    import os
    # os.chdir(os.path.dirname(__file__))
    # uvicorn.run("headers:app", reload=True)
    uvicorn.run(app)
