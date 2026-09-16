from controllers.auth_controller import router as auth_router
from controllers.mentor_controller import router as mentor_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="duck2p API",
    description="API para o sistema duck2p",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(mentor_router)


@app.get("/")
def read_root():
    return {"message": "Hello, World! I'm Duck2P!"}
