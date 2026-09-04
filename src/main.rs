use ntex::web;
use restapi::{
    error::AppError,
    handlers::tasks::{create_task, delete_task, get_task, health, list_tasks, update_task},
    state::AppState,
};
use sqlx::sqlite::SqlitePoolOptions;

#[ntex::main]

async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().expect(".env file not found");
    let url = std::env::var("DATABASE_URL").expect("DATABASE_URL not set");
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&url)
        .await?;
    sqlx::migrate!("./migrations").run(&pool).await?;
    let state = AppState::new(pool);

    web::HttpServer::new(async move || {
        web::App::new()
            .state(state.clone())
            .service(health)
            .service(create_task)
            .service(delete_task)
            .service(list_tasks)
            .service(get_task)
            .service(update_task)
            .default_service(web::route().to(not_found))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await?;

    Ok(())
}

async fn not_found() -> Result<web::HttpResponse, AppError> {
    Err(AppError::NotFound)
}
