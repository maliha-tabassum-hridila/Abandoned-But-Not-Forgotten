/* ============================================================
   Mission Detective — three-round identification game.
   Uses local, verified clues. Independent of the Quiz page
   and of NASA APIs.
   ============================================================ */

(function () {
  "use strict";

  var root = document.getElementById("detective-root");
  if (!root) return;

  var ROUNDS = [
    {
      id: "spirit",
      title: "Identify the rover",
      question: "This Mars rover was designed for a 90-sol mission, explored Gusev Crater, became stuck in soft soil, and last communicated with Earth in March 2010. Which rover was it?",
      options: [
        { id: "spirit", label: "Spirit" },
        { id: "opportunity", label: "Opportunity" },
        { id: "sojourner", label: "Sojourner" }
      ],
      correct: "spirit",
      explain: "Spirit operated far beyond its planned 90-sol lifetime. NASA reports it travelled 4.8 miles (7.73 kilometers) before becoming marooned in soft soil. Its last communication was March 22, 2010. NASA ended contact attempts and declared the mission complete later, on May 25, 2011 \u2014 a different date from the last signal.",
      sourceUrl: "https://science.nasa.gov/mission/mer-spirit/",
      sourceLabel: "NASA Science \u2014 Spirit"
    },
    {
      id: "opportunity",
      title: "Decode the dust storm",
      question: "Which Mars rover travelled 28.06 miles (45.16 kilometers) and lost communication during a severe dust storm that reduced the sunlight reaching its solar panels?",
      options: [
        { id: "spirit", label: "Spirit" },
        { id: "opportunity", label: "Opportunity" },
        { id: "phoenix", label: "Phoenix" }
      ],
      correct: "opportunity",
      explain: "Opportunity's last communication was received on June 10, 2018, during a Mars-wide dust storm. NASA declared the mission over on February 13, 2019, after more than a thousand recovery commands. The storm and the official closure are months apart. When the mission ended, the rover's odometer read 45.16 kilometers.",
      sourceUrl: "https://science.nasa.gov/mission/mer-opportunity/",
      sourceLabel: "NASA Science \u2014 Opportunity"
    },
    {
      id: "surveyor-3",
      title: "The lunar visitor",
      question: "Which lunar lander was visited by Apollo 12 astronauts, who retrieved selected components for examination on Earth?",
      options: [
        { id: "surveyor-3", label: "Surveyor 3" },
        { id: "surveyor-1", label: "Surveyor 1" },
        { id: "apollo-lm", label: "Apollo 12 Lunar Module" }
      ],
      correct: "surveyor-3",
      explain: "Surveyor 3 landed on April 20, 1967, and tested lunar surface conditions with a soil-mechanics scoop. NASA records last contact on May 4, 1967. In November 1969, Apollo 12 astronauts walked to the silent lander and returned selected parts \u2014 including the camera and scoop \u2014 to Earth. The rest of the lander remains on the Moon; the returned pieces do not.",
      sourceUrl: "https://science.nasa.gov/mission/surveyor-3/",
      sourceLabel: "NASA Science \u2014 Surveyor 3"
    }
  ];

  var state = initialState();

  function initialState() {
    return {
      screen: "intro",
      roundIndex: 0,
      selected: null,
      submitted: false,
      scored: false,
      score: 0,
      history: []
    };
  }

  function esc(str) {
    return window.SiteUtils ? SiteUtils.esc(str) : String(str);
  }

  function progressDots(activeRound, completedThrough) {
    return '<ol class="detective-progress" aria-label="Game progress">' +
      [1, 2, 3].map(function (n) {
        var cls = "detective-dot";
        var label = "Round " + n;
        if (n <= completedThrough) {
          cls += " is-done";
          label += ", completed";
        }
        if (n === activeRound) {
          cls += " is-current";
          label += ", current";
        }
        return '<li class="' + cls + '"><span class="visually-hidden">' + label + "</span><span aria-hidden=\"true\">" + n + "</span></li>";
      }).join("") +
      "</ol>";
  }

  function render() {
    if (state.screen === "intro") {
      root.innerHTML = introHTML();
      bindIntro();
      return;
    }
    if (state.screen === "results") {
      root.innerHTML = resultsHTML();
      bindResults();
      return;
    }
    root.innerHTML = roundHTML();
    bindRound();
  }

  function introHTML() {
    return "" +
      '<div class="detective-card detective-intro">' +
        progressDots(0, 0) +
        '<span class="eyebrow">THREE-ROUND CASE FILE</span>' +
        "<h2>Mission Detective</h2>" +
        '<p class="detective-sub">Read the clues. Solve the mission. Discover what remains.</p>' +
        "<p>Identify three real NASA missions from verified clues. Each round has one correct answer. You do not need an account, and your score stays on this device.</p>" +
        '<ul class="detective-howto">' +
          "<li>Read the clues, then choose one of three missions.</li>" +
          "<li>Submit your answer to lock it in. You can score each round only once.</li>" +
          "<li>A short NASA-sourced explanation follows, then the next round.</li>" +
        "</ul>" +
        '<button type="button" class="btn btn-primary" id="detective-start">Start Game</button>' +
      "</div>";
  }

  function roundHTML() {
    var round = ROUNDS[state.roundIndex];
    var n = state.roundIndex + 1;
    var options = round.options.map(function (opt) {
      var pressed = state.selected === opt.id;
      var cls = "detective-option";
      var extra = "";
      if (state.submitted) {
        if (opt.id === round.correct) {
          cls += " is-correct";
          extra = ' <span class="detective-flag">Correct mission</span>';
        } else if (pressed) {
          cls += " is-incorrect";
          extra = ' <span class="detective-flag">Your choice</span>';
        }
      } else if (pressed) {
        cls += " is-selected";
      }
      return '<button type="button" class="' + cls + '" data-id="' + opt.id + '" aria-pressed="' + String(pressed) + '"' +
        (state.submitted ? " disabled" : "") + ">" +
        "<span>" + esc(opt.label) + extra + "</span></button>";
    }).join("");

    var feedback = "";
    if (state.submitted) {
      var ok = state.selected === round.correct;
      feedback =
        '<div class="detective-feedback" role="status">' +
          '<p class="detective-verdict">' + (ok ? "Correct." : "Not that mission.") + "</p>" +
          "<p>" + round.explain + "</p>" +
          '<p class="detective-source">NASA source: <a href="' + round.sourceUrl + '" target="_blank" rel="noopener">' + esc(round.sourceLabel) + "</a></p>" +
          (n < 3
            ? '<button type="button" class="btn btn-primary" id="detective-next">Next Round</button>'
            : '<button type="button" class="btn btn-primary" id="detective-next">See results</button>') +
        "</div>";
    }

    return "" +
      '<div class="detective-card">' +
        progressDots(n, state.submitted ? n : n - 1) +
        '<span class="eyebrow">ROUND ' + n + " OF 3 \u2014 " + round.title.toUpperCase() + "</span>" +
        "<h3>" + esc(round.question) + "</h3>" +
        '<div class="detective-options" role="group" aria-label="Answer choices">' + options + "</div>" +
        '<button type="button" class="btn btn-primary" id="detective-submit"' +
          (state.submitted || !state.selected ? " disabled" : "") + ">Submit Answer</button>" +
        feedback +
      "</div>";
  }

  function resultsHTML() {
    var messages = [
      "Every clue is a door into a real mission file. Try again whenever you like.",
      "One mission solved \u2014 the other two are waiting in the archive.",
      "Two out of three. The last case is a good reason to reopen the mission record.",
      "Three missions solved. You read the clues the way a mission historian would."
    ];
    var recap = ROUNDS.map(function (round, i) {
      var entry = state.history[i] || {};
      var mark = entry.correct ? "Solved" : "Missed";
      var cls = entry.correct ? "right" : "wrong";
      return '<li class="quiz-result-row ' + cls + '"><span>' + esc(round.title) + " \u2014 " +
        '<a href="mission.html?id=' + round.id + '">' + esc(getMissionById(round.id).name) + "</a></span>" +
        '<span class="r-mark">' + mark + "</span></li>";
    }).join("");

    return "" +
      '<div class="detective-card quiz-result">' +
        progressDots(3, 3) +
        '<span class="eyebrow">CASE CLOSED</span>' +
        '<p class="score-big">' + state.score + " out of 3 missions solved</p>" +
        "<p>" + messages[state.score] + "</p>" +
        "<p>Every mission has a different ending, but its scientific legacy can continue long after communication stops.</p>" +
        '<ul class="quiz-result-list">' + recap + "</ul>" +
        '<p class="detective-source">Sources: ' +
          ROUNDS.map(function (r) {
            return '<a href="' + r.sourceUrl + '" target="_blank" rel="noopener">' + esc(r.sourceLabel) + "</a>";
          }).join(" · ") +
        "</p>" +
        '<div class="detective-result-actions">' +
          '<button type="button" class="btn btn-primary" id="detective-again">Play Again</button>' +
          '<a class="btn btn-secondary" href="missions.html">Explore Mission Archive</a>' +
        "</div>" +
      "</div>";
  }

  function bindIntro() {
    document.getElementById("detective-start").addEventListener("click", function () {
      state = initialState();
      state.screen = "round";
      render();
      root.querySelector("h3").focus();
    });
  }

  function bindRound() {
    var heading = root.querySelector("h3");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
    }
    root.querySelectorAll(".detective-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (state.submitted) return;
        state.selected = btn.getAttribute("data-id");
        render();
      });
    });
    var submit = document.getElementById("detective-submit");
    if (submit) {
      submit.addEventListener("click", function () {
        if (state.submitted || !state.selected) return;
        var round = ROUNDS[state.roundIndex];
        var ok = state.selected === round.correct;
        state.submitted = true;
        if (!state.scored) {
          if (ok) state.score += 1;
          state.scored = true;
          state.history.push({ id: round.id, correct: ok });
        }
        render();
        var status = root.querySelector(".detective-feedback");
        if (status) status.focus();
      });
    }
    var next = document.getElementById("detective-next");
    if (next) {
      next.addEventListener("click", function () {
        if (state.roundIndex >= ROUNDS.length - 1) {
          state.screen = "results";
          render();
          return;
        }
        state.roundIndex += 1;
        state.selected = null;
        state.submitted = false;
        state.scored = false;
        render();
        var h = root.querySelector("h3");
        if (h) h.focus();
      });
    }
    var feedback = root.querySelector(".detective-feedback");
    if (feedback) feedback.setAttribute("tabindex", "-1");
  }

  function bindResults() {
    document.getElementById("detective-again").addEventListener("click", function () {
      state = initialState();
      state.screen = "intro";
      render();
      document.getElementById("detective-start").focus();
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
