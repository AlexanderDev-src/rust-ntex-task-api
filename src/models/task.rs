use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::Type)]
#[serde(rename_all = "snake_case")]
#[sqlx(type_name = "task_status", rename_all = "snake_case")]
pub enum TaskStatus {
    Todo,
    InProgress,
    Done,
}
#[derive(Debug, Serialize, Clone, sqlx::FromRow, Validate)]
pub struct Task {
    #[sqlx(try_from = "String")]
    pub(crate) id: Uuid,
    #[validate(length(min = 1, max = 200))]
    pub(crate) title: String,
    #[validate(length(min = 1, max = 200))]
    pub(crate) description: Option<String>,
    pub(crate) status: TaskStatus,
    #[serde(with = "time::serde::rfc3339")]
    pub(crate) created_at: OffsetDateTime,
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

    pub fn id(&self) -> Uuid {
        self.id
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateTask {
    #[validate(length(min = 1, max = 200, message = "title must be 1-200 chars"))]
    title: String,
    description: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateTask {
    #[validate(length(min = 1, max = 200, message = "title must be 1-200 chars"))]
    pub(crate) title: Option<String>,
    pub(crate) description: Option<String>,
    pub(crate) status: Option<TaskStatus>,
}

fn default_limit() -> u32 {
    20
}

#[derive(Debug, Deserialize, Validate)]
pub struct TaskQuery {
    pub status: Option<TaskStatus>,
    #[serde(default = "default_limit")]
    #[validate(range(min = 1, max = 100, message = "limit must be 1-100"))]
    pub limit: u32,
    #[serde(default)]
    pub offset: u32,
}
