use sqlx::{PgPool, Postgres, QueryBuilder};
use uuid::Uuid;

use crate::models::task::{Task, TaskQuery, UpdateTask};

#[derive(Clone)]
pub struct AppState {
    pool: PgPool,
}

impl AppState {
    pub fn new(db: PgPool) -> Self {
        Self { pool: db }
    }

    pub async fn insert(&self, task: Task) -> Result<(), sqlx::Error> {
        sqlx::query(
            "Insert into tasks (id, title, description, status, created_at) VALUES ($1, $2, $3, $4, $5)",
        )
        .bind(task.id())
        .bind(&task.title)
        .bind(&task.description)
        .bind(&task.status)
        .bind(task.created_at)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get(&self, id: Uuid) -> Result<Option<Task>, sqlx::Error> {
        sqlx::query_as("SELECT * FROM tasks where id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list(&self, query: &TaskQuery) -> Result<Vec<Task>, sqlx::Error> {
        let limit = query.limit.min(100);
        let mut b: QueryBuilder<Postgres> = QueryBuilder::new("SELECT * FROM tasks");

        if let Some(s) = &query.status {
            b.push(" WHERE status = ").push_bind(s.clone());
        }

        b.push(" ORDER BY created_at DESC LIMIT ")
            .push_bind(limit)
            .push(" OFFSET ")
            .push_bind(query.offset);

        let tasks = b.build_query_as::<Task>().fetch_all(&self.pool).await?;

        Ok(tasks)
    }

    pub async fn update(&self, id: Uuid, task: UpdateTask) -> Result<Option<Task>, sqlx::Error> {
        let existing = sqlx::query_as::<_, Task>("SELECT * FROM tasks WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;

        let Some(mut current) = existing else {
            return Ok(None);
        };

        if let Some(title) = task.title {
            current.title = title;
        }
        if let Some(description) = task.description {
            current.description = description;
        }
        if let Some(status) = task.status {
            current.status = status;
        }

        sqlx::query(
            "UPDATE tasks
         SET title = $1, description = $2, status = $3
         WHERE id = $4",
        )
        .bind(&current.title)
        .bind(&current.description)
        .bind(&current.status)
        .bind(id)
        .execute(&self.pool)
        .await?;

        Ok(Some(current))
    }
    pub async fn remove(&self, id: Uuid) -> Result<bool, sqlx::Error> {
        let r = sqlx::query("DELETE FROM tasks WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(r.rows_affected() > 0)
    }
}
