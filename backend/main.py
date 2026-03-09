from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import sqlite3
import csv
import os
import io

app = FastAPI(title="Student Manager API v2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "students.db")
CSV_STUDENTS = os.path.join(os.path.dirname(__file__), "..", "students.csv")
CSV_CLASSES = os.path.join(os.path.dirname(__file__), "..", "classes.csv")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    db = get_db()

    # Create classes table
    db.execute("""
        CREATE TABLE IF NOT EXISTS classes (
            class_id TEXT PRIMARY KEY,
            class_name TEXT,
            advisor TEXT
        )
    """)

    # Create students table with class_id
    db.execute("""
        CREATE TABLE IF NOT EXISTS students (
            student_id TEXT PRIMARY KEY,
            name TEXT,
            birth_year INTEGER,
            major TEXT,
            gpa REAL,
            class_id TEXT,
            FOREIGN KEY (class_id) REFERENCES classes(class_id)
        )
    """)

    # Migrate: add class_id column if it doesn't exist yet
    try:
        db.execute("ALTER TABLE students ADD COLUMN class_id TEXT")
    except Exception:
        pass  # column already exists

    # Seed classes from CSV
    class_count = db.execute("SELECT COUNT(*) FROM classes").fetchone()[0]
    if class_count == 0 and os.path.exists(CSV_CLASSES):
        with open(CSV_CLASSES, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                db.execute(
                    "INSERT OR IGNORE INTO classes (class_id, class_name, advisor) VALUES (?, ?, ?)",
                    (row["class_id"], row["class_name"], row["advisor"]),
                )

    # Seed students from CSV
    student_count = db.execute("SELECT COUNT(*) FROM students").fetchone()[0]
    if student_count == 0 and os.path.exists(CSV_STUDENTS):
        with open(CSV_STUDENTS, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                db.execute(
                    "INSERT OR IGNORE INTO students (student_id, name, birth_year, major, gpa, class_id) VALUES (?, ?, ?, ?, ?, ?)",
                    (
                        row["student_id"],
                        row["name"],
                        int(row["birth_year"]),
                        row["major"],
                        float(str(row["gpa"]).replace(",", ".")),
                        row.get("class_id", None),
                    ),
                )

    db.commit()
    db.close()


init_db()


# ── Pydantic models ────────────────────────────────────────────

class StudentCreate(BaseModel):
    student_id: str
    name: str
    birth_year: int
    major: str
    gpa: float
    class_id: Optional[str] = None


class StudentUpdate(BaseModel):
    name: str
    birth_year: int
    major: str
    gpa: float
    class_id: Optional[str] = None


class ClassCreate(BaseModel):
    class_id: str
    class_name: str
    advisor: str


class ClassUpdate(BaseModel):
    class_name: str
    advisor: str


# ── Students ────────────────────────────────────────────────────

@app.get("/students")
def get_students(search: Optional[str] = Query(default=None)):
    db = get_db()
    if search:
        rows = db.execute(
            """SELECT s.student_id, s.name, s.birth_year, s.major, s.gpa, s.class_id, c.class_name
               FROM students s LEFT JOIN classes c ON s.class_id = c.class_id
               WHERE s.name LIKE ?
               ORDER BY s.student_id""",
            (f"%{search}%",),
        ).fetchall()
    else:
        rows = db.execute(
            """SELECT s.student_id, s.name, s.birth_year, s.major, s.gpa, s.class_id, c.class_name
               FROM students s LEFT JOIN classes c ON s.class_id = c.class_id
               ORDER BY s.student_id"""
        ).fetchall()
    db.close()
    return [dict(r) for r in rows]


@app.get("/students/export")
def export_students():
    db = get_db()
    rows = db.execute(
        """SELECT s.student_id, s.name, s.birth_year, s.major, s.gpa, s.class_id, c.class_name
           FROM students s LEFT JOIN classes c ON s.class_id = c.class_id
           ORDER BY s.student_id"""
    ).fetchall()
    db.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["student_id", "name", "birth_year", "major", "gpa", "class_id", "class_name"])
    for r in rows:
        writer.writerow([r["student_id"], r["name"], r["birth_year"], r["major"], r["gpa"], r["class_id"], r["class_name"]])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=students.csv"},
    )


@app.get("/students/{student_id}")
def get_student(student_id: str):
    db = get_db()
    row = db.execute(
        """SELECT s.student_id, s.name, s.birth_year, s.major, s.gpa, s.class_id, c.class_name
           FROM students s LEFT JOIN classes c ON s.class_id = c.class_id
           WHERE s.student_id=?""",
        (student_id,),
    ).fetchone()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail="Student not found")
    return dict(row)


