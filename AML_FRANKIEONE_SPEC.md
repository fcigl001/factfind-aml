# AML / FrankieOne Verification — PIERS Backend Specification

This document specifies what the **PIERS backend** must provide for FrankieOne client
verification to work end-to-end. The React frontend (this repo) is already fully wired
to the routes below.

**Architecture decision:** PIERS owns **all** FrankieOne communication. FrankieOne
credentials and SDK never touch the browser — the frontend only *triggers* verification
and *displays* the result via PIERS routes.

---

## Conventions (already assumed by the frontend)

- **Base URL:** `https://factfindAML.peirstech.com` (frontend override: `VITE_API_URL`)
- **Auth:** every request sends `Authorization: Bearer <token>`. PIERS validates the JWT
  and scopes it to the client.
- **Responses:** `application/json`. The frontend reads either the raw object **or**
  `{ "data": { ... } }` (it does `res?.data || res`), so either envelope is accepted.
- **Errors:** non-2xx should return `{ "message": "...", "error"?: "...", "errors"?: {...} }`.
  The frontend surfaces `message` to the advisor.

---

## 1. `POST /api/clients/{clientId}/aml/check` — start verification

**Trigger:** advisor clicks **"Run electronic verification (FrankieOne)"**.

**PIERS must:**
1. Authenticate; load the client + `client_aml_records`.
2. Build the FrankieOne entity from the client's identity data (name, DOB, address, and
   the ID-document fields the advisor entered — `id_doc_type`, `id_doc_number`,
   `id_doc_expiry`, `id_issuing_authority`) plus any uploaded `client_aml_documents`.
3. Call FrankieOne to create/verify the entity and start the IDV + AML (PEP/sanctions) check.
4. Persist FrankieOne's `entityId` / `checkId` on `client_aml_records` for correlation.
5. Set `client_aml_records.status` to a pending state (e.g. `IN_PROGRESS`).

**Request body:** none (frontend sends an empty POST). If you'd prefer it to send the
current AML form fields, request a frontend change.

**Response:** `200`/`202`. Body is flexible — the frontend re-polls status immediately after.
Returning the status object (see §2) is ideal.

**Failure:** return `4xx`/`5xx` with `{ "message": "..." }`. The frontend shows it in an
orange banner and stops. The route degrades gracefully if not yet deployed.

---

## 2. `GET /api/clients/{clientId}/aml/status` — verification result (polled)

**Trigger:** frontend polls this **every 3 seconds, up to 20 times (~60s)** after a check
starts; also once after each document upload, and once on page load.

**PIERS must return** the current FrankieOne outcome for the client:

```json
{
  "status": "VERIFIED",
  "documents": [
    {
      "id": 12,
      "document_type": "Primary photo ID",
      "file_name": "passport.jpg",
      "url": "https://.../signed-link"
    }
  ]
}
```

### ⚠️ Critical contract — `status` drives the polling loop

`status` is **required** and must be one of these exact words (frontend uppercases before
comparing, so case is flexible — the *words* are not):

| Value         | Meaning                    | Polling behaviour                |
| ------------- | -------------------------- | -------------------------------- |
| `PENDING`     | not started                | keeps polling                    |
| `IN_PROGRESS` | FrankieOne check running   | keeps polling                    |
| `VERIFIED`    | passed                     | **terminal — polling stops**     |
| `FAILED`      | failed / refer             | **terminal — polling stops**     |
| `EXPIRED`     | check expired              | **terminal — polling stops**     |

