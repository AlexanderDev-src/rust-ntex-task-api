#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("{0} is not set")]
    Missing(&'static str),
    #[error("{0} must be a number, got {1:?}")]
    NotANumber(&'static str, String),
}
pub struct Config {
    pub database_url: String,
    pub port: u16,
    pub workers: usize,
}
fn parse_or<T: std::str::FromStr>(key: &'static str, fallback: T) -> Result<T, ConfigError> {
    match std::env::var(key) {
        Err(_) => Ok(fallback),
        Ok(raw) => raw.parse().map_err(|_| ConfigError::NotANumber(key, raw)),
    }
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        let database_url =
            std::env::var("DATABASE_URL").map_err(|_| ConfigError::Missing("DATABASE_URL"))?;

        let port = parse_or("PORT", 8080)?;
        let workers = parse_or("WORKERS", 4)?;

        Ok(Self {
            database_url,
            port,
            workers,
        })
    }
}
