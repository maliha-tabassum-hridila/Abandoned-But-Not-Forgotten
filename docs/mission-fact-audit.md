# Mission fact audit (October 2026)

This note records corrections made while adding Mission Detective, What Remains?, and the comparison-page cleanup. It is not a claim that every sentence in the archive was independently verified.

**How sources were checked:** NASA Science and NASA/JPL pages were queried through web search in this implementation pass. Direct page fetches sometimes timed out, so wording was taken from NASA page excerpts returned by search. Anything not confirmed that way is marked unresolved.

## Confirmed corrections

### Spirit

| Field | Old value (if known) | Corrected value | Unit / definition | Source | Reason | Status |
|---|---|---|---|---|---|---|
| Landing date | January 4, 2004 | January 3, 2004 (PST) / January 4, 2004 (UTC) | Calendar date of landing; PST vs UTC | https://science.nasa.gov/mission/mer-spirit/ | NASA Science key dates use Jan. 3, 2004; detailed text gives 20:35 PST Jan. 3, which is Jan. 4 UTC | Confirmed |
| Planned duration | 90 sols (about 92 Earth days) | Unchanged | 90 Martian sols, not 90 Earth days | https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/ | Twin MER primary mission | Confirmed |
| Last communication | March 22, 2010 | Unchanged | Last successful contact, not mission closure | https://science.nasa.gov/mission/mer-spirit/ | NASA: silent since March 2010; last comm March 22, 2010 | Confirmed |
| Official closure | May 25, 2011 — NASA ended efforts to make contact | May 25, 2011 — NASA ended contact attempts and declared the mission complete | End of recovery attempts | https://science.nasa.gov/mission/mer-spirit/ | Distinct from last communication | Confirmed |
| Distance | 7.73 km (4.8 mi) driven | 4.8 miles (7.73 km) driven | Surface odometer reported by NASA | https://science.nasa.gov/mission/mer-spirit/ | Order of units aligned with NASA Science | Confirmed |
| Actual duration | 2,208 sols on the surface | 6 years, 2 months, and 19 days of surface operations until last communication | NASA's elapsed-time wording from landing to last comm, not to May 2011 | https://science.nasa.gov/mission/mer-spirit/ | 2,208 sols was not quoted on the NASA Science page excerpt; NASA's year-month-day figure is used instead | Confirmed (NASA wording); 2,208 sols not re-cited |
| Marooned in soft soil | Present in narrative | Retained | Physical status at end of mobility | https://science.nasa.gov/mission/mer-spirit/ | NASA describes the marooned rover | Confirmed |
| Science | Wet past / silica | Retained, tied to NASA wording about a wetter Mars | Discovery summary | https://science.nasa.gov/mission/mer-spirit/ | Confirmed at summary level | Confirmed |

### Opportunity

| Field | Old value (if known) | Corrected value | Unit / definition | Source | Reason | Status |
|---|---|---|---|---|---|---|
| Landing date | January 25, 2004 | January 24, 2004 (PST) / January 25, 2004 (UTC) | Calendar date of landing | https://science.nasa.gov/mission/mer-opportunity/ | NASA Science key dates: Jan. 24, 2004 | Confirmed |
| Planned duration | 90 sols | Unchanged | 90 Martian sols | https://science.nasa.gov/mission/mer-opportunity/ | Designed to last 90 Martian days | Confirmed |
| Last communication | June 10, 2018 | Unchanged | Last signal | https://science.nasa.gov/mission/mer-opportunity/ | Key date on NASA Science | Confirmed |
| Official closure | February 13, 2019 | Unchanged, kept separate from June 2018 | NASA declared End of Mission | https://science.nasa.gov/mission/mer-opportunity/ | Months after last communication | Confirmed |
| Distance | 45.16 km with “longest off Earth” claim | 28.06 miles (45.16 km) at end of mission | Odometer when NASA declared the mission complete | https://science.nasa.gov/mission/mer-opportunity/ | NASA Science now states Perseverance surpassed the extra-terrestrial record on Oct. 11, 2026 | Confirmed |
| Dust storm | Present | Retained | Storm reduced sunlight to solar panels | https://science.nasa.gov/mission/mer-opportunity/ | Cause of loss of contact | Confirmed |
| Surface sols | 5,111 sols | Retained as sols until last communication | Sol 5111 = 10 June 2018 | NASA NTRS Opportunity End of Mission Report (20200000214) | Matches last-comm sol, not February 2019 | Confirmed via NTRS citation |

### Surveyor 3

| Field | Old value (if known) | Corrected value | Unit / definition | Source | Reason | Status |
|---|---|---|---|---|---|---|
| Landing | April 20, 1967 | Unchanged | Soft landing, 00:04:17 UT April 20, 1967 | https://science.nasa.gov/mission/surveyor-3/ | Confirmed | Confirmed |
| Last contact | May 3, 1967 | May 4, 1967 | Last contact, two days after lunar night began | https://science.nasa.gov/mission/surveyor-3/ | NASA Science and NASA “Footpads and Footprints” | Confirmed |
| Apollo 12 visit | Astronauts removed parts | Retained, with wording that returned parts are on Earth | Camera, scoop, tubing/cable retrieved | https://www.jpl.nasa.gov/blog/2012/1/surveyor-3-camera-returned-from-the-moon | Must not imply returned hardware remains on the Moon | Confirmed |
| Science | Soil mechanics / surface conditions | Retained using NASA soil-consistency wording | Bearing strength comparable to wet sand | https://science.nasa.gov/mission/surveyor-3/ | Confirmed at summary level | Confirmed |
| Distance to Apollo 12 | less than 200 meters (about 600 feet) | “less than 600 feet” (JPL) / nearby crater (NASA) | Not a precision survey | JPL blog; NASA Science | Sources round differently | Confirmed as approximate |

## Comparison-page changes (not new facts)

- Planned duration and actual operational lifetime are separate rows.
- Last communication and official mission closure are separate rows.
- Surface distance is omitted (Not applicable) for stationary landers and flyby probes. Previous `distanceKm: 0` values were chart helpers, not measured zeroes.
- Chart bars, when shown, are labelled as Earth-day equivalents. They are not sols.

## Unresolved / needs manual review

- **Other 12 missions** (Sojourner, Phoenix, InSight, Surveyor 1/5/6/7, Apollo LM, Pioneer 10/11, Voyager 1/2): source URLs were added as NASA Science mission-page candidates. Those pages were **not** fetched and quoted in this pass. What Remains? labels them as archive summaries.
- **Spirit 2,208 sols:** commonly cited, but not used as a NASA Science key figure here.
- **Surveyor 3 May 3 vs May 4:** some older summaries say operations ended May 3; NASA Science says last contact May 4. This site follows NASA Science.
- **Live spacecraft distances** for Voyager and Pioneer remain archive milestones, not live ephemerides.
- **Phoenix frost-damage orbital images:** retained as archive narrative; not re-verified from a 2026 NASA image caption.

## Features that do not use NASA APIs

Mission Detective scoring and What Remains? evidence panels use local records in `js/data.js` and `js/data-extra.js`. NASA Image Library and Mars Rover Photos APIs still power galleries only.
