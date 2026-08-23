use ntex::web;
use restapi::{
    handlers::tasks::{create_task, delete_task, get_task, health, list_tasks, update_task},
    state::AppState,
};

#[ntex::main]

async fn main() -> std::io::Result<()> {
    let state = AppState::new();

    web::HttpServer::new(async move || {
        web::App::new()
            .state(state.clone())
            .service(health)
            .service(create_task)
            .service(delete_task)
            .service(list_tasks)
            .service(get_task)
            .service(update_task)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
