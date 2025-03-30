from pydantic import BaseModel
from typing import List, Dict

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

def assign_slot(timetable: TimetableDay, used_teachers: Dict, used_rooms: Dict, subject_counts: Dict,
                teachers: List[dict], subjects: List[dict], rooms: List[dict], day_index: int, slot_index: int,
                division_name: str) -> bool:
    """Recursively assign a slot in the timetable with backtracking, allowing partial schedules."""
    if day_index >= 6:  # All 6 days processed
        return True

    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    day = days[day_index]
    time_slot = f"{slot_index+1}:00-{slot_index+2}:00"
    
    print(f"Attempting to assign slot for {division_name} on {day} at {time_slot}")  # Debug log

    available_subjects = [s for s in subjects if s["assignedTeachers"]]
    if not available_subjects:
        print(f"No subjects with assigned teachers for {division_name}")
        return False

    # Ensure subject_counts[division_name] exists
    if division_name not in subject_counts:
        raise ValueError(f"Division {division_name} not found in subject_counts")

    available_subjects.sort(key=lambda s: subject_counts[division_name][s["name"]])  # Prioritize least assigned
    available_teachers = [t for t in teachers if t["id"] in sum([s["assignedTeachers"] for s in available_subjects], [])]
    
    # Filter available rooms based on current usage
    available_rooms = []
    for room in rooms:
        room_conflict = False
        # Check if room is already used in this time slot
        for existing_slot in used_rooms.get((day, time_slot), []):
            if existing_slot.room == room["name"]:
                room_conflict = True
                break
        if not room_conflict:
            available_rooms.append(room)

    slot_assigned = False
    for subject in available_subjects:
        for teacher in [t for t in available_teachers if t["id"] in subject["assignedTeachers"]]:
            for room in available_rooms:
                conflict = False
                for existing_slot in used_teachers.get((day, time_slot), []):
                    if existing_slot.teacher == teacher["name"]:
                        conflict = True
                        break
                for existing_slot in used_rooms.get((day, time_slot), []):
                    if existing_slot.room == room["name"]:
                        conflict = True
                        break
                if not conflict:
                    # Assign the slot
                    slot = TimetableSlot(subject=subject["name"], teacher=teacher["name"], room=room["name"])
                    timetable.__setattr__(day, {**timetable.__getattribute__(day), time_slot: slot})
                    used_teachers.setdefault((day, time_slot), []).append(slot)
                    used_rooms.setdefault((day, time_slot), []).append(slot)
                    subject_counts[division_name][subject["name"]] += 1
                    slot_assigned = True

                    # Move to next slot
                    next_slot = (slot_index + 1) % 6
                    next_day = day_index + (1 if next_slot == 0 else 0)
                    if assign_slot(timetable, used_teachers, used_rooms, subject_counts,
                                 teachers, subjects, rooms, next_day, next_slot, division_name):
                        return True

                    # Backtrack: Remove the assignment
                    current_day_slots = timetable.__getattribute__(day)
                    del current_day_slots[time_slot]
                    timetable.__setattr__(day, current_day_slots)
                    used_teachers[(day, time_slot)].remove(slot)
                    used_rooms[(day, time_slot)].remove(slot)
                    if not used_teachers[(day, time_slot)]:
                        del used_teachers[(day, time_slot)]
                    if not used_rooms[(day, time_slot)]:
                        del used_rooms[(day, time_slot)]
                    subject_counts[division_name][subject["name"]] -= 1

    # If no assignment was possible for this slot, move to the next slot (partial schedule)
    if not slot_assigned:
        print(f"Could not assign slot for {division_name} on {day} at {time_slot}, skipping...")
        next_slot = (slot_index + 1) % 6
        next_day = day_index + (1 if next_slot == 0 else 0)
        return assign_slot(timetable, used_teachers, used_rooms, subject_counts,
                         teachers, subjects, rooms, next_day, next_slot, division_name)

    return True  # Return True if we successfully assigned this slot

def generate_timetables(teachers: List[dict], subjects: List[dict], rooms: List[dict], divisions: List[dict]) -> Dict[str, TimetableDay]:
    divisions = divisions[:5]  # Limit to 5 divisions
    timetables = {}

    # Initialize subject_counts as a nested dictionary
    subject_counts = {
        division["name"]: {sub["name"]: 0 for sub in subjects}
        for division in divisions
    }
    print(f"Initialized subject_counts: {subject_counts}")  # Debug log

    # Global state for tracking teacher and room assignments across all divisions
    global_used_teachers = {}
    global_used_rooms = {}

    for division in divisions:
        print(f"Generating timetable for {division['name']}")  # Debug log
        timetable = TimetableDay()

        # Start the recursive assignment from the first day and slot
        success = assign_slot(timetable, global_used_teachers, global_used_rooms, subject_counts,
                    teachers, subjects, rooms, 0, 0, division["name"])
        
        if success:
            print(f"Successfully generated complete timetable for {division['name']}")
        else:
            print(f"Generated partial timetable for {division['name']}")

        timetables[division["name"]] = timetable

    return timetables