from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.assessment import router as assessment_router
from app.routes.recommend import router as recommend_router
from app.routes.roadmap import router as roadmap_router
from app.routes.profile import router as profile_router
from app.routes.careers import router as careers_router
from app.routes.generator import router as generator_router
from app.routes.confidence import router as confidence_router
from app.routes.advisor import router as advisor_router
from app.routes.similar import router as similar_router
from app.routes.similar import router as similar_router
from app.routes.cluster import router as cluster_router
from app.routes.compare import router as compare_router
from app.routes.explain import router as explain_router
from app.routes.graph import router as graph_router

app = FastAPI(title="Career AI Backend")

# 🔐 CORS CONFIGURATION (IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router, tags=["Auth"])
app.include_router(assessment_router, prefix="/assessment", tags=["Assessment"])
app.include_router(recommend_router, tags=["Recommend"])
app.include_router(roadmap_router, tags=["Roadmap"])
app.include_router(profile_router, tags=["Profile"])
app.include_router(careers_router, tags=["Careers"])
app.include_router(generator_router, tags=["Generator"])
app.include_router(confidence_router, tags=["Confidence"])
app.include_router(advisor_router, tags=["Advisor"])
app.include_router(similar_router, tags=["Similarity"])
app.include_router(cluster_router, tags=["Clustering"])
app.include_router(compare_router, tags=["Career Comparison"])
app.include_router(explain_router)
app.include_router(graph_router)

@app.get("/")
def home():
    return {"message": "Career AI Backend Running"}