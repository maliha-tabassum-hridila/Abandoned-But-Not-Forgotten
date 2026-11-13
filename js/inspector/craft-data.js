/* ============================================================
   Spacecraft Inspector: educational text for each model family.
   Wording is deliberately conservative and general. Mission-specific
   dates, causes and current status are NOT repeated here: the inspector
   reads them from the archive records in js/data.js (MISSIONS).
   Every 3D model is an ILLUSTRATIVE RECONSTRUCTION built from simple
   shapes. None is an authentic NASA model.
   ============================================================ */
(function (root) {
  "use strict";
  var FAMILIES = {
    mer: {
      label: "Mars Exploration Rover class (Spirit and Opportunity were twins)",
      parts: [
        { id: "wheels", name: "Six wheels", text: "Each wheel had its own motor. Spirit's mission ended after its wheels broke through a crust of soil and became trapped in soft sand." },
        { id: "suspension", name: "Rocker-bogie suspension", text: "A linked frame, not springs, lets all six wheels stay on the ground over uneven rock." },
        { id: "solar", name: "Solar panels", text: "Sunlight charged the batteries. Dust on the panels and low winter sun both cut the power available." },
        { id: "mast", name: "Camera mast", text: "Pancam (color stereo science camera) and Navcam (navigation cameras) sit here. They were the rover's eyes for science targets and for planning drives." },
        { id: "hga", name: "High-gain antenna", text: "A steerable dish for direct radio contact with Earth. The rover also talked to orbiters over UHF." },
        { id: "arm", name: "Instrument arm", text: "The arm placed a microscope, two spectrometers and a rock-grinding tool against targets: hands-on geology at a distance of millions of kilometres." },
        { id: "hazcam", name: "Hazard cameras", text: "Wide-angle cameras low on the body watch for rocks and drop-offs right in front of the wheels." },
        { id: "sundial", hidden: true, name: "Hidden detail: calibration sundial", text: "The camera calibration target doubles as a sundial. It lets the cameras check their colors and it carries an engraved message, \"Two Worlds, One Sun\"." }
      ]
    },
    sojourner: {
      label: "Sojourner (Mars Pathfinder rover)",
      parts: [
        { id: "wheels", name: "Six wheels", text: "Six small cleated wheels carried the first rover to drive on Mars across a small area around its lander." },
        { id: "suspension", name: "Rocker-bogie suspension", text: "Sojourner was the first rover on Mars to use this wheel-linkage design, later reused on larger rovers." },
        { id: "solar", name: "Solar panel", text: "A panel on top powered the rover. Non-rechargeable batteries were also carried for backup." },
        { id: "cameras", name: "Cameras", text: "Front cameras gave stereo views for driving and a rear color camera looked back at the surface behind the rover." },
        { id: "apxs", name: "APXS spectrometer", text: "The Alpha Proton X-ray Spectrometer was lowered onto rocks and soil to measure what chemical elements they contain." },
        { id: "antenna", name: "UHF antenna", text: "Sojourner could not call Earth itself. It talked to the Pathfinder lander, which relayed the data." }
      ]
    },
    phoenix: {
      label: "Phoenix lander",
      parts: [
        { id: "legs", name: "Landing legs", text: "Phoenix was a stationary lander. It touched down on three legs, slowed by thrusters rather than airbags." },
        { id: "solar", name: "Solar arrays", text: "Two circular arrays unfolded after landing. Falling sunlight as northern winter approached ended operations." },
        { id: "arm", name: "Robotic arm and scoop", text: "The arm dug trenches and delivered soil and ice samples to the instruments on the deck." },
        { id: "camera", name: "Stereo camera mast", text: "The Surface Stereo Imager photographed the landing area and the arm's work from the top of the mast." },
        { id: "met", name: "Weather station", text: "A weather mast measured conditions at the site, including a lidar that looked up at dust and clouds." },
        { id: "lab", name: "Soil laboratories", text: "Two instrument suites on the deck heated soil samples in small ovens and tested them with water-based chemistry." },
        { id: "dvd", hidden: true, name: "Hidden detail: message disc", text: "Phoenix carried a DVD of messages, stories and art about Mars, meant for future explorers." }
      ]
    },
    insight: {
      label: "InSight lander",
      parts: [
        { id: "legs", name: "Landing legs", text: "InSight was a stationary lander. Its job was to listen to the planet, so it stayed put." },
        { id: "solar", name: "Solar arrays", text: "Two round arrays powered it. Dust slowly covered them and cut the power." },
        { id: "arm", name: "Instrument arm", text: "The arm lifted instruments off the deck and set them down on the ground, a first for a Mars mission." },
        { id: "seis", name: "Seismometer under its shield", text: "The seismometer was placed on the ground and covered by a wind and thermal shield. It recorded marsquakes." },
        { id: "hp3", name: "Heat probe", text: "A self-hammering probe was meant to burrow into the soil and measure heat flowing from the interior. It could not get as deep as planned." },
        { id: "camera", name: "Cameras", text: "Cameras on the deck and the arm gave engineers views of the instruments and the ground." },
        { id: "chips", hidden: true, name: "Hidden detail: names on a chip", text: "Microchips aboard carried names submitted by members of the public." }
      ]
    },
    apollo: {
      label: "Apollo Lunar Module, descent stage only",
      note: "Only the descent stage stays on the Moon. The ascent stage launched the astronauts back to lunar orbit, so it is not shown.",
      parts: [
        { id: "body", name: "Descent stage body", text: "The gold-colored foil is multilayer thermal insulation. The stage held the fuel tanks for landing and served as the launch pad for the ascent stage." },
        { id: "legs", name: "Landing legs and footpads", text: "Four legs with wide footpads spread the load on soft lunar soil." },
        { id: "engine", name: "Descent engine", text: "A throttleable rocket engine slowed the lander so it could touch down gently." },
        { id: "ladder", name: "Ladder", text: "A ladder on the front leg let astronauts climb down to the surface and back up." },
        { id: "stowage", name: "Equipment stowage bay", text: "A compartment on the side carried tools, cameras and other equipment for work on the surface." },
        { id: "plaque", hidden: true, name: "Hidden detail: commemorative plaque", text: "Each landing carried a plaque on the front landing leg. The text is specific to each mission." }
      ]
    },
    surveyor: {
      label: "Surveyor lander class (illustrative generic model)",
      note: "The five Surveyor landers in the archive differed from one another. This one model shows the shared design only.",
      parts: [
        { id: "legs", name: "Three legs", text: "A three-legged frame with footpads. Surveyors proved that a spacecraft could land softly and stay upright on the Moon." },
        { id: "solar", name: "Solar panel", text: "A panel on top of the mast charged the battery that powered the lander." },
        { id: "camera", name: "Television camera", text: "The camera looked into a tilting mirror to build panoramas of the surface and to inspect the soil." },
        { id: "antennas", name: "Antennas", text: "A flat-panel antenna for directed communication and a simple omnidirectional antenna as backup." },
        { id: "thrusters", name: "Vernier engines", text: "Small steering rockets worked through the final descent and landing." },
        { id: "sampler", name: "Surface sampler arm", text: "Some Surveyors (including Surveyor 3) carried a scoop on an extendable arm to dig and test lunar soil. Check the mission record for which ones." }
      ]
    },
    pioneer: {
      label: "Pioneer 10 / Pioneer 11 class",
      parts: [
        { id: "hga", name: "High-gain dish", text: "A dish about 2.7 meters wide pointed back at Earth for the faint radio link across the Solar System." },
        { id: "rtg", name: "Nuclear power generators", text: "Sunlight is too weak far from the Sun, so radioisotope generators turned heat from plutonium into electricity." },
        { id: "magboom", name: "Magnetometer boom", text: "A long boom held the magnetometer away from the spacecraft's own magnetic fields." },
        { id: "bus", name: "Equipment compartment", text: "A hexagonal compartment sheltered the electronics and several instruments." },
        { id: "plaque", hidden: true, name: "Hidden detail: engraved plaque", text: "An engraved aluminum plaque was attached as a message for any finder, showing humans and where we are from." }
      ]
    },
    voyager: {
      label: "Voyager 1 / Voyager 2 class",
      parts: [
        { id: "hga", name: "High-gain dish", text: "A dish about 3.7 meters wide, aimed at Earth, for the radio link over billions of kilometres." },
        { id: "bus", name: "Ten-sided bus", text: "The central body holds electronics and the computers that run the spacecraft." },
        { id: "rtg", name: "Power boom", text: "Three radioisotope generators on a boom supply electricity from the heat of decaying plutonium." },
        { id: "scan", name: "Scan platform", text: "A pointing platform carried the imaging cameras and other remote-sensing instruments toward planets and moons." },
        { id: "magboom", name: "Magnetometer boom", text: "A long boom keeps the magnetometers away from magnetic fields made by the spacecraft itself." },
        { id: "antennas", name: "Long antenna rods", text: "Two long rods listened for radio waves and plasma waves." },
        { id: "record", hidden: true, name: "Hidden detail: Golden Record", text: "A gold-plated copper disc with sounds and images of Earth, carried as a message for anyone who might find it." }
      ]
    }
  };

  /* mission id -> model family. All 15 archive missions are covered. */
  var CRAFT = {
    "spirit": "mer", "opportunity": "mer", "sojourner": "sojourner", "phoenix": "phoenix", "insight": "insight",
    "apollo-lm": "apollo",
    "surveyor-1": "surveyor", "surveyor-3": "surveyor", "surveyor-5": "surveyor", "surveyor-6": "surveyor", "surveyor-7": "surveyor",
    "pioneer-10": "pioneer", "pioneer-11": "pioneer", "voyager-1": "voyager", "voyager-2": "voyager"
  };

  root.INSPECT_DATA = { FAMILIES: FAMILIES, CRAFT: CRAFT };
  if (typeof module !== "undefined") module.exports = root.INSPECT_DATA;
})(typeof window !== "undefined" ? window : globalThis);
