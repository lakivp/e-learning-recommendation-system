from fastapi import FastAPI
from pydantic import BaseModel
from recommender import recommend

app = FastAPI()

class Course(BaseModel):
    id: str              
    title: str           
    description: str     


class RecommendRequest(BaseModel):
    courses: list[Course]            
    completedCourseIds: list[str]    
    enrolledCourseIds: list[str] = []  
    interests: str = ""          

@app.post("/recommend")
def recommend_courses(data: RecommendRequest):


    all_courses = [c.dict() for c in data.courses]

    completed_courses = [
        c.dict()
        for c in data.courses
        if c.id in data.completedCourseIds
    ]

    enrolled_courses = [
        c.dict()
        for c in data.courses
        if c.id in data.enrolledCourseIds
    ]

    result = recommend(
        completed_courses=completed_courses,
        enrolled_courses=enrolled_courses,
        interests=data.interests,
        all_courses=all_courses
    )

    return {"recommendations": result}