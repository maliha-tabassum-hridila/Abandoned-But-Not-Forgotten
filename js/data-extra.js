/* ============================================================
   Extra per-mission data: coordinates, NASA search queries,
   comparison metadata, and What Remains? reveal records.
   Coordinates are approximate (landing region, about +/-0.5 deg)
   and are shown on maps only as "approximate region".
   lon is east longitude, 0-360 for Mars, -180..180 for the Moon.

   plannedDays / actualDays are Earth-day chart helpers only.
   They are not a substitute for the labelled units in data.js.
   actualDays counts Earth days from landing/arrival to last
   communication (or to "still operating" for active probes).
   distanceKm is surface odometer only; null means not applicable.
   ============================================================ */
var MISSION_EXTRAS = {
  "spirit": {
    body: "mars",
    sites: [{ lat: -14.57, lon: 175.47, label: "Gusev Crater" }],
    rover: "spirit",
    query: "Spirit rover Mars Exploration Rover",
    must: ["spirit"],
    plannedDays: 92.5,
    actualDays: 2269,
    durationChartNote: "Chart uses Earth days from landing to last communication. Planned lifetime was 90 sols.",
    distanceKm: 7.73,
    surfaceTravel: "rover",
    sizeNote: "Rover, about 185 kg",
    power: "Solar panels + batteries",
    mobility: "Wheeled, 6 wheels",
    factCheck: "verified-2026",
    remainsReveal: {
      verified: true,
      prompt: "What do you think remains from this mission?",
      choices: [
        "The rover itself, at its last known location",
        "Physical traces such as tracks and disturbed soil",
        "Scientific data, images, and mineral evidence"
      ],
      physicalRemains: "NASA's mission account describes Spirit as remaining at its last known location in the Columbia Hills inside Gusev Crater after becoming marooned in soft soil. The archive does not document a later spacecraft recovering the rover.",
      lastKnownStatus: "Spirit last communicated on March 22, 2010. NASA ended attempts to contact the rover and declared the mission complete on May 25, 2011. Last communication and official mission closure are different events.",
      scientificLegacy: "NASA reports that Spirit uncovered strong evidence that Mars was once much wetter than it is now, including silica-rich soil associated with past hot springs or steam vents.",
      knownVsUncertain: "Established: planned 90-sol mission, Gusev landing, last communication in March 2010, contact attempts ended May 25, 2011, and about 4.8 miles (7.73 km) of driving. Uncertain: the rover's present mechanical condition after years of dust and cold, which NASA has not documented in detail.",
      sourceUrl: "https://science.nasa.gov/mission/mer-spirit/",
      sourceLabel: "NASA Science — Spirit"
    }
  },
  "opportunity": {
    body: "mars",
    sites: [{ lat: -1.95, lon: 354.47, label: "Meridiani Planum" }],
    rover: "opportunity",
    query: "Opportunity rover Mars Exploration Rover",
    must: ["opportunity"],
    plannedDays: 92.5,
    actualDays: 5250,
    durationChartNote: "Chart uses Earth days from landing to last communication on sol 5111. Official closure was February 13, 2019.",
    distanceKm: 45.16,
    surfaceTravel: "rover",
    sizeNote: "Rover, about 185 kg",
    power: "Solar panels + batteries",
    mobility: "Wheeled, 6 wheels",
    factCheck: "verified-2026",
    remainsReveal: {
      verified: true,
      prompt: "What do you think remains from this mission?",
      choices: [
        "The rover itself, at Perseverance Valley",
        "A long traverse of wheel tracks across Meridiani Planum",
        "Evidence of ancient water and potentially habitable environments"
      ],
      physicalRemains: "According to NASA's mission account, Opportunity remains at its last known location in Perseverance Valley on the rim of Endeavour Crater. NASA has not reported retrieving the rover.",
      lastKnownStatus: "Last communication was received June 10, 2018, during a severe Mars-wide dust storm that reduced sunlight reaching the solar panels. NASA declared the mission over on February 13, 2019, after months of recovery commands.",
      scientificLegacy: "Opportunity found mineral evidence, including hematite spherules, that Mars may once have been able to sustain microbial life, and later clay minerals pointing to less acidic ancient water.",
      knownVsUncertain: "Established: 90-sol plan, 28.06 miles (45.16 km) of driving at mission end, last signal June 10, 2018, and official end February 13, 2019. Uncertain: the exact internal damage caused by cold and dust after the storm, which engineers inferred but could not inspect in person.",
      sourceUrl: "https://science.nasa.gov/mission/mer-opportunity/",
      sourceLabel: "NASA Science — Opportunity"
    }
  },
  "sojourner": {
    body: "mars",
    sites: [{ lat: 19.33, lon: 326.78, label: "Ares Vallis" }],
    query: "Sojourner rover Mars Pathfinder",
    must: ["sojourner", "pathfinder"],
    plannedDays: 7.2,
    actualDays: 85,
    durationChartNote: "Earth-day equivalents of a 7-sol plan and about 83 sols of surface work until the lander relay failed.",
    distanceKm: 0.1,
    surfaceTravel: "rover",
    sizeNote: "Microwave-oven-sized rover",
    power: "Solar panel + battery",
    mobility: "Wheeled, 6 wheels",
    factCheck: "archive-text",
    remainsReveal: {
      verified: false,
      prompt: "What do you think remains from this mission?",
      choices: [
        "Sojourner and the Pathfinder lander nearby",
        "A short set of rover tracks",
        "Proof that a small rover could work on Mars"
      ],
      physicalRemains: "The archive record places Sojourner near the Pathfinder lander (Carl Sagan Memorial Station) in Ares Vallis. No later NASA retrieval of the hardware is recorded here.",
      lastKnownStatus: "The last full data session is recorded as September 27, 1997. The rover's Earth link depended on the stationary lander. The mission was formally closed on March 10, 1998.",
      scientificLegacy: "Sojourner measured rock and soil chemistry near the lander and showed that a small solar-powered rover could operate on Mars, shaping later rover designs.",
      knownVsUncertain: "More verified detail is needed from a freshly checked NASA page. The exact cause of the lander failure is not known with certainty in this archive.",
      sourceUrl: "https://science.nasa.gov/mission/mars-pathfinder/",
      sourceLabel: "NASA Science — Mars Pathfinder"
    }
  },
  "phoenix": {
    body: "mars",
    sites: [{ lat: 68.22, lon: 234.25, label: "Green Valley" }],
    query: "Phoenix Mars lander",
    must: ["phoenix"],
    plannedDays: 92.5,
    actualDays: 161,
    durationChartNote: "Earth-day equivalents of a 90-sol plan and 157 sols of surface operations until last communication.",
    distanceKm: null,
    surfaceTravel: "stationary",
    sizeNote: "Stationary lander",
    power: "Solar arrays",
    mobility: "Stationary (robotic arm)",
    factCheck: "archive-text",
    remainsReveal: {
      verified: false,
      prompt: "What do you think remains from this mission?",
      choices: [
        "The lander at the north polar site",
        "Trenches dug by the robotic arm",
        "Confirmed water ice and soil chemistry results"
      ],
      physicalRemains: "Phoenix was a stationary lander. This archive records it remaining at its Vastitas Borealis landing site. Later orbital images have been cited as showing frost-related damage, but that condition should be read from NASA mission updates rather than assumed from this page alone.",
      lastKnownStatus: "Last communication is listed as November 2, 2008. NASA later declared the mission complete after additional winters with no response.",
      scientificLegacy: "Phoenix confirmed water ice just beneath the polar surface and detected perchlorate salts, with implications for habitability studies and future exploration.",
      knownVsUncertain: "More verified 2026 checking is still needed for closure wording and the orbital-image damage claim. Polar frost makes the lander's present appearance uncertain.",
      sourceUrl: "https://science.nasa.gov/mission/phoenix/",
      sourceLabel: "NASA Science — Phoenix"
    }
  },
  "insight": {
    body: "mars",
    sites: [{ lat: 4.5, lon: 135.62, label: "Elysium Planitia" }],
    query: "InSight Mars lander",
    must: ["insight"],
    plannedDays: 687,
    actualDays: 1480,
    durationChartNote: "Earth-day chart helpers for a roughly two-Earth-year plan versus just over four years on the surface until last communication.",
    distanceKm: null,
    surfaceTravel: "stationary",
    sizeNote: "Stationary lander",
    power: "Solar arrays",
    mobility: "Stationary (robotic arm)",
    factCheck: "archive-text",
    remainsReveal: {
      verified: false,
      prompt: "What do you think remains from this mission?",
      choices: [
        "The lander and its seismometer on Elysium Planitia",
        "Dust-coated solar panels",
        "A catalog of marsquakes and interior measurements"
      ],
      physicalRemains: "InSight was stationary. The archive places the lander on Elysium Planitia, with solar panels that accumulated dust until power ran out.",
      lastKnownStatus: "Last communication is listed as December 15, 2022. NASA declared the mission over on December 21, 2022.",
      scientificLegacy: "InSight recorded more than a thousand seismic events and provided the first detailed measurements of Mars' crust, mantle, and core.",
      knownVsUncertain: "This reveal uses the existing archive text. A fresh NASA-page check was not completed for InSight in the 2026 audit.",
      sourceUrl: "https://science.nasa.gov/mission/insight/",
      sourceLabel: "NASA Science — InSight"
    }
  },
  "surveyor-1": {
    body: "moon",
    sites: [{ lat: -2.47, lon: -43.34, label: "Oceanus Procellarum" }],
    query: "Surveyor 1 lunar lander",
    must: ["surveyor"],
    plannedDays: 28,
    actualDays: 219,
    durationChartNote: "Earth-day helpers only. Surveyor 1 was planned for about one to two lunar days, with sporadic contact into January 1967.",
    distanceKm: null,
    surfaceTravel: "stationary",
    sizeNote: "Stationary lander",
    power: "Solar panel + battery",
    mobility: "Stationary",
    factCheck: "archive-text",
    remainsReveal: {
      verified: false,
      prompt: "What do you think remains from this mission?",
      choices: [
        "The lander on Oceanus Procellarum",
        "Footpad impressions in the lunar soil",
        "Proof that the surface could support a crewed lander"
      ],
      physicalRemains: "Surveyor 1 was a stationary lander. This archive records it remaining at its Oceanus Procellarum landing site. Unlike Surveyor 3, it was not visited by Apollo astronauts.",
      lastKnownStatus: "Last communication is listed as January 7, 1967, after surviving multiple lunar nights beyond the original plan.",
      scientificLegacy: "Its footpads showed the lunar surface was firm enough to support a future crewed lander, and its camera returned thousands of surface images.",
      knownVsUncertain: "Landing-site coordinates and image counts in popular summaries can differ slightly by source. This reveal was not re-fetched from NASA Science during the 2026 audit.",
      sourceUrl: "https://science.nasa.gov/mission/surveyor-1/",
      sourceLabel: "NASA Science — Surveyor 1"
    }
  },
  "surveyor-3": {
    body: "moon",
    sites: [{ lat: -3.0, lon: -23.4, label: "Oceanus Procellarum" }],
    query: "Surveyor 3 lunar lander Apollo 12",
    must: ["surveyor"],
    plannedDays: 14,
    actualDays: 14,
    durationChartNote: "About one lunar day of surface operations. NASA records last contact on May 4, 1967.",
    distanceKm: null,
    surfaceTravel: "stationary",
    sizeNote: "Stationary lander",
    power: "Solar panel + battery",
    mobility: "Stationary (scoop arm)",
    factCheck: "verified-2026",
    remainsReveal: {
      verified: true,
      prompt: "What do you think remains from this mission?",
      choices: [
        "Most of the lander, still on the Moon",
        "Selected parts that Apollo 12 brought back to Earth",
        "Measurements of lunar soil strength and surface conditions"
      ],
      physicalRemains: "The lander remains on the Moon at its landing site in Oceanus Procellarum, according to NASA's documented mission history. Apollo 12 astronauts retrieved selected components — including the television camera, soil-sampler scoop, and pieces of tubing and cable — and returned those items to Earth. Components returned to Earth do not remain on the Moon.",
      lastKnownStatus: "NASA records last contact on May 4, 1967, two days after lunar night began. The spacecraft was already silent when Apollo 12 visited in November 1969.",
      scientificLegacy: "Surveyor 3's surface sampler dug trenches and ran bearing tests. NASA reports that those results showed lunar soil with a consistency similar to wet sand, strong enough to support an Apollo Lunar Module. The returned hardware later allowed engineers to study the effects of more than two years of lunar exposure.",
      knownVsUncertain: "Established: April 20, 1967 landing, soil-mechanics tests, last contact May 4, 1967, and Apollo 12 retrieval of selected parts. Uncertain: the present condition of remaining hardware after decades on the surface, which NASA has not described in engineering detail on the mission page.",
      sourceUrl: "https://science.nasa.gov/mission/surveyor-3/",
      sourceLabel: "NASA Science — Surveyor 3"
    }
  },
  "surveyor-5": {
    body: "moon",
    sites: [{ lat: 1.4, lon: 23.2, label: "Mare Tranquillitatis" }],
    query: "Surveyor 5 lunar lander",
    must: ["surveyor"],
    plannedDays: 28,
    actualDays: 97,
    durationChartNote: "Earth-day helpers for a roughly one-to-two-lunar-day plan versus intermittent operation into December 1967.",
    distanceKm: null,
    surfaceTravel: "stationary",
    sizeNote: "Stationary lander",
    power: "Solar panel + battery",
    mobility: "Stationary",
    factCheck: "archive-text",
    remainsReveal: {
      verified: false,
      prompt: "What do you think remains from this mission?",
      choices: [
        "The lander in Mare Tranquillitatis",
        "The first in-place lunar soil chemistry measurements",
        "Reconnaissance that helped clear Apollo 11's neighborhood"
      ],
      physicalRemains: "Surveyor 5 was stationary. This archive records the lander remaining in the Sea of Tranquility. No crewed visit to this spacecraft is recorded.",
      lastKnownStatus: "Last communication is listed as December 17, 1967.",
      scientificLegacy: "Its alpha-scattering instrument returned the first chemical analysis of lunar soil at the site, finding a composition similar to basaltic rock.",
      knownVsUncertain: "The landing date is sometimes listed as September 10 or 11, 1967, depending on time zone. This reveal was not re-fetched from NASA Science in the 2026 audit.",
      sourceUrl: "https://science.nasa.gov/mission/surveyor-5/",
      sourceLabel: "NASA Science — Surveyor 5"
    }
  },
  "surveyor-6": {
    body: "moon",
    sites: [{ lat: 0.5, lon: -1.4, label: "Sinus Medii" }],
    query: "Surveyor 6 lunar lander",
    must: ["surveyor"],
    plannedDays: 28,
    actualDays: 34,
    durationChartNote: "Earth-day helpers. The 2.5-meter hop is a documented relocation, not a rover traverse.",
    distanceKm: 0.0025,
    surfaceTravel: "hop",
    sizeNote: "Stationary lander (one hop)",
    power: "Solar panel + battery",
    mobility: "One 2.5 m hop",
    factCheck: "archive-text",
    remainsReveal: {
      verified: false,
      prompt: "What do you think remains from this mission?",
      choices: [
        "The lander a few meters from its first touchdown",
        "Two nearby sets of footpad marks from the hop",
        "Additional lunar soil chemistry"
      ],
      physicalRemains: "This archive records Surveyor 6 remaining in Sinus Medii, a few meters from its original landing spot after a brief engine hop.",
      lastKnownStatus: "Last useful data came on November 24, 1967, as lunar night began. A brief contact on December 14, 1967 returned no useful data. Last useful data, last contact and closure are different events.",
      scientificLegacy: "The hop demonstrated that a spacecraft could lift off and land again on another world. Its alpha-scattering instrument added mare soil chemistry to earlier Surveyor results.",
      knownVsUncertain: "Hop distance and height figures in summaries can be rounded. This reveal was not independently re-fetched from NASA Science in the 2026 audit.",
      sourceUrl: "https://science.nasa.gov/mission/surveyor-6/",
      sourceLabel: "NASA Science — Surveyor 6"
    }
  },
  "surveyor-7": {
    body: "moon",
    sites: [{ lat: -40.9, lon: -11.5, label: "Tycho crater rim" }],
    query: "Surveyor 7 lunar lander Tycho",
    must: ["surveyor"],
    plannedDays: 28,
    actualDays: 42,
    durationChartNote: "Earth-day helpers for a lunar-day-scale plan versus about six weeks of operation.",
    distanceKm: null,
    surfaceTravel: "stationary",
    sizeNote: "Stationary lander",
    power: "Solar panel + battery",
    mobility: "Stationary (scoop arm)",
    factCheck: "archive-text",
    remainsReveal: {
      verified: false,
      prompt: "What do you think remains from this mission?",
      choices: [
        "The lander on the rim of Tycho Crater",
        "Scoop trenches in highland soil",
        "Evidence that highland chemistry differs from the maria"
      ],
      physicalRemains: "Surveyor 7 was stationary. This archive records it remaining on the northern rim of Tycho Crater. It was not an Apollo landing-site scout in the same way as earlier Surveyors.",
      lastKnownStatus: "Last communication is listed as February 21, 1968, ending the Surveyor landing series.",
      scientificLegacy: "It sampled highland terrain and found soil chemistry different from the darker mare sites visited earlier.",
      knownVsUncertain: "This reveal uses archive text and was not re-fetched from NASA Science in the 2026 audit.",
      sourceUrl: "https://science.nasa.gov/mission/surveyor-7/",
      sourceLabel: "NASA Science — Surveyor 7"
    }
  },
  "apollo-lm": {
    body: "moon",
    sites: [
      { lat: 0.67, lon: 23.47, label: "Apollo 11" }, { lat: -3.01, lon: -23.42, label: "Apollo 12" },
      { lat: -3.65, lon: -17.47, label: "Apollo 14" }, { lat: 26.13, lon: 3.63, label: "Apollo 15" },
      { lat: -8.97, lon: 15.5, label: "Apollo 16" }, { lat: 20.19, lon: 30.77, label: "Apollo 17" }
    ],
    query: "Apollo Lunar Module descent stage lunar surface",
    must: ["apollo", "lunar module"],
    plannedDays: 3,
    actualDays: null,
    durationChartNote: "Not comparable as a single lifetime. Each crew spent about 1 to 3 days on the surface; descent stages were left by design.",
    distanceKm: null,
    surfaceTravel: "crew-sites",
    sizeNote: "Crewed two-stage lander",
    power: "Batteries",
    mobility: "Landed on legs",
    factCheck: "archive-text",
    remainsReveal: {
      verified: false,
      prompt: "What do you think remains from these missions?",
      choices: [
        "Six descent stages at six landing sites",
        "Experiments, discarded tools, and three lunar rovers",
        "Returned lunar samples and years of instrument data"
      ],
      physicalRemains: "Each descent stage was left on the Moon on purpose, as the launch platform for the ascent stage. Later missions also left experiment packages and, on Apollo 15–17, Lunar Roving Vehicles. This is six landing sites, not one spacecraft.",
      lastKnownStatus: "The hardware is inert. Last communication is not a single date because these were crewed landings, not one robotic communications mission.",
      scientificLegacy: "Crews collected hundreds of pounds of lunar samples and deployed instruments, including seismometers that recorded moonquakes after the astronauts left.",
      knownVsUncertain: "This combined record is a summary of six missions. Individual site inventories differ. Lunar Reconnaissance Orbiter images show several sites from orbit, but this page does not treat those images as a live dataset.",
      sourceUrl: "https://science.nasa.gov/mission/apollo/",
      sourceLabel: "NASA Science — Apollo"
    }
  },
  "pioneer-10": {
    body: "deep",
    query: "Pioneer 10 spacecraft Jupiter",
    must: ["pioneer"],
    plannedDays: 640,
    actualDays: 11284,
    durationChartNote: "Earth-day helpers from launch-era plan to last contact. Pioneer 10 did not drive on a surface.",
    distanceKm: null,
    surfaceTravel: "flyby",
    sizeNote: "Flyby probe",
    power: "Plutonium RTG",
    mobility: "Free flight",
    factCheck: "archive-text",
    remainsReveal: {
      verified: false,
      prompt: "What do you think remains from this mission?",
      choices: [
        "The spacecraft, still coasting in interstellar space",
        "A gold plaque with a message from Earth",
        "The first close-up Jupiter data and images"
      ],
      physicalRemains: "Pioneer 10 is not sitting on the Moon or Mars. The archive describes the spacecraft itself still traveling, no longer able to communicate, carrying a gold plaque.",
      lastKnownStatus: "Last signal is listed as January 23, 2003. A later contact attempt in 2006 heard nothing.",
      scientificLegacy: "It returned the first close-up images of Jupiter and proved a spacecraft could cross the asteroid belt.",
      knownVsUncertain: "Current distance is not shown as a live value. Trajectory toward Aldebaran is a directional description, not a predicted arrival.",
      sourceUrl: "https://science.nasa.gov/mission/pioneer-10/",
      sourceLabel: "NASA Science — Pioneer 10"
    }
  },
  "pioneer-11": {
    body: "deep",
    query: "Pioneer 11 spacecraft Saturn",
    must: ["pioneer"],
    plannedDays: 730,
    actualDays: 8212,
    durationChartNote: "Earth-day helpers. Pioneer 11 did not drive on a surface.",
    distanceKm: null,
    surfaceTravel: "flyby",
    sizeNote: "Flyby probe",
    power: "Plutonium RTG",
    mobility: "Free flight",
    factCheck: "archive-text",
    remainsReveal: {
      verified: false,
      prompt: "What do you think remains from this mission?",
      choices: [
        "The spacecraft traveling toward Aquila",
        "A matching gold plaque",
        "The first close-up data from Saturn"
      ],
      physicalRemains: "Pioneer 11 is a flyby probe, not surface hardware. The archive describes it still moving through space with a gold plaque like Pioneer 10.",
      lastKnownStatus: "Last transmission is listed as September 30, 1995.",
      scientificLegacy: "It was the first spacecraft to fly past Saturn and helped scout a path later used by Voyager.",
      knownVsUncertain: "This reveal uses archive text and was not re-fetched from NASA Science in the 2026 audit.",
      sourceUrl: "https://science.nasa.gov/mission/pioneer-11/",
      sourceLabel: "NASA Science — Pioneer 11"
    }
  },
  "voyager-1": {
    body: "deep",
    query: "Voyager 1 spacecraft",
    must: ["voyager"],
    plannedDays: 1826,
    actualDays: 17943,
    durationChartNote: "Earth-day helpers for a five-year planetary tour versus decades of continuing operation. Not a surface odometer.",
    distanceKm: null,
    surfaceTravel: "flyby",
    sizeNote: "Flyby probe",
    power: "Plutonium RTG",
    mobility: "Free flight",
    factCheck: "archive-text",
    remainsReveal: {
      verified: false,
      prompt: "What do you think remains from this mission?",
      choices: [
        "An active spacecraft in interstellar space",
        "The Golden Record",
        "Discoveries from Jupiter, Saturn, and the heliosphere"
      ],
      physicalRemains: "Voyager 1 is still a functioning spacecraft, not discarded surface equipment. It carries the Golden Record. No hardware was left on the Moon or Mars by this mission.",
      lastKnownStatus: "NASA says Voyager 1 has reached interstellar space and is still operating. NASA is switching instruments off to save power and has announced no end date. Distance figures on this site are milestones, not a live tracker.",
      scientificLegacy: "It found active volcanoes on Io, photographed the Pale Blue Dot, and became the first spacecraft confirmed to enter interstellar space in 2012.",
      knownVsUncertain: "Exact remaining power and which instruments are on change over time. Check NASA's Voyager status pages for current operations.",
      sourceUrl: "https://science.nasa.gov/mission/voyager/",
      sourceLabel: "NASA Science — Voyager"
    }
  },
  "voyager-2": {
    body: "deep",
    query: "Voyager 2 spacecraft Neptune",
    must: ["voyager"],
    plannedDays: 1826,
    actualDays: 17959,
    durationChartNote: "Earth-day helpers. Voyager 2 is still operating; this is not a closed surface mission.",
    distanceKm: null,
    surfaceTravel: "flyby",
    sizeNote: "Flyby probe",
    power: "Plutonium RTG",
    mobility: "Free flight",
    factCheck: "archive-text",
    remainsReveal: {
      verified: false,
      prompt: "What do you think remains from this mission?",
      choices: [
        "An active spacecraft on a different interstellar path",
        "The only close-up tour of Uranus and Neptune",
        "A Golden Record identical in purpose to Voyager 1's"
      ],
      physicalRemains: "Voyager 2 remains an operating probe in interstellar space. It did not leave a lander on the Moon or Mars.",
      lastKnownStatus: "NASA says Voyager 2 has reached interstellar space and is still operating. NASA manages remaining power by turning instruments off over time and has announced no end date.",
      scientificLegacy: "It is the only spacecraft to have flown past Uranus (1986) and Neptune (1989), including observations of geysers on Triton.",
      knownVsUncertain: "Live distance and instrument state are not fetched by this website. Use NASA Voyager status for current figures.",
      sourceUrl: "https://science.nasa.gov/mission/voyager/",
      sourceLabel: "NASA Science — Voyager"
    }
  }
};
MISSIONS.forEach(function (m) { Object.assign(m, MISSION_EXTRAS[m.id] || {}); });
