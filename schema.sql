-- Use this SQL schema to set up the database for the Group Scheduling Tool
-- Table for storing events
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    created_at DATETIME NOT NULL,
    title TEXT NOT NULL UNIQUE
);
-- Table for storing participants
CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id)
);
-- Candidate Dates Table
CREATE TABLE IF NOT EXISTS candidate_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,
    candidate_date DATE NOT NULL,
    candidate_time TIME,
    FOREIGN KEY (event_id) REFERENCES events(id)
);
-- Participant Responses Table
CREATE TABLE IF NOT EXISTS participant_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id INTEGER NOT NULL,
    candidate_date_id INTEGER NOT NULL,
    response TEXT CHECK(response IN ('OK', 'MAYBE', 'NO')) NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES participants(id),
    FOREIGN KEY (candidate_date_id) REFERENCES candidate_dates(id)
);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);