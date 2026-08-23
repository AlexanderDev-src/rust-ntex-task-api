use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use uuid::Uuid;

use crate::models::task::{Task, UpdateTask};

#[derive(Clone, Default)]
pub struct AppState {
    tasks: Arc<Mutex<HashMap<Uuid, Task>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            tasks: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn insert(&self, task: Task) {
        let mut map = self.tasks.lock().unwrap();
        map.insert(task.get_id(), task);
    }

    pub fn list(&self) -> Vec<Task> {
        let map = self.tasks.lock().unwrap();
        map.values().cloned().collect()
    }

    pub fn get(&self, id: Uuid) -> Option<Task> {
        self.tasks.lock().unwrap().get(&id).cloned()
    }

    pub fn update(&self, id: Uuid, update: UpdateTask) -> Option<Task> {
        let mut map = self.tasks.lock().unwrap();
        let task = map.get_mut(&id)?;
        task.apply(update);
        Some(task.clone())
    }

    pub fn remove(&self, id: Uuid) -> bool {
        self.tasks.lock().unwrap().remove(&id).is_some()
    }
}
