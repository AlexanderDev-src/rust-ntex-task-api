use ntex::web;
use uuid::Uuid;

use crate::{
    models::task::{CreateTask, Task, UpdateTask},
    state::AppState,
};

#[web::get("/health")]
async fn health() -> impl web::Responder {
    web::HttpResponse::Ok().body("OK")
}

#[web::post("/tasks")]
async fn create_task(
    state: web::types::State<AppState>,
    body: web::types::Json<CreateTask>,
) -> web::HttpResponse {
    let task = Task::new(body.into_inner());
    state.insert(task.clone());
    web::HttpResponse::Created().json(&task)
}

#[web::get("/tasks/{id}")]
async fn get_task(
    state: web::types::State<AppState>,
    path: web::types::Path<Uuid>,
) -> web::HttpResponse {
    let id = path.into_inner();

    match state.get(id) {
        Some(task) => web::HttpResponse::Ok().json(&task),
        None => web::HttpResponse::NotFound().finish(),
    }
}
#[web::get("/tasks")]
async fn list_tasks(state: web::types::State<AppState>) -> web::HttpResponse {
    let tasks = state.list();
    web::HttpResponse::Ok().json(&tasks)
}

#[web::patch("/tasks/{id}")]

async fn update_task(
    state: web::types::State<AppState>,
    path: web::types::Path<Uuid>,
    body: web::types::Json<UpdateTask>,
) -> web::HttpResponse {
    let id = path.into_inner();

    match state.update(id, body.into_inner()) {
        Some(task) => web::HttpResponse::Ok().json(&task),
        None => web::HttpResponse::NotFound().finish(),
    }
}

#[web::delete("/tasks/{id}")]
async fn delete_task(
    state: web::types::State<AppState>,
    path: web::types::Path<Uuid>,
) -> web::HttpResponse {
    let id = path.into_inner();

    if state.remove(id) {
        web::HttpResponse::NoContent().finish()
    } else {
        web::HttpResponse::NotFound().finish()
    }
}
