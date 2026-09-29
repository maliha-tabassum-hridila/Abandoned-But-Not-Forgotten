/* ============================================================
   Quiz: "Could You Be a Mission Controller?"
   ============================================================ */

(function () {
  "use strict";

  var QUESTIONS = [
    {
      q: "Which planet did Spirit explore?",
      options: ["Venus", "Mars", "Mercury", "The Moon"],
      correct: 1,
      explain: "Spirit landed inside Gusev Crater on Mars in January 2004, alongside its twin rover Opportunity on the opposite side of the planet.",
      fact: "Gusev Crater was chosen because scientists suspected it was once an ancient lakebed."
    },
    {
      q: "What was Spirit's original planned mission duration?",
      options: ["90 sols", "1 year", "10 sols", "5 years"],
      correct: 0,
      explain: "Spirit and Opportunity were both designed for a 90-sol primary mission. Spirit ended up operating for more than 2,200 sols.",
      fact: "90 sols is about 92 Earth days, since a Martian sol is slightly longer than an Earth day."
    },
    {
      q: "Which of these rovers traveled the farthest across Mars?",
      options: ["Sojourner", "Spirit", "Opportunity", "Phoenix (it didn't rove)"],
      correct: 2,
      explain: "Opportunity drove more than 45 kilometers (about 28 miles) over nearly 15 years \u2014 the longest distance any vehicle has ever traveled off Earth.",
      fact: "Opportunity's total distance is roughly the length of a marathon."
    },
    {
      q: "What is a \u201csol\u201d?",
      options: ["A type of Martian rock", "One full day on Mars", "A NASA mission code name", "A unit of solar power"],
      correct: 1,
      explain: "A sol is one Martian solar day \u2014 about 24 hours and 39 minutes, just a little longer than a day on Earth.",
      fact: "Mission teams on Mars rovers often work on a sol-based schedule that slowly drifts out of sync with Earth clocks."
    },
    {
      q: "Which spacecraft was the first human-made object to cross into interstellar space?",
      options: ["Voyager 2", "Pioneer 10", "Voyager 1", "New Horizons"],
      correct: 2,
      explain: "Voyager 1 crossed into interstellar space on August 25, 2012. Voyager 2 followed in November 2018, taking a different route out of the solar system.",
      fact: "Voyager 1 is now more than 165 astronomical units from the Sun \u2014 over 24 billion kilometers away."
    },
    {
      q: "Why did Opportunity stop communicating with Earth?",
      options: [
        "It ran out of fuel",
        "A planet-wide dust storm blocked sunlight from its solar panels",
        "It fell into a crater",
        "NASA intentionally shut it down"
      ],
      correct: 1,
      explain: "A massive, planet-wide dust storm in June 2018 coated Opportunity's solar panels, cutting off its power in the cold Martian night.",
      fact: "NASA sent more than a thousand recovery commands over eight months before declaring the mission complete."
    },
    {
      q: "Which mission was the first wheeled vehicle to rove on Mars?",
      options: ["Curiosity", "Spirit", "Sojourner", "Perseverance"],
      correct: 2,
      explain: "Sojourner, part of the 1997 Mars Pathfinder mission, was the first wheeled rover to operate on another planet.",
      fact: "Sojourner was about the size of a microwave oven and drove roughly 100 meters in total."
    },
    {
      q: "What do rovers like Spirit and Opportunity mainly study?",
      options: [
        "Rocks and soil for clues about water and climate history",
        "The Martian atmosphere's color",
        "Signals from other planets",
        "The Moon's gravity"
      ],
      correct: 0,
      explain: "Both rovers were built to study Martian rocks and soil for mineral evidence of a wetter, warmer past.",
      fact: "Both rovers found strong mineral evidence \u2014 hematite \u2018blueberries\u2019 and sulfate deposits \u2014 that Mars once had liquid water."
    },
    {
      q: "Which Surveyor lunar lander was later visited by Apollo astronauts?",
      options: ["Surveyor 1", "Surveyor 3", "Surveyor 6", "Surveyor 7"],
      correct: 1,
      explain: "Apollo 12 astronauts Pete Conrad and Alan Bean walked to Surveyor 3 in November 1969 and brought pieces of it back to Earth.",
      fact: "Surveyor 3 remains the only spacecraft on another world that astronauts have ever physically visited."
    },
    {
      q: "Why did NASA's InSight lander mission come to an end?",
      options: [
        "A dust storm damaged its seismometer",
        "It drove off a cliff",
        "Dust gradually built up on its solar panels until it lost power",
        "It completed a planned self-shutdown after 90 sols"
      ],
      correct: 2,
      explain: "InSight had no way to clean its flat solar panels. Dust accumulated for years until its batteries could no longer keep it running, and it sent its last signal in December 2022.",
      fact: "Before it lost power, InSight detected more than 1,300 marsquakes, including the largest ever recorded on the planet."
    }
  ];

  var current = 0;
  var score = 0;
  var answered = false;
  var log = [];

  var root = document.getElementById("quiz-root");

  function renderProgress() {
    return '' +
      '<p class="quiz-progress">QUESTION ' + (current + 1) + ' OF ' + QUESTIONS.length + '</p>' +
      '<div class="quiz-progress-bar" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax="' + QUESTIONS.length + '" aria-valuenow="' + current + '"><span style="width:' + (((current) / QUESTIONS.length) * 100) + '%"></span></div>';
  }

  function renderQuestion() {
    var item = QUESTIONS[current];
    answered = false;
    var html = renderProgress() +
      '<div class="quiz-card">' +
        '<h3 id="quiz-question" tabindex="-1">' + item.q + '</h3>' +
        '<div class="quiz-options" id="quiz-options">' +
          item.options.map(function (opt, i) {
            return '<button type="button" class="quiz-option" data-idx="' + i + '">' + opt + '</button>';
          }).join("") +
        '</div>' +
        '<div id="quiz-feedback"></div>' +
      '</div>';
    root.innerHTML = html;
    root.querySelector("#quiz-question").focus();

    root.querySelectorAll(".quiz-option").forEach(function (btn) {
      btn.addEventListener("click", function () { selectAnswer(parseInt(btn.getAttribute("data-idx"), 10)); });
    });
  }

  function selectAnswer(idx) {
    if (answered) return;
    answered = true;
    var item = QUESTIONS[current];
    var correct = idx === item.correct;
    if (correct) score++;
    log.push({ q: item.q, correct: correct, chosen: item.options[idx], answer: item.options[item.correct] });

    var buttons = root.querySelectorAll(".quiz-option");
    buttons.forEach(function (btn, i) {
      btn.disabled = true;
      if (i === item.correct) btn.classList.add("correct");
      else if (i === idx) btn.classList.add("incorrect");
    });

    var feedback = document.getElementById("quiz-feedback");
    feedback.innerHTML = '' +
      '<div class="quiz-feedback" role="status" aria-live="polite">' +
        '<p><strong>' + (correct ? "Correct." : "Not quite.") + '</strong> ' + item.explain + '</p>' +
        '<h4 class="quiz-why">Why?</h4>' +
        '<span class="fact-label">MISSION FACT</span>' +
        '<p>' + item.fact + '</p>' +
        '<button type="button" class="btn btn-primary" id="quiz-next">' + (current === QUESTIONS.length - 1 ? "See Results" : "Next Question \u2192") + '</button>' +
      '</div>';

    document.getElementById("quiz-next").addEventListener("click", function () {
      current++;
      if (current >= QUESTIONS.length) renderResults();
      else renderQuestion();
    });
  }

  function renderResults() {
    var pct = Math.round((score / QUESTIONS.length) * 100);
    var verdict;
    if (pct === 100) verdict = "Flawless. Mission Control would hire you today.";
    else if (pct >= 70) verdict = "Strong work \u2014 you know your mission history.";
    else if (pct >= 40) verdict = "A solid start. A few more mission records and you'll have it down.";
    else verdict = "Time to spend more time in the archive.";

    var rows = log.map(function (item) {
      return '<div class="quiz-result-row ' + (item.correct ? "right" : "wrong") + '">' +
        '<span>' + item.q + '</span>' +
        '<span class="r-mark">' + (item.correct ? "CORRECT" : "ANSWER: " + item.answer.toUpperCase()) + '</span>' +
      '</div>';
    }).join("");

    root.innerHTML = '' +
      '<div class="quiz-card quiz-result" tabindex="-1">' +
        '<span class="eyebrow">MISSION COMPLETE</span>' +
        '<p class="score-big">' + score + ' / ' + QUESTIONS.length + '</p>' +
        '<p>' + verdict + '</p>' +
        '<div class="quiz-result-list">' + rows + '</div>' +
        '<div style="margin-top:28px; display:flex; gap:14px; flex-wrap:wrap;">' +
          '<button type="button" class="btn btn-primary" id="quiz-retry">Retry Quiz</button>' +
          '<a href="missions.html" class="btn btn-secondary">Explore the Archive</a>' +
        '</div>' +
      '</div>';

    document.getElementById("quiz-retry").addEventListener("click", function () {
      current = 0; score = 0; log = [];
      renderQuestion();
    });
    root.querySelector(".quiz-result").focus();
  }

  document.addEventListener("DOMContentLoaded", renderQuestion);
})();
