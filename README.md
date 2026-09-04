# Task API — learning Rust by building a REST API

A small Task/Todo REST API written in Rust with [ntex](https://ntex.rs) and SQLite.

**This repository is a learning exercise, not a product.** The goal was never the API — it was
learning Rust. The API is just the thing I built while doing it.

## How this was built: project-based learning with an AI coach

I already knew Java and OOP, so the gap was Rust specifically, not programming. Instead of reading a
book front to back, I picked a real project and learned each concept at the moment it became
necessary.

I worked through it with Claude acting as a **coach, not an autocomplete**:

- The AI explained concepts, gave function signatures, and named the traps ahead — it did not write
  my code.
- I typed everything myself and hit the compiler errors myself.
- After each step the AI read the code, compiled it, ran the server, and reported what actually
  happened — including the bugs I had missed.
- Every phase ended with self-check questions I had to answer without looking anything up.

That split mattered. The bugs I remember are the ones I wrote: an `Option` that got dropped by a
stray semicolon, a `.bind(id)` that silently stored a UUID as a BLOB so every `WHERE id = ?` quietly
matched zero rows, a whole handler registered on the wrong HTTP verb that compiled and ran and simply
never fired.

## What it does

| Method | Path          | Behaviour                                          |
| ------ | ------------- | -------------------------------------------------- |
| GET    | `/health`     | liveness check                                      |
| GET    | `/tasks`      | list all tasks                                      |
| POST   | `/tasks`      | create a task — validated, returns `201` + the task |
| GET    | `/tasks/{id}` | fetch one task, `404` if it does not exist          |
| PATCH  | `/tasks/{id}` | partial update — only the fields you send           |
| DELETE | `/tasks/{id}` | delete, `204` on success                            |

Every error comes back in the same JSON shape, including unknown routes:

```json
{ "error": "not_found", "message": "task not found" }
```

Status codes are used deliberately: `400` when the body will not parse, `422` when it parses but
breaks a validation rule, `404` when the row is not there, `500` for anything the server got wrong.

## Stack

| Crate       | Why                                                             |
| ----------- | --------------------------------------------------------------- |
| `ntex`      | web framework (thread-per-core, actix-derived)                   |
| `sqlx`      | async SQLite, compile-time-optional query checking, migrations   |
| `serde`     | JSON in and out                                                  |
| `validator` | declarative validation rules on the request structs              |
| `thiserror` | one error enum with the boilerplate generated                    |
| `uuid`      | task ids                                                         |
| `time`      | RFC 3339 timestamps                                              |

### Why ntex and not axum

The project started on axum and moved to ntex a day in, purely out of curiosity about a framework I
had not seen. That turned out to be a real trade-off worth writing down: ntex is fast, but almost
every Rust web tutorial online is written for axum, and ntex's own docs carry very few examples.

The closest thing to documentation is actix-web, which ntex is derived from — and the two are similar
enough to be dangerous. The differences that cost me the most time:

- `HttpServer::new` needs an **async** closure (`AsyncFn`); actix takes a plain one.
- Extractors live in `web::types::`, not `web::`.
- `FromRequest<Err>` carries an extra generic parameter that actix does not have.
- Middleware registers with `.middleware()`, not `.wrap()`.

Reading `docs.rs` type signatures and the ntex source directly ended up being faster than searching.

## Running it

```bash
git clone git@github.com:AlexanderDev-src/rust-ntex-task-api.git
cd rust-ntex-task-api
echo 'DATABASE_URL=sqlite://tasks.db?mode=rwc' > .env
cargo run
```

The server listens on `http://localhost:8080`. Migrations run automatically at startup, and the
SQLite file is created on first run.

```bash
curl -X POST localhost:8080/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"learn ntex"}'
```

## Tests

`test.fish` is an acceptance script that exercises every endpoint plus the error and validation
paths. Start the server first, then in another terminal:

```bash
./test.fish
```

It creates its own tasks and cleans them up, so it is safe to run repeatedly. It exits non-zero if
anything fails.

## Layout

```
src/
├── main.rs            startup: config, pool, migrations, routes
├── lib.rs             module declarations
├── error.rs           AppError + WebResponseError — every error becomes JSON here
├── extract.rs         ValidatedJson<T>, a custom FromRequest extractor
├── state.rs           AppState — owns the SqlitePool, all SQL lives here
├── handlers/tasks.rs  HTTP only: request in, AppState call, response out
└── models/task.rs     Task, CreateTask, UpdateTask, TaskStatus
migrations/            versioned schema, applied on startup
```

Dependencies point one way: `handlers` → `state` → `models`. Handlers contain no SQL, and models know
nothing about HTTP.

That layering paid off concretely. Phase 6 replaced an in-memory `Arc<Mutex<HashMap>>` with a real
SQLite pool, and the five handlers changed by adding `.await` — nothing else. The same acceptance
script verified both versions.

## Learning path

Each phase was one commit and taught one thing.

| Phase | Topic                     | What it was actually for                                      |
| ----- | ------------------------- | ------------------------------------------------------------- |
| 0     | scaffold                  | crates, targets, what `main.rs` and `lib.rs` each are          |
| 1     | first server              | `async` returns a future that does nothing until awaited       |
| 2     | JSON in and out           | derive macros, extractors, `Responder`                         |
| 3     | shared state + CRUD       | `Arc`, `Mutex`, interior mutability, thread-per-core state     |
| 4     | error handling            | `Result`, `?`, one error enum, `WebResponseError`              |
| 5     | validation                | writing `FromRequest` by hand — how extractors actually work   |
| 6     | SQLite with sqlx          | pools, migrations, async database calls, type mapping          |
| 7     | query params, pagination  | planned                                                        |
| 8     | config, graceful shutdown | planned                                                        |

Deliberately out of scope: authentication, a test suite in Rust, Docker, tracing, OpenAPI. They are
worth doing, but each is its own topic and would have blurred the phase it landed in.

## Status

Phases 0–6 are done and the acceptance script passes. This is learning code: it has no auth, no rate
limiting, no Rust-level tests, and it is not hardened for anything. Do not run it in production.
