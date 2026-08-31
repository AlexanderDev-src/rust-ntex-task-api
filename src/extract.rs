use ntex::web::{self, ErrorRenderer, FromRequest};
use serde::de::DeserializeOwned;
use validator::Validate;

use crate::error::AppError;

pub struct ValidatedJson<T>(pub T);

impl<T, Err> FromRequest<Err> for ValidatedJson<T>
where
    T: DeserializeOwned + Validate + 'static,
    Err: ErrorRenderer,
{
    type Error = AppError;

    async fn from_request(
        req: &ntex::web::HttpRequest,
        payload: &mut ntex::http::Payload,
    ) -> Result<Self, Self::Error> {
        let json = <web::types::Json<T> as FromRequest<Err>>::from_request(req, payload)
            .await
            .map_err(|e| AppError::BadRequest(e.to_string()))?;
        let value = json.into_inner();
        value
            .validate()
            .map_err(|e| AppError::Validation(e.to_string()))?;

        Ok(ValidatedJson(value))
    }
}
