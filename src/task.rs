use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
enum TaskStatus {
    Todo,
    InProgress,
    Done,
}
#[derive(Debug, Serialize)]
pub struct Task {
    id: Uuid,
    title: String,
    description: Option<String>,
    status: TaskStatus,
    #[serde(with = "time::serde::rfc3339")]
    created_at: OffsetDateTime,
}

impl Task {
    pub fn new(input: CreateTask) -> Self {
        Self {
            id: Uuid::new_v4(),
            title: input.title,
            description: input.description,
            status: TaskStatus::Todo,
            created_at: OffsetDateTime::now_utc(),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateTask {
    title: String,
    description: Option<String>,
}
