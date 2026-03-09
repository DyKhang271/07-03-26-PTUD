from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3
import csv
import os

app = FastAPI(title="Student Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "students.db")
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "students.csv")


def get_db():
    return sqlite3.connect(DB_PATH)


def init_db():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS students (
            student_id TEXT PRIMARY KEY,
            name TEXT,
            birth_year INTEGER,
            major TEXT,
            gpa REAL
        )
    """)
    count = db.execute("SELECT COUNT(*) FROM students").fetchone()[0]
    if count == 0 and os.path.exists(CSV_PATH):
        with open(CSV_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                db.execute(
                    "INSERT INTO students (student_id, name, birth_year, major, gpa) VALUES (?, ?, ?, ?, ?)",
                    (
                        row["student_id"],
                        row["name"],
                        int(row["birth_year"]),
                        row["major"],
                        float(str(row["gpa"]).replace(",", ".")),
                    ),
                )
    db.commit()
    db.close()


init_db()


class StudentCreate(BaseModel):
    student_id: str
    name: str
    birth_year: int
    major: str
    gpa: float


class StudentUpdate(BaseModel):
    name: str
    birth_year: int
    major: str
    gpa: float


def row_to_dict(row):
    return {
        "student_id": row[0],
        "name": row[1],
        "birth_year": row[2],
        "major": row[3],
        "gpa": row[4],
    }


@app.get("/students")
def get_students():
    db = get_db()
    rows = db.execute(
        "SELECT student_id, name, birth_year, major, gpa FROM students ORDER BY student_id"
    ).fetchall()
    db.close()
    return [row_to_dict(r) for r in rows]


@app.get("/students/{student_id}")
def get_student(student_id: str):
    db = get_db()
    row = db.execute(
        "SELECT student_id, name, birth_year, major, gpa FROM students WHERE student_id=?",
        (student_id,),
    ).fetchone()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail="Student not found")
    return row_to_dict(row)


@app.post("/students", status_code=201)
def create_student(student: StudentCreate):
    db = get_db()
    existing = db.execute(
        "SELECT student_id FROM students WHERE student_id=?", (student.student_id,)
    ).fetchone()
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="Student ID already exists")
    db.execute(
        "INSERT INTO students (student_id, name, birth_year, major, gpa) VALUES (?, ?, ?, ?, ?)",
        (student.student_id, student.name, student.birth_year, student.major, student.gpa),
    )
    db.commit()
    db.close()
    return {"message": "Student created successfully"}


@app.put("/students/{student_id}")
def update_student(student_id: str, student: StudentUpdate):
    db = get_db()
    row = db.execute(
        "SELECT student_id FROM students WHERE student_id=?", (student_id,)
    ).fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Student not found")
    db.execute(
        "UPDATE students SET name=?, birth_year=?, major=?, gpa=? WHERE student_id=?",
        (student.name, student.birth_year, student.major, student.gpa, student_id),
    )
    db.commit()
    db.close()
    return {"message": "Student updated successfully"}


@app.delete("/students/{student_id}")
def delete_student(student_id: str):
    db = get_db()
    row = db.execute(
        "SELECT student_id FROM students WHERE student_id=?", (student_id,)
    ).fetchone()
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Student not found")
    db.execute("DELETE FROM students WHERE student_id=?", (student_id,))
    db.commit()
    db.close()
    return {"message": "Student deleted successfully"}
