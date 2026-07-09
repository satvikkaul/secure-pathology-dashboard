# Algorithm Result Template System — Phase 2 Planning

**Status:** Planning / design only. No implementation.
**Applies to:** Secure Pathology Dashboard (local research prototype, MSc MRP).
**Prototype only — not for clinical use. Sample/demo images only. All algorithm outputs are experimental placeholders unless independently validated.**

---

## 0. Core design answer (the one decision everything hangs on)

Use a **discriminated union**: every algorithm returns the *same outer envelope* with one tag field — `result_type` — that names its shape. The frontend keeps a **registry** mapping `result_type → template component`, with a **generic fallback** for anything unrecognized.

```
result JSON (envelope + result_type + metrics)
      │
      ▼
frontend registry.get(result_type) ─── miss ──▶ GenericResultTemplate
      │ hit
      ▼
ClassificationReportTemplate / GleasonReportTemplate / …
```

Consequences that keep this cheap:
- **Backend stays algorithm-agnostic.** It stores the JSON blob it already stores today (`result_summary`). No per-algorithm backend branching, no results table.
- **New algorithm ≠ new backend code.** A new algorithm just emits a `result_type` and a `metrics` object.
- **A missing template is never a broken page.** Unknown `result_type` renders through the generic fallback. You do not need all templates before you ship the system.

That last point is the whole reason not to overbuild: the system's value is that you *don't* hardcode or pre-build every algorithm.

---

## 1. Purpose of the template system

**Why:** Different algorithms produce structurally different outputs — a classifier returns a label + confidence; a segmentation model returns region coverage; a quality check returns a pass/fail with warnings. Forcing all of these through one hard-coded report page means every new algorithm edits that page, and the page grows a tangle of conditionals.

**What the template system buys:**
- **Extensibility without central edits.** Adding an algorithm adds (at most) one template file and one registry entry — existing templates are untouched.
- **A stable contract.** The envelope + `result_type` is the interface between "whatever the algorithm computed" and "how the dashboard shows it."
- **Safe-by-default rendering.** The generic fallback guarantees any conformant result displays *something* correct and non-misleading, even with no dedicated template.
- **Separation of concerns.** Algorithm authors think in metrics; frontend authors think in presentation; they meet at the envelope.

---

## 2. Algorithm categories to support

Support these **result_type** values. Only `classification` and `generic` matter near-term (they cover `placeholder_v1`); the rest are named now so the contract is stable, but built later, on demand.

| result_type | Category | Near-term? |
|---|---|---|
| `classification` | Single/multi-class label + confidence | Yes (fits placeholder_v1) |
| `gleason_grading` | Experimental grade-group / pattern output | Later |
| `segmentation` | Region/area coverage of tissue classes | Later |
| `nuclei_detection` | Object detection / counting / density | Later |
| `quality_check` | Image/tissue quality pass-fail + warnings | Later |
| `heatmap` | Attention / saliency overlay (visual) | Future (needs overlays) |
| `generic` | Fallback: envelope + key/value metric dump | Yes (safety net) |

Note: `gleason_grading` names a real clinical grading system. In this prototype it is an **experimental, non-diagnostic placeholder** and must be labelled as such wherever it appears.

---

## 3. Possible metrics per category

Illustrative, not binding — the `metrics` object is free-form per type.

- **classification:** `predicted_class`, `confidence`, `top_k` (list of `{class, probability}`), `class_labels`.
- **gleason_grading (experimental):** `grade_group`, `primary_pattern`, `secondary_pattern`, `score_sum`, `pattern_confidence`. Always paired with an experimental warning.
- **segmentation:** `classes` (list of `{label, coverage_fraction, pixel_area}`), `tissue_coverage`, `background_fraction`.
- **nuclei_detection:** `nuclei_count`, `density_per_mm2` (or per-tile if scale unknown), `mean_object_size`, `detection_confidence`.
- **quality_check:** `quality_score`, `status` (`pass`/`review`/`fail`), `blur_score`, `artifact_flags`, `warnings`.
- **heatmap:** `overlay_ref` (placeholder), `intensity_scale`, `method` (e.g. "attention"). No numeric diagnosis.
- **All categories (envelope-level):** `summary`, `findings`, `warnings`, `model_notes`.