If PIERS returns FrankieOne's native statuses (e.g. `"pass"`, `"refer"`, `"clear"`),
**map them** to the values above server-side — otherwise the badge never settles and
polling times out at ~60s. (If a clean server-side mapping isn't possible, provide
FrankieOne's actual strings and the frontend terminal-state check can be adjusted instead.)

**`documents`** — array for the uploaded-evidence list (§3). Omit/empty is fine.

### Optional but recommended — detailed outcomes for auto-fill

If `/aml/status` also returns FrankieOne's detailed results, the frontend can be extended
to auto-fill the (currently manual) AML record fields:

```json
{
  "pep_status": "not_pep",
  "tfs_status": "No — confirmed not listed",
  "ml_tf_risk_rating": "low",
  "id_name_matches": "Yes — exact match",
  "frankie_entity_id": "...",
  "frankie_check_id": "...",
  "checked_at": "2026-06-25T00:00:00Z"
}
```

---

## 3. `POST /api/clients/{clientId}/aml/documents` — upload ID evidence

**Trigger:** advisor picks a doc type + file in the KYC card.

**Frontend sends** `multipart/form-data` with exactly:
- `document` — the file (binary)
- `type` — the doc-type string (e.g. `"Primary photo ID"`)

**PIERS must:**
1. Store the file (S3 or equivalent) and create a `client_aml_documents` row (FK to client,
   `document_type`, `url`, etc.).
2. Optionally forward the document to FrankieOne as verification evidence.
3. Return success. The frontend immediately re-fetches `/aml/status`, so the new doc should
   appear in that response's `documents[]`.

**Field-name note:** the frontend reads each document as `document_type` / `file_name` /
`url` (with `type` as a fallback for the type). Match those keys, or provide yours for a
frontend alignment.

---

## 4. AML record persistence (the manual fields)

The bulk of the AML page (PEP, sanctions, source of funds, risk rating, contemporaneous
notes, advisor name, meeting date) currently flows through the **fact-find draft** as
`form_data.aml` (via `PUT /api/factfind/{clientId}/draft`).

For these to land in the `client_aml_records` table, **PIERS must extract `form_data.aml`
from the draft payload and upsert it into `client_aml_records`** (column names already
match the frontend keys). On read, return it either nested as `form_data.aml` **or** as a
top-level AML record — the frontend handles both.

---

## 5. Cross-cutting requirements

- **CORS:** allow the SPA origin (`https://factfindAML.pierstech.com`) on all three AML
  routes — `Authorization` header + `multipart/form-data` for uploads.
- **Async results:** FrankieOne IDV/AML is often asynchronous; a 60s frontend poll may not
  suffice. **Strongly recommended:** a FrankieOne **webhook receiver** on PIERS that updates
  `client_aml_records.status` when results land. The advisor can then reload and `/aml/status`
  reflects the final outcome.
- **Authorization:** restrict all AML routes to **advisor-role** tokens (the page is
  advisor-only).
- **Audit:** persist FrankieOne IDs + timestamps on `client_aml_records` for the compliance
  record.

---

## Checklist for the PIERS team

1. ☐ `POST /aml/check` → create FrankieOne entity + start check, store IDs, set status `IN_PROGRESS`.
2. ☐ `GET /aml/status` → return `{ status, documents[] }` with `status` mapped to `PENDING` / `IN_PROGRESS` / `VERIFIED` / `FAILED` / `EXPIRED`.
3. ☐ `POST /aml/documents` → accept `document` + `type`, save to `client_aml_documents`, surface in `/aml/status`.
4. ☐ Extract `form_data.aml` from draft → upsert `client_aml_records`.
5. ☐ FrankieOne **webhook** → update status on async completion.
6. ☐ CORS + advisor-only authz on all three routes.

---

## Open questions for PIERS (affect whether the frontend changes again)

1. **FrankieOne's native status strings** — if they can't be mapped to the five enum values
   server-side, provide them and the frontend terminal-state logic will be updated.
2. **Will `/aml/status` return PEP/sanctions/risk detail?** — if yes, the frontend can be
   wired to auto-fill those fields, removing manual entry for the advisor.

---

## Frontend reference (already implemented)

- API client: [`src/utils/api.js`](src/utils/api.js) — `initiateAmlCheck`, `getAmlStatus`,
  `uploadAmlDocument`.
- AML page UI + trigger/polling: [`src/components/Pages.jsx`](src/components/Pages.jsx) — `AmlPage`.
- Status enum: [`src/constants/enums.js`](src/constants/enums.js) — `AML_STATUS`.
- AML field mapping (load): [`src/utils/mapper.js`](src/utils/mapper.js) — `mapClientToForm`.
