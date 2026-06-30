# PIERS Fact Finder v2 — factfindAML.pierstech.com

React SPA for the PIAA property investment fact find with AML/CTF compliance.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

Test with the live API:
```
http://localhost:3000?clientId=1303&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

Add `&role=advisor` to see the AML/KYC section.

## Build

```bash
npm run build        # outputs to /dist
```

## Project structure

```
src/
  App.jsx                  # Main orchestrator — loads data, manages state, routing
  main.jsx                 # React entry point
  components/
    Header.jsx             # Teal header with stepper navigation
    Pages.jsx              # All 6/7 form pages (Start, Personal, Goals, Finance, Property, AML, Finish)
    UI.jsx                 # Shared primitives (Button, Input, Select, Card, PillGroup, etc.)
  hooks/
    useAutoSave.js         # 30s interval save + blur trigger + beforeunload beacon
    useUrlParams.js        # Parses clientId, token, role from URL query string
  utils/
    api.js                 # All PIERS API calls (Bearer token auth)
    mapper.js              # GET response → form state, form state → POST payload
  constants/
    enums.js               # All enumerated values from spec Appendix 10.1
```

## Key behaviours

### Authentication (v1 pattern)
- Reads `clientId` and `token` from URL query params
- Passes token as `Authorization: Bearer {token}` on all requests
- `role` param (`client` | `advisor`) controls which sections are visible

### Data loading
1. `GET /api/clients/{clientId}` — pre-populates the form
2. `GET /api/factfind/{clientId}` — loads saved state + status (gracefully degrades if not deployed)
3. `GET /api/clients/{clientId}/aml/status` — advisor only (gracefully degrades)

### Field mapping quirks (spec Section 6.2/6.3)
- `adddress` (triple-d typo) → `personal.address`
- `wages` (string) → `personal.income` (number via parseFloat)
- `birthdate` "1964-02-24" → `birth_date` "1964" (year only)
- `etype_id` → `employment_type` (integer 0/1)
- `stage_of_life` always parseInt'd (can arrive as string or integer)

### Auto-save
- Fires on field blur and every 30 seconds
- Uses `PUT /api/factfind/{clientId}/draft` with optimistic locking
- Final save on page unload via `navigator.sendBeacon`
- Retries failed saves up to 3 times with exponential backoff
- 409 conflict shows inline banner with reload option

### Submit
- `POST /api/factfind/{clientId}/submit` (status transition)
- `POST /api/generate-pdf` with full `form_data` + legacy root-level fields
- Opens PDF in new tab on success

### AML section
- Only rendered when `role=advisor` in URL
- Never sent to `/api/generate-pdf` — advisor-only record

### Form locking
- Client: read-only when status is `SUBMITTED`, `IN_REVIEW`, `LOCKED`, or `COMPLETED`
- Advisor: read-only when status is `LOCKED` or `COMPLETED`

## AWS deployment (S3 + CloudFront)

```bash
# 1. Build
npm run build

# 2. Sync to S3
aws s3 sync dist/ s3://factfindaml-pierstech-com --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id {DIST_ID} --paths "/*"
```

### CloudFront configuration
- Origin: S3 bucket
- Default root object: `index.html`
- Error pages: 404 → `/index.html` (200) — required for SPA routing
- HTTPS: Certificate in ACM for `factfindAML.pierstech.com`
- CORS: Managed by PIERS backend — no CloudFront CORS rules needed

### S3 bucket policy
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "CloudFrontAccess",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::factfindaml-pierstech-com/*"
  }]
}
```

### PIERS backend CORS
The PIERS backend at `piers.forrestercohen.com` must allow:
```
Access-Control-Allow-Origin: https://factfindAML.pierstech.com
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

## New endpoints needed from PIERS backend (spec Section 4.2)

These endpoints are called but gracefully degrade if not yet deployed:

| Endpoint | Priority | Notes |
|----------|----------|-------|
| `GET /api/factfind/{clientId}` | High | Form state + status + advisor notes |
| `PUT /api/factfind/{clientId}/draft` | High | Auto-save |
| `POST /api/factfind/{clientId}/submit` | High | Status transition DRAFT→SUBMITTED |
| `GET /api/clients/{clientId}/aml/status` | Medium | AML check status |
| `POST /api/clients/{clientId}/aml/check` | Medium | Initiate verification |
| `GET /api/factfind/{clientId}/history` | Low | Revision history |
| `POST /api/factfind/{clientId}/notes` | Low | Advisor annotations |
