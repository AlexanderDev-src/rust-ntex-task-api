mod task;
use ntex::web;
use task::{CreateTask, Task};

#[ntex::main]

async fn main() -> std::io::Result<()> {
    web::HttpServer::new(async || web::App::new().service(health).service(create_task))
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}
#[web::get("/health")]
async fn health() -> impl web::Responder {
    web::HttpResponse::Ok().body("OK")
}

#[web::post("/tasks")]
async fn create_task(body: web::types::Json<CreateTask>) -> web::HttpResponse {
    let task = Task::new(body.into_inner());
    web::HttpResponse::Created().json(&task)
}
