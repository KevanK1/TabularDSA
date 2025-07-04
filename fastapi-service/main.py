from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Dict
from timetable import generate_timetables
from database import database
from bson import ObjectId

app = FastAPI()

# Pydantic models for request and response
class Teacher(BaseModel):
    id: str
    name: str
    email: str

class Subject(BaseModel):
    id: str
    code: str
    name: str
    assignedTeachers: List[str]

class Room(BaseModel):
    id: str
    name: str
    capacity: int

class Division(BaseModel):
    id: str
    name: str

class TimetableRequest(BaseModel):
    teachers: List[Teacher]
    subjects: List[Subject]
    rooms: List[Room]
    divisions: List[Division]

class TimetableSlot(BaseModel):
    subject: str
    teacher: str
    room: str

class TimetableDay(BaseModel):
    Monday: Dict[str, TimetableSlot] = {}
    Tuesday: Dict[str, TimetableSlot] = {}
    Wednesday: Dict[str, TimetableSlot] = {}
    Thursday: Dict[str, TimetableSlot] = {}
    Friday: Dict[str, TimetableSlot] = {}
    Saturday: Dict[str, TimetableSlot] = {}

class TimetableResponse(BaseModel):
    division: str
    schedule: TimetableDay

@app.get("/teachers", response_model=List[Teacher])
async def list_teachers(request: Request):
    teachers_cursor = request.app.mongodb["teachers"].find()
    teachers = await teachers_cursor.to_list(1000)
    return teachers

@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient("mongodb://localhost:27017/tabularDSA")
    app.mongodb = app.mongodb_client["tabularDSA"]

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

@app.post("/generate-timetable")
async def generate_timetable_endpoint(request: TimetableRequest):
    try:
        print("\n=== Received request data from Express ===\n")
        print("Request received at endpoint /generate-timetable")
        print("\nTeachers:")
        for t in request.teachers:
            print(f"  - {t.name} (ID: {t.id}, Email: {t.email})")
        print("\nSubjects:")
        for s in request.subjects:
            print(f"  - {s.name} (Code: {s.code})")
            print(f"    Assigned Teachers: {s.assignedTeachers}")
        print("\nRooms:")
        for r in request.rooms:
            print(f"  - {r.name} (ID: {r.id}, Capacity: {r.capacity})")
        print("\nDivisions:")
        for d in request.divisions:
            print(f"  - {d.name} (ID: {d.id})")
        print("\n=== End of request data ===\n")
        
        # Check if any subjects have assigned teachers
        has_assigned_teachers = any(len(subject.assignedTeachers) > 0 for subject in request.subjects)
        if not has_assigned_teachers:
            print("No subjects have assigned teachers")
            return []
        
        # Convert Pydantic objects to dictionaries
        timetable_data = generate_timetables(
            teachers=[teacher.dict() for teacher in request.teachers],
            subjects=[subject.dict() for subject in request.subjects],
            rooms=[room.dict() for room in request.rooms],
            divisions=[division.dict() for division in request.divisions]
        )
        
        # Convert to a list of TimetableResponse objects
        response = [
            TimetableResponse(division=division, schedule=schedule.dict())
            for division, schedule in timetable_data.items()
        ]
        
        print("\nGenerated timetables for each division:")
        for r in response:
            print(f"\nTimetable for {r.division}:")
            print("Schedule:", r.schedule.dict())
        return response
        
    except Exception as e:
        print("Error in FastAPI:", str(e))
        return []  # Return empty array instead of error object

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)