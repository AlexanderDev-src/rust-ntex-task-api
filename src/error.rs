use ntex::web::error::WebResponseError;
use ntex::{
    http::StatusCode,
    web::{self, HttpRequest},
};
use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("task not found")]
    NotFound,
    #[error("bad request : {0}")]
    BadRequest(String),
    #[error("{0}")]
    Validation(String),
    #[error("error occurred. Please try again")]
    Internal,
}

#[derive(Serialize)]
struct ErrorBody {
    error: &'static str,
    message: String,
}

impl WebResponseError for AppError {
    fn status_code(&self) -> StatusCode {
        match self {
            AppError::NotFound => StatusCode::NOT_FOUND,
            AppError::BadRequest(_) => StatusCode::BAD_REQUEST,
            AppError::Validation(_) => StatusCode::UNPROCESSABLE_ENTITY,
            AppError::Internal => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
    fn error_response(&self, _: &HttpRequest) -> web::HttpResponse {
        let code = match self {
            AppError::NotFound => "not_found",
            AppError::BadRequest(_) => "bad_request",
            AppError::Validation(_) => "required",
            AppError::Internal => "server_error",
        };
        web::HttpResponse::build(self.status_code()).json(&ErrorBody {
            error: code,
            message: self.to_string(),
        })
    }
}
