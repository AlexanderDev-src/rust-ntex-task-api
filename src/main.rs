use ntex::{
    time::Seconds,
    web::{self},
};
use restapi::{
    config::Config,
    error::AppError,
    handlers::tasks::{create_task, delete_task, get_task, health, list_tasks, update_task},
    state::AppState,
};
use sqlx::postgres::PgPoolOptions;

#[ntex::main]

async fn main() {
    if let Err(e) = run().await {
        eprintln!("Error: {e}");
        std::process::exit(1);
    }
}
async fn run() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let config = Config::from_env()?;
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
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
    .workers(config.workers)
    .shutdown_timeout(Seconds(5))
    .bind(("127.0.0.1", config.port))?
    .run()
    .await?;

    Ok(())
}

async fn not_found() -> Result<web::HttpResponse, AppError> {
    Err(AppError::NotFound)
}
