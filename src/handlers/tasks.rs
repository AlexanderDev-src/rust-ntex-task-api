use ntex::web;
use uuid::Uuid;

use crate::{
    error::AppError,
    extract::{ValidatedJson, ValidatedQuery},
    models::task::{CreateTask, Task, TaskQuery, UpdateTask},
    state::AppState,
};

#[web::get("/health")]
async fn health() -> impl web::Responder {
    web::HttpResponse::Ok().body("OK")
}
#[web::post("/tasks")]
async fn create_task(
    state: web::types::State<AppState>,
    ValidatedJson(input): ValidatedJson<CreateTask>,
) -> Result<web::HttpResponse, AppError> {
    let task = Task::new(input);
    state.insert(task.clone()).await?;
    Ok(web::HttpResponse::Created().json(&task))
}

#[web::get("/tasks/{id}")]
async fn get_task(
    state: web::types::State<AppState>,
    path: web::types::Path<Uuid>,
) -> Result<web::HttpResponse, AppError> {
    let id = path.into_inner();
    let task = state.get(id).await?.ok_or(AppError::NotFound)?;
    Ok(web::HttpResponse::Ok().json(&task))
}
#[web::get("/tasks")]
async fn list_tasks(
    state: web::types::State<AppState>,
    ValidatedQuery(q): ValidatedQuery<TaskQuery>,
) -> Result<web::HttpResponse, AppError> {
    let tasks = state.list(&q).await?;
    Ok(web::HttpResponse::Ok().json(&tasks))
}

#[web::patch("/tasks/{id}")]

async fn update_task(
    state: web::types::State<AppState>,
    path: web::types::Path<Uuid>,
    ValidatedJson(input): ValidatedJson<UpdateTask>,
) -> Result<web::HttpResponse, AppError> {
    let task = state
        .update(path.into_inner(), input)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(web::HttpResponse::Ok().json(&task))
}

#[web::delete("/tasks/{id}")]
async fn delete_task(
    state: web::types::State<AppState>,
    path: web::types::Path<Uuid>,
) -> Result<web::HttpResponse, AppError> {
    let id = path.into_inner();
    state.remove(id).await?.ok_or(AppError::NotFound)?;
    Ok(web::HttpResponse::NoContent().finish())
}