@app.post("/students", status_code=201)
def create_student(student: StudentCreate):
    db = get_db()
    if db.execute("SELECT 1 FROM students WHERE student_id=?", (student.student_id,)).fetchone():
        db.close()
        raise HTTPException(status_code=400, detail="Student ID already exists")
    db.execute(
        "INSERT INTO students (student_id, name, birth_year, major, gpa, class_id) VALUES (?, ?, ?, ?, ?, ?)",
        (student.student_id, student.name, student.birth_year, student.major, student.gpa, student.class_id),
    )
    db.commit()
    db.close()
    return {"message": "Student created successfully"}


@app.put("/students/{student_id}")
def update_student(student_id: str, student: StudentUpdate):
    db = get_db()
    if not db.execute("SELECT 1 FROM students WHERE student_id=?", (student_id,)).fetchone():
        db.close()
        raise HTTPException(status_code=404, detail="Student not found")
    db.execute(
        "UPDATE students SET name=?, birth_year=?, major=?, gpa=?, class_id=? WHERE student_id=?",
        (student.name, student.birth_year, student.major, student.gpa, student.class_id, student_id),
    )
    db.commit()
    db.close()
    return {"message": "Student updated successfully"}


@app.delete("/students/{student_id}")
def delete_student(student_id: str):
    db = get_db()
    if not db.execute("SELECT 1 FROM students WHERE student_id=?", (student_id,)).fetchone():
        db.close()
        raise HTTPException(status_code=404, detail="Student not found")
    db.execute("DELETE FROM students WHERE student_id=?", (student_id,))
    db.commit()
    db.close()
    return {"message": "Student deleted successfully"}


# ── Classes ─────────────────────────────────────────────────────

@app.get("/classes")
def get_classes():
    db = get_db()
    rows = db.execute(
        """SELECT c.class_id, c.class_name, c.advisor,
                  COUNT(s.student_id) as student_count
           FROM classes c LEFT JOIN students s ON c.class_id = s.class_id
           GROUP BY c.class_id ORDER BY c.class_id"""
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]


@app.get("/classes/{class_id}")
def get_class(class_id: str):
    db = get_db()
    row = db.execute("SELECT * FROM classes WHERE class_id=?", (class_id,)).fetchone()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail="Class not found")
    return dict(row)


@app.post("/classes", status_code=201)
def create_class(cls: ClassCreate):
    db = get_db()
    if db.execute("SELECT 1 FROM classes WHERE class_id=?", (cls.class_id,)).fetchone():
        db.close()
        raise HTTPException(status_code=400, detail="Class ID already exists")
    db.execute(
        "INSERT INTO classes (class_id, class_name, advisor) VALUES (?, ?, ?)",
        (cls.class_id, cls.class_name, cls.advisor),
    )
    db.commit()
    db.close()
    return {"message": "Class created successfully"}


@app.put("/classes/{class_id}")
def update_class(class_id: str, cls: ClassUpdate):
    db = get_db()
    if not db.execute("SELECT 1 FROM classes WHERE class_id=?", (class_id,)).fetchone():
        db.close()
        raise HTTPException(status_code=404, detail="Class not found")
    db.execute(
        "UPDATE classes SET class_name=?, advisor=? WHERE class_id=?",
        (cls.class_name, cls.advisor, class_id),
    )
    db.commit()
    db.close()
    return {"message": "Class updated successfully"}


@app.delete("/classes/{class_id}")
def delete_class(class_id: str):
    db = get_db()
    if not db.execute("SELECT 1 FROM classes WHERE class_id=?", (class_id,)).fetchone():
        db.close()
        raise HTTPException(status_code=404, detail="Class not found")
    db.execute("DELETE FROM classes WHERE class_id=?", (class_id,))
    db.commit()
    db.close()
    return {"message": "Class deleted successfully"}


# ── Statistics ───────────────────────────────────────────────────

@app.get("/statistics")
def get_statistics():
    db = get_db()
    total = db.execute("SELECT COUNT(*) FROM students").fetchone()[0]
    avg_gpa_row = db.execute("SELECT ROUND(AVG(gpa), 2) FROM students").fetchone()[0]
    avg_gpa = avg_gpa_row if avg_gpa_row else 0
    total_classes = db.execute("SELECT COUNT(*) FROM classes").fetchone()[0]

    by_major = db.execute(
        """SELECT major, COUNT(*) as count, ROUND(AVG(gpa),2) as avg_gpa
           FROM students GROUP BY major ORDER BY count DESC"""
    ).fetchall()

    by_class = db.execute(
        """SELECT c.class_name, COUNT(s.student_id) as count
           FROM classes c LEFT JOIN students s ON c.class_id = s.class_id
           GROUP BY c.class_id ORDER BY c.class_id"""
    ).fetchall()

    db.close()
    return {
        "total_students": total,
        "avg_gpa": avg_gpa,
        "total_classes": total_classes,
        "by_major": [dict(r) for r in by_major],
        "by_class": [dict(r) for r in by_class],
    }
