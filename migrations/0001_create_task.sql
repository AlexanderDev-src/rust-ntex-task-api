CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    created_at TIMESTAMPTZ NOT NULL
);
