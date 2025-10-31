# Advanced Movie Review API

A secure, robust backend API to manage movie reviews with authentication, filtering, sorting, and full CRUD operations.

## Requirements

- Node.js 18+

## Environment Setup

Create a `.env` file in the project root using the template below. If your environment blocks dotfiles, create `env.local` and rename to `.env` before publishing.

```env
PORT=3000
API_KEY=replace-with-a-secure-random-string
ADMIN_IDS=admin
```

- `API_KEY`: Value clients must send in the `x-api-key` header for protected endpoints
- `ADMIN_IDS`: Comma-separated list of user IDs with admin rights. User ID is provided by clients via `x-user-id` header.

## Install & Run Locally

```bash
npm install
npm start
```

Server starts on `http://localhost:${PORT}`.

## Authentication

- Protected endpoints require headers:
  - `x-api-key`: must match `API_KEY`
  - `x-user-id`: arbitrary string identifying the user; used for ownership checks
- Admins: if `x-user-id` is included in `ADMIN_IDS`, they can delete any review.

## Data Storage

- JSON file at `data/movies.json`
- Auto-created if missing; corrupted files are treated as empty arrays

## Endpoints

Base URL: `/api/movies`

### GET /api/movies

Returns all reviews with optional filtering and sorting.

Query params:

- `director`: exact (case-insensitive) director match
- `rating`: exact integer rating
- `tag`: review must include tag (case-insensitive)
- `sort`: `rating:asc|desc` or `date:asc|desc` (defaults to `desc`)

Responses:

- `200 OK` → `[]` if no matches

### POST /api/movies

Create a new review. Auth required.

Headers:

- `x-api-key`, `x-user-id`

Body (JSON):

```json
{
  "movieTitle": "string",
  "director": "string",
  "reviewText": "string",
  "rating": 1,
  "tags": ["optional", "tags"]
}
```

Rules:

- Required: `movieTitle`, `director`, `reviewText`, `rating`
- `rating` must be 1–10
- Duplicate by same user for same `movieTitle` is rejected

Responses:

- `201 Created` → returns created review
- `400 Bad Request`, `401 Unauthorized`, `409 Conflict`

### PUT /api/movies/:id

Update review text, rating, or tags. Owner only.

Headers:

- `x-api-key`, `x-user-id`

Body (JSON, any subset):

```json
{
  "reviewText": "updated text",
  "rating": 8,
  "tags": ["updated", "tags"]
}
```

- `movieTitle`, `director`, `id` remain unchanged

Responses:

- `200 OK` → updated review
- `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

### DELETE /api/movies/:id

Delete a review. Owner or admin only.

Headers:

- `x-api-key`, `x-user-id`

Responses:

- `200 OK` → `{ success: true }`
- `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

## CORS

- Enabled globally for frontend integration.

## Deployment (Render)

1. Push this repo to GitHub
2. Create a new Render Web Service
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add Environment Variables: `PORT`, `API_KEY`, `ADMIN_IDS`
6. Deploy

### API URL

Include your Render base URL here after deployment (e.g., `https://movie-review-api-9dol.onrender.com/`).

## Submission Notes

- Include Postman screenshots for all endpoints
- Include Render dashboard screenshot
- Provide a short explanation of challenges faced






