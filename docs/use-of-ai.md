# Use of AI (for the NASA project page "Use of AI" field)

**Tool:** Claude (Anthropic), used as a coding and writing assistant.

**What the AI did**
- Wrote the HTML, CSS and JavaScript from a written project brief (structure, design direction, features, accessibility, accuracy rules).
- Drafted mission summaries and the short first-person "If this machine could talk" texts.
- Audited its own mission data against NASA/JPL sources and corrected errors (for example: Opportunity's operating time is 5,111 sols / over 14 years, not 15; Opportunity and Spirit are both solar powered; the Surveyor landers were planned for roughly one to two lunar days, not 90 days).

**Prompts and reasoning (summary)**
1. Brief: build a NASA-style interactive archive for school-age students about retired NASA hardware, in vanilla HTML/CSS/JS, accurate, accessible, responsive.
2. Instruction to use only NASA/JPL facts, never guess values, and separate confirmed facts from storytelling.
3. Follow-up: use NASA open data and APIs, add real maps, comparison charts, live NASA imagery, and documentation for judging.

**Data the AI worked on:** NASA/JPL mission pages and press material listed in `data.html`; live responses from the NASA Image and Video Library and Mars Rover Photos APIs.

**What is NOT AI-generated:** no images are AI-generated. Photographs come from NASA. Illustrations are hand-written SVG.

**Later implementation pass:** a Cursor coding assistant (Grok 4.6) added Mission Detective, What Remains?, comparison-page cleanup, and a 2026 NASA Science fact pass for Spirit, Opportunity, and Surveyor 3. That pass did not re-check every mission in the archive.

**Where human work went (edit this to match your team):** reviewing facts against the NASA sources, choosing the story structure, testing on phones, recording the videos.