---

## 4. Backend result schema proposal (the envelope)

Lives **inside the existing `AlgorithmJob.result_summary` JSON column** — no migration, no new table.

**Scope: the envelope contract applies to `completed` jobs only.** Failed jobs are handled by job `status` (the existing status panel renders them); their `result_summary` holds only a safe error note and is never fed to a template. No `error` result_type is needed.

Every algorithm returns:

```json
{
  "algorithm_name": "placeholder_v1",
  "algorithm_version": "1.0.0",
  "result_type": "classification",
  "summary": "Experimental placeholder classification result.",
  "metrics": {
    "predicted_class": "benign",
    "confidence": 0.87,
    "top_k": [
      { "class": "benign", "probability": 0.87 },
      { "class": "atypical", "probability": 0.13 }
    ]
  },
  "findings": [
    { "label": "Dominant pattern", "value": "uniform", "note": "illustrative only" }
  ],
  "warnings": [],
  "visual_outputs": [
    { "type": "heatmap", "status": "not_available", "note": "overlays deferred to a future phase" }
  ],
  "disclaimer": "Prototype only — not for clinical use. Output is experimental.",
  "model_metadata": {
    "runtime_ms": 12,
    "seed": 42,
    "notes": "synthetic placeholder"
  }
}
```

**Field rules:**
- `algorithm_name`, `algorithm_version`, `result_type`, `summary` — **always present**. The frontend depends only on these.
- `disclaimer` — expected, but **supplementary only**: per-algorithm wording. The authoritative safety banner is a fixed UI constant rendered outside the templates (§9) and never depends on this field — safety must not rest on algorithm authors remembering it.
- `metrics` — type-specific, free-form. The generic template can render it blind.
- `findings`, `warnings` — always arrays (empty, never null), so templates never null-check.
- `visual_outputs` — **placeholder list only** in this phase. Entries carry `status: "not_available"`. No image bytes, no URLs, no download.
- `model_metadata` — operational/debug info; never used for clinical claims.

