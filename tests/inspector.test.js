/* Node smoke test (no WebGL): builds every craft family with a minimal THREE stub and checks that
   every documented component has a selectable group with geometry, and all 15 missions are mapped.
   Run: node tests/inspector.test.js */
"use strict";
var assert = require("assert");
var DATA = require("../js/inspector/craft-data.js");
var MODELS = require("../js/inspector/models.js");

function V3(x, y, z) { this.x = x || 0; this.y = y || 0; this.z = z || 0; }
V3.prototype.set = function (x, y, z) { this.x = x; this.y = y; this.z = z; return this; };
V3.prototype.copy = function (v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; };
V3.prototype.clone = function () { return new V3(this.x, this.y, this.z); };
V3.prototype.subVectors = function (a, b) { this.x = a.x - b.x; this.y = a.y - b.y; this.z = a.z - b.z; return this; };
V3.prototype.addScaledVector = function (v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; };
V3.prototype.length = function () { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); };
V3.prototype.normalize = function () { var l = this.length() || 1; this.x /= l; this.y /= l; this.z /= l; return this; };
function Obj() { this.children = []; this.userData = {}; this.position = new V3(); this.rotation = { set: function () {}, x: 0, y: 0, z: 0 }; this.scale = new V3(1, 1, 1); this.quaternion = { setFromUnitVectors: function () {} }; }
Obj.prototype.add = function (c) { this.children.push(c); return this; };
function Mesh(g, m) { Obj.call(this); this.geometry = g; this.material = m; }
Mesh.prototype = Object.create(Obj.prototype);
function geo() { return function () { }; }
var THREE = {
  Vector3: V3, Group: Obj, Mesh: Mesh, FrontSide: 0, DoubleSide: 2,
  MeshStandardMaterial: function (o) { this.o = o; },
  CylinderGeometry: geo(), BoxGeometry: geo(), SphereGeometry: geo()
};

assert.strictEqual(Object.keys(DATA.CRAFT).length, 15, "15 missions mapped");
Object.keys(DATA.CRAFT).forEach(function (id) { assert.ok(DATA.FAMILIES[DATA.CRAFT[id]], id + " maps to a family"); });
Object.keys(DATA.FAMILIES).forEach(function (fam) {
  var built = MODELS.build(THREE, fam), fd = DATA.FAMILIES[fam];
  fd.parts.forEach(function (p) {
    var g = built.parts[p.id];
    assert.ok(g, fam + ": missing 3D part for component '" + p.id + "'");
    var n = 0; g.children.forEach(function (c) { if (c instanceof Mesh) { n++; assert.strictEqual(c.userData.part, p.id, fam + "/" + p.id + " mesh tag"); } });
    assert.ok(n > 0, fam + "/" + p.id + " has no meshes");
    assert.ok(p.name && p.text && p.text.length < 330, fam + "/" + p.id + " text present and short");
  });
  Object.keys(built.parts).forEach(function (id) { assert.ok(fd.parts.some(function (p) { return p.id === id; }), fam + ": 3D part '" + id + "' has no description"); });
});
console.log("inspector smoke test OK: " + Object.keys(DATA.FAMILIES).length + " families, 15 missions");
