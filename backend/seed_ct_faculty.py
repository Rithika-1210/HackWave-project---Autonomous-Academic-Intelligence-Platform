import sqlite3

conn = sqlite3.connect('aaip.db')
cursor = conn.cursor()

# Check Department 9
dept = cursor.execute("SELECT id, name, code FROM departments WHERE id = 9").fetchone()
print("Department 9:", dept)

# Check existing faculty
existing_fac = cursor.execute("SELECT id, full_name, email, department_id FROM faculty WHERE department_id = 9").fetchall()
print("Existing faculty in Dept 9:", existing_fac)

# Insert CT_UG Faculty if not present
sham_fac = cursor.execute("SELECT id FROM faculty WHERE email = 'sham.ct@aaip.edu'").fetchone()
if not sham_fac:
    cursor.execute("""
        INSERT INTO faculty (faculty_id, full_name, email, phone, department_id, designation, specialization, max_weekly_workload, status, created_at)
        VALUES ('FAC-CT-001', 'Sham', 'sham.ct@aaip.edu', '9876543220', 9, 'Associate Professor', 'Cloud Computing & Architecture', 18, 'Active', datetime('now'))
    """)
    sham_id = cursor.lastrowid
else:
    sham_id = sham_fac[0]

kaviya_fac = cursor.execute("SELECT id FROM faculty WHERE email = 'kaviya.ct@aaip.edu'").fetchone()
if not kaviya_fac:
    cursor.execute("""
        INSERT INTO faculty (faculty_id, full_name, email, phone, department_id, designation, specialization, max_weekly_workload, status, created_at)
        VALUES ('FAC-CT-002', 'Kaviya', 'kaviya.ct@aaip.edu', '9876543221', 9, 'Assistant Professor (Sr. Gr.)', 'Deep Learning Systems', 18, 'Active', datetime('now'))
    """)
    kaviya_id = cursor.lastrowid
else:
    kaviya_id = kaviya_fac[0]

karthick_fac = cursor.execute("SELECT id FROM faculty WHERE email = 'karthick.ct@aaip.edu'").fetchone()
if not karthick_fac:
    cursor.execute("""
        INSERT INTO faculty (faculty_id, full_name, email, phone, department_id, designation, specialization, max_weekly_workload, status, created_at)
        VALUES ('FAC-CT-003', 'Karthick', 'karthick.ct@aaip.edu', '9876543222', 9, 'Assistant Professor', 'Distributed Computing & Networks', 18, 'Active', datetime('now'))
    """)
    karthick_id = cursor.lastrowid
else:
    karthick_id = karthick_fac[0]

print(f"CT_UG Faculty IDs: Sham={sham_id}, Kaviya={kaviya_id}, Karthick={karthick_id}")

# Update CT_UG subjects to use these faculty
cursor.execute("UPDATE subjects SET assigned_faculty_id = ? WHERE department_id = 9 AND code IN ('CT304', 'CT306', 'CT308')", (sham_id,))
cursor.execute("UPDATE subjects SET assigned_faculty_id = ? WHERE department_id = 9 AND code IN ('CT305', 'CT307P')", (kaviya_id,))
cursor.execute("UPDATE subjects SET assigned_faculty_id = ? WHERE department_id = 9 AND code NOT IN ('CT304', 'CT305', 'CT306', 'CT307P', 'CT308')", (karthick_id,))

# Update timetable_entries for Department 9
# Distribute between Sham and Kaviya and Karthick
cursor.execute("UPDATE timetable_entries SET faculty_id = ? WHERE department_id = 9 AND subject_id IN (SELECT id FROM subjects WHERE code IN ('CT304', 'CT306'))", (sham_id,))
cursor.execute("UPDATE timetable_entries SET faculty_id = ? WHERE department_id = 9 AND subject_id IN (SELECT id FROM subjects WHERE code IN ('CT305', 'CT307P'))", (kaviya_id,))
cursor.execute("UPDATE timetable_entries SET faculty_id = ? WHERE department_id = 9 AND subject_id IN (SELECT id FROM subjects WHERE code = 'CT308')", (karthick_id,))

# Ensure timetable header exists for department 9
tt_hdr = cursor.execute("SELECT id FROM timetables WHERE department_id = 9 AND semester = 6").fetchone()
if not tt_hdr:
    cursor.execute("""
        INSERT INTO timetables (academic_year, semester, department_id, status, created_at)
        VALUES ('2025-2026', 6, 9, 'Published', datetime('now'))
    """)
    tt_hdr_id = cursor.lastrowid
else:
    tt_hdr_id = tt_hdr[0]

cursor.execute("UPDATE timetable_entries SET timetable_id = ? WHERE department_id = 9", (tt_hdr_id,))

conn.commit()

# Verify
entries = cursor.execute("""
    SELECT te.id, te.day_of_week, te.start_time, te.end_time, s.name, s.code, f.full_name, c.room_number
    FROM timetable_entries te
    JOIN subjects s ON te.subject_id = s.id
    JOIN faculty f ON te.faculty_id = f.id
    JOIN classrooms c ON te.classroom_id = c.id
    WHERE te.department_id = 9
    ORDER BY te.day_of_week, te.start_time
""").fetchall()

print(f"Total CT_UG Timetable entries: {len(entries)}")
for e in entries[:5]:
    print(" ", e)

conn.close()