**Validation posture (defer, don't skip):** define this as a Pydantic model *later* so the backend can reject malformed results at the trust boundary. Not needed while there's one placeholder algorithm; needed before the second real one lands.

---

## 5. Algorithm metadata model

Most of this **already exists** on the `Algorithm` model (`name`, `display_name`, `version`, `description`). The template system needs a few additions, conceptually:

| Field | Exists today? | Purpose |
|---|---|---|
| `name` | yes | Stable machine key |
| `display_name` | yes | UI label |
| `version` | yes | Output/version tracking |
| `description` | yes | Short experimental description |
| `input_requirements` | new | Accepted formats/size (JPG/PNG, <=10 MB) — mirrors current upload rules |
| `result_type` | new | Which template renders this algorithm's output |
| `supported_metrics` | new (optional) | Advertised metric keys — for docs/UI hints, not enforcement |
| `experimental` / `status` | new | Flag driving the "experimental placeholder" labelling |

`result_type` on the algorithm is a *hint* for pre-run UI (e.g. "this produces a classification report"); the authoritative `result_type` is the one in the **result envelope**, because a single algorithm could evolve its output. Keep both, trust the result at render time.

Deferral: these additions are a Phase 2 schema change (SQLite → recreate, as you already do). Don't add them until a template actually consumes them.

---

## 6. Frontend rendering architecture

A single registry + fallback. No inheritance hierarchy, no plugin loader.

```
result_type  →  template component
─────────────────────────────────
classification    → ClassificationReportTemplate
gleason_grading   → GleasonReportTemplate
segmentation      → SegmentationReportTemplate
nuclei_detection  → NucleiReportTemplate
quality_check     → QualityCheckTemplate
heatmap           → HeatmapTemplate      (future)
(anything else)   → GenericResultTemplate  ← fallback
```

Flow on `JobResultPage`:
1. Parse `result_summary` JSON into the envelope.
2. `const Template = registry[result_type] ?? GenericResultTemplate`. **Unknown, absent, or malformed `result_type` all land in the generic fallback** — this also covers legacy pre-envelope results (today's `placeholder_v1` output has no `result_type`), so no migration of stored results is ever required.
3. Render `<Template result={envelope} />` inside the existing `AppLayout`.
4. Render the **fixed safety banner unconditionally**, outside the template (see §9) — safety must not depend on which template runs or on the algorithm populating `disclaimer`.

Each template receives the whole envelope and decides how to present `metrics`; all templates reuse the shared envelope chrome (summary, findings, warnings, disclaimer) so only the metrics section differs. The envelope chrome is written once and shared; templates stay thin.

**Drift guard:** `result_type` strings are an allowlist defined on both sides of the API — backend algorithms emit them, the frontend registry keys on them. A typo silently degrades to the generic fallback (safe but invisible). Use the same mitigation as the role allowlist: cross-reference comments at both definition sites naming each other.

**Build order:** ship `GenericResultTemplate` + `ClassificationReportTemplate` first. Add each other template only when a real algorithm emits that `result_type`. Until then the generic fallback covers them safely.

---

## 7. Dashboard-level metrics

All **per-user** (respect existing data isolation — never aggregate across users) and **purely operational counts** — no trends, no diagnostic aggregation.

- Total uploaded images (this user)
- Total analyses run
- Completed jobs / failed jobs (counts by `status`)
- Recent algorithms used (distinct `algorithm_name`, most recent N)
- Recent reports (last N jobs with links to their result page)

Explicitly **not**: "X% benign this week", diagnosis rates, patient-level trends, or anything that reads as a clinical finding. These are counts of activity, labelled as such. All derivable from the existing `images` and `algorithm_jobs` tables — no new storage.

---

## 8. Example result templates (mock JSON + UI intent)

> Examples are abbreviated for readability: the mandatory envelope fields per §4 (`algorithm_name`, `algorithm_version`, `summary`) are elided but required in real outputs. Do not copy these verbatim as complete envelopes.

**Classification**
```json
{ "result_type": "classification", "summary": "Experimental classification.",
  "metrics": { "predicted_class": "benign", "confidence": 0.87,
    "top_k": [ {"class":"benign","probability":0.87}, {"class":"atypical","probability":0.13} ] },
  "findings": [], "warnings": [], "disclaimer": "Prototype only — not for clinical use." }
```
UI: big label + confidence, a small top-k bar list. (Matches today's page.)

**Gleason grading (experimental)**
```json
{ "result_type": "gleason_grading", "summary": "Experimental, non-diagnostic pattern output.",
  "metrics": { "grade_group": 2, "primary_pattern": 3, "secondary_pattern": 4, "score_sum": 7 },
  "warnings": ["Experimental placeholder — not a diagnosis."],
  "disclaimer": "Prototype only — not for clinical use." }
```
UI: pattern/grade shown as neutral data chips + a prominent experimental warning band. No interpretive text.

**Segmentation**
```json
{ "result_type": "segmentation", "summary": "Illustrative tissue coverage.",
  "metrics": { "tissue_coverage": 0.62,
    "classes": [ {"label":"stroma","coverage_fraction":0.4}, {"label":"epithelium","coverage_fraction":0.22} ] },
  "visual_outputs": [ {"type":"mask","status":"not_available","note":"overlays deferred"} ],
  "disclaimer": "Prototype only — not for clinical use." }
```
UI: coverage table + stacked bar; overlay area shows a "visual output not available in this prototype" placeholder.

**Quality check**
```json
{ "result_type": "quality_check", "summary": "Experimental image quality screen.",
  "metrics": { "quality_score": 0.78, "status": "review" },
  "warnings": ["Possible blur in region"], "disclaimer": "Prototype only — not for clinical use." }
```
UI: status pill (pass/review/fail), score meter, warnings list.

**Generic fallback**
```json
{ "result_type": "unknown_v0", "summary": "Result rendered with the generic template.",
  "metrics": { "some_number": 3, "some_label": "value" },
  "disclaimer": "Prototype only — not for clinical use." }
```
UI: summary + a plain key/value table of `metrics` + findings/warnings + disclaimer. Never invents interpretation — just displays what's present.

---

## 9. Safety and wording guidelines

Apply consistently, everywhere a result is shown:

- **Prototype only — not for clinical use.**
- **Sample/demo images only.** No real or de-identified patient data.
- **No diagnostic or treatment decision should be based on this output.**
- **Algorithm outputs are experimental/placeholders unless independently validated.**
- Named clinical concepts (e.g. Gleason) are **experimental reproductions**, not diagnoses.

**Design enforcement (defense in depth):**
- The safety banner is a **fixed UI constant rendered outside the template**, so it shows even if an algorithm omits `disclaimer` or a template has a bug.
- Templates must not synthesize interpretive prose ("this suggests malignancy"). They present values and let the fixed disclaimers frame them.
- The generic fallback is deliberately the *most* conservative renderer: data only, zero interpretation.

---

## 10. Implementation roadmap

Not gating on professor feedback — sequenced by **risk and readiness**. The discipline that stays regardless: **design the contract before building templates, and build templates on demand, not speculatively.**

- **Now (documentation only): ✓ done** — this document. Envelope shape and `result_type` registry concept frozen. No code.
- **Next (schema design, still cheap): ✓ done — see Appendix A.** Envelope written as a Pydantic model spec, algorithm-metadata additions specified, `placeholder_v1` retrofit mapped, validation posture decided.
- **Later Phase 2 (first real build): ✓ done (2026-07-05/06)** — envelope + validation in the jobs router, `GenericResultTemplate` + `ClassificationReportTemplate`, registry routing in `JobResultPage`, three `Algorithm` metadata columns, `placeholder_v1` retrofit. Verified: backend curl end-to-end, `test_envelope.py` self-check, browser click-through. **Stopped here, as planned, until a second algorithm exists.**
- **On demand:** add each specific template (`segmentation`, `quality_check`, …) only when an algorithm actually emits that type.
- **Future (out of current scope):** visual overlays/heatmaps, exports/downloads, audit logs, real model integration. All currently on the excluded list — keep them there.

**Scope discipline:** resist building all six templates in the "first real build." Envelope + generic + one concrete template is the minimum that proves the system; the rest is unnecessary until a real output needs them.

---

## 11. Risks and open questions

- **Real algorithms defining their own schemas.** Risk: each model author invents incompatible metrics. Mitigation: the envelope is mandatory; `metrics` is free but should draw from the advertised `supported_metrics`. Open: how strictly to validate `metrics` per `result_type` (loose now, tighten when it hurts).
- **Inconsistent metrics across algorithms.** Two "classification" models may name fields differently. Open: whether to standardize common keys (`predicted_class`, `confidence`) as a soft convention. Recommendation: yes, document a small shared vocabulary; don't enforce early.
- **`result_type` string drift.** Backend-emitted strings and frontend registry keys can silently diverge (typo → everything renders generic, no error surfaces). Mitigation: cross-reference comments at both definition sites (§6); consider a startup or test assertion comparing the two lists once more than two types exist.
- **Avoiding misleading clinical interpretation.** Mitigation: fixed disclaimers outside templates, no interpretive prose, experimental labelling on named clinical outputs. This is the highest-stakes risk — treat the wording rules in §9 as non-negotiable.
- **Template versioning.** Risk of over-engineering. Recommendation: **don't** build template-version negotiation now. `algorithm_version` + `result_type` + the generic fallback absorb drift. Revisit only if a `result_type`'s shape actually changes incompatibly.
- **Future image overlays.** `visual_outputs` is a placeholder list now so the envelope won't need reshaping later. Open: where overlay assets live and how access control/signed access works — defer with the rest of storage planning.
- **Keeping the generic fallback safe.** It must render arbitrary `metrics` without ever implying meaning. Open: cap on nesting/size to avoid rendering a huge/hostile blob; escape all values (it's user-adjacent data). Keep it data-only, always.

---

**Bottom line:** one envelope + one discriminator + one frontend registry with a safe generic fallback. It reuses the JSON column and Algorithm fields you already have, needs almost no backend change to *start*, and lets you add exactly one template at a time. The main work is agreeing the envelope and holding the safety-wording line — not building machinery.

---

# Appendix A — Schema design (deliverable of the "Next" roadmap phase)

Design-level spec only; still no implementation. This is what the "first real build" phase implements verbatim.

## A1. Result envelope — Pydantic model spec

One model, `ResultEnvelope`, living in `backend/app/schemas.py` next to the existing schemas.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `algorithm_name` | `str` | yes | — | Matches `Algorithm.name` |
| `algorithm_version` | `str` | yes | — | Copied from `Algorithm.version` at run time |
| `result_type` | `str` | yes | — | Registry discriminator — see decision below |
| `summary` | `str` | yes | — | One sentence, non-interpretive |
| `metrics` | `dict` | no | `{}` | Free-form, type-specific; not validated |
| `findings` | `list[Finding]` | no | `[]` | `Finding = {label: str (required), score: float?, value: str?, note: str?}` — matches current placeholder shape |
| `warnings` | `list[str]` | no | `[]` | |
| `visual_outputs` | `list[VisualOutput]` | no | `[]` | `VisualOutput = {type: str, status: str = "not_available", note: str?}` — placeholder entries only this phase |
| `disclaimer` | `str` | no | `None` | Supplementary (§4); fixed banner is authoritative |
| `model_metadata` | `dict` | no | `{}` | Operational/debug only |

**Decision — `result_type` is a plain `str`, not a `Literal`/enum.** Deliberate contrast with `AllowedRole`: there, rejecting unknown values is the point; here, unknown values are *by design* absorbed safely by the frontend's generic fallback. An enum would turn every new algorithm category into an envelope schema change — exactly the coupling this system exists to avoid. The known values live in the §2 table + cross-reference comments (§6 drift guard).

**Decision — free-text bounds.** `summary`, `disclaimer` get `max_length` (e.g. 500 / 500); `warnings` items and `Finding.label/note` likewise (200). Same trust-boundary practice as the profile fields — results are generated server-side today, but the bound costs nothing and holds when third-party algorithm code lands.

## A2. Validation posture — decided

- **Envelope validated at job-completion time**, before `json.dumps` into `result_summary`: the jobs router passes the algorithm's return dict through `ResultEnvelope`. Cost ≈ zero (the model exists anyway); benefit: a malformed blob can never reach the frontend.
- **Validation failure reuses the existing failure path** (`status="failed"`, safe error note, logged). A bad envelope is a programming error in the algorithm adapter, and the status panel already renders failed jobs — no new UI, no `error` result_type.
- **`metrics` and `model_metadata` contents are not validated** — free-form by design; the shared vocabulary (A5) is convention, not enforcement.
- **API surface unchanged:** `JobOut.result_summary` stays a JSON string; the frontend keeps parsing it. No response-model change.

## A3. `placeholder_v1` retrofit — target output

Current → envelope mapping:

| Current field | Envelope destination |
|---|---|
| `algorithm` | `algorithm_name` |
| `prediction` | `metrics.predicted_class` |
| `confidence` | `metrics.confidence` |
| `findings` | `findings` (shape already conforms) |
| `note` | `disclaimer` |
| `image_id` | **dropped** — the job row already stores it |
| — (new) | `result_type: "classification"`, `algorithm_version: "1.0.0"`, `summary: "Experimental placeholder classification result."` |

## A4. Algorithm metadata — column additions (design only)

| Column | Type | Default | Purpose |
|---|---|---|---|
| `result_type` | `String, nullable=False` | `"generic"` | Pre-run UI hint (§5); envelope value stays authoritative |
| `input_requirements` | `String` | `"JPG/PNG, max 10 MB"` | Display text mirroring upload validation — informational, not enforcement |
| `experimental` | `Boolean, nullable=False` | `True` | Drives "experimental placeholder" labelling |

**Deferred: `supported_metrics`.** Nothing consumes it yet — add the column when a UI or doc generator actually reads it.

SQLite recreate required on landing (one `rm pathology.db`); the WS3 `verify_schema()` startup guard already fails loud if forgotten.

## A5. Shared metric vocabulary — soft convention

For any algorithm claiming `result_type: "classification"`:

- `predicted_class` — `str`
- `confidence` — `float`, **0–1 fraction** (frontend formats to %)
- `top_k` — `list of {class: str, probability: float 0–1}`

Convention only (documented, not validated). Rule that generalizes: **all ratios/probabilities stored as 0–1 fractions everywhere**; formatting is the frontend's job.

## A6. What the build phase implements (unchanged from §10)

`ResultEnvelope` + validation in the jobs router, the three `Algorithm` columns, the `placeholder_v1` retrofit (A3), `GenericResultTemplate`, `ClassificationReportTemplate`, and the registry routing in `JobResultPage`. Stop there.
