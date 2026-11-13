# Scientific audit: Hardware Map (Phase 1)

Updated 29 October 2026. Scope: the 16 records in `data/objects.geojson`. Status values: **source-checked** (the source page or table was opened and read in this pass), **archive-text** (inherited from the project's existing mission records, not re-opened), **needs-check** (not verified in this pass).

The official NASA challenge Resources (expected 13 November 2026) have **not** been reviewed.

## Corrections to the local guide's sample record (Apollo 11)

| Sample field | What the NSSDCA catalogue record 1969-059C says | Action taken |
|---|---|---|
| `lat 0.67408, lon 23.47297` | LM landed at 0.67416 N, 23.47314 E (Lunar Reconnaissance Orbiter images, DE 421 mean Earth/polar-axis frame). The NSSDCA site table (`lunar_sites.html`) gives the same LM values. | Used 0.67416, 23.47314. Difference is about 5 m, but the source is now named. |
| `last_contact: 1969-07-21` | The descent stage never communicated. The attached EASEP stopped accepting commands on 27 Aug 1969. | `last_contact` is `null` for Apollo stages; the panel shows "Not applicable". |
| `left_behind: 1969-07-21` | Ascent-stage liftoff 21 July 1969, 17:54:01 UT. | Kept, with `left_behind_basis` stating exactly which event it is. |
| `science_enabled: seismic and laser ranging experiments deployed beside it` | EASEP (passive seismometer, dust detector) was deployed about 17 m south of the LM; the retroreflector about 5 m NNW of the EASEP. The descent stage carried the equipment. | Reworded: the stage carried and supported; it did not run the experiments. |
| `image: local/apollo11_lm.jpg` | No local photo was available (no network in the build environment). | Panel loads the image shown on the NSSDCA record when online, otherwise a built-in schematic. Nothing is claimed to be local. |

## Source-checked in this pass

- Apollo 11: landing 20 July 1969 20:17:40 UT; liftoff 21 July 1969 17:54:01 UT; position; EASEP placement; descent stage as launch platform; ascent stage's fate unknown (NSSDCA 1969-059C).
- Positions of the six Apollo LM descent stages (NSSDCA `lunar_sites.html`, LRO-derived, Wagner et al. 2017).
- Positions, landing dates and uncertainties for Surveyors 1, 3, 5, 6, 7 (NSSDCA `lunar_artifact_impacts.html`; LROC 2016 coordinates). Surveyor 5, 6, 7 instruments and Surveyor 3, 7 sampler (NSSDCA `surveyor.html`). Surveyor 7 key dates (NASA Science).
- Mars landing-site coordinates for Spirit, Opportunity, Pathfinder, Phoenix, InSight: **secondary compilation** (The Planetary Society map, which cites Arvidson 2006, Squyres 2006, NSSDC, a press briefing and Golombek et al.). Phoenix also matches the Washington University Phoenix page (IAU 2000 areocentric).
- Spirit and Opportunity dates: checked against NASA Science in the earlier October 2026 pass (see `mission-fact-audit.md`).

## Unresolved: please verify before relying on them

1. **Apollo 12, 14, 15, 16, 17**: landing dates, liftoff dates (the "left behind" dates) and the NSSDCA catalogue IDs (1969-099C, 1971-008C, 1971-063C, 1972-031C, 1972-096C) were not re-opened. Flagged `needs-check`. Apollo 12 and 15 landing dates are consistent with a Sky & Telescope article seen in search results (secondary).
2. **Surveyor catalogue IDs** other than Surveyor 1 (66-045A, seen in a catalogue copy): 1967-035A, 1967-084A, 1967-112A, 1968-001A are `needs-check`.
3. **Surveyor 1, 5, 6 last-contact dates** (7 Jan 1967, 17 Dec 1967, 14 Dec 1967; Surveyor 6 last useful data 24 Nov 1967) come from the project archive text, not re-opened.
4. **Mars last-contact and closure dates** for Sojourner/Pathfinder (27 Sep 1997; 10 Mar 1998), Phoenix (2 Nov 2008; "May 2010", day unknown) and InSight (15 Dec 2022; 21 Dec 2022) are archive text. NSSDCA IDs for all Mars objects are `needs-check`.
5. **Pathfinder longitude**: this dataset uses 19.33 N, 33.55 W (NSSDC via the Planetary Society); the older per-mission record uses 326.78 E (33.22 W). They differ by about 0.33 degrees (roughly 20 km). Which is preferred for "the lander" should be settled against a primary source.
6. **Mars latitude type** (areocentric vs areographic) is not uniform across the sources. The difference is far below the map's resolution but is stated in each record.
7. **Rovers**: Spirit, Opportunity (and Sojourner) moved after landing. Their pins mark the **landing site**, not the final position. A final-position record would need rover-traverse data (not added).
8. **Surveyor 3 / Apollo 12**: "selected parts were retrieved and are on Earth" comes from the earlier NASA Science check recorded in `mission-fact-audit.md`; not re-opened.
9. **Apollo ALSEP inventories** (which instruments at which site, and Apollo 17's different package) are intentionally not itemised.
10. **Moon coordinate frame**: stated explicitly by NSSDCA only for the Apollo 11 record; applied to other Apollo and Surveyor positions on the strength of the LROC/NSSDCA table headings. Marked as such in each record.
11. **Basemap**: the NASA Trek tile URL pattern, zoom limits (Moon 0 to 8, Mars 0 to 7), 256 px tiles and CORS behaviour come from NASA's Trek documentation plus third-party measurements dated 3 Oct 2026. They were **not** fetched from this build environment. Redistribution terms for the tiles were not reviewed, which is why tiles are streamed, not bundled.
12. **Imagery**: the NASA Image and Video Library search for a mission returns images of that mission, not necessarily of the exact object. The panel says so.
13. **First-person quotes** in `js/data.js` are imagined storytelling and are labelled that way on the mission page and in the map panel.
14. The site-wide "Use of AI" sentence on `data.html` (supplied by the team) says all facts were "rigorously checked". That is stronger than this audit supports; see the Known limits.

## Phase 2 checklist (after 13 November 2026)

1. Add the official Resources and the updated ZIP; list which files are authoritative.
2. For each record, compare name, mission, date fields, coordinates, mission status and identifiers claim by claim; record disagreements in `verification` and here.
3. Replace `needs-check` and `archive-text` values only with evidence; keep `source_url` and identifiers visible.
4. Settle the Pathfinder longitude and the Mars latitude type; decide whether rover final positions should be added.
5. Re-run `node tools/build-data.js --check`, then the QA steps in `docs/qa-report.md`.
6. Update `README.md`, `data.html` and the changelog with every scientific correction.
