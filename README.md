# Task Management REST API

A REST API where users can register, log in, and securely manage their own tasks.

**Tech stack:** Node.js · Express.js · MongoDB (Mongoose) · JWT · Git/GitHub

## Features

- User registration, login, and profile (JWT auth, bcrypt password hashing)
- Task CRUD - every task belongs to, and is only accessible by, its owner
- Search (title/description), filter (status, priority), and pagination
- Request validation (`express-validator`), centralized error handling, `helmet` security headers

## Project structure

```
src/
  config/        database connection
  controllers/   request handlers (auth, tasks)
  middleware/    auth guard, validation runner, error handler
  models/        Mongoose schemas (User, Task)
  routes/        route definitions
  validators/    validation rules
  utils/         AppError, asyncHandler, JWT helper
  app.js         Express app setup
  server.js      entry point
postman/         Postman collection
```

## Setup

**Prerequisites:** Node.js 18+ and a running MongoDB (local or MongoDB Atlas).

```bash
git clone <your-repo-url>
cd task-management-api
npm install
cp .env.example .env      # then edit values
npm run dev               # or: npm start
```

The API runs at `http://localhost:5000` (health check: `GET /health`).

### Environment variables

| Variable         | Description                              | Example                                      |
|------------------|------------------------------------------|----------------------------------------------|
| `PORT`           | Server port                              | `5000`                                       |
| `NODE_ENV`       | `development` or `production`            | `development`                                |
| `MONGO_URI`      | MongoDB connection string                | `mongodb://127.0.0.1:27017/task_management`  |
| `JWT_SECRET`     | Secret used to sign tokens               | long random string                           |
| `JWT_EXPIRES_IN` | Token lifetime                           | `1d`                                         |

## API endpoints

| Method | Endpoint             | Auth | Description              |
|--------|----------------------|------|--------------------------|
| POST   | `/api/auth/register` | No   | Register a user          |
| POST   | `/api/auth/login`    | No   | Log in, receive a JWT    |
| GET    | `/api/auth/profile`  | Yes  | Get logged-in user       |
| POST   | `/api/tasks`         | Yes  | Create a task            |
| GET    | `/api/tasks`         | Yes  | List your tasks          |
| GET    | `/api/tasks/:id`     | Yes  | Get a single task        |
| PUT    | `/api/tasks/:id`     | Yes  | Update a task            |
| DELETE | `/api/tasks/:id`     | Yes  | Delete a task            |

Protected routes need the header `Authorization: Bearer <token>`.

### Task fields

| Field         | Type   | Notes                                                |
|---------------|--------|------------------------------------------------------|
| `title`       | string | required, max 100 chars                              |
| `description` | string | optional, max 1000 chars                             |
| `status`      | string | `Pending` (default), `In Progress`, `Completed`      |
| `priority`    | string | `Low`, `Medium` (default), `High`                    |
| `dueDate`     | date   | optional, ISO 8601 (e.g. `2026-12-31`)               |
| `createdAt`   | date   | set automatically                                    |

`PUT /api/tasks/:id` accepts any subset of the fields above.

### Listing tasks: search, filter, pagination

```
GET /api/tasks?search=report&status=Completed&priority=High&page=1&limit=10
```

| Param      | Description                                        |
|------------|----------------------------------------------------|
| `search`   | Case-insensitive match on title or description     |
| `status`   | `Pending` \| `In Progress` \| `Completed`          |
| `priority` | `Low` \| `Medium` \| `High`                        |
| `page`     | Page number (default `1`)                          |
| `limit`    | Items per page (default `10`, max `100`)           |

Results are sorted newest first. Response shape:

```json
{
  "success": true,
  "data": [ { "_id": "...", "title": "...", "status": "Completed", "priority": "High" } ],
  "pagination": { "total": 25, "page": 1, "limit": 10, "totalPages": 3 }
}
```

### Example requests

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secret123"}'

# Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"title":"Finish assignment","priority":"High","dueDate":"2026-12-31"}'
```

### Error format

```json
{ "success": false, "message": "Validation failed", "errors": [ { "field": "email", "message": "A valid email is required" } ] }
```

| Code | Meaning                                     |
|------|---------------------------------------------|
| 400  | Validation error / malformed input          |
| 401  | Missing, invalid, or expired token / bad login |
| 404  | Task or route not found (also returned for other users' tasks) |
| 409  | Email already registered                    |
| 500  | Unexpected server error (details hidden in production) |

## Security notes

- Passwords hashed with bcrypt (12 rounds); the hash is never selected or returned.
- All task queries are filtered by the authenticated user's id, so other users' tasks return `404`.
- Only whitelisted task fields are accepted (no mass-assignment); search input is regex-escaped.
- Login returns the same error for unknown email and wrong password.

## Postman

Import `postman/Task_Management_API.postman_collection.json`. Run **Register** or **Login** first - the token (and the created task id) are stored in collection variables automatically. Change the `baseUrl` variable if you deploy.
