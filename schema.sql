-- schema.sql

-- 1. ตารางสำนัก/ส่วนราชการ (141 สำนัก)
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    article_ref TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_started',
    respondent_name TEXT,
    respondent_position TEXT,
    respondent_phone TEXT,
    submitted_at TEXT,
    updated_at TEXT
);

-- 2. ตารางหน้าที่และอำนาจตามประกาศ
CREATE TABLE IF NOT EXISTS mandates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dept_id TEXT NOT NULL,
    item_order INTEGER NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(id)
);

-- 3. ตารางคำตอบส่วนที่ 1 (ประเมินหน้าที่เดิม)
CREATE TABLE IF NOT EXISTS mandate_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dept_id TEXT NOT NULL,
    mandate_id INTEGER NOT NULL,
    has_action TEXT,
    problems TEXT,
    keep_status TEXT,
    suggestion TEXT,
    updated_at TEXT,
    UNIQUE(dept_id, mandate_id),
    FOREIGN KEY (dept_id) REFERENCES departments(id),
    FOREIGN KEY (mandate_id) REFERENCES mandates(id)
);

-- 4. ตารางคำตอบส่วนที่ 2 (ข้อเสนอหน้าที่ใหม่)
CREATE TABLE IF NOT EXISTS new_mandate_proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dept_id TEXT NOT NULL,
    item_order INTEGER NOT NULL,
    proposed_content TEXT NOT NULL,
    reason TEXT,
    FOREIGN KEY (dept_id) REFERENCES departments(id)
);