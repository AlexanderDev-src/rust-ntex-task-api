# Task API — learning Rust by building a REST API

A small Task/Todo REST API written in Rust with [ntex](https://ntex.rs) and PostgreSQL.

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

| Method | Path          | Behaviour                                                       |
| ------ | ------------- | --------------------------------------------------------------- |
| GET    | `/health`     | liveness check                                                   |
| GET    | `/tasks`      | list tasks — newest first, with `status`, `limit`, `offset`       |
| POST   | `/tasks`      | create a task — validated, returns `201` + the task              |
| GET    | `/tasks/{id}` | fetch one task, `404` if it does not exist                       |
| PATCH  | `/tasks/{id}` | partial update — only the fields you send                        |
| DELETE | `/tasks/{id}` | delete, `204` on success                                         |

Listing supports filtering and paging:

```
GET /tasks?status=done&limit=20&offset=40
```

`limit` defaults to 20 and must be between 1 and 100. Results are ordered by `created_at`
descending — without a fixed order, paging silently duplicates and skips rows.

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
| `sqlx`      | async PostgreSQL, compile-time-optional query checking, migrations |
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

PostgreSQL runs in Docker; the API runs on the host.

```bash
git clone git@github.com:AlexanderDev-src/rust-ntex-task-api.git
cd rust-ntex-task-api
docker compose up -d db
printf '%s\n' 'DATABASE_URL=postgres://restapi:restapi@127.0.0.1:5433/tasks' 'PORT=8080' > .env
cargo run
```

Migrations run automatically at startup. The database is published on host port **5433**, not the
usual 5432, so it does not collide with another Postgres already on the machine. Its data lives in the
`pgdata` named volume and survives `docker compose down`; only `docker compose down -v` deletes it.

The `POSTGRES_USER` / `POSTGRES_PASSWORD` values in `docker-compose.yml` are read once, when the
volume is first initialised. Changing them afterwards does nothing until the volume is recreated, so
keep `.env` in step with whatever the volume was created with.

To look at the data directly:

```bash
docker compose exec db psql -U restapi -d tasks -c 'select id, title, status from tasks;'
```

Configuration comes from the environment; `.env` is only a convenience for local work, and real
environment variables take precedence over it:

| Variable       | Required | Default | Notes                        |
| -------------- | -------- | ------- | ---------------------------- |
| `DATABASE_URL` | yes      | —       | startup fails without it     |
| `PORT`         | no       | 8080    |                              |
| `WORKERS`      | no       | 4       | ntex worker threads          |

A missing or malformed value fails fast with one readable line, not a panic:

```
Error: DATABASE_URL is not set
Error: PORT must be a number, got "abc"
```

`PORT=4000 cargo run` overrides the file. Ctrl-C shuts down gracefully, giving in-flight requests up
to five seconds to finish.

```bash
curl -X POST localhost:8080/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"learn ntex"}'
```

## Tests

`test.fish` is an acceptance script — 54 checks covering every endpoint, every error path, the
validation rules, the paging behaviour, and PATCH semantics. Start the server first, then in another terminal:

```bash
./test.fish          # or ./test.fish 4000 for a different port
```

It seeds its own tasks and deletes them afterwards, so it is safe to run repeatedly, and every count
it asserts is relative to what it created — leftover rows do not break it. It exits non-zero if
anything fails.

There is also one Rust unit test, for the `UpdateTask` deserializer — it needs no server or database:

```bash
cargo test
```

Two of the acceptance checks are less obvious than the rest and were worth writing: one asserts that page 1
and page 2 share no ids, and one asserts that the same request twice returns the same order. Both
fail the moment `ORDER BY` goes missing, which is exactly the bug that is invisible when you only
ever look at one page.

## Layout

```
src/
├── main.rs            startup: config, pool, migrations, routes
├── lib.rs             module declarations
├── config.rs          Config::from_env — the only place that reads the environment
├── error.rs           AppError + WebResponseError — every error becomes JSON here
├── extract.rs         ValidatedJson<T> and ValidatedQuery<T>, custom FromRequest extractors
├── state.rs           AppState — owns the PgPool, all SQL lives here
├── handlers/tasks.rs  HTTP only: request in, AppState call, response out
└── models/task.rs     Task, CreateTask, UpdateTask, TaskQuery, TaskStatus
migrations/            versioned schema, applied on startup
frontend/              React + TypeScript + Tailwind
docker-compose.yml     PostgreSQL (plus the frontend image)
```

Dependencies point one way: `handlers` → `state` → `models`. Handlers contain no SQL, and models know
nothing about HTTP.

That layering paid off concretely. Phase 6 replaced an in-memory `Arc<Mutex<HashMap>>` with a real
SQLite pool, and the five handlers changed by adding `.await` — nothing else. The later move from
SQLite to PostgreSQL touched `state.rs`, `main.rs`, the model derives and the migration, and again
no handler. The same acceptance script verified every version.

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
| 7     | query params, pagination  | `Query<T>`, `QueryBuilder`, why paging needs `ORDER BY`         |
| 8     | config, graceful shutdown | env-driven config, splitting `main` from `run`, clean shutdown  |

After the eight phases:

| Step        | What it was actually for                                                        |
| ----------- | ------------------------------------------------------------------------------- |
| frontend    | React + TS client behind a Vite dev proxy; one `api.ts` owns every request       |
| PATCH fix   | `Option<Option<String>>` so `null` clears a field and a missing key leaves it    |
| PostgreSQL  | native `uuid` / `timestamptz`, `$1` placeholders, no unsigned integers           |

### What the PostgreSQL move actually changed

- **Types got real.** SQLite stored the UUID as `TEXT` and needed `.to_string()` on every bind plus
  `#[sqlx(try_from = "String")]` on read — forgetting one silently matched zero rows. Postgres has a
  `uuid` column type, so all of that went away.
- **Placeholders.** `?` became `$1, $2, …`. `QueryBuilder::push_bind` numbers them itself.
- **No unsigned integers.** `u32` does not encode for Postgres, so `limit` / `offset` became `i64`.
  That removed the free rejection of negative numbers, so `offset` now needs an explicit
  `range(min = 0)` — and `?limit=-1` is a `422` (parsed, then refused) instead of a `400`.
- **`type_name` must match the schema.** `#[sqlx(type_name = "task_status")]` told sqlx the column
  was a Postgres enum that the migration never created; every insert failed with a generic
  `database error`. The column is `TEXT`, so the derive says `TEXT`.

Deliberately out of scope: authentication, tracing, OpenAPI, and running the API itself in Docker. They are
worth doing, but each is its own topic and would have blurred the phase it landed in.

## Status

All eight phases are done, the backend runs on PostgreSQL, and the 54-check acceptance script plus
the Rust unit test pass. Next: a Dockerfile for the API so `docker compose up` brings up the whole
stack — see the commented-out `api` service in `docker-compose.yml`.

This is learning code. It has no auth and no rate limiting, the Rust test suite is a single unit test,
and it is not hardened for anything. Do not run it in production.
