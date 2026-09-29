/* ============================================================
   Lightweight SVG glyphs for mission cards and detail pages.
   Kept intentionally schematic / technical-diagram in style
   rather than illustrative, to match the mission-archive tone.
   ============================================================ */

var MissionIcons = (function () {
  "use strict";

  function iconFor(mission) {
    if (mission.type === "Rover") return roverIcon();
    if (mission.type === "Crewed lander hardware") return lmIcon();
    if (mission.type === "Flyby probe") return probeIcon();
    return landerIcon();
  }

  function roverIcon() {
    return '<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<rect x="30" y="28" width="60" height="24" rx="2" stroke="currentColor" stroke-width="1.6"/>' +
      '<rect x="42" y="14" width="14" height="16" stroke="currentColor" stroke-width="1.4"/>' +
      '<line x1="49" y1="14" x2="49" y2="6" stroke="currentColor" stroke-width="1.4"/>' +
      '<circle cx="49" cy="6" r="2.4" stroke="currentColor" stroke-width="1.2"/>' +
      '<circle cx="40" cy="58" r="9" stroke="currentColor" stroke-width="1.6"/>' +
      '<circle cx="80" cy="58" r="9" stroke="currentColor" stroke-width="1.6"/>' +
      '<circle cx="60" cy="60" r="7" stroke="currentColor" stroke-width="1.4" opacity="0.6"/>' +
      '<line x1="90" y1="34" x2="104" y2="24" stroke="currentColor" stroke-width="1.4"/>' +
      '<circle cx="104" cy="24" r="2" stroke="currentColor" stroke-width="1.2"/>' +
      '</svg>';
  }

  function landerIcon() {
    return '<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<polygon points="60,18 84,50 36,50" stroke="currentColor" stroke-width="1.5"/>' +
      '<rect x="44" y="50" width="32" height="10" stroke="currentColor" stroke-width="1.5"/>' +
      '<line x1="44" y1="60" x2="26" y2="72" stroke="currentColor" stroke-width="1.4"/>' +
      '<line x1="76" y1="60" x2="94" y2="72" stroke="currentColor" stroke-width="1.4"/>' +
      '<line x1="50" y1="60" x2="38" y2="72" stroke="currentColor" stroke-width="1.4"/>' +
      '<line x1="70" y1="60" x2="82" y2="72" stroke="currentColor" stroke-width="1.4"/>' +
      '<circle cx="26" cy="74" r="2" stroke="currentColor" stroke-width="1.2"/>' +
      '<circle cx="94" cy="74" r="2" stroke="currentColor" stroke-width="1.2"/>' +
      '<circle cx="38" cy="74" r="2" stroke="currentColor" stroke-width="1.2"/>' +
      '<circle cx="82" cy="74" r="2" stroke="currentColor" stroke-width="1.2"/>' +
      '<line x1="60" y1="18" x2="60" y2="8" stroke="currentColor" stroke-width="1.4"/>' +
      '</svg>';
  }

  function lmIcon() {
    return '<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<rect x="46" y="24" width="28" height="26" stroke="currentColor" stroke-width="1.5"/>' +
      '<polygon points="40,50 80,50 90,62 30,62" stroke="currentColor" stroke-width="1.5"/>' +
      '<line x1="34" y1="62" x2="22" y2="74" stroke="currentColor" stroke-width="1.4"/>' +
      '<line x1="86" y1="62" x2="98" y2="74" stroke="currentColor" stroke-width="1.4"/>' +
      '<line x1="44" y1="62" x2="36" y2="74" stroke="currentColor" stroke-width="1.4"/>' +
      '<line x1="76" y1="62" x2="84" y2="74" stroke="currentColor" stroke-width="1.4"/>' +
      '<circle cx="60" cy="16" r="5" stroke="currentColor" stroke-width="1.3"/>' +
      '<line x1="60" y1="21" x2="60" y2="24" stroke="currentColor" stroke-width="1.3"/>' +
      '</svg>';
  }

  function probeIcon() {
    return '<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<circle cx="60" cy="40" r="12" stroke="currentColor" stroke-width="1.6"/>' +
      '<ellipse cx="60" cy="40" rx="38" ry="10" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>' +
      '<line x1="60" y1="28" x2="60" y2="10" stroke="currentColor" stroke-width="1.4"/>' +
      '<line x1="46" y1="14" x2="74" y2="14" stroke="currentColor" stroke-width="1.4"/>' +
      '<line x1="72" y1="48" x2="94" y2="62" stroke="currentColor" stroke-width="1.4"/>' +
      '<line x1="48" y1="48" x2="26" y2="62" stroke="currentColor" stroke-width="1.4"/>' +
      '<circle cx="60" cy="40" r="3" stroke="currentColor" stroke-width="1.2"/>' +
      '</svg>';
  }

  function locationGlyph(location) {
    if (location === "mars") {
      return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.4"/><circle cx="9" cy="10" r="1.4" fill="currentColor"/><circle cx="14" cy="14" r="1" fill="currentColor"/></svg>';
    }
    if (location === "moon") {
      return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M15 4a8 8 0 1 0 5 13.9A8.5 8.5 0 0 1 15 4Z" stroke="currentColor" stroke-width="1.3"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M4 20 20 4M9 4h7v7" stroke="currentColor" stroke-width="1.4"/></svg>';
  }

  function arrowIcon() {
    return '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5"/></svg>';
  }

  return { iconFor: iconFor, locationGlyph: locationGlyph, arrowIcon: arrowIcon, roverIcon: roverIcon, landerIcon: landerIcon, lmIcon: lmIcon, probeIcon: probeIcon };
})();
