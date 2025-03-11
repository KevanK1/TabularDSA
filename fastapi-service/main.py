from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from timetable import generate_timetables

app = FastAPI()

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

@app.post("/generate-timetable")
async def generate_timetable_endpoint(request: TimetableRequest):
    try:
        print("Received request data:", request.dict())  # Debug log
        # Convert Pydantic objects to dictionaries
        timetable_data = generate_timetables(
            teachers=[teacher.dict() for teacher in request.teachers],
            subjects=[subject.dict() for subject in request.subjects],
            rooms=[room.dict() for room in request.rooms],
            divisions=[division.dict() for division in request.divisions]
        )
        print("Generated timetables:", timetable_data)  # Debug log
        response = [
            TimetableResponse(division=division, schedule=schedule)
            for division, schedule in timetable_data.items()
        ]
        return response
    except Exception as e:
        print("Error in FastAPI:", str(e))  # Debug log
        return {"error": f"Failed to generate timetables: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)