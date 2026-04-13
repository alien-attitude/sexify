# Genderize Classifier API
# Sexify

A lightweight Express API that wraps the [Genderize.io](https://genderize.io/) service and adds confidence scoring.

## Endpoint

```
GET /api/classify?name={name}
```

### Success — `200 OK`

```json
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 1234,
    "is_confident": true,
    "processed_at": "2026-04-01T12:00:00.000Z"
  }
}
```

### Error responses

| Status | Trigger |
|--------|---------|
| `400` | `name` is missing or empty |
| `422` | `name` is not a string (e.g. array param) |
| `200` (error body) | Genderize returns `gender: null` or `count: 0` |
| `502` | Upstream API error / timeout |
| `500` | Unexpected server error |

All errors follow:
```json
{ "status": "error", "message": "..." }
```

---

## Processing rules

| Field | Source | Rule |
|-------|--------|------|
| `gender` | `gender` | Direct |
| `probability` | `probability` | Direct |
| `sample_size` | `count` | Renamed |
| `is_confident` | computed | `probability >= 0.7` **AND** `sample_size >= 100` |
| `processed_at` | server time | UTC ISO-8601, generated per request |

---

## Running locally

```bash
# Install dependencies
npm install

# Start (production)
npm start

# Start with auto-reload (dev)
npm run dev
```

The server listens on `PORT` env variable, defaulting to `3000`.

---

## Deployment

The app is a plain Node.js/Express server. Any platform that runs Node 18+ works:

| Platform | Notes                                                             |
|----------|-------------------------------------------------------------------|
| **Vercel** | Add `vercel.json` routing `/(.*) → app.js`                        |
| **Railway** | Push repo, set start command to `npm start`                       |
| **Heroku** | `git push heroku main` — Procfile not required (uses `npm start`) |
| **AWS / Fly.io** | Standard container or VM deploy                                   |

> **Render is not accepted per task rules.**

### Vercel (`vercel.json`)

```json
{
  "version": 2,
  "builds": [{ "src": "app.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "app.js" }]
}
```

---

## Example `curl` calls

```bash
# Happy path
curl "https://your-deployment.com/api/classify?name=john"

# Missing param  → 400
curl "https://your-deployment.com/api/classify"

# Empty param → 400
curl "https://your-deployment.com/api/classify?name="

# Unknown name → error body
curl "https://your-deployment.com/api/classify?name=xyzzy123"
```