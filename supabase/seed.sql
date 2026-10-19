-- CampusOne Deterministic SQL Seed File for Supabase
-- For local / staging development only. NEVER run in production.

-- 1. Departments
INSERT INTO departments (id, code, name) VALUES
('d1000000-0000-0000-0000-000000000001', 'CSE', 'Computer Science & Engineering'),
('d1000000-0000-0000-0000-000000000002', 'ECE', 'Electronics & Communication Engineering'),
('d1000000-0000-0000-0000-000000000003', 'MECH', 'Mechanical Engineering')
ON CONFLICT (id) DO NOTHING;

-- 2. Academic Terms
INSERT INTO academic_terms (id, name, start_date, end_date, is_active) VALUES
('t1000000-0000-0000-0000-000000000001', 'Fall 2026', '2026-08-15', '2026-12-20', true),
('t1000000-0000-0000-0000-000000000002', 'Spring 2026', '2026-01-10', '2026-05-25', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Courses
INSERT INTO courses (id, code, title, department_id, credits, description) VALUES
('c1000000-0000-0000-0000-000000000001', 'CS301', 'Data Structures & Algorithms', 'd1000000-0000-0000-0000-000000000001', 4, 'Advanced data structures and algorithms.'),
('c1000000-0000-0000-0000-000000000002', 'CS302', 'Database Management Systems', 'd1000000-0000-0000-0000-000000000001', 3, 'Relational databases and transactions.'),
('c1000000-0000-0000-0000-000000000003', 'CS303', 'Computer Networks & Security', 'd1000000-0000-0000-0000-000000000001', 3, 'TCP/IP and network security protocols.'),
('c1000000-0000-0000-0000-000000000004', 'EC201', 'Digital Signal Processing', 'd1000000-0000-0000-0000-000000000002', 4, 'Discrete-time signals and systems.')
ON CONFLICT (id) DO NOTHING;
