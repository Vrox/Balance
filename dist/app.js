"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
            }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
                var n = t[o][1][e];return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
        s(r[o]);
    }return s;
})({ 1: [function (require, module, exports) {
        /* global module Float32Array */
        var ids = {
            GRASS: 1 << 0, // 1
            CIV: 1 << 1, // 2
            DIRT: 1 << 2, // 4
            TREE: 1 << 3, // 8
            ROCK: 1 << 4, // 16
            GROWTH: 1 << 5, // 32
            WATER: 1 << 6, // 64
            FAUNA: 1 << 7, // 128
            WALL: 1 << 8 };

        var GRASS = ids.GRASS,
            CIV = ids.CIV,
            DIRT = ids.DIRT,
            TREE = ids.TREE,
            ROCK = ids.ROCK,
            GROWTH = ids.GROWTH,
            WATER = ids.WATER,
            FAUNA = ids.FAUNA,
            WALL = ids.WALL;


        var colors = {};
        colors[GRASS] = new Float32Array([76 / 255, 116 / 255, 38 / 255, 1]);
        colors[CIV] = new Float32Array([170 / 255, 170 / 255, 17 / 255, 1]);
        colors[DIRT] = new Float32Array([129 / 255, 118 / 255, 42 / 255, 1]);
        colors[TREE] = new Float32Array([33 / 255, 67 / 255, 0 / 255, 1]);
        colors[ROCK] = new Float32Array([88 / 255, 103 / 255, 118 / 255, 1]);
        colors[GROWTH] = new Float32Array([42 / 255, 81 / 255, 5 / 255, 1]);
        colors[WATER] = new Float32Array([0 / 255, 102 / 255, 102 / 255, 1]);
        colors[FAUNA] = new Float32Array([94 / 255, 75 / 255, 0 / 255, 1]);
        colors[WALL] = new Float32Array([0, 0, 0, 1]);

        var heights = {};
        heights[GRASS] = 0.;
        heights[CIV] = 0.9;
        heights[DIRT] = -0.2;
        heights[TREE] = 2.5;
        heights[ROCK] = 0.5;
        heights[GROWTH] = 1.5;
        heights[WATER] = 0.0;
        heights[FAUNA] = 0.8;
        heights[WALL] = 3.0;

        module.exports.ids = ids;
        module.exports.colors = colors;
        module.exports.heights = heights;
    }, {}], 2: [function (require, module, exports) {
        /* global require module */
        var glMatrix = require('gl-matrix');

        var mat4 = glMatrix.mat4;


        var cellTypes = require('./CellTypes.js');

        var _cellTypes$ids = cellTypes.ids,
            GRASS = _cellTypes$ids.GRASS,
            CIV = _cellTypes$ids.CIV,
            DIRT = _cellTypes$ids.DIRT,
            TREE = _cellTypes$ids.TREE,
            ROCK = _cellTypes$ids.ROCK,
            GROWTH = _cellTypes$ids.GROWTH,
            WATER = _cellTypes$ids.WATER,
            FAUNA = _cellTypes$ids.FAUNA,
            WALL = _cellTypes$ids.WALL;


        var BUILDABLE = GRASS | DIRT;
        var WATER_FLOWS = GRASS | DIRT;
        var PLANT = GRASS | TREE | GROWTH;
        var FOREST = TREE | GROWTH;
        var FAUNA_ROAMS = GRASS | TREE | GROWTH | WATER;
        var EATS = CIV | FAUNA;
        var BAREN = ROCK | WALL;

        var GridSpace = function () {
            function GridSpace(x, y, worldMap, noise) {
                _classCallCheck(this, GridSpace);

                this.x = x;
                this.y = y;
                this.baseHeight = noise * 10;
                this.worldMap = worldMap;
                this.modelMatrix = mat4.create();
                this.modelMatrix[12] = x;
                this.modelMatrix[13] = y;
                this.cellType = GRASS;
            }

            // This isn't done in the constructor because all adjacent gridspaces must already
            // be instantiated


            _createClass(GridSpace, [{
                key: "link",
                value: function link() {
                    var x = this.x,
                        y = this.y;
                    var _worldMap = this.worldMap,
                        width = _worldMap.width,
                        height = _worldMap.height,
                        grid = _worldMap.grid;

                    this.westNode = grid[x === 0 ? width - 1 : x - 1][y];
                    this.eastNode = grid[x === width - 1 ? 0 : x + 1][y];
                    this.northNode = grid[x][y === 0 ? height - 1 : y - 1];
                    this.southNode = grid[x][y === height - 1 ? 0 : y + 1];
                    this.northwestNode = grid[x === 0 ? width - 1 : x - 1][y === 0 ? height - 1 : y - 1];
                    this.northeastNode = grid[x === width - 1 ? 0 : x + 1][y === 0 ? height - 1 : y - 1];
                    this.southwestNode = grid[x === 0 ? width - 1 : x - 1][y === height - 1 ? 0 : y + 1];
                    this.southeastNode = grid[x === width - 1 ? 0 : x + 1][y === height - 1 ? 0 : y + 1];
                }
            }, {
                key: "realHeight",
                value: function realHeight() {
                    return this.modelMatrix[14];
                }
            }, {
                key: "resolve",
                value: function resolve() {
                    var cellType = this.cellType,
                        x = this.x,
                        y = this.y;
                    var northNode = this.northNode,
                        northeastNode = this.northeastNode,
                        eastNode = this.eastNode,
                        southeastNode = this.southeastNode,
                        southNode = this.southNode,
                        southwestNode = this.southwestNode,
                        westNode = this.westNode,
                        northwestNode = this.northwestNode;


                    var waterLeniency = 0.;
                    if (cellType !== WATER) {
                        if (northNode.cellType === WATER && northNode.realHeight() < this.realHeight() + waterLeniency) return WATER;
                        if (northeastNode.cellType === WATER && northeastNode.realHeight() < this.realHeight() + waterLeniency) return WATER;
                        if (eastNode.cellType === WATER && eastNode.realHeight() < this.realHeight() + waterLeniency) return WATER;
                        if (southeastNode.cellType === WATER && southeastNode.realHeight() < this.realHeight() + waterLeniency) return WATER;
                        if (southNode.cellType === WATER && southNode.realHeight() < this.realHeight() + waterLeniency) return WATER;
                        if (southwestNode.cellType === WATER && southwestNode.realHeight() < this.realHeight() + waterLeniency) return WATER;
                        if (westNode.cellType === WATER && westNode.realHeight() < this.realHeight() + waterLeniency) return WATER;
                        if (northwestNode.cellType === WATER && northwestNode.realHeight() < this.realHeight() + waterLeniency) return WATER;
                    } else {
                        if (this.baseHeight < 5) return GRASS;
                    }

                    // if (cellType & WATER_FLOWS) {
                    //   if (((x !== 0 && y !== 0) && northwestNode.cellType === WATER) ||
                    //   (x !==0 && !(northNode.cellType & WATER_FLOWS) && westNode.cellType === WATER) ||
                    //   (y !== 0 && !(westNode.cellType & WATER_FLOWS) && northNode.cellType === WATER)) {
                    //     return WATER;
                    //   }
                    // }

                    if (cellType & BUILDABLE) {
                        if ((this.allNeighborCount(TREE | GRASS | FAUNA) >= 3 || this.hasNeighbor(TREE)) && this.oneAxis(CIV)) {
                            return CIV;
                        }
                    }

                    if (cellType & FAUNA_ROAMS && this.baseHeight > 6) {
                        if (!this.hasNeighbor(CIV) && this.allNeighborCount(BAREN) <= 2 && this.hasDiagnalNeighbor(FAUNA) && !this.hasDirectNeighbor(FAUNA)) {
                            return FAUNA;
                        }
                    }

                    if (cellType === DIRT) {
                        if (this.allNeighborCount(CIV) >= 4) {
                            return ROCK;
                        }
                        if (this.hasNeighbor(WATER) || this.allNeighborCount(PLANT) > this.allNeighborCount(CIV) + 2) {
                            return GRASS;
                        }
                    }

                    if (cellType === GRASS) {
                        if (this.allNeighborCount(TREE) >= 3 && !this.hasNeighbor(CIV)) {
                            return GROWTH;
                        }
                        if (this.allNeighborCount(PLANT) < this.allNeighborCount(EATS | BAREN) + 1) {
                            return DIRT;
                        }
                    }

                    if (cellType === ROCK) {
                        if (!this.hasNeighbor(CIV) && this.allNeighborCount(TREE | FAUNA) >= 2 || this.allNeighborCount(PLANT | FAUNA) >= 4) {
                            return DIRT;
                        }
                        if (this.allNeighborCount(WATER) >= 4) {
                            return DIRT;
                        }
                    }

                    if (cellType === CIV) {
                        if (this.isAllDirectNeighbors(CIV) || this.allNeighborCount(CIV) > this.allNeighborCount(GRASS)) {
                            return ROCK;
                        }
                        if (!this.hasDirectNeighbor(CIV)) {
                            return DIRT;
                        }
                    }

                    if (cellType === TREE) {
                        if (this.hasDirectNeighbor(CIV)) {
                            return DIRT;
                        }
                    }

                    if (cellType === GROWTH) {
                        if (this.allNeighborCount(GROWTH) === 2 && this.hasNeighbor(WATER) && this.baseHeight > 6) {
                            return FAUNA;
                        }
                        return TREE;
                    }

                    if (cellType === FAUNA) {
                        if (this.allNeighborCount(CIV) >= 2) {
                            return CIV;
                        }
                        if (this.hasNeighbor(CIV)) {
                            return DIRT;
                        }
                        if (this.allNeighborCount(EATS) > this.allNeighborCount(PLANT)) {
                            return GRASS;
                        }
                    }

                    if (cellType === WATER) {
                        if (this.hasNeighbor(CIV)) {
                            return GRASS;
                        }
                        if (this.hasDirectNeighbor(FOREST) && this.allNeighborCount(WATER) >= 3) {
                            return GROWTH;
                        }
                        if (this.allNeighborCount(TREE) > 4 && !this.hasNeighbor(WATER)) {
                            return GRASS;
                        }
                    }

                    return cellType;
                }
            }, {
                key: "hasDirectNeighbor",
                value: function hasDirectNeighbor(flag) {
                    return this.westNode.cellType & flag || this.eastNode.cellType & flag || this.northNode.cellType & flag || this.southNode.cellType & flag;
                }
            }, {
                key: "hasDiagnalNeighbor",
                value: function hasDiagnalNeighbor(flag) {
                    return this.northwestNode.cellType & flag || this.northeastNode.cellType & flag || this.southwestNode.cellType & flag || this.southeastNode.cellType & flag;
                }
            }, {
                key: "hasNeighbor",
                value: function hasNeighbor(flag) {
                    return this.westNode.cellType & flag || this.eastNode.cellType & flag || this.northNode.cellType & flag || this.southNode.cellType & flag || this.northwestNode.cellType & flag || this.southwestNode.cellType & flag || this.northeastNode.cellType & flag || this.southeastNode.cellType & flag;
                }
            }, {
                key: "allNeighbors",
                value: function allNeighbors(x, y, flag) {
                    return this.westNode.cellType & flag && this.eastNode.cellType & flag && this.northNode.cellType & flag && this.southNode.cellType & flag && this.northwestNode.cellType & flag && this.southwestNode.cellType & flag && this.northeastNode.cellType & flag && this.southeastNode.cellType & flag;
                }
            }, {
                key: "directNeighborCount",
                value: function directNeighborCount(x, y, flag) {
                    var count = 0;
                    if (this.westNode.cellType & flag) count++;
                    if (this.eastNode.cellType & flag) count++;
                    if (this.northNode.cellType & flag) count++;
                    if (this.southNode.cellType & flag) count++;
                    return count;
                }
            }, {
                key: "isAllDirectNeighbors",
                value: function isAllDirectNeighbors(flag) {
                    return this.westNode.cellType & flag && this.eastNode.cellType & flag && this.northNode.cellType & flag && this.southNode.cellType & flag;
                }
            }, {
                key: "allNeighborCount",
                value: function allNeighborCount(flag) {
                    var count = 0;
                    if (this.westNode.cellType & flag) count++;
                    if (this.eastNode.cellType & flag) count++;
                    if (this.northNode.cellType & flag) count++;
                    if (this.southNode.cellType & flag) count++;
                    if (this.northwestNode.cellType & flag) count++;
                    if (this.southwestNode.cellType & flag) count++;
                    if (this.northeastNode.cellType & flag) count++;
                    if (this.southeastNode.cellType & flag) count++;
                    return count;
                }
            }, {
                key: "oneAxis",
                value: function oneAxis(flag) {
                    return (this.westNode.cellType & flag || this.eastNode.cellType & flag) !== (this.northNode.cellType & flag || this.southNode.cellType & flag);
                }
            }, {
                key: "naturalColor",
                value: function naturalColor() {
                    return cellTypes.colors[this.cellType];
                }
            }, {
                key: "render",
                value: function render(renderer) {
                    mat4.multiply(renderer.finalMat, renderer.projViewMat, this.modelMatrix);
                    renderer.matrixUniform.setUniformMatrix4fv(renderer.finalMat);
                    renderer.colorUniform.setUniform4fv(this.worldMap.cellColor(this.x, this.y));
                    renderer.gl.drawElements(renderer.gl.TRIANGLES, 30, renderer.gl.UNSIGNED_BYTE, 0);
                }
            }, {
                key: "cellType",
                set: function set(type) {
                    this._cellType = type;
                    this.modelMatrix[14] = this.baseHeight - cellTypes.heights[type];
                },
                get: function get() {
                    return this._cellType;
                }
            }]);

            return GridSpace;
        }();

        module.exports = GridSpace;
    }, { "./CellTypes.js": 1, "gl-matrix": 19 }], 3: [function (require, module, exports) {
        /* global require module Float32Array Uint8Array */
        var WebGLUtils = require('./WebGLUtils.js');
        var ShaderAttribute = require('./ShaderAttribute.js');
        var ShaderUniform = require('./ShaderUniform.js');
        var vertShader = require('../shaders/vert.glsl');
        var fragShader = require('../shaders/frag.glsl');
        var createCamera = require('perspective-camera');
        var glMatrix = require('gl-matrix');
        var rayPick = require('camera-picking-ray');

        var mat4 = glMatrix.mat4;

        var Renderer = function () {
            function Renderer(glCanvas) {
                _classCallCheck(this, Renderer);

                this.glCanvas = glCanvas;
                this.gl = glCanvas.getContext('webgl');
                var gl = this.gl;
                gl.enable(gl.CULL_FACE);
                gl.enable(gl.DEPTH_TEST);
                //gl.cullFace(gl.FRONT);
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

                // this.triangles = new Float32Array([
                //   // top face
                //   -.5, -.5, 0,
                //   +.5, -.5, 0,
                //   -.5,  .5, 0,
                //   -.5,  .5, 0,
                //   +.5, -.5, 0,
                //   +.5,  .5, 0
                // ]);

                var verts = new Float32Array([-.5, -.5, 0, .5, -.5, 0, -.5, .5, 0, .5, .5, 0, -.5, -.5, 10, .5, -.5, 10, -.5, .5, 10, .5, .5, 10]);

                var indicies = new Uint8Array([1, 0, 2, 3, 1, 2, 4, 0, 1, 4, 1, 5, 5, 1, 3, 5, 3, 7, 6, 3, 2, 6, 7, 3, 0, 4, 2, 4, 6, 2]);

                var vertBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

                var indexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicies, gl.STATIC_DRAW);

                //    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

                this.vertexShader = WebGLUtils.createShader(gl, gl.VERTEX_SHADER, vertShader());

                this.fragmentShader = WebGLUtils.createShader(gl, gl.FRAGMENT_SHADER, fragShader());

                // create shader program
                this.program = WebGLUtils.createProgram(gl, this.vertexShader, this.fragmentShader);
                gl.useProgram(this.program);

                this.positionAttribute = new ShaderAttribute(gl, this.program, 'a_position', { size: 3 });

                this.matrixUniform = new ShaderUniform(gl, this.program, 'u_mat');

                this.colorUniform = new ShaderUniform(gl, this.program, 'u_color');
                this.colorUniform.setUniform4fv(new Float32Array([1., 1., 0., 0.]));

                this.gl.clearColor(0.0, 0.4, 0.4, 1.0);

                this.viewport = [0, 0, gl.canvas.width, gl.canvas.height];

                this.camera = createCamera({ far: 9999, viewport: this.viewport });
                this.camera.position[2] = -35;
                this.projViewMat = mat4.create();
                this.finalMat = mat4.create();
                this.invProjViewMat = mat4.create();
            }

            _createClass(Renderer, [{
                key: "updateCamera",
                value: function updateCamera() {
                    this.camera.update();
                    mat4.multiply(this.projViewMat, this.camera.projection, this.camera.view);
                    mat4.invert(this.invProjViewMat, this.projViewMat);
                }
            }, {
                key: "mouseRay",
                value: function mouseRay(mouseLoc) {
                    var rayOrigin = [0, 0, 0];
                    var rayDir = [0, 0, 0];

                    rayPick(rayOrigin, rayDir, mouseLoc, this.viewport, this.invProjViewMat);

                    return { rayOrigin: rayOrigin, rayDir: rayDir };
                }
            }, {
                key: "renderPrep",
                value: function renderPrep() {
                    var gl = this.gl;

                    gl.clear(gl.COLOR_BUFFER_BIT);
                }
            }]);

            return Renderer;
        }();

        module.exports = Renderer;
    }, { "../shaders/frag.glsl": 52, "../shaders/vert.glsl": 53, "./ShaderAttribute.js": 4, "./ShaderUniform.js": 5, "./WebGLUtils.js": 6, "camera-picking-ray": 9, "gl-matrix": 19, "perspective-camera": 42 }], 4: [function (require, module, exports) {
        /* global module */
        var ShaderAttribute = function ShaderAttribute(gl, program, name, options) {
            _classCallCheck(this, ShaderAttribute);

            this.gl = gl;
            this.program = program;
            this.name = name;
            this.location = gl.getAttribLocation(program, name);

            gl.enableVertexAttribArray(this.position);

            var _options$size = options.size,
                size = _options$size === undefined ? 1 : _options$size,
                _options$dataType = options.dataType,
                dataType = _options$dataType === undefined ? gl.FLOAT : _options$dataType,
                _options$normalize = options.normalize,
                normalize = _options$normalize === undefined ? false : _options$normalize,
                _options$stride = options.stride,
                stride = _options$stride === undefined ? 0 : _options$stride,
                _options$offset = options.offset,
                offset = _options$offset === undefined ? 0 : _options$offset;


            gl.vertexAttribPointer(this.location, size, dataType, normalize, stride, offset);
            gl.enableVertexAttribArray(this.location);
        };

        module.exports = ShaderAttribute;
    }, {}], 5: [function (require, module, exports) {
        /* global module */
        var ShaderUniform = function () {
            function ShaderUniform(gl, program, name) {
                _classCallCheck(this, ShaderUniform);

                this.gl = gl;
                this.program = program;
                this.name = name;
                this.location = gl.getUniformLocation(program, name);
            }

            // Floats


            _createClass(ShaderUniform, [{
                key: "setUniform1f",
                value: function setUniform1f(v0) {
                    this.gl.uniform1f(this.location, v0);
                }
            }, {
                key: "setUniform2f",
                value: function setUniform2f(v0, v1) {
                    this.gl.uniform2f(this.location, v0, v1);
                }
            }, {
                key: "setUniform3f",
                value: function setUniform3f(v0, v1, v2) {
                    this.gl.uniform3f(this.location, v0, v1, v2);
                }
            }, {
                key: "setUniform4f",
                value: function setUniform4f(v0, v1, v2, v3) {
                    this.gl.uniform4f(this.location, v0, v1, v2, v3);
                }

                // Float vectors

            }, {
                key: "setUniform1fv",
                value: function setUniform1fv(v) {
                    this.gl.uniform1fv(this.location, v);
                }
            }, {
                key: "setUniform2fv",
                value: function setUniform2fv(v) {
                    this.gl.uniform2fv(this.location, v);
                }
            }, {
                key: "setUniform3fv",
                value: function setUniform3fv(v) {
                    this.gl.uniform3fv(this.location, v);
                }
            }, {
                key: "setUniform4fv",
                value: function setUniform4fv(v) {
                    this.gl.uniform4fv(this.location, v);
                }

                // Integers

            }, {
                key: "setUniform1i",
                value: function setUniform1i(v0) {
                    this.gl.uniform1i(this.location, v0);
                }
            }, {
                key: "setUniform2i",
                value: function setUniform2i(v0, v1) {
                    this.gl.uniform2i(this.location, v0, v1);
                }
            }, {
                key: "setUniform3i",
                value: function setUniform3i(v0, v1, v2) {
                    this.gl.uniform3i(this.location, v0, v1, v2);
                }
            }, {
                key: "setUniform4i",
                value: function setUniform4i(v0, v1, v2, v3) {
                    this.gl.uniform4i(this.location, v0, v1, v2, v3);
                }

                // Integer vectors

            }, {
                key: "setUniform1iv",
                value: function setUniform1iv(v) {
                    this.gl.uniform1iv(this.location, v);
                }
            }, {
                key: "setUniform2iv",
                value: function setUniform2iv(v) {
                    this.gl.uniform2iv(this.location, v);
                }
            }, {
                key: "setUniform3iv",
                value: function setUniform3iv(v) {
                    this.gl.uniform3iv(this.location, v);
                }
            }, {
                key: "setUniform4iv",
                value: function setUniform4iv(v) {
                    this.gl.uniform4iv(this.location, v);
                }

                // Matricies

            }, {
                key: "setUniformMatrix2fv",
                value: function setUniformMatrix2fv(v) {
                    this.gl.uniformMatrix2fv(this.location, false, v);
                }
            }, {
                key: "setUniformMatrix3fv",
                value: function setUniformMatrix3fv(v) {
                    this.gl.uniformMatrix3fv(this.location, false, v);
                }
            }, {
                key: "setUniformMatrix4fv",
                value: function setUniformMatrix4fv(v) {
                    this.gl.uniformMatrix4fv(this.location, false, v);
                }
            }]);

            return ShaderUniform;
        }();

        module.exports = ShaderUniform;
    }, {}], 6: [function (require, module, exports) {
        /* global module */
        module.exports.createProgram = function (gl, vertexShader, fragmentShader) {
            var program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            var success = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (success) {
                return program;
            }

            console.log(gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
        };

        module.exports.createShader = function createShader(gl, type, source) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (success) {
                return shader;
            }
            console.log("error creating shader:");
            console.log(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
        };
    }, {}], 7: [function (require, module, exports) {
        /* globals require module Float32Array */
        var GridSpace = require('./GridSpace.js');
        var cellTypes = require('./CellTypes.js');
        var perlin = require('perlin-noise');

        var _cellTypes$ids2 = cellTypes.ids,
            GRASS = _cellTypes$ids2.GRASS,
            CIV = _cellTypes$ids2.CIV,
            DIRT = _cellTypes$ids2.DIRT,
            TREE = _cellTypes$ids2.TREE,
            ROCK = _cellTypes$ids2.ROCK,
            GROWTH = _cellTypes$ids2.GROWTH,
            WATER = _cellTypes$ids2.WATER,
            FAUNA = _cellTypes$ids2.FAUNA,
            WALL = _cellTypes$ids2.WALL;

        var WorldMap = function () {
            function WorldMap(width, height) {
                _classCallCheck(this, WorldMap);

                this.width = width;
                this.height = height;

                var noise = perlin.generatePerlinNoise(width, height);

                var grid = [this.width];
                for (var x = 0; x < this.width; x++) {
                    grid[x] = [this.height];
                    for (var y = 0; y < this.height; y++) {
                        grid[x][y] = new GridSpace(x, y, this, noise[y * width + x]);
                    }
                }
                this.grid = grid;

                this.highlightLoc;
                this.highlightSize = 3;
                this.selectedCellType = TREE;

                this.iterate(function (cell) {
                    return cell.link();
                });

                grid[25][25].cellType = CIV;
                grid[25][26].cellType = CIV;

                grid[21][33].cellType = CIV;
                grid[22][33].cellType = CIV;

                grid[3][16].cellType = TREE;
                grid[4][16].cellType = TREE;
                grid[5][15].cellType = TREE;

                grid[23][17].cellType = TREE;
                grid[24][17].cellType = TREE;
                grid[25][17].cellType = TREE;
                grid[23][18].cellType = TREE;
                grid[24][18].cellType = TREE;
                grid[25][18].cellType = TREE;
                grid[23][19].cellType = TREE;
                grid[24][19].cellType = TREE;
                grid[25][19].cellType = TREE;
            }

            _createClass(WorldMap, [{
                key: "iterate",
                value: function iterate(f) {
                    for (var x = 0; x < this.width; x++) {
                        for (var y = 0; y < this.height; y++) {
                            f(this.grid[x][y]);
                        }
                    }
                }
            }, {
                key: "turn",
                value: function turn() {
                    var width = this.width,
                        height = this.height;

                    var gridCopy = [width];
                    for (var x = 0; x < width; x++) {
                        gridCopy[x] = [];
                        for (var y = 0; y < height; y++) {
                            gridCopy[x][y] = this.grid[x][y].resolve();
                        }
                    }
                    for (x = 0; x < width; x++) {
                        for (y = 0; y < height; y++) {
                            this.grid[x][y].cellType = gridCopy[x][y];
                        }
                    }
                }
            }, {
                key: "cellColor",
                value: function cellColor(gridX, gridY) {
                    var color = this.grid[gridX][gridY].naturalColor();
                    if (this.inHighlight(gridX, gridY)) {
                        return [color[0] * 0.8, color[1] * 0.8, color[2] * 0.8, 1];
                    }
                    return color;
                }
            }, {
                key: "hightlightInBounds",
                value: function hightlightInBounds() {
                    var _highlightLoc = this.highlightLoc,
                        x = _highlightLoc.x,
                        y = _highlightLoc.y;

                    return x >= 0 && y >= 0 && x < this.width && y < this.height;
                }
            }, {
                key: "highlightColor",
                value: function highlightColor() {
                    if (!this.hightlightInBounds()) {
                        return new Float32Array([0, 0, 0, 1]);
                    }
                    var color = cellTypes.colors[this.selectedCellType];
                    return new Float32Array([color[0] * 1.2, color[1] * 1.2, color[2] * 1.2, 1]);
                }
            }, {
                key: "inHighlight",
                value: function inHighlight(gridX, gridY) {
                    if (this.highlightLoc === null) return false;
                    var dx = Math.abs(this.highlightLoc.x - gridX);
                    var dy = Math.abs(this.highlightLoc.y - gridY);
                    return dx * dx + dy * dy <= this.highlightSize * this.highlightSize;
                }
            }, {
                key: "paintHighlight",
                value: function paintHighlight() {
                    this.paint(this.highlightLoc.x, this.highlightLoc.y, this.highlightSize, this.selectedCellType);
                }
            }, {
                key: "paint",
                value: function paint(gridX, gridY, brushSize, cellType) {
                    for (var bx = gridX - brushSize, bxMax = gridX + brushSize; bx <= bxMax; bx++) {
                        for (var by = gridY - brushSize, byMax = gridY + brushSize; by <= byMax; by++) {
                            var dx = Math.abs(gridX - bx);
                            var dy = Math.abs(gridY - by);
                            if (dx * dx + dy * dy <= brushSize * brushSize) {
                                this.paintCell(bx, by, cellType);
                            }
                        }
                    }
                }
            }, {
                key: "paintCell",
                value: function paintCell(gridX, gridY, cellType) {
                    if (gridX < 0 || gridY < 0 || gridX >= this.width || gridY >= this.height) return;
                    this.grid[gridX][gridY].cellType = cellType;
                }
            }]);

            return WorldMap;
        }();

        module.exports = WorldMap;
    }, { "./CellTypes.js": 1, "./GridSpace.js": 2, "perlin-noise": 41 }], 8: [function (require, module, exports) {
        /* globals Float32Array require module */
        var Renderer = require('./Renderer.js');
        var WorldMap = require('./WorldMap.js');
        var cellTypes = require('./CellTypes.js');
        var glMatrix = require('gl-matrix');
        var unproject = require('camera-unproject');

        var _cellTypes$ids3 = cellTypes.ids,
            GRASS = _cellTypes$ids3.GRASS,
            CIV = _cellTypes$ids3.CIV,
            DIRT = _cellTypes$ids3.DIRT,
            TREE = _cellTypes$ids3.TREE,
            ROCK = _cellTypes$ids3.ROCK,
            GROWTH = _cellTypes$ids3.GROWTH,
            WATER = _cellTypes$ids3.WATER,
            FAUNA = _cellTypes$ids3.FAUNA,
            WALL = _cellTypes$ids3.WALL;
        var vec3 = glMatrix.vec3,
            mat4 = glMatrix.mat4;


        window.onload = init;

        var canvasWidth = 1024;
        var canvasHeight = 700;

        var GRID_WIDTH = 50;
        var GRID_HEIGHT = 50;

        var CELL_SIZE = canvasHeight / GRID_HEIGHT;

        var lastTime = null;
        var turnTimer = 0;

        var mouseLoc = [0, 0];

        var mouseDownTracker = false;

        var sidebar = void 0;
        var worldMap = void 0;

        var renderer = void 0;
        var glCanvas = void 0;

        var turnSpeed = 0.7;

        var keys = [];

        function init() {

            glCanvas = document.getElementById('glCanvas');
            glCanvas.width = canvasWidth;
            glCanvas.height = canvasHeight;
            renderer = new Renderer(glCanvas);

            worldMap = new WorldMap(GRID_WIDTH, GRID_HEIGHT);

            registerEventListeners();

            requestAnimationFrame(render);
        }

        function registerEventListeners() {

            window.onkeyup = function (e) {
                keys[e.keyCode] = false;
            };
            window.onkeydown = function (e) {
                keys[e.keyCode] = true;
                switch (e.keyCode) {
                    case 49:
                        // 0
                        worldMap.selectedCellType = CIV;
                        break;
                    case 50:
                        // 1
                        worldMap.selectedCellType = TREE;
                        break;
                    case 51:
                        // 2
                        worldMap.selectedCellType = GRASS;
                        break;
                    case 52:
                        // 3
                        worldMap.selectedCellType = ROCK;
                        break;
                    case 53:
                        // 4
                        worldMap.selectedCellType = WATER;
                        break;
                    case 54:
                        // 5
                        worldMap.selectedCellType = DIRT;
                        break;
                    case 55:
                        // 6
                        worldMap.selectedCellType = WALL;
                        break;
                    case 81:
                        // Q
                        worldMap.highlightSize = Math.max(0, worldMap.highlightSize - 1);
                        break;
                    case 69:
                        // E
                        worldMap.highlightSize = Math.min(25, worldMap.highlightSize + 1);
                        break;
                }
            };

            glCanvas.addEventListener('mousemove', function (event) {
                var rect = glCanvas.getBoundingClientRect();
                mouseLoc[0] = event.clientX - rect.left;
                mouseLoc[1] = event.clientY - rect.top;
                if (mouseDownTracker) {
                    paint();
                }
            }, false);

            glCanvas.addEventListener("mousedown", function () {
                mouseDownTracker = true;
                paint();
            });
            glCanvas.addEventListener("mouseup", function () {
                mouseDownTracker = false;
            });
        }

        function render(time) {
            window.requestAnimationFrame(render);

            var dt = lastTime === null ? 0 : (time - lastTime) / 1000;
            lastTime = time;

            tick(dt);

            draw();
        }

        var cameraDist = 0;

        function tick(dt) {
            turnTimer += dt;
            if (turnTimer >= turnSpeed) {
                turnTimer -= turnSpeed;
                worldMap.turn();
            }

            if (keys[90]) {
                // Z
                turnSpeed += turnSpeed * 1.5 * dt;
            } else if (keys[67]) {
                // C
                turnSpeed -= turnSpeed * 1.5 * dt;
            }

            turnSpeed = Math.min(1, Math.max(0.05, turnSpeed));

            renderer.gl.clearColor(0., 0.9 * (1.0 - turnSpeed), 0.9 * (1.0 - turnSpeed), 1.);

            var halfW = worldMap.width / 2;
            var halfH = worldMap.height / 2;

            var _renderer = renderer,
                camera = _renderer.camera;


            if (keys[65]) {
                // Q
                cameraDist += dt * 1.0;
            } else if (keys[68]) {
                // E
                cameraDist -= dt * 1.0;
            }

            if (keys[83]) {
                // R
                camera.position[2] -= dt * 40.;
            } else if (keys[87]) {
                // F
                camera.position[2] += dt * 40.;
                camera.position[2] = Math.min(0, camera.position[2]);
            }

            camera.position[0] = halfW + Math.cos(cameraDist) * halfW * 1.8;
            camera.position[1] = halfH + Math.sin(cameraDist) * halfH * 1.8;
            // camera.position.x = 1; //Math.cos(lastTime);
            // camera.position.y = Math.sin(lastTime);
            camera.lookAt([halfW, halfH, 5]);
            camera.up = [0, 0, -1];

            renderer.updateCamera();

            var _renderer$mouseRay = renderer.mouseRay(mouseLoc),
                rayOrigin = _renderer$mouseRay.rayOrigin,
                rayDir = _renderer$mouseRay.rayDir;

            // Find mouse hover
            // plane at Z = 0


            var planeZ = 0;
            var heightDiff = -rayOrigin[2] + planeZ;

            // const camDir = vec3.fromValues(
            //   camera.direction[0],
            //   camera.direction[1],
            //   camera.direction[2]
            // );
            // vec3.normalize(camDir, camDir);


            var t = heightDiff / rayDir[2];

            //console.log(t);

            var hoverGridX = Math.floor(rayOrigin[0] + t * rayDir[0] + .5);
            var hoverGridY = Math.floor(rayOrigin[1] + t * rayDir[1] + .5);

            worldMap.highlightLoc = {
                x: hoverGridX,
                y: hoverGridY
            };

            debugModelMat[12] = hoverGridX;
            debugModelMat[13] = hoverGridY;
            debugModelMat[14] = planeZ - 2;

            //console.log(worldMap.highlightLoc);
        }

        function paint() {
            worldMap.paintHighlight(TREE);
        }

        function draw() {
            renderer.renderPrep();
            worldMap.iterate(function (cell) {
                cell.render(renderer);
            });
            drawDebug();
        }

        var debugModelMat = mat4.create();
        var debugFinalMat = mat4.create();

        function drawDebug() {

            mat4.multiply(debugFinalMat, renderer.projViewMat, debugModelMat);
            renderer.matrixUniform.setUniformMatrix4fv(debugFinalMat);
            renderer.colorUniform.setUniform4fv(worldMap.highlightColor());
            renderer.gl.drawElements(renderer.gl.TRIANGLES, 30, renderer.gl.UNSIGNED_BYTE, 0);
        }
    }, { "./CellTypes.js": 1, "./Renderer.js": 3, "./WorldMap.js": 7, "camera-unproject": 11, "gl-matrix": 19 }], 9: [function (require, module, exports) {
        var unproject = require('camera-unproject');
        var set = require('gl-vec3/set');
        var sub = require('gl-vec3/subtract');
        var normalize = require('gl-vec3/normalize');

        module.exports = createPickRay;
        function createPickRay(origin, direction, point, viewport, invProjView) {
            set(origin, point[0], point[1], 0);
            set(direction, point[0], point[1], 1);
            unproject(origin, origin, viewport, invProjView);
            unproject(direction, direction, viewport, invProjView);
            sub(direction, direction, origin);
            normalize(direction, direction);
        }
    }, { "camera-unproject": 11, "gl-vec3/normalize": 33, "gl-vec3/set": 36, "gl-vec3/subtract": 38 }], 10: [function (require, module, exports) {
        var transformMat4 = require('gl-vec4/transformMat4');
        var set = require('gl-vec4/set');

        var NEAR_RANGE = 0;
        var FAR_RANGE = 1;
        var tmp4 = [0, 0, 0, 0];

        module.exports = cameraProject;
        function cameraProject(out, vec, viewport, combinedProjView) {
            var vX = viewport[0],
                vY = viewport[1],
                vWidth = viewport[2],
                vHeight = viewport[3],
                n = NEAR_RANGE,
                f = FAR_RANGE;

            // convert: clip space -> NDC -> window coords
            // implicit 1.0 for w component
            set(tmp4, vec[0], vec[1], vec[2], 1.0);

            // transform into clip space
            transformMat4(tmp4, tmp4, combinedProjView);

            // now transform into NDC
            var w = tmp4[3];
            if (w !== 0) {
                // how to handle infinity here?
                tmp4[0] = tmp4[0] / w;
                tmp4[1] = tmp4[1] / w;
                tmp4[2] = tmp4[2] / w;
            }

            // and finally into window coordinates
            // the foruth component is (1/clip.w)
            // which is the same as gl_FragCoord.w
            out[0] = vX + vWidth / 2 * tmp4[0] + (0 + vWidth / 2);
            out[1] = vY + vHeight / 2 * tmp4[1] + (0 + vHeight / 2);
            out[2] = (f - n) / 2 * tmp4[2] + (f + n) / 2;
            out[3] = w === 0 ? 0 : 1 / w;
            return out;
        }
    }, { "gl-vec4/set": 39, "gl-vec4/transformMat4": 40 }], 11: [function (require, module, exports) {
        var transform = require('./lib/projectMat4');

        module.exports = unproject;

        /**
         * Unproject a point from screen space to 3D space.
         * The point should have its x and y properties set to
         * 2D screen space, and the z either at 0 (near plane)
         * or 1 (far plane). The provided matrix is assumed to already
         * be combined, i.e. projection * view.
         *
         * After this operation, the out vector's [x, y, z] components will
         * represent the unprojected 3D coordinate.
         *
         * @param  {vec3} out               the output vector
         * @param  {vec3} vec               the 2D space vector to unproject
         * @param  {vec4} viewport          screen x, y, width and height in pixels
         * @param  {mat4} invProjectionView combined projection and view matrix
         * @return {vec3}                   the output vector
         */
        function unproject(out, vec, viewport, invProjectionView) {
            var viewX = viewport[0],
                viewY = viewport[1],
                viewWidth = viewport[2],
                viewHeight = viewport[3];

            var x = vec[0],
                y = vec[1],
                z = vec[2];

            x = x - viewX;
            y = viewHeight - y - 1;
            y = y - viewY;

            out[0] = 2 * x / viewWidth - 1;
            out[1] = 2 * y / viewHeight - 1;
            out[2] = 2 * z - 1;
            return transform(out, out, invProjectionView);
        }
    }, { "./lib/projectMat4": 12 }], 12: [function (require, module, exports) {
        module.exports = project;

        /**
         * Multiplies the input vec by the specified matrix, 
         * applying a W divide, and stores the result in out 
         * vector. This is useful for projection,
         * e.g. unprojecting a 2D point into 3D space.
         *
         * @method  prj
         * @param {vec3} out the output vector
         * @param {vec3} vec the input vector to project
         * @param {mat4} m the 4x4 matrix to multiply with 
         * @return {vec3} the out vector
         */
        function project(out, vec, m) {
            var x = vec[0],
                y = vec[1],
                z = vec[2],
                a00 = m[0],
                a01 = m[1],
                a02 = m[2],
                a03 = m[3],
                a10 = m[4],
                a11 = m[5],
                a12 = m[6],
                a13 = m[7],
                a20 = m[8],
                a21 = m[9],
                a22 = m[10],
                a23 = m[11],
                a30 = m[12],
                a31 = m[13],
                a32 = m[14],
                a33 = m[15];

            var lw = 1 / (x * a03 + y * a13 + z * a23 + a33);

            out[0] = (x * a00 + y * a10 + z * a20 + a30) * lw;
            out[1] = (x * a01 + y * a11 + z * a21 + a31) * lw;
            out[2] = (x * a02 + y * a12 + z * a22 + a32) * lw;
            return out;
        }
    }, {}], 13: [function (require, module, exports) {
        module.exports = function () {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] !== undefined) return arguments[i];
            }
        };
    }, {}], 14: [function (require, module, exports) {
        module.exports = identity;

        /**
         * Set a mat4 to the identity matrix
         *
         * @param {mat4} out the receiving matrix
         * @returns {mat4} out
         */
        function identity(out) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = 1;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 1;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        };
    }, {}], 15: [function (require, module, exports) {
        module.exports = invert;

        /**
         * Inverts a mat4
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the source matrix
         * @returns {mat4} out
         */
        function invert(out, a) {
            var a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a03 = a[3],
                a10 = a[4],
                a11 = a[5],
                a12 = a[6],
                a13 = a[7],
                a20 = a[8],
                a21 = a[9],
                a22 = a[10],
                a23 = a[11],
                a30 = a[12],
                a31 = a[13],
                a32 = a[14],
                a33 = a[15],
                b00 = a00 * a11 - a01 * a10,
                b01 = a00 * a12 - a02 * a10,
                b02 = a00 * a13 - a03 * a10,
                b03 = a01 * a12 - a02 * a11,
                b04 = a01 * a13 - a03 * a11,
                b05 = a02 * a13 - a03 * a12,
                b06 = a20 * a31 - a21 * a30,
                b07 = a20 * a32 - a22 * a30,
                b08 = a20 * a33 - a23 * a30,
                b09 = a21 * a32 - a22 * a31,
                b10 = a21 * a33 - a23 * a31,
                b11 = a22 * a33 - a23 * a32,


            // Calculate the determinant
            det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

            if (!det) {
                return null;
            }
            det = 1.0 / det;

            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
            out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
            out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
            out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
            out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
            out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
            out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
            out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
            out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
            out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

            return out;
        };
    }, {}], 16: [function (require, module, exports) {
        var identity = require('./identity');

        module.exports = lookAt;

        /**
         * Generates a look-at matrix with the given eye position, focal point, and up axis
         *
         * @param {mat4} out mat4 frustum matrix will be written into
         * @param {vec3} eye Position of the viewer
         * @param {vec3} center Point the viewer is looking at
         * @param {vec3} up vec3 pointing up
         * @returns {mat4} out
         */
        function lookAt(out, eye, center, up) {
            var x0,
                x1,
                x2,
                y0,
                y1,
                y2,
                z0,
                z1,
                z2,
                len,
                eyex = eye[0],
                eyey = eye[1],
                eyez = eye[2],
                upx = up[0],
                upy = up[1],
                upz = up[2],
                centerx = center[0],
                centery = center[1],
                centerz = center[2];

            if (Math.abs(eyex - centerx) < 0.000001 && Math.abs(eyey - centery) < 0.000001 && Math.abs(eyez - centerz) < 0.000001) {
                return identity(out);
            }

            z0 = eyex - centerx;
            z1 = eyey - centery;
            z2 = eyez - centerz;

            len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
            z0 *= len;
            z1 *= len;
            z2 *= len;

            x0 = upy * z2 - upz * z1;
            x1 = upz * z0 - upx * z2;
            x2 = upx * z1 - upy * z0;
            len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
            if (!len) {
                x0 = 0;
                x1 = 0;
                x2 = 0;
            } else {
                len = 1 / len;
                x0 *= len;
                x1 *= len;
                x2 *= len;
            }

            y0 = z1 * x2 - z2 * x1;
            y1 = z2 * x0 - z0 * x2;
            y2 = z0 * x1 - z1 * x0;

            len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
            if (!len) {
                y0 = 0;
                y1 = 0;
                y2 = 0;
            } else {
                len = 1 / len;
                y0 *= len;
                y1 *= len;
                y2 *= len;
            }

            out[0] = x0;
            out[1] = y0;
            out[2] = z0;
            out[3] = 0;
            out[4] = x1;
            out[5] = y1;
            out[6] = z1;
            out[7] = 0;
            out[8] = x2;
            out[9] = y2;
            out[10] = z2;
            out[11] = 0;
            out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
            out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
            out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
            out[15] = 1;

            return out;
        };
    }, { "./identity": 14 }], 17: [function (require, module, exports) {
        module.exports = multiply;

        /**
         * Multiplies two mat4's
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the first operand
         * @param {mat4} b the second operand
         * @returns {mat4} out
         */
        function multiply(out, a, b) {
            var a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a03 = a[3],
                a10 = a[4],
                a11 = a[5],
                a12 = a[6],
                a13 = a[7],
                a20 = a[8],
                a21 = a[9],
                a22 = a[10],
                a23 = a[11],
                a30 = a[12],
                a31 = a[13],
                a32 = a[14],
                a33 = a[15];

            // Cache only the current line of the second matrix
            var b0 = b[0],
                b1 = b[1],
                b2 = b[2],
                b3 = b[3];
            out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[4];b1 = b[5];b2 = b[6];b3 = b[7];
            out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[8];b1 = b[9];b2 = b[10];b3 = b[11];
            out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[12];b1 = b[13];b2 = b[14];b3 = b[15];
            out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
            return out;
        };
    }, {}], 18: [function (require, module, exports) {
        module.exports = perspective;

        /**
         * Generates a perspective projection matrix with the given bounds
         *
         * @param {mat4} out mat4 frustum matrix will be written into
         * @param {number} fovy Vertical field of view in radians
         * @param {number} aspect Aspect ratio. typically viewport width/height
         * @param {number} near Near bound of the frustum
         * @param {number} far Far bound of the frustum
         * @returns {mat4} out
         */
        function perspective(out, fovy, aspect, near, far) {
            var f = 1.0 / Math.tan(fovy / 2),
                nf = 1 / (near - far);
            out[0] = f / aspect;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = f;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = (far + near) * nf;
            out[11] = -1;
            out[12] = 0;
            out[13] = 0;
            out[14] = 2 * far * near * nf;
            out[15] = 0;
            return out;
        };
    }, {}], 19: [function (require, module, exports) {
        /**
         * @fileoverview gl-matrix - High performance matrix and vector operations
         * @author Brandon Jones
         * @author Colin MacKenzie IV
         * @version 2.3.2
         */

        /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
        
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
        
        The above copyright notice and this permission notice shall be included in
        all copies or substantial portions of the Software.
        
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE. */
        // END HEADER

        exports.glMatrix = require("./gl-matrix/common.js");
        exports.mat2 = require("./gl-matrix/mat2.js");
        exports.mat2d = require("./gl-matrix/mat2d.js");
        exports.mat3 = require("./gl-matrix/mat3.js");
        exports.mat4 = require("./gl-matrix/mat4.js");
        exports.quat = require("./gl-matrix/quat.js");
        exports.vec2 = require("./gl-matrix/vec2.js");
        exports.vec3 = require("./gl-matrix/vec3.js");
        exports.vec4 = require("./gl-matrix/vec4.js");
    }, { "./gl-matrix/common.js": 20, "./gl-matrix/mat2.js": 21, "./gl-matrix/mat2d.js": 22, "./gl-matrix/mat3.js": 23, "./gl-matrix/mat4.js": 24, "./gl-matrix/quat.js": 25, "./gl-matrix/vec2.js": 26, "./gl-matrix/vec3.js": 27, "./gl-matrix/vec4.js": 28 }], 20: [function (require, module, exports) {
        /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
        
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
        
        The above copyright notice and this permission notice shall be included in
        all copies or substantial portions of the Software.
        
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE. */

        /**
         * @class Common utilities
         * @name glMatrix
         */
        var glMatrix = {};

        // Configuration Constants
        glMatrix.EPSILON = 0.000001;
        glMatrix.ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
        glMatrix.RANDOM = Math.random;
        glMatrix.ENABLE_SIMD = false;

        // Capability detection
        glMatrix.SIMD_AVAILABLE = glMatrix.ARRAY_TYPE === Float32Array && 'SIMD' in this;
        glMatrix.USE_SIMD = glMatrix.ENABLE_SIMD && glMatrix.SIMD_AVAILABLE;

        /**
         * Sets the type of array used when creating new vectors and matrices
         *
         * @param {Type} type Array type, such as Float32Array or Array
         */
        glMatrix.setMatrixArrayType = function (type) {
            glMatrix.ARRAY_TYPE = type;
        };

        var degree = Math.PI / 180;

        /**
        * Convert Degree To Radian
        *
        * @param {Number} Angle in Degrees
        */
        glMatrix.toRadian = function (a) {
            return a * degree;
        };

        /**
         * Tests whether or not the arguments have approximately the same value, within an absolute
         * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less 
         * than or equal to 1.0, and a relative tolerance is used for larger values)
         * 
         * @param {Number} a The first number to test.
         * @param {Number} b The second number to test.
         * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
         */
        glMatrix.equals = function (a, b) {
            return Math.abs(a - b) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
        };

        module.exports = glMatrix;
    }, {}], 21: [function (require, module, exports) {
        /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
        
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
        
        The above copyright notice and this permission notice shall be included in
        all copies or substantial portions of the Software.
        
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE. */

        var glMatrix = require("./common.js");

        /**
         * @class 2x2 Matrix
         * @name mat2
         */
        var mat2 = {};

        /**
         * Creates a new identity mat2
         *
         * @returns {mat2} a new 2x2 matrix
         */
        mat2.create = function () {
            var out = new glMatrix.ARRAY_TYPE(4);
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        };

        /**
         * Creates a new mat2 initialized with values from an existing matrix
         *
         * @param {mat2} a matrix to clone
         * @returns {mat2} a new 2x2 matrix
         */
        mat2.clone = function (a) {
            var out = new glMatrix.ARRAY_TYPE(4);
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            return out;
        };

        /**
         * Copy the values from one mat2 to another
         *
         * @param {mat2} out the receiving matrix
         * @param {mat2} a the source matrix
         * @returns {mat2} out
         */
        mat2.copy = function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            return out;
        };

        /**
         * Set a mat2 to the identity matrix
         *
         * @param {mat2} out the receiving matrix
         * @returns {mat2} out
         */
        mat2.identity = function (out) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        };

        /**
         * Create a new mat2 with the given values
         *
         * @param {Number} m00 Component in column 0, row 0 position (index 0)
         * @param {Number} m01 Component in column 0, row 1 position (index 1)
         * @param {Number} m10 Component in column 1, row 0 position (index 2)
         * @param {Number} m11 Component in column 1, row 1 position (index 3)
         * @returns {mat2} out A new 2x2 matrix
         */
        mat2.fromValues = function (m00, m01, m10, m11) {
            var out = new glMatrix.ARRAY_TYPE(4);
            out[0] = m00;
            out[1] = m01;
            out[2] = m10;
            out[3] = m11;
            return out;
        };

        /**
         * Set the components of a mat2 to the given values
         *
         * @param {mat2} out the receiving matrix
         * @param {Number} m00 Component in column 0, row 0 position (index 0)
         * @param {Number} m01 Component in column 0, row 1 position (index 1)
         * @param {Number} m10 Component in column 1, row 0 position (index 2)
         * @param {Number} m11 Component in column 1, row 1 position (index 3)
         * @returns {mat2} out
         */
        mat2.set = function (out, m00, m01, m10, m11) {
            out[0] = m00;
            out[1] = m01;
            out[2] = m10;
            out[3] = m11;
            return out;
        };

        /**
         * Transpose the values of a mat2
         *
         * @param {mat2} out the receiving matrix
         * @param {mat2} a the source matrix
         * @returns {mat2} out
         */
        mat2.transpose = function (out, a) {
            // If we are transposing ourselves we can skip a few steps but have to cache some values
            if (out === a) {
                var a1 = a[1];
                out[1] = a[2];
                out[2] = a1;
            } else {
                out[0] = a[0];
                out[1] = a[2];
                out[2] = a[1];
                out[3] = a[3];
            }

            return out;
        };

        /**
         * Inverts a mat2
         *
         * @param {mat2} out the receiving matrix
         * @param {mat2} a the source matrix
         * @returns {mat2} out
         */
        mat2.invert = function (out, a) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3],


            // Calculate the determinant
            det = a0 * a3 - a2 * a1;

            if (!det) {
                return null;
            }
            det = 1.0 / det;

            out[0] = a3 * det;
            out[1] = -a1 * det;
            out[2] = -a2 * det;
            out[3] = a0 * det;

            return out;
        };

        /**
         * Calculates the adjugate of a mat2
         *
         * @param {mat2} out the receiving matrix
         * @param {mat2} a the source matrix
         * @returns {mat2} out
         */
        mat2.adjoint = function (out, a) {
            // Caching this value is nessecary if out == a
            var a0 = a[0];
            out[0] = a[3];
            out[1] = -a[1];
            out[2] = -a[2];
            out[3] = a0;

            return out;
        };

        /**
         * Calculates the determinant of a mat2
         *
         * @param {mat2} a the source matrix
         * @returns {Number} determinant of a
         */
        mat2.determinant = function (a) {
            return a[0] * a[3] - a[2] * a[1];
        };

        /**
         * Multiplies two mat2's
         *
         * @param {mat2} out the receiving matrix
         * @param {mat2} a the first operand
         * @param {mat2} b the second operand
         * @returns {mat2} out
         */
        mat2.multiply = function (out, a, b) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3];
            var b0 = b[0],
                b1 = b[1],
                b2 = b[2],
                b3 = b[3];
            out[0] = a0 * b0 + a2 * b1;
            out[1] = a1 * b0 + a3 * b1;
            out[2] = a0 * b2 + a2 * b3;
            out[3] = a1 * b2 + a3 * b3;
            return out;
        };

        /**
         * Alias for {@link mat2.multiply}
         * @function
         */
        mat2.mul = mat2.multiply;

        /**
         * Rotates a mat2 by the given angle
         *
         * @param {mat2} out the receiving matrix
         * @param {mat2} a the matrix to rotate
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat2} out
         */
        mat2.rotate = function (out, a, rad) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3],
                s = Math.sin(rad),
                c = Math.cos(rad);
            out[0] = a0 * c + a2 * s;
            out[1] = a1 * c + a3 * s;
            out[2] = a0 * -s + a2 * c;
            out[3] = a1 * -s + a3 * c;
            return out;
        };

        /**
         * Scales the mat2 by the dimensions in the given vec2
         *
         * @param {mat2} out the receiving matrix
         * @param {mat2} a the matrix to rotate
         * @param {vec2} v the vec2 to scale the matrix by
         * @returns {mat2} out
         **/
        mat2.scale = function (out, a, v) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3],
                v0 = v[0],
                v1 = v[1];
            out[0] = a0 * v0;
            out[1] = a1 * v0;
            out[2] = a2 * v1;
            out[3] = a3 * v1;
            return out;
        };

        /**
         * Creates a matrix from a given angle
         * This is equivalent to (but much faster than):
         *
         *     mat2.identity(dest);
         *     mat2.rotate(dest, dest, rad);
         *
         * @param {mat2} out mat2 receiving operation result
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat2} out
         */
        mat2.fromRotation = function (out, rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad);
            out[0] = c;
            out[1] = s;
            out[2] = -s;
            out[3] = c;
            return out;
        };

        /**
         * Creates a matrix from a vector scaling
         * This is equivalent to (but much faster than):
         *
         *     mat2.identity(dest);
         *     mat2.scale(dest, dest, vec);
         *
         * @param {mat2} out mat2 receiving operation result
         * @param {vec2} v Scaling vector
         * @returns {mat2} out
         */
        mat2.fromScaling = function (out, v) {
            out[0] = v[0];
            out[1] = 0;
            out[2] = 0;
            out[3] = v[1];
            return out;
        };

        /**
         * Returns a string representation of a mat2
         *
         * @param {mat2} mat matrix to represent as a string
         * @returns {String} string representation of the matrix
         */
        mat2.str = function (a) {
            return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
        };

        /**
         * Returns Frobenius norm of a mat2
         *
         * @param {mat2} a the matrix to calculate Frobenius norm of
         * @returns {Number} Frobenius norm
         */
        mat2.frob = function (a) {
            return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2));
        };

        /**
         * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
         * @param {mat2} L the lower triangular matrix 
         * @param {mat2} D the diagonal matrix 
         * @param {mat2} U the upper triangular matrix 
         * @param {mat2} a the input matrix to factorize
         */

        mat2.LDU = function (L, D, U, a) {
            L[2] = a[2] / a[0];
            U[0] = a[0];
            U[1] = a[1];
            U[3] = a[3] - L[2] * U[1];
            return [L, D, U];
        };

        /**
         * Adds two mat2's
         *
         * @param {mat2} out the receiving matrix
         * @param {mat2} a the first operand
         * @param {mat2} b the second operand
         * @returns {mat2} out
         */
        mat2.add = function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            out[3] = a[3] + b[3];
            return out;
        };

        /**
         * Subtracts matrix b from matrix a
         *
         * @param {mat2} out the receiving matrix
         * @param {mat2} a the first operand
         * @param {mat2} b the second operand
         * @returns {mat2} out
         */
        mat2.subtract = function (out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            out[3] = a[3] - b[3];
            return out;
        };

        /**
         * Alias for {@link mat2.subtract}
         * @function
         */
        mat2.sub = mat2.subtract;

        /**
         * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
         *
         * @param {mat2} a The first matrix.
         * @param {mat2} b The second matrix.
         * @returns {Boolean} True if the matrices are equal, false otherwise.
         */
        mat2.exactEquals = function (a, b) {
            return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
        };

        /**
         * Returns whether or not the matrices have approximately the same elements in the same position.
         *
         * @param {mat2} a The first matrix.
         * @param {mat2} b The second matrix.
         * @returns {Boolean} True if the matrices are equal, false otherwise.
         */
        mat2.equals = function (a, b) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3];
            var b0 = b[0],
                b1 = b[1],
                b2 = b[2],
                b3 = b[3];
            return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3));
        };

        /**
         * Multiply each element of the matrix by a scalar.
         *
         * @param {mat2} out the receiving matrix
         * @param {mat2} a the matrix to scale
         * @param {Number} b amount to scale the matrix's elements by
         * @returns {mat2} out
         */
        mat2.multiplyScalar = function (out, a, b) {
            out[0] = a[0] * b;
            out[1] = a[1] * b;
            out[2] = a[2] * b;
            out[3] = a[3] * b;
            return out;
        };

        /**
         * Adds two mat2's after multiplying each element of the second operand by a scalar value.
         *
         * @param {mat2} out the receiving vector
         * @param {mat2} a the first operand
         * @param {mat2} b the second operand
         * @param {Number} scale the amount to scale b's elements by before adding
         * @returns {mat2} out
         */
        mat2.multiplyScalarAndAdd = function (out, a, b, scale) {
            out[0] = a[0] + b[0] * scale;
            out[1] = a[1] + b[1] * scale;
            out[2] = a[2] + b[2] * scale;
            out[3] = a[3] + b[3] * scale;
            return out;
        };

        module.exports = mat2;
    }, { "./common.js": 20 }], 22: [function (require, module, exports) {
        /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
        
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
        
        The above copyright notice and this permission notice shall be included in
        all copies or substantial portions of the Software.
        
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE. */

        var glMatrix = require("./common.js");

        /**
         * @class 2x3 Matrix
         * @name mat2d
         * 
         * @description 
         * A mat2d contains six elements defined as:
         * <pre>
         * [a, c, tx,
         *  b, d, ty]
         * </pre>
         * This is a short form for the 3x3 matrix:
         * <pre>
         * [a, c, tx,
         *  b, d, ty,
         *  0, 0, 1]
         * </pre>
         * The last row is ignored so the array is shorter and operations are faster.
         */
        var mat2d = {};

        /**
         * Creates a new identity mat2d
         *
         * @returns {mat2d} a new 2x3 matrix
         */
        mat2d.create = function () {
            var out = new glMatrix.ARRAY_TYPE(6);
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            out[4] = 0;
            out[5] = 0;
            return out;
        };

        /**
         * Creates a new mat2d initialized with values from an existing matrix
         *
         * @param {mat2d} a matrix to clone
         * @returns {mat2d} a new 2x3 matrix
         */
        mat2d.clone = function (a) {
            var out = new glMatrix.ARRAY_TYPE(6);
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            return out;
        };

        /**
         * Copy the values from one mat2d to another
         *
         * @param {mat2d} out the receiving matrix
         * @param {mat2d} a the source matrix
         * @returns {mat2d} out
         */
        mat2d.copy = function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            return out;
        };

        /**
         * Set a mat2d to the identity matrix
         *
         * @param {mat2d} out the receiving matrix
         * @returns {mat2d} out
         */
        mat2d.identity = function (out) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            out[4] = 0;
            out[5] = 0;
            return out;
        };

        /**
         * Create a new mat2d with the given values
         *
         * @param {Number} a Component A (index 0)
         * @param {Number} b Component B (index 1)
         * @param {Number} c Component C (index 2)
         * @param {Number} d Component D (index 3)
         * @param {Number} tx Component TX (index 4)
         * @param {Number} ty Component TY (index 5)
         * @returns {mat2d} A new mat2d
         */
        mat2d.fromValues = function (a, b, c, d, tx, ty) {
            var out = new glMatrix.ARRAY_TYPE(6);
            out[0] = a;
            out[1] = b;
            out[2] = c;
            out[3] = d;
            out[4] = tx;
            out[5] = ty;
            return out;
        };

        /**
         * Set the components of a mat2d to the given values
         *
         * @param {mat2d} out the receiving matrix
         * @param {Number} a Component A (index 0)
         * @param {Number} b Component B (index 1)
         * @param {Number} c Component C (index 2)
         * @param {Number} d Component D (index 3)
         * @param {Number} tx Component TX (index 4)
         * @param {Number} ty Component TY (index 5)
         * @returns {mat2d} out
         */
        mat2d.set = function (out, a, b, c, d, tx, ty) {
            out[0] = a;
            out[1] = b;
            out[2] = c;
            out[3] = d;
            out[4] = tx;
            out[5] = ty;
            return out;
        };

        /**
         * Inverts a mat2d
         *
         * @param {mat2d} out the receiving matrix
         * @param {mat2d} a the source matrix
         * @returns {mat2d} out
         */
        mat2d.invert = function (out, a) {
            var aa = a[0],
                ab = a[1],
                ac = a[2],
                ad = a[3],
                atx = a[4],
                aty = a[5];

            var det = aa * ad - ab * ac;
            if (!det) {
                return null;
            }
            det = 1.0 / det;

            out[0] = ad * det;
            out[1] = -ab * det;
            out[2] = -ac * det;
            out[3] = aa * det;
            out[4] = (ac * aty - ad * atx) * det;
            out[5] = (ab * atx - aa * aty) * det;
            return out;
        };

        /**
         * Calculates the determinant of a mat2d
         *
         * @param {mat2d} a the source matrix
         * @returns {Number} determinant of a
         */
        mat2d.determinant = function (a) {
            return a[0] * a[3] - a[1] * a[2];
        };

        /**
         * Multiplies two mat2d's
         *
         * @param {mat2d} out the receiving matrix
         * @param {mat2d} a the first operand
         * @param {mat2d} b the second operand
         * @returns {mat2d} out
         */
        mat2d.multiply = function (out, a, b) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3],
                a4 = a[4],
                a5 = a[5],
                b0 = b[0],
                b1 = b[1],
                b2 = b[2],
                b3 = b[3],
                b4 = b[4],
                b5 = b[5];
            out[0] = a0 * b0 + a2 * b1;
            out[1] = a1 * b0 + a3 * b1;
            out[2] = a0 * b2 + a2 * b3;
            out[3] = a1 * b2 + a3 * b3;
            out[4] = a0 * b4 + a2 * b5 + a4;
            out[5] = a1 * b4 + a3 * b5 + a5;
            return out;
        };

        /**
         * Alias for {@link mat2d.multiply}
         * @function
         */
        mat2d.mul = mat2d.multiply;

        /**
         * Rotates a mat2d by the given angle
         *
         * @param {mat2d} out the receiving matrix
         * @param {mat2d} a the matrix to rotate
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat2d} out
         */
        mat2d.rotate = function (out, a, rad) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3],
                a4 = a[4],
                a5 = a[5],
                s = Math.sin(rad),
                c = Math.cos(rad);
            out[0] = a0 * c + a2 * s;
            out[1] = a1 * c + a3 * s;
            out[2] = a0 * -s + a2 * c;
            out[3] = a1 * -s + a3 * c;
            out[4] = a4;
            out[5] = a5;
            return out;
        };

        /**
         * Scales the mat2d by the dimensions in the given vec2
         *
         * @param {mat2d} out the receiving matrix
         * @param {mat2d} a the matrix to translate
         * @param {vec2} v the vec2 to scale the matrix by
         * @returns {mat2d} out
         **/
        mat2d.scale = function (out, a, v) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3],
                a4 = a[4],
                a5 = a[5],
                v0 = v[0],
                v1 = v[1];
            out[0] = a0 * v0;
            out[1] = a1 * v0;
            out[2] = a2 * v1;
            out[3] = a3 * v1;
            out[4] = a4;
            out[5] = a5;
            return out;
        };

        /**
         * Translates the mat2d by the dimensions in the given vec2
         *
         * @param {mat2d} out the receiving matrix
         * @param {mat2d} a the matrix to translate
         * @param {vec2} v the vec2 to translate the matrix by
         * @returns {mat2d} out
         **/
        mat2d.translate = function (out, a, v) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3],
                a4 = a[4],
                a5 = a[5],
                v0 = v[0],
                v1 = v[1];
            out[0] = a0;
            out[1] = a1;
            out[2] = a2;
            out[3] = a3;
            out[4] = a0 * v0 + a2 * v1 + a4;
            out[5] = a1 * v0 + a3 * v1 + a5;
            return out;
        };

        /**
         * Creates a matrix from a given angle
         * This is equivalent to (but much faster than):
         *
         *     mat2d.identity(dest);
         *     mat2d.rotate(dest, dest, rad);
         *
         * @param {mat2d} out mat2d receiving operation result
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat2d} out
         */
        mat2d.fromRotation = function (out, rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad);
            out[0] = c;
            out[1] = s;
            out[2] = -s;
            out[3] = c;
            out[4] = 0;
            out[5] = 0;
            return out;
        };

        /**
         * Creates a matrix from a vector scaling
         * This is equivalent to (but much faster than):
         *
         *     mat2d.identity(dest);
         *     mat2d.scale(dest, dest, vec);
         *
         * @param {mat2d} out mat2d receiving operation result
         * @param {vec2} v Scaling vector
         * @returns {mat2d} out
         */
        mat2d.fromScaling = function (out, v) {
            out[0] = v[0];
            out[1] = 0;
            out[2] = 0;
            out[3] = v[1];
            out[4] = 0;
            out[5] = 0;
            return out;
        };

        /**
         * Creates a matrix from a vector translation
         * This is equivalent to (but much faster than):
         *
         *     mat2d.identity(dest);
         *     mat2d.translate(dest, dest, vec);
         *
         * @param {mat2d} out mat2d receiving operation result
         * @param {vec2} v Translation vector
         * @returns {mat2d} out
         */
        mat2d.fromTranslation = function (out, v) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            out[4] = v[0];
            out[5] = v[1];
            return out;
        };

        /**
         * Returns a string representation of a mat2d
         *
         * @param {mat2d} a matrix to represent as a string
         * @returns {String} string representation of the matrix
         */
        mat2d.str = function (a) {
            return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ')';
        };

        /**
         * Returns Frobenius norm of a mat2d
         *
         * @param {mat2d} a the matrix to calculate Frobenius norm of
         * @returns {Number} Frobenius norm
         */
        mat2d.frob = function (a) {
            return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1);
        };

        /**
         * Adds two mat2d's
         *
         * @param {mat2d} out the receiving matrix
         * @param {mat2d} a the first operand
         * @param {mat2d} b the second operand
         * @returns {mat2d} out
         */
        mat2d.add = function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            out[3] = a[3] + b[3];
            out[4] = a[4] + b[4];
            out[5] = a[5] + b[5];
            return out;
        };

        /**
         * Subtracts matrix b from matrix a
         *
         * @param {mat2d} out the receiving matrix
         * @param {mat2d} a the first operand
         * @param {mat2d} b the second operand
         * @returns {mat2d} out
         */
        mat2d.subtract = function (out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            out[3] = a[3] - b[3];
            out[4] = a[4] - b[4];
            out[5] = a[5] - b[5];
            return out;
        };

        /**
         * Alias for {@link mat2d.subtract}
         * @function
         */
        mat2d.sub = mat2d.subtract;

        /**
         * Multiply each element of the matrix by a scalar.
         *
         * @param {mat2d} out the receiving matrix
         * @param {mat2d} a the matrix to scale
         * @param {Number} b amount to scale the matrix's elements by
         * @returns {mat2d} out
         */
        mat2d.multiplyScalar = function (out, a, b) {
            out[0] = a[0] * b;
            out[1] = a[1] * b;
            out[2] = a[2] * b;
            out[3] = a[3] * b;
            out[4] = a[4] * b;
            out[5] = a[5] * b;
            return out;
        };

        /**
         * Adds two mat2d's after multiplying each element of the second operand by a scalar value.
         *
         * @param {mat2d} out the receiving vector
         * @param {mat2d} a the first operand
         * @param {mat2d} b the second operand
         * @param {Number} scale the amount to scale b's elements by before adding
         * @returns {mat2d} out
         */
        mat2d.multiplyScalarAndAdd = function (out, a, b, scale) {
            out[0] = a[0] + b[0] * scale;
            out[1] = a[1] + b[1] * scale;
            out[2] = a[2] + b[2] * scale;
            out[3] = a[3] + b[3] * scale;
            out[4] = a[4] + b[4] * scale;
            out[5] = a[5] + b[5] * scale;
            return out;
        };

        /**
         * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
         *
         * @param {mat2d} a The first matrix.
         * @param {mat2d} b The second matrix.
         * @returns {Boolean} True if the matrices are equal, false otherwise.
         */
        mat2d.exactEquals = function (a, b) {
            return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
        };

        /**
         * Returns whether or not the matrices have approximately the same elements in the same position.
         *
         * @param {mat2d} a The first matrix.
         * @param {mat2d} b The second matrix.
         * @returns {Boolean} True if the matrices are equal, false otherwise.
         */
        mat2d.equals = function (a, b) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3],
                a4 = a[4],
                a5 = a[5];
            var b0 = b[0],
                b1 = b[1],
                b2 = b[2],
                b3 = b[3],
                b4 = b[4],
                b5 = b[5];
            return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5));
        };

        module.exports = mat2d;
    }, { "./common.js": 20 }], 23: [function (require, module, exports) {
        /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
        
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
        
        The above copyright notice and this permission notice shall be included in
        all copies or substantial portions of the Software.
        
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE. */

        var glMatrix = require("./common.js");

        /**
         * @class 3x3 Matrix
         * @name mat3
         */
        var mat3 = {};

        /**
         * Creates a new identity mat3
         *
         * @returns {mat3} a new 3x3 matrix
         */
        mat3.create = function () {
            var out = new glMatrix.ARRAY_TYPE(9);
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 1;
            out[5] = 0;
            out[6] = 0;
            out[7] = 0;
            out[8] = 1;
            return out;
        };

        /**
         * Copies the upper-left 3x3 values into the given mat3.
         *
         * @param {mat3} out the receiving 3x3 matrix
         * @param {mat4} a   the source 4x4 matrix
         * @returns {mat3} out
         */
        mat3.fromMat4 = function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[4];
            out[4] = a[5];
            out[5] = a[6];
            out[6] = a[8];
            out[7] = a[9];
            out[8] = a[10];
            return out;
        };

        /**
         * Creates a new mat3 initialized with values from an existing matrix
         *
         * @param {mat3} a matrix to clone
         * @returns {mat3} a new 3x3 matrix
         */
        mat3.clone = function (a) {
            var out = new glMatrix.ARRAY_TYPE(9);
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
            return out;
        };

        /**
         * Copy the values from one mat3 to another
         *
         * @param {mat3} out the receiving matrix
         * @param {mat3} a the source matrix
         * @returns {mat3} out
         */
        mat3.copy = function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
            return out;
        };

        /**
         * Create a new mat3 with the given values
         *
         * @param {Number} m00 Component in column 0, row 0 position (index 0)
         * @param {Number} m01 Component in column 0, row 1 position (index 1)
         * @param {Number} m02 Component in column 0, row 2 position (index 2)
         * @param {Number} m10 Component in column 1, row 0 position (index 3)
         * @param {Number} m11 Component in column 1, row 1 position (index 4)
         * @param {Number} m12 Component in column 1, row 2 position (index 5)
         * @param {Number} m20 Component in column 2, row 0 position (index 6)
         * @param {Number} m21 Component in column 2, row 1 position (index 7)
         * @param {Number} m22 Component in column 2, row 2 position (index 8)
         * @returns {mat3} A new mat3
         */
        mat3.fromValues = function (m00, m01, m02, m10, m11, m12, m20, m21, m22) {
            var out = new glMatrix.ARRAY_TYPE(9);
            out[0] = m00;
            out[1] = m01;
            out[2] = m02;
            out[3] = m10;
            out[4] = m11;
            out[5] = m12;
            out[6] = m20;
            out[7] = m21;
            out[8] = m22;
            return out;
        };

        /**
         * Set the components of a mat3 to the given values
         *
         * @param {mat3} out the receiving matrix
         * @param {Number} m00 Component in column 0, row 0 position (index 0)
         * @param {Number} m01 Component in column 0, row 1 position (index 1)
         * @param {Number} m02 Component in column 0, row 2 position (index 2)
         * @param {Number} m10 Component in column 1, row 0 position (index 3)
         * @param {Number} m11 Component in column 1, row 1 position (index 4)
         * @param {Number} m12 Component in column 1, row 2 position (index 5)
         * @param {Number} m20 Component in column 2, row 0 position (index 6)
         * @param {Number} m21 Component in column 2, row 1 position (index 7)
         * @param {Number} m22 Component in column 2, row 2 position (index 8)
         * @returns {mat3} out
         */
        mat3.set = function (out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
            out[0] = m00;
            out[1] = m01;
            out[2] = m02;
            out[3] = m10;
            out[4] = m11;
            out[5] = m12;
            out[6] = m20;
            out[7] = m21;
            out[8] = m22;
            return out;
        };

        /**
         * Set a mat3 to the identity matrix
         *
         * @param {mat3} out the receiving matrix
         * @returns {mat3} out
         */
        mat3.identity = function (out) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 1;
            out[5] = 0;
            out[6] = 0;
            out[7] = 0;
            out[8] = 1;
            return out;
        };

        /**
         * Transpose the values of a mat3
         *
         * @param {mat3} out the receiving matrix
         * @param {mat3} a the source matrix
         * @returns {mat3} out
         */
        mat3.transpose = function (out, a) {
            // If we are transposing ourselves we can skip a few steps but have to cache some values
            if (out === a) {
                var a01 = a[1],
                    a02 = a[2],
                    a12 = a[5];
                out[1] = a[3];
                out[2] = a[6];
                out[3] = a01;
                out[5] = a[7];
                out[6] = a02;
                out[7] = a12;
            } else {
                out[0] = a[0];
                out[1] = a[3];
                out[2] = a[6];
                out[3] = a[1];
                out[4] = a[4];
                out[5] = a[7];
                out[6] = a[2];
                out[7] = a[5];
                out[8] = a[8];
            }

            return out;
        };

        /**
         * Inverts a mat3
         *
         * @param {mat3} out the receiving matrix
         * @param {mat3} a the source matrix
         * @returns {mat3} out
         */
        mat3.invert = function (out, a) {
            var a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a10 = a[3],
                a11 = a[4],
                a12 = a[5],
                a20 = a[6],
                a21 = a[7],
                a22 = a[8],
                b01 = a22 * a11 - a12 * a21,
                b11 = -a22 * a10 + a12 * a20,
                b21 = a21 * a10 - a11 * a20,


            // Calculate the determinant
            det = a00 * b01 + a01 * b11 + a02 * b21;

            if (!det) {
                return null;
            }
            det = 1.0 / det;

            out[0] = b01 * det;
            out[1] = (-a22 * a01 + a02 * a21) * det;
            out[2] = (a12 * a01 - a02 * a11) * det;
            out[3] = b11 * det;
            out[4] = (a22 * a00 - a02 * a20) * det;
            out[5] = (-a12 * a00 + a02 * a10) * det;
            out[6] = b21 * det;
            out[7] = (-a21 * a00 + a01 * a20) * det;
            out[8] = (a11 * a00 - a01 * a10) * det;
            return out;
        };

        /**
         * Calculates the adjugate of a mat3
         *
         * @param {mat3} out the receiving matrix
         * @param {mat3} a the source matrix
         * @returns {mat3} out
         */
        mat3.adjoint = function (out, a) {
            var a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a10 = a[3],
                a11 = a[4],
                a12 = a[5],
                a20 = a[6],
                a21 = a[7],
                a22 = a[8];

            out[0] = a11 * a22 - a12 * a21;
            out[1] = a02 * a21 - a01 * a22;
            out[2] = a01 * a12 - a02 * a11;
            out[3] = a12 * a20 - a10 * a22;
            out[4] = a00 * a22 - a02 * a20;
            out[5] = a02 * a10 - a00 * a12;
            out[6] = a10 * a21 - a11 * a20;
            out[7] = a01 * a20 - a00 * a21;
            out[8] = a00 * a11 - a01 * a10;
            return out;
        };

        /**
         * Calculates the determinant of a mat3
         *
         * @param {mat3} a the source matrix
         * @returns {Number} determinant of a
         */
        mat3.determinant = function (a) {
            var a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a10 = a[3],
                a11 = a[4],
                a12 = a[5],
                a20 = a[6],
                a21 = a[7],
                a22 = a[8];

            return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
        };

        /**
         * Multiplies two mat3's
         *
         * @param {mat3} out the receiving matrix
         * @param {mat3} a the first operand
         * @param {mat3} b the second operand
         * @returns {mat3} out
         */
        mat3.multiply = function (out, a, b) {
            var a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a10 = a[3],
                a11 = a[4],
                a12 = a[5],
                a20 = a[6],
                a21 = a[7],
                a22 = a[8],
                b00 = b[0],
                b01 = b[1],
                b02 = b[2],
                b10 = b[3],
                b11 = b[4],
                b12 = b[5],
                b20 = b[6],
                b21 = b[7],
                b22 = b[8];

            out[0] = b00 * a00 + b01 * a10 + b02 * a20;
            out[1] = b00 * a01 + b01 * a11 + b02 * a21;
            out[2] = b00 * a02 + b01 * a12 + b02 * a22;

            out[3] = b10 * a00 + b11 * a10 + b12 * a20;
            out[4] = b10 * a01 + b11 * a11 + b12 * a21;
            out[5] = b10 * a02 + b11 * a12 + b12 * a22;

            out[6] = b20 * a00 + b21 * a10 + b22 * a20;
            out[7] = b20 * a01 + b21 * a11 + b22 * a21;
            out[8] = b20 * a02 + b21 * a12 + b22 * a22;
            return out;
        };

        /**
         * Alias for {@link mat3.multiply}
         * @function
         */
        mat3.mul = mat3.multiply;

        /**
         * Translate a mat3 by the given vector
         *
         * @param {mat3} out the receiving matrix
         * @param {mat3} a the matrix to translate
         * @param {vec2} v vector to translate by
         * @returns {mat3} out
         */
        mat3.translate = function (out, a, v) {
            var a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a10 = a[3],
                a11 = a[4],
                a12 = a[5],
                a20 = a[6],
                a21 = a[7],
                a22 = a[8],
                x = v[0],
                y = v[1];

            out[0] = a00;
            out[1] = a01;
            out[2] = a02;

            out[3] = a10;
            out[4] = a11;
            out[5] = a12;

            out[6] = x * a00 + y * a10 + a20;
            out[7] = x * a01 + y * a11 + a21;
            out[8] = x * a02 + y * a12 + a22;
            return out;
        };

        /**
         * Rotates a mat3 by the given angle
         *
         * @param {mat3} out the receiving matrix
         * @param {mat3} a the matrix to rotate
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat3} out
         */
        mat3.rotate = function (out, a, rad) {
            var a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a10 = a[3],
                a11 = a[4],
                a12 = a[5],
                a20 = a[6],
                a21 = a[7],
                a22 = a[8],
                s = Math.sin(rad),
                c = Math.cos(rad);

            out[0] = c * a00 + s * a10;
            out[1] = c * a01 + s * a11;
            out[2] = c * a02 + s * a12;

            out[3] = c * a10 - s * a00;
            out[4] = c * a11 - s * a01;
            out[5] = c * a12 - s * a02;

            out[6] = a20;
            out[7] = a21;
            out[8] = a22;
            return out;
        };

        /**
         * Scales the mat3 by the dimensions in the given vec2
         *
         * @param {mat3} out the receiving matrix
         * @param {mat3} a the matrix to rotate
         * @param {vec2} v the vec2 to scale the matrix by
         * @returns {mat3} out
         **/
        mat3.scale = function (out, a, v) {
            var x = v[0],
                y = v[1];

            out[0] = x * a[0];
            out[1] = x * a[1];
            out[2] = x * a[2];

            out[3] = y * a[3];
            out[4] = y * a[4];
            out[5] = y * a[5];

            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
            return out;
        };

        /**
         * Creates a matrix from a vector translation
         * This is equivalent to (but much faster than):
         *
         *     mat3.identity(dest);
         *     mat3.translate(dest, dest, vec);
         *
         * @param {mat3} out mat3 receiving operation result
         * @param {vec2} v Translation vector
         * @returns {mat3} out
         */
        mat3.fromTranslation = function (out, v) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 1;
            out[5] = 0;
            out[6] = v[0];
            out[7] = v[1];
            out[8] = 1;
            return out;
        };

        /**
         * Creates a matrix from a given angle
         * This is equivalent to (but much faster than):
         *
         *     mat3.identity(dest);
         *     mat3.rotate(dest, dest, rad);
         *
         * @param {mat3} out mat3 receiving operation result
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat3} out
         */
        mat3.fromRotation = function (out, rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad);

            out[0] = c;
            out[1] = s;
            out[2] = 0;

            out[3] = -s;
            out[4] = c;
            out[5] = 0;

            out[6] = 0;
            out[7] = 0;
            out[8] = 1;
            return out;
        };

        /**
         * Creates a matrix from a vector scaling
         * This is equivalent to (but much faster than):
         *
         *     mat3.identity(dest);
         *     mat3.scale(dest, dest, vec);
         *
         * @param {mat3} out mat3 receiving operation result
         * @param {vec2} v Scaling vector
         * @returns {mat3} out
         */
        mat3.fromScaling = function (out, v) {
            out[0] = v[0];
            out[1] = 0;
            out[2] = 0;

            out[3] = 0;
            out[4] = v[1];
            out[5] = 0;

            out[6] = 0;
            out[7] = 0;
            out[8] = 1;
            return out;
        };

        /**
         * Copies the values from a mat2d into a mat3
         *
         * @param {mat3} out the receiving matrix
         * @param {mat2d} a the matrix to copy
         * @returns {mat3} out
         **/
        mat3.fromMat2d = function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = 0;

            out[3] = a[2];
            out[4] = a[3];
            out[5] = 0;

            out[6] = a[4];
            out[7] = a[5];
            out[8] = 1;
            return out;
        };

        /**
        * Calculates a 3x3 matrix from the given quaternion
        *
        * @param {mat3} out mat3 receiving operation result
        * @param {quat} q Quaternion to create matrix from
        *
        * @returns {mat3} out
        */
        mat3.fromQuat = function (out, q) {
            var x = q[0],
                y = q[1],
                z = q[2],
                w = q[3],
                x2 = x + x,
                y2 = y + y,
                z2 = z + z,
                xx = x * x2,
                yx = y * x2,
                yy = y * y2,
                zx = z * x2,
                zy = z * y2,
                zz = z * z2,
                wx = w * x2,
                wy = w * y2,
                wz = w * z2;

            out[0] = 1 - yy - zz;
            out[3] = yx - wz;
            out[6] = zx + wy;

            out[1] = yx + wz;
            out[4] = 1 - xx - zz;
            out[7] = zy - wx;

            out[2] = zx - wy;
            out[5] = zy + wx;
            out[8] = 1 - xx - yy;

            return out;
        };

        /**
        * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
        *
        * @param {mat3} out mat3 receiving operation result
        * @param {mat4} a Mat4 to derive the normal matrix from
        *
        * @returns {mat3} out
        */
        mat3.normalFromMat4 = function (out, a) {
            var a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a03 = a[3],
                a10 = a[4],
                a11 = a[5],
                a12 = a[6],
                a13 = a[7],
                a20 = a[8],
                a21 = a[9],
                a22 = a[10],
                a23 = a[11],
                a30 = a[12],
                a31 = a[13],
                a32 = a[14],
                a33 = a[15],
                b00 = a00 * a11 - a01 * a10,
                b01 = a00 * a12 - a02 * a10,
                b02 = a00 * a13 - a03 * a10,
                b03 = a01 * a12 - a02 * a11,
                b04 = a01 * a13 - a03 * a11,
                b05 = a02 * a13 - a03 * a12,
                b06 = a20 * a31 - a21 * a30,
                b07 = a20 * a32 - a22 * a30,
                b08 = a20 * a33 - a23 * a30,
                b09 = a21 * a32 - a22 * a31,
                b10 = a21 * a33 - a23 * a31,
                b11 = a22 * a33 - a23 * a32,


            // Calculate the determinant
            det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

            if (!det) {
                return null;
            }
            det = 1.0 / det;

            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

            out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

            out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

            return out;
        };

        /**
         * Returns a string representation of a mat3
         *
         * @param {mat3} mat matrix to represent as a string
         * @returns {String} string representation of the matrix
         */
        mat3.str = function (a) {
            return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' + a[8] + ')';
        };

        /**
         * Returns Frobenius norm of a mat3
         *
         * @param {mat3} a the matrix to calculate Frobenius norm of
         * @returns {Number} Frobenius norm
         */
        mat3.frob = function (a) {
            return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2));
        };

        /**
         * Adds two mat3's
         *
         * @param {mat3} out the receiving matrix
         * @param {mat3} a the first operand
         * @param {mat3} b the second operand
         * @returns {mat3} out
         */
        mat3.add = function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            out[3] = a[3] + b[3];
            out[4] = a[4] + b[4];
            out[5] = a[5] + b[5];
            out[6] = a[6] + b[6];
            out[7] = a[7] + b[7];
            out[8] = a[8] + b[8];
            return out;
        };

        /**
         * Subtracts matrix b from matrix a
         *
         * @param {mat3} out the receiving matrix
         * @param {mat3} a the first operand
         * @param {mat3} b the second operand
         * @returns {mat3} out
         */
        mat3.subtract = function (out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            out[3] = a[3] - b[3];
            out[4] = a[4] - b[4];
            out[5] = a[5] - b[5];
            out[6] = a[6] - b[6];
            out[7] = a[7] - b[7];
            out[8] = a[8] - b[8];
            return out;
        };

        /**
         * Alias for {@link mat3.subtract}
         * @function
         */
        mat3.sub = mat3.subtract;

        /**
         * Multiply each element of the matrix by a scalar.
         *
         * @param {mat3} out the receiving matrix
         * @param {mat3} a the matrix to scale
         * @param {Number} b amount to scale the matrix's elements by
         * @returns {mat3} out
         */
        mat3.multiplyScalar = function (out, a, b) {
            out[0] = a[0] * b;
            out[1] = a[1] * b;
            out[2] = a[2] * b;
            out[3] = a[3] * b;
            out[4] = a[4] * b;
            out[5] = a[5] * b;
            out[6] = a[6] * b;
            out[7] = a[7] * b;
            out[8] = a[8] * b;
            return out;
        };

        /**
         * Adds two mat3's after multiplying each element of the second operand by a scalar value.
         *
         * @param {mat3} out the receiving vector
         * @param {mat3} a the first operand
         * @param {mat3} b the second operand
         * @param {Number} scale the amount to scale b's elements by before adding
         * @returns {mat3} out
         */
        mat3.multiplyScalarAndAdd = function (out, a, b, scale) {
            out[0] = a[0] + b[0] * scale;
            out[1] = a[1] + b[1] * scale;
            out[2] = a[2] + b[2] * scale;
            out[3] = a[3] + b[3] * scale;
            out[4] = a[4] + b[4] * scale;
            out[5] = a[5] + b[5] * scale;
            out[6] = a[6] + b[6] * scale;
            out[7] = a[7] + b[7] * scale;
            out[8] = a[8] + b[8] * scale;
            return out;
        };

        /*
         * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
         *
         * @param {mat3} a The first matrix.
         * @param {mat3} b The second matrix.
         * @returns {Boolean} True if the matrices are equal, false otherwise.
         */
        mat3.exactEquals = function (a, b) {
            return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
        };

        /**
         * Returns whether or not the matrices have approximately the same elements in the same position.
         *
         * @param {mat3} a The first matrix.
         * @param {mat3} b The second matrix.
         * @returns {Boolean} True if the matrices are equal, false otherwise.
         */
        mat3.equals = function (a, b) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3],
                a4 = a[4],
                a5 = a[5],
                a6 = a[6],
                a7 = a[7],
                a8 = a[8];
            var b0 = b[0],
                b1 = b[1],
                b2 = b[2],
                b3 = b[3],
                b4 = b[4],
                b5 = b[5],
                b6 = a[6],
                b7 = b[7],
                b8 = b[8];
            return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8));
        };

        module.exports = mat3;
    }, { "./common.js": 20 }], 24: [function (require, module, exports) {
        /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
        
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
        
        The above copyright notice and this permission notice shall be included in
        all copies or substantial portions of the Software.
        
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE. */

        var glMatrix = require("./common.js");

        /**
         * @class 4x4 Matrix
         * @name mat4
         */
        var mat4 = {
            scalar: {},
            SIMD: {}
        };

        /**
         * Creates a new identity mat4
         *
         * @returns {mat4} a new 4x4 matrix
         */
        mat4.create = function () {
            var out = new glMatrix.ARRAY_TYPE(16);
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = 1;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 1;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        };

        /**
         * Creates a new mat4 initialized with values from an existing matrix
         *
         * @param {mat4} a matrix to clone
         * @returns {mat4} a new 4x4 matrix
         */
        mat4.clone = function (a) {
            var out = new glMatrix.ARRAY_TYPE(16);
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
            out[9] = a[9];
            out[10] = a[10];
            out[11] = a[11];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
            return out;
        };

        /**
         * Copy the values from one mat4 to another
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the source matrix
         * @returns {mat4} out
         */
        mat4.copy = function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
            out[9] = a[9];
            out[10] = a[10];
            out[11] = a[11];
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
            return out;
        };

        /**
         * Create a new mat4 with the given values
         *
         * @param {Number} m00 Component in column 0, row 0 position (index 0)
         * @param {Number} m01 Component in column 0, row 1 position (index 1)
         * @param {Number} m02 Component in column 0, row 2 position (index 2)
         * @param {Number} m03 Component in column 0, row 3 position (index 3)
         * @param {Number} m10 Component in column 1, row 0 position (index 4)
         * @param {Number} m11 Component in column 1, row 1 position (index 5)
         * @param {Number} m12 Component in column 1, row 2 position (index 6)
         * @param {Number} m13 Component in column 1, row 3 position (index 7)
         * @param {Number} m20 Component in column 2, row 0 position (index 8)
         * @param {Number} m21 Component in column 2, row 1 position (index 9)
         * @param {Number} m22 Component in column 2, row 2 position (index 10)
         * @param {Number} m23 Component in column 2, row 3 position (index 11)
         * @param {Number} m30 Component in column 3, row 0 position (index 12)
         * @param {Number} m31 Component in column 3, row 1 position (index 13)
         * @param {Number} m32 Component in column 3, row 2 position (index 14)
         * @param {Number} m33 Component in column 3, row 3 position (index 15)
         * @returns {mat4} A new mat4
         */
        mat4.fromValues = function (m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
            var out = new glMatrix.ARRAY_TYPE(16);
            out[0] = m00;
            out[1] = m01;
            out[2] = m02;
            out[3] = m03;
            out[4] = m10;
            out[5] = m11;
            out[6] = m12;
            out[7] = m13;
            out[8] = m20;
            out[9] = m21;
            out[10] = m22;
            out[11] = m23;
            out[12] = m30;
            out[13] = m31;
            out[14] = m32;
            out[15] = m33;
            return out;
        };

        /**
         * Set the components of a mat4 to the given values
         *
         * @param {mat4} out the receiving matrix
         * @param {Number} m00 Component in column 0, row 0 position (index 0)
         * @param {Number} m01 Component in column 0, row 1 position (index 1)
         * @param {Number} m02 Component in column 0, row 2 position (index 2)
         * @param {Number} m03 Component in column 0, row 3 position (index 3)
         * @param {Number} m10 Component in column 1, row 0 position (index 4)
         * @param {Number} m11 Component in column 1, row 1 position (index 5)
         * @param {Number} m12 Component in column 1, row 2 position (index 6)
         * @param {Number} m13 Component in column 1, row 3 position (index 7)
         * @param {Number} m20 Component in column 2, row 0 position (index 8)
         * @param {Number} m21 Component in column 2, row 1 position (index 9)
         * @param {Number} m22 Component in column 2, row 2 position (index 10)
         * @param {Number} m23 Component in column 2, row 3 position (index 11)
         * @param {Number} m30 Component in column 3, row 0 position (index 12)
         * @param {Number} m31 Component in column 3, row 1 position (index 13)
         * @param {Number} m32 Component in column 3, row 2 position (index 14)
         * @param {Number} m33 Component in column 3, row 3 position (index 15)
         * @returns {mat4} out
         */
        mat4.set = function (out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
            out[0] = m00;
            out[1] = m01;
            out[2] = m02;
            out[3] = m03;
            out[4] = m10;
            out[5] = m11;
            out[6] = m12;
            out[7] = m13;
            out[8] = m20;
            out[9] = m21;
            out[10] = m22;
            out[11] = m23;
            out[12] = m30;
            out[13] = m31;
            out[14] = m32;
            out[15] = m33;
            return out;
        };

        /**
         * Set a mat4 to the identity matrix
         *
         * @param {mat4} out the receiving matrix
         * @returns {mat4} out
         */
        mat4.identity = function (out) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = 1;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 1;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        };

        /**
         * Transpose the values of a mat4 not using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the source matrix
         * @returns {mat4} out
         */
        mat4.scalar.transpose = function (out, a) {
            // If we are transposing ourselves we can skip a few steps but have to cache some values
            if (out === a) {
                var a01 = a[1],
                    a02 = a[2],
                    a03 = a[3],
                    a12 = a[6],
                    a13 = a[7],
                    a23 = a[11];

                out[1] = a[4];
                out[2] = a[8];
                out[3] = a[12];
                out[4] = a01;
                out[6] = a[9];
                out[7] = a[13];
                out[8] = a02;
                out[9] = a12;
                out[11] = a[14];
                out[12] = a03;
                out[13] = a13;
                out[14] = a23;
            } else {
                out[0] = a[0];
                out[1] = a[4];
                out[2] = a[8];
                out[3] = a[12];
                out[4] = a[1];
                out[5] = a[5];
                out[6] = a[9];
                out[7] = a[13];
                out[8] = a[2];
                out[9] = a[6];
                out[10] = a[10];
                out[11] = a[14];
                out[12] = a[3];
                out[13] = a[7];
                out[14] = a[11];
                out[15] = a[15];
            }

            return out;
        };

        /**
         * Transpose the values of a mat4 using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the source matrix
         * @returns {mat4} out
         */
        mat4.SIMD.transpose = function (out, a) {
            var a0, a1, a2, a3, tmp01, tmp23, out0, out1, out2, out3;

            a0 = SIMD.Float32x4.load(a, 0);
            a1 = SIMD.Float32x4.load(a, 4);
            a2 = SIMD.Float32x4.load(a, 8);
            a3 = SIMD.Float32x4.load(a, 12);

            tmp01 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
            tmp23 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
            out0 = SIMD.Float32x4.shuffle(tmp01, tmp23, 0, 2, 4, 6);
            out1 = SIMD.Float32x4.shuffle(tmp01, tmp23, 1, 3, 5, 7);
            SIMD.Float32x4.store(out, 0, out0);
            SIMD.Float32x4.store(out, 4, out1);

            tmp01 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
            tmp23 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
            out2 = SIMD.Float32x4.shuffle(tmp01, tmp23, 0, 2, 4, 6);
            out3 = SIMD.Float32x4.shuffle(tmp01, tmp23, 1, 3, 5, 7);
            SIMD.Float32x4.store(out, 8, out2);
            SIMD.Float32x4.store(out, 12, out3);

            return out;
        };

        /**
         * Transpse a mat4 using SIMD if available and enabled
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the source matrix
         * @returns {mat4} out
         */
        mat4.transpose = glMatrix.USE_SIMD ? mat4.SIMD.transpose : mat4.scalar.transpose;

        /**
         * Inverts a mat4 not using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the source matrix
         * @returns {mat4} out
         */
        mat4.scalar.invert = function (out, a) {
            var a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a03 = a[3],
                a10 = a[4],
                a11 = a[5],
                a12 = a[6],
                a13 = a[7],
                a20 = a[8],
                a21 = a[9],
                a22 = a[10],
                a23 = a[11],
                a30 = a[12],
                a31 = a[13],
                a32 = a[14],
                a33 = a[15],
                b00 = a00 * a11 - a01 * a10,
                b01 = a00 * a12 - a02 * a10,
                b02 = a00 * a13 - a03 * a10,
                b03 = a01 * a12 - a02 * a11,
                b04 = a01 * a13 - a03 * a11,
                b05 = a02 * a13 - a03 * a12,
                b06 = a20 * a31 - a21 * a30,
                b07 = a20 * a32 - a22 * a30,
                b08 = a20 * a33 - a23 * a30,
                b09 = a21 * a32 - a22 * a31,
                b10 = a21 * a33 - a23 * a31,
                b11 = a22 * a33 - a23 * a32,


            // Calculate the determinant
            det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

            if (!det) {
                return null;
            }
            det = 1.0 / det;

            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
            out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
            out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
            out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
            out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
            out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
            out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
            out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
            out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
            out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

            return out;
        };

        /**
         * Inverts a mat4 using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the source matrix
         * @returns {mat4} out
         */
        mat4.SIMD.invert = function (out, a) {
            var row0,
                row1,
                row2,
                row3,
                tmp1,
                minor0,
                minor1,
                minor2,
                minor3,
                det,
                a0 = SIMD.Float32x4.load(a, 0),
                a1 = SIMD.Float32x4.load(a, 4),
                a2 = SIMD.Float32x4.load(a, 8),
                a3 = SIMD.Float32x4.load(a, 12);

            // Compute matrix adjugate
            tmp1 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
            row1 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
            row0 = SIMD.Float32x4.shuffle(tmp1, row1, 0, 2, 4, 6);
            row1 = SIMD.Float32x4.shuffle(row1, tmp1, 1, 3, 5, 7);
            tmp1 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
            row3 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
            row2 = SIMD.Float32x4.shuffle(tmp1, row3, 0, 2, 4, 6);
            row3 = SIMD.Float32x4.shuffle(row3, tmp1, 1, 3, 5, 7);

            tmp1 = SIMD.Float32x4.mul(row2, row3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor0 = SIMD.Float32x4.mul(row1, tmp1);
            minor1 = SIMD.Float32x4.mul(row0, tmp1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row1, tmp1), minor0);
            minor1 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor1);
            minor1 = SIMD.Float32x4.swizzle(minor1, 2, 3, 0, 1);

            tmp1 = SIMD.Float32x4.mul(row1, row2);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor0);
            minor3 = SIMD.Float32x4.mul(row0, tmp1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row3, tmp1));
            minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor3);
            minor3 = SIMD.Float32x4.swizzle(minor3, 2, 3, 0, 1);

            tmp1 = SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(row1, 2, 3, 0, 1), row3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            row2 = SIMD.Float32x4.swizzle(row2, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor0);
            minor2 = SIMD.Float32x4.mul(row0, tmp1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row2, tmp1));
            minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor2);
            minor2 = SIMD.Float32x4.swizzle(minor2, 2, 3, 0, 1);

            tmp1 = SIMD.Float32x4.mul(row0, row1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor2);
            minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row2, tmp1), minor3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row3, tmp1), minor2);
            minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row2, tmp1));

            tmp1 = SIMD.Float32x4.mul(row0, row3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row2, tmp1));
            minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor2);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor1);
            minor2 = SIMD.Float32x4.sub(minor2, SIMD.Float32x4.mul(row1, tmp1));

            tmp1 = SIMD.Float32x4.mul(row0, row2);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor1);
            minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row1, tmp1));
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row3, tmp1));
            minor3 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor3);

            // Compute matrix determinant
            det = SIMD.Float32x4.mul(row0, minor0);
            det = SIMD.Float32x4.add(SIMD.Float32x4.swizzle(det, 2, 3, 0, 1), det);
            det = SIMD.Float32x4.add(SIMD.Float32x4.swizzle(det, 1, 0, 3, 2), det);
            tmp1 = SIMD.Float32x4.reciprocalApproximation(det);
            det = SIMD.Float32x4.sub(SIMD.Float32x4.add(tmp1, tmp1), SIMD.Float32x4.mul(det, SIMD.Float32x4.mul(tmp1, tmp1)));
            det = SIMD.Float32x4.swizzle(det, 0, 0, 0, 0);
            if (!det) {
                return null;
            }

            // Compute matrix inverse
            SIMD.Float32x4.store(out, 0, SIMD.Float32x4.mul(det, minor0));
            SIMD.Float32x4.store(out, 4, SIMD.Float32x4.mul(det, minor1));
            SIMD.Float32x4.store(out, 8, SIMD.Float32x4.mul(det, minor2));
            SIMD.Float32x4.store(out, 12, SIMD.Float32x4.mul(det, minor3));
            return out;
        };

        /**
         * Inverts a mat4 using SIMD if available and enabled
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the source matrix
         * @returns {mat4} out
         */
        mat4.invert = glMatrix.USE_SIMD ? mat4.SIMD.invert : mat4.scalar.invert;

        /**
         * Calculates the adjugate of a mat4 not using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the source matrix
         * @returns {mat4} out
         */
        mat4.scalar.adjoint = function (out, a) {
            var a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a03 = a[3],
                a10 = a[4],
                a11 = a[5],
                a12 = a[6],
                a13 = a[7],
                a20 = a[8],
                a21 = a[9],
                a22 = a[10],
                a23 = a[11],
                a30 = a[12],
                a31 = a[13],
                a32 = a[14],
                a33 = a[15];

            out[0] = a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22);
            out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
            out[2] = a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12);
            out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
            out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
            out[5] = a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22);
            out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
            out[7] = a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12);
            out[8] = a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21);
            out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
            out[10] = a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11);
            out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
            out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
            out[13] = a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21);
            out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
            out[15] = a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11);
            return out;
        };

        /**
         * Calculates the adjugate of a mat4 using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the source matrix
         * @returns {mat4} out
         */
        mat4.SIMD.adjoint = function (out, a) {
            var a0, a1, a2, a3;
            var row0, row1, row2, row3;
            var tmp1;
            var minor0, minor1, minor2, minor3;

            var a0 = SIMD.Float32x4.load(a, 0);
            var a1 = SIMD.Float32x4.load(a, 4);
            var a2 = SIMD.Float32x4.load(a, 8);
            var a3 = SIMD.Float32x4.load(a, 12);

            // Transpose the source matrix.  Sort of.  Not a true transpose operation
            tmp1 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
            row1 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
            row0 = SIMD.Float32x4.shuffle(tmp1, row1, 0, 2, 4, 6);
            row1 = SIMD.Float32x4.shuffle(row1, tmp1, 1, 3, 5, 7);

            tmp1 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
            row3 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
            row2 = SIMD.Float32x4.shuffle(tmp1, row3, 0, 2, 4, 6);
            row3 = SIMD.Float32x4.shuffle(row3, tmp1, 1, 3, 5, 7);

            tmp1 = SIMD.Float32x4.mul(row2, row3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor0 = SIMD.Float32x4.mul(row1, tmp1);
            minor1 = SIMD.Float32x4.mul(row0, tmp1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row1, tmp1), minor0);
            minor1 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor1);
            minor1 = SIMD.Float32x4.swizzle(minor1, 2, 3, 0, 1);

            tmp1 = SIMD.Float32x4.mul(row1, row2);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor0);
            minor3 = SIMD.Float32x4.mul(row0, tmp1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row3, tmp1));
            minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor3);
            minor3 = SIMD.Float32x4.swizzle(minor3, 2, 3, 0, 1);

            tmp1 = SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(row1, 2, 3, 0, 1), row3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            row2 = SIMD.Float32x4.swizzle(row2, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor0);
            minor2 = SIMD.Float32x4.mul(row0, tmp1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row2, tmp1));
            minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor2);
            minor2 = SIMD.Float32x4.swizzle(minor2, 2, 3, 0, 1);

            tmp1 = SIMD.Float32x4.mul(row0, row1);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor2);
            minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row2, tmp1), minor3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row3, tmp1), minor2);
            minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row2, tmp1));

            tmp1 = SIMD.Float32x4.mul(row0, row3);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row2, tmp1));
            minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor2);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor1);
            minor2 = SIMD.Float32x4.sub(minor2, SIMD.Float32x4.mul(row1, tmp1));

            tmp1 = SIMD.Float32x4.mul(row0, row2);
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
            minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor1);
            minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row1, tmp1));
            tmp1 = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
            minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row3, tmp1));
            minor3 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor3);

            SIMD.Float32x4.store(out, 0, minor0);
            SIMD.Float32x4.store(out, 4, minor1);
            SIMD.Float32x4.store(out, 8, minor2);
            SIMD.Float32x4.store(out, 12, minor3);
            return out;
        };

        /**
         * Calculates the adjugate of a mat4 using SIMD if available and enabled
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the source matrix
         * @returns {mat4} out
         */
        mat4.adjoint = glMatrix.USE_SIMD ? mat4.SIMD.adjoint : mat4.scalar.adjoint;

        /**
         * Calculates the determinant of a mat4
         *
         * @param {mat4} a the source matrix
         * @returns {Number} determinant of a
         */
        mat4.determinant = function (a) {
            var a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a03 = a[3],
                a10 = a[4],
                a11 = a[5],
                a12 = a[6],
                a13 = a[7],
                a20 = a[8],
                a21 = a[9],
                a22 = a[10],
                a23 = a[11],
                a30 = a[12],
                a31 = a[13],
                a32 = a[14],
                a33 = a[15],
                b00 = a00 * a11 - a01 * a10,
                b01 = a00 * a12 - a02 * a10,
                b02 = a00 * a13 - a03 * a10,
                b03 = a01 * a12 - a02 * a11,
                b04 = a01 * a13 - a03 * a11,
                b05 = a02 * a13 - a03 * a12,
                b06 = a20 * a31 - a21 * a30,
                b07 = a20 * a32 - a22 * a30,
                b08 = a20 * a33 - a23 * a30,
                b09 = a21 * a32 - a22 * a31,
                b10 = a21 * a33 - a23 * a31,
                b11 = a22 * a33 - a23 * a32;

            // Calculate the determinant
            return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        };

        /**
         * Multiplies two mat4's explicitly using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the first operand, must be a Float32Array
         * @param {mat4} b the second operand, must be a Float32Array
         * @returns {mat4} out
         */
        mat4.SIMD.multiply = function (out, a, b) {
            var a0 = SIMD.Float32x4.load(a, 0);
            var a1 = SIMD.Float32x4.load(a, 4);
            var a2 = SIMD.Float32x4.load(a, 8);
            var a3 = SIMD.Float32x4.load(a, 12);

            var b0 = SIMD.Float32x4.load(b, 0);
            var out0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 0, 0, 0, 0), a0), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 1, 1, 1, 1), a1), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 2, 2, 2, 2), a2), SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 3, 3, 3, 3), a3))));
            SIMD.Float32x4.store(out, 0, out0);

            var b1 = SIMD.Float32x4.load(b, 4);
            var out1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 0, 0, 0, 0), a0), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 1, 1, 1, 1), a1), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 2, 2, 2, 2), a2), SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 3, 3, 3, 3), a3))));
            SIMD.Float32x4.store(out, 4, out1);

            var b2 = SIMD.Float32x4.load(b, 8);
            var out2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 0, 0, 0, 0), a0), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 1, 1, 1, 1), a1), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 2, 2, 2, 2), a2), SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 3, 3, 3, 3), a3))));
            SIMD.Float32x4.store(out, 8, out2);

            var b3 = SIMD.Float32x4.load(b, 12);
            var out3 = SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 0, 0, 0, 0), a0), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 1, 1, 1, 1), a1), SIMD.Float32x4.add(SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 2, 2, 2, 2), a2), SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 3, 3, 3, 3), a3))));
            SIMD.Float32x4.store(out, 12, out3);

            return out;
        };

        /**
         * Multiplies two mat4's explicitly not using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the first operand
         * @param {mat4} b the second operand
         * @returns {mat4} out
         */
        mat4.scalar.multiply = function (out, a, b) {
            var a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a03 = a[3],
                a10 = a[4],
                a11 = a[5],
                a12 = a[6],
                a13 = a[7],
                a20 = a[8],
                a21 = a[9],
                a22 = a[10],
                a23 = a[11],
                a30 = a[12],
                a31 = a[13],
                a32 = a[14],
                a33 = a[15];

            // Cache only the current line of the second matrix
            var b0 = b[0],
                b1 = b[1],
                b2 = b[2],
                b3 = b[3];
            out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[4];b1 = b[5];b2 = b[6];b3 = b[7];
            out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[8];b1 = b[9];b2 = b[10];b3 = b[11];
            out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[12];b1 = b[13];b2 = b[14];b3 = b[15];
            out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
            return out;
        };

        /**
         * Multiplies two mat4's using SIMD if available and enabled
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the first operand
         * @param {mat4} b the second operand
         * @returns {mat4} out
         */
        mat4.multiply = glMatrix.USE_SIMD ? mat4.SIMD.multiply : mat4.scalar.multiply;

        /**
         * Alias for {@link mat4.multiply}
         * @function
         */
        mat4.mul = mat4.multiply;

        /**
         * Translate a mat4 by the given vector not using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to translate
         * @param {vec3} v vector to translate by
         * @returns {mat4} out
         */
        mat4.scalar.translate = function (out, a, v) {
            var x = v[0],
                y = v[1],
                z = v[2],
                a00,
                a01,
                a02,
                a03,
                a10,
                a11,
                a12,
                a13,
                a20,
                a21,
                a22,
                a23;

            if (a === out) {
                out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
                out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
                out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
                out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
            } else {
                a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
                a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
                a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];

                out[0] = a00;out[1] = a01;out[2] = a02;out[3] = a03;
                out[4] = a10;out[5] = a11;out[6] = a12;out[7] = a13;
                out[8] = a20;out[9] = a21;out[10] = a22;out[11] = a23;

                out[12] = a00 * x + a10 * y + a20 * z + a[12];
                out[13] = a01 * x + a11 * y + a21 * z + a[13];
                out[14] = a02 * x + a12 * y + a22 * z + a[14];
                out[15] = a03 * x + a13 * y + a23 * z + a[15];
            }

            return out;
        };

        /**
         * Translates a mat4 by the given vector using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to translate
         * @param {vec3} v vector to translate by
         * @returns {mat4} out
         */
        mat4.SIMD.translate = function (out, a, v) {
            var a0 = SIMD.Float32x4.load(a, 0),
                a1 = SIMD.Float32x4.load(a, 4),
                a2 = SIMD.Float32x4.load(a, 8),
                a3 = SIMD.Float32x4.load(a, 12),
                vec = SIMD.Float32x4(v[0], v[1], v[2], 0);

            if (a !== out) {
                out[0] = a[0];out[1] = a[1];out[2] = a[2];out[3] = a[3];
                out[4] = a[4];out[5] = a[5];out[6] = a[6];out[7] = a[7];
                out[8] = a[8];out[9] = a[9];out[10] = a[10];out[11] = a[11];
            }

            a0 = SIMD.Float32x4.mul(a0, SIMD.Float32x4.swizzle(vec, 0, 0, 0, 0));
            a1 = SIMD.Float32x4.mul(a1, SIMD.Float32x4.swizzle(vec, 1, 1, 1, 1));
            a2 = SIMD.Float32x4.mul(a2, SIMD.Float32x4.swizzle(vec, 2, 2, 2, 2));

            var t0 = SIMD.Float32x4.add(a0, SIMD.Float32x4.add(a1, SIMD.Float32x4.add(a2, a3)));
            SIMD.Float32x4.store(out, 12, t0);

            return out;
        };

        /**
         * Translates a mat4 by the given vector using SIMD if available and enabled
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to translate
         * @param {vec3} v vector to translate by
         * @returns {mat4} out
         */
        mat4.translate = glMatrix.USE_SIMD ? mat4.SIMD.translate : mat4.scalar.translate;

        /**
         * Scales the mat4 by the dimensions in the given vec3 not using vectorization
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to scale
         * @param {vec3} v the vec3 to scale the matrix by
         * @returns {mat4} out
         **/
        mat4.scalar.scale = function (out, a, v) {
            var x = v[0],
                y = v[1],
                z = v[2];

            out[0] = a[0] * x;
            out[1] = a[1] * x;
            out[2] = a[2] * x;
            out[3] = a[3] * x;
            out[4] = a[4] * y;
            out[5] = a[5] * y;
            out[6] = a[6] * y;
            out[7] = a[7] * y;
            out[8] = a[8] * z;
            out[9] = a[9] * z;
            out[10] = a[10] * z;
            out[11] = a[11] * z;
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
            return out;
        };

        /**
         * Scales the mat4 by the dimensions in the given vec3 using vectorization
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to scale
         * @param {vec3} v the vec3 to scale the matrix by
         * @returns {mat4} out
         **/
        mat4.SIMD.scale = function (out, a, v) {
            var a0, a1, a2;
            var vec = SIMD.Float32x4(v[0], v[1], v[2], 0);

            a0 = SIMD.Float32x4.load(a, 0);
            SIMD.Float32x4.store(out, 0, SIMD.Float32x4.mul(a0, SIMD.Float32x4.swizzle(vec, 0, 0, 0, 0)));

            a1 = SIMD.Float32x4.load(a, 4);
            SIMD.Float32x4.store(out, 4, SIMD.Float32x4.mul(a1, SIMD.Float32x4.swizzle(vec, 1, 1, 1, 1)));

            a2 = SIMD.Float32x4.load(a, 8);
            SIMD.Float32x4.store(out, 8, SIMD.Float32x4.mul(a2, SIMD.Float32x4.swizzle(vec, 2, 2, 2, 2)));

            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
            return out;
        };

        /**
         * Scales the mat4 by the dimensions in the given vec3 using SIMD if available and enabled
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to scale
         * @param {vec3} v the vec3 to scale the matrix by
         * @returns {mat4} out
         */
        mat4.scale = glMatrix.USE_SIMD ? mat4.SIMD.scale : mat4.scalar.scale;

        /**
         * Rotates a mat4 by the given angle around the given axis
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to rotate
         * @param {Number} rad the angle to rotate the matrix by
         * @param {vec3} axis the axis to rotate around
         * @returns {mat4} out
         */
        mat4.rotate = function (out, a, rad, axis) {
            var x = axis[0],
                y = axis[1],
                z = axis[2],
                len = Math.sqrt(x * x + y * y + z * z),
                s,
                c,
                t,
                a00,
                a01,
                a02,
                a03,
                a10,
                a11,
                a12,
                a13,
                a20,
                a21,
                a22,
                a23,
                b00,
                b01,
                b02,
                b10,
                b11,
                b12,
                b20,
                b21,
                b22;

            if (Math.abs(len) < glMatrix.EPSILON) {
                return null;
            }

            len = 1 / len;
            x *= len;
            y *= len;
            z *= len;

            s = Math.sin(rad);
            c = Math.cos(rad);
            t = 1 - c;

            a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
            a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
            a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];

            // Construct the elements of the rotation matrix
            b00 = x * x * t + c;b01 = y * x * t + z * s;b02 = z * x * t - y * s;
            b10 = x * y * t - z * s;b11 = y * y * t + c;b12 = z * y * t + x * s;
            b20 = x * z * t + y * s;b21 = y * z * t - x * s;b22 = z * z * t + c;

            // Perform rotation-specific matrix multiplication
            out[0] = a00 * b00 + a10 * b01 + a20 * b02;
            out[1] = a01 * b00 + a11 * b01 + a21 * b02;
            out[2] = a02 * b00 + a12 * b01 + a22 * b02;
            out[3] = a03 * b00 + a13 * b01 + a23 * b02;
            out[4] = a00 * b10 + a10 * b11 + a20 * b12;
            out[5] = a01 * b10 + a11 * b11 + a21 * b12;
            out[6] = a02 * b10 + a12 * b11 + a22 * b12;
            out[7] = a03 * b10 + a13 * b11 + a23 * b12;
            out[8] = a00 * b20 + a10 * b21 + a20 * b22;
            out[9] = a01 * b20 + a11 * b21 + a21 * b22;
            out[10] = a02 * b20 + a12 * b21 + a22 * b22;
            out[11] = a03 * b20 + a13 * b21 + a23 * b22;

            if (a !== out) {
                // If the source and destination differ, copy the unchanged last row
                out[12] = a[12];
                out[13] = a[13];
                out[14] = a[14];
                out[15] = a[15];
            }
            return out;
        };

        /**
         * Rotates a matrix by the given angle around the X axis not using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to rotate
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat4} out
         */
        mat4.scalar.rotateX = function (out, a, rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad),
                a10 = a[4],
                a11 = a[5],
                a12 = a[6],
                a13 = a[7],
                a20 = a[8],
                a21 = a[9],
                a22 = a[10],
                a23 = a[11];

            if (a !== out) {
                // If the source and destination differ, copy the unchanged rows
                out[0] = a[0];
                out[1] = a[1];
                out[2] = a[2];
                out[3] = a[3];
                out[12] = a[12];
                out[13] = a[13];
                out[14] = a[14];
                out[15] = a[15];
            }

            // Perform axis-specific matrix multiplication
            out[4] = a10 * c + a20 * s;
            out[5] = a11 * c + a21 * s;
            out[6] = a12 * c + a22 * s;
            out[7] = a13 * c + a23 * s;
            out[8] = a20 * c - a10 * s;
            out[9] = a21 * c - a11 * s;
            out[10] = a22 * c - a12 * s;
            out[11] = a23 * c - a13 * s;
            return out;
        };

        /**
         * Rotates a matrix by the given angle around the X axis using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to rotate
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat4} out
         */
        mat4.SIMD.rotateX = function (out, a, rad) {
            var s = SIMD.Float32x4.splat(Math.sin(rad)),
                c = SIMD.Float32x4.splat(Math.cos(rad));

            if (a !== out) {
                // If the source and destination differ, copy the unchanged rows
                out[0] = a[0];
                out[1] = a[1];
                out[2] = a[2];
                out[3] = a[3];
                out[12] = a[12];
                out[13] = a[13];
                out[14] = a[14];
                out[15] = a[15];
            }

            // Perform axis-specific matrix multiplication
            var a_1 = SIMD.Float32x4.load(a, 4);
            var a_2 = SIMD.Float32x4.load(a, 8);
            SIMD.Float32x4.store(out, 4, SIMD.Float32x4.add(SIMD.Float32x4.mul(a_1, c), SIMD.Float32x4.mul(a_2, s)));
            SIMD.Float32x4.store(out, 8, SIMD.Float32x4.sub(SIMD.Float32x4.mul(a_2, c), SIMD.Float32x4.mul(a_1, s)));
            return out;
        };

        /**
         * Rotates a matrix by the given angle around the X axis using SIMD if availabe and enabled
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to rotate
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat4} out
         */
        mat4.rotateX = glMatrix.USE_SIMD ? mat4.SIMD.rotateX : mat4.scalar.rotateX;

        /**
         * Rotates a matrix by the given angle around the Y axis not using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to rotate
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat4} out
         */
        mat4.scalar.rotateY = function (out, a, rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad),
                a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a03 = a[3],
                a20 = a[8],
                a21 = a[9],
                a22 = a[10],
                a23 = a[11];

            if (a !== out) {
                // If the source and destination differ, copy the unchanged rows
                out[4] = a[4];
                out[5] = a[5];
                out[6] = a[6];
                out[7] = a[7];
                out[12] = a[12];
                out[13] = a[13];
                out[14] = a[14];
                out[15] = a[15];
            }

            // Perform axis-specific matrix multiplication
            out[0] = a00 * c - a20 * s;
            out[1] = a01 * c - a21 * s;
            out[2] = a02 * c - a22 * s;
            out[3] = a03 * c - a23 * s;
            out[8] = a00 * s + a20 * c;
            out[9] = a01 * s + a21 * c;
            out[10] = a02 * s + a22 * c;
            out[11] = a03 * s + a23 * c;
            return out;
        };

        /**
         * Rotates a matrix by the given angle around the Y axis using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to rotate
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat4} out
         */
        mat4.SIMD.rotateY = function (out, a, rad) {
            var s = SIMD.Float32x4.splat(Math.sin(rad)),
                c = SIMD.Float32x4.splat(Math.cos(rad));

            if (a !== out) {
                // If the source and destination differ, copy the unchanged rows
                out[4] = a[4];
                out[5] = a[5];
                out[6] = a[6];
                out[7] = a[7];
                out[12] = a[12];
                out[13] = a[13];
                out[14] = a[14];
                out[15] = a[15];
            }

            // Perform axis-specific matrix multiplication
            var a_0 = SIMD.Float32x4.load(a, 0);
            var a_2 = SIMD.Float32x4.load(a, 8);
            SIMD.Float32x4.store(out, 0, SIMD.Float32x4.sub(SIMD.Float32x4.mul(a_0, c), SIMD.Float32x4.mul(a_2, s)));
            SIMD.Float32x4.store(out, 8, SIMD.Float32x4.add(SIMD.Float32x4.mul(a_0, s), SIMD.Float32x4.mul(a_2, c)));
            return out;
        };

        /**
         * Rotates a matrix by the given angle around the Y axis if SIMD available and enabled
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to rotate
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat4} out
         */
        mat4.rotateY = glMatrix.USE_SIMD ? mat4.SIMD.rotateY : mat4.scalar.rotateY;

        /**
         * Rotates a matrix by the given angle around the Z axis not using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to rotate
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat4} out
         */
        mat4.scalar.rotateZ = function (out, a, rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad),
                a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a03 = a[3],
                a10 = a[4],
                a11 = a[5],
                a12 = a[6],
                a13 = a[7];

            if (a !== out) {
                // If the source and destination differ, copy the unchanged last row
                out[8] = a[8];
                out[9] = a[9];
                out[10] = a[10];
                out[11] = a[11];
                out[12] = a[12];
                out[13] = a[13];
                out[14] = a[14];
                out[15] = a[15];
            }

            // Perform axis-specific matrix multiplication
            out[0] = a00 * c + a10 * s;
            out[1] = a01 * c + a11 * s;
            out[2] = a02 * c + a12 * s;
            out[3] = a03 * c + a13 * s;
            out[4] = a10 * c - a00 * s;
            out[5] = a11 * c - a01 * s;
            out[6] = a12 * c - a02 * s;
            out[7] = a13 * c - a03 * s;
            return out;
        };

        /**
         * Rotates a matrix by the given angle around the Z axis using SIMD
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to rotate
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat4} out
         */
        mat4.SIMD.rotateZ = function (out, a, rad) {
            var s = SIMD.Float32x4.splat(Math.sin(rad)),
                c = SIMD.Float32x4.splat(Math.cos(rad));

            if (a !== out) {
                // If the source and destination differ, copy the unchanged last row
                out[8] = a[8];
                out[9] = a[9];
                out[10] = a[10];
                out[11] = a[11];
                out[12] = a[12];
                out[13] = a[13];
                out[14] = a[14];
                out[15] = a[15];
            }

            // Perform axis-specific matrix multiplication
            var a_0 = SIMD.Float32x4.load(a, 0);
            var a_1 = SIMD.Float32x4.load(a, 4);
            SIMD.Float32x4.store(out, 0, SIMD.Float32x4.add(SIMD.Float32x4.mul(a_0, c), SIMD.Float32x4.mul(a_1, s)));
            SIMD.Float32x4.store(out, 4, SIMD.Float32x4.sub(SIMD.Float32x4.mul(a_1, c), SIMD.Float32x4.mul(a_0, s)));
            return out;
        };

        /**
         * Rotates a matrix by the given angle around the Z axis if SIMD available and enabled
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to rotate
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat4} out
         */
        mat4.rotateZ = glMatrix.USE_SIMD ? mat4.SIMD.rotateZ : mat4.scalar.rotateZ;

        /**
         * Creates a matrix from a vector translation
         * This is equivalent to (but much faster than):
         *
         *     mat4.identity(dest);
         *     mat4.translate(dest, dest, vec);
         *
         * @param {mat4} out mat4 receiving operation result
         * @param {vec3} v Translation vector
         * @returns {mat4} out
         */
        mat4.fromTranslation = function (out, v) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = 1;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 1;
            out[11] = 0;
            out[12] = v[0];
            out[13] = v[1];
            out[14] = v[2];
            out[15] = 1;
            return out;
        };

        /**
         * Creates a matrix from a vector scaling
         * This is equivalent to (but much faster than):
         *
         *     mat4.identity(dest);
         *     mat4.scale(dest, dest, vec);
         *
         * @param {mat4} out mat4 receiving operation result
         * @param {vec3} v Scaling vector
         * @returns {mat4} out
         */
        mat4.fromScaling = function (out, v) {
            out[0] = v[0];
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = v[1];
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = v[2];
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        };

        /**
         * Creates a matrix from a given angle around a given axis
         * This is equivalent to (but much faster than):
         *
         *     mat4.identity(dest);
         *     mat4.rotate(dest, dest, rad, axis);
         *
         * @param {mat4} out mat4 receiving operation result
         * @param {Number} rad the angle to rotate the matrix by
         * @param {vec3} axis the axis to rotate around
         * @returns {mat4} out
         */
        mat4.fromRotation = function (out, rad, axis) {
            var x = axis[0],
                y = axis[1],
                z = axis[2],
                len = Math.sqrt(x * x + y * y + z * z),
                s,
                c,
                t;

            if (Math.abs(len) < glMatrix.EPSILON) {
                return null;
            }

            len = 1 / len;
            x *= len;
            y *= len;
            z *= len;

            s = Math.sin(rad);
            c = Math.cos(rad);
            t = 1 - c;

            // Perform rotation-specific matrix multiplication
            out[0] = x * x * t + c;
            out[1] = y * x * t + z * s;
            out[2] = z * x * t - y * s;
            out[3] = 0;
            out[4] = x * y * t - z * s;
            out[5] = y * y * t + c;
            out[6] = z * y * t + x * s;
            out[7] = 0;
            out[8] = x * z * t + y * s;
            out[9] = y * z * t - x * s;
            out[10] = z * z * t + c;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        };

        /**
         * Creates a matrix from the given angle around the X axis
         * This is equivalent to (but much faster than):
         *
         *     mat4.identity(dest);
         *     mat4.rotateX(dest, dest, rad);
         *
         * @param {mat4} out mat4 receiving operation result
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat4} out
         */
        mat4.fromXRotation = function (out, rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad);

            // Perform axis-specific matrix multiplication
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = c;
            out[6] = s;
            out[7] = 0;
            out[8] = 0;
            out[9] = -s;
            out[10] = c;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        };

        /**
         * Creates a matrix from the given angle around the Y axis
         * This is equivalent to (but much faster than):
         *
         *     mat4.identity(dest);
         *     mat4.rotateY(dest, dest, rad);
         *
         * @param {mat4} out mat4 receiving operation result
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat4} out
         */
        mat4.fromYRotation = function (out, rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad);

            // Perform axis-specific matrix multiplication
            out[0] = c;
            out[1] = 0;
            out[2] = -s;
            out[3] = 0;
            out[4] = 0;
            out[5] = 1;
            out[6] = 0;
            out[7] = 0;
            out[8] = s;
            out[9] = 0;
            out[10] = c;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        };

        /**
         * Creates a matrix from the given angle around the Z axis
         * This is equivalent to (but much faster than):
         *
         *     mat4.identity(dest);
         *     mat4.rotateZ(dest, dest, rad);
         *
         * @param {mat4} out mat4 receiving operation result
         * @param {Number} rad the angle to rotate the matrix by
         * @returns {mat4} out
         */
        mat4.fromZRotation = function (out, rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad);

            // Perform axis-specific matrix multiplication
            out[0] = c;
            out[1] = s;
            out[2] = 0;
            out[3] = 0;
            out[4] = -s;
            out[5] = c;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 1;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;
            return out;
        };

        /**
         * Creates a matrix from a quaternion rotation and vector translation
         * This is equivalent to (but much faster than):
         *
         *     mat4.identity(dest);
         *     mat4.translate(dest, vec);
         *     var quatMat = mat4.create();
         *     quat4.toMat4(quat, quatMat);
         *     mat4.multiply(dest, quatMat);
         *
         * @param {mat4} out mat4 receiving operation result
         * @param {quat4} q Rotation quaternion
         * @param {vec3} v Translation vector
         * @returns {mat4} out
         */
        mat4.fromRotationTranslation = function (out, q, v) {
            // Quaternion math
            var x = q[0],
                y = q[1],
                z = q[2],
                w = q[3],
                x2 = x + x,
                y2 = y + y,
                z2 = z + z,
                xx = x * x2,
                xy = x * y2,
                xz = x * z2,
                yy = y * y2,
                yz = y * z2,
                zz = z * z2,
                wx = w * x2,
                wy = w * y2,
                wz = w * z2;

            out[0] = 1 - (yy + zz);
            out[1] = xy + wz;
            out[2] = xz - wy;
            out[3] = 0;
            out[4] = xy - wz;
            out[5] = 1 - (xx + zz);
            out[6] = yz + wx;
            out[7] = 0;
            out[8] = xz + wy;
            out[9] = yz - wx;
            out[10] = 1 - (xx + yy);
            out[11] = 0;
            out[12] = v[0];
            out[13] = v[1];
            out[14] = v[2];
            out[15] = 1;

            return out;
        };

        /**
         * Returns the translation vector component of a transformation
         *  matrix. If a matrix is built with fromRotationTranslation,
         *  the returned vector will be the same as the translation vector
         *  originally supplied.
         * @param  {vec3} out Vector to receive translation component
         * @param  {mat4} mat Matrix to be decomposed (input)
         * @return {vec3} out
         */
        mat4.getTranslation = function (out, mat) {
            out[0] = mat[12];
            out[1] = mat[13];
            out[2] = mat[14];

            return out;
        };

        /**
         * Returns a quaternion representing the rotational component
         *  of a transformation matrix. If a matrix is built with
         *  fromRotationTranslation, the returned quaternion will be the
         *  same as the quaternion originally supplied.
         * @param {quat} out Quaternion to receive the rotation component
         * @param {mat4} mat Matrix to be decomposed (input)
         * @return {quat} out
         */
        mat4.getRotation = function (out, mat) {
            // Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
            var trace = mat[0] + mat[5] + mat[10];
            var S = 0;

            if (trace > 0) {
                S = Math.sqrt(trace + 1.0) * 2;
                out[3] = 0.25 * S;
                out[0] = (mat[6] - mat[9]) / S;
                out[1] = (mat[8] - mat[2]) / S;
                out[2] = (mat[1] - mat[4]) / S;
            } else if (mat[0] > mat[5] & mat[0] > mat[10]) {
                S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
                out[3] = (mat[6] - mat[9]) / S;
                out[0] = 0.25 * S;
                out[1] = (mat[1] + mat[4]) / S;
                out[2] = (mat[8] + mat[2]) / S;
            } else if (mat[5] > mat[10]) {
                S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
                out[3] = (mat[8] - mat[2]) / S;
                out[0] = (mat[1] + mat[4]) / S;
                out[1] = 0.25 * S;
                out[2] = (mat[6] + mat[9]) / S;
            } else {
                S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
                out[3] = (mat[1] - mat[4]) / S;
                out[0] = (mat[8] + mat[2]) / S;
                out[1] = (mat[6] + mat[9]) / S;
                out[2] = 0.25 * S;
            }

            return out;
        };

        /**
         * Creates a matrix from a quaternion rotation, vector translation and vector scale
         * This is equivalent to (but much faster than):
         *
         *     mat4.identity(dest);
         *     mat4.translate(dest, vec);
         *     var quatMat = mat4.create();
         *     quat4.toMat4(quat, quatMat);
         *     mat4.multiply(dest, quatMat);
         *     mat4.scale(dest, scale)
         *
         * @param {mat4} out mat4 receiving operation result
         * @param {quat4} q Rotation quaternion
         * @param {vec3} v Translation vector
         * @param {vec3} s Scaling vector
         * @returns {mat4} out
         */
        mat4.fromRotationTranslationScale = function (out, q, v, s) {
            // Quaternion math
            var x = q[0],
                y = q[1],
                z = q[2],
                w = q[3],
                x2 = x + x,
                y2 = y + y,
                z2 = z + z,
                xx = x * x2,
                xy = x * y2,
                xz = x * z2,
                yy = y * y2,
                yz = y * z2,
                zz = z * z2,
                wx = w * x2,
                wy = w * y2,
                wz = w * z2,
                sx = s[0],
                sy = s[1],
                sz = s[2];

            out[0] = (1 - (yy + zz)) * sx;
            out[1] = (xy + wz) * sx;
            out[2] = (xz - wy) * sx;
            out[3] = 0;
            out[4] = (xy - wz) * sy;
            out[5] = (1 - (xx + zz)) * sy;
            out[6] = (yz + wx) * sy;
            out[7] = 0;
            out[8] = (xz + wy) * sz;
            out[9] = (yz - wx) * sz;
            out[10] = (1 - (xx + yy)) * sz;
            out[11] = 0;
            out[12] = v[0];
            out[13] = v[1];
            out[14] = v[2];
            out[15] = 1;

            return out;
        };

        /**
         * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
         * This is equivalent to (but much faster than):
         *
         *     mat4.identity(dest);
         *     mat4.translate(dest, vec);
         *     mat4.translate(dest, origin);
         *     var quatMat = mat4.create();
         *     quat4.toMat4(quat, quatMat);
         *     mat4.multiply(dest, quatMat);
         *     mat4.scale(dest, scale)
         *     mat4.translate(dest, negativeOrigin);
         *
         * @param {mat4} out mat4 receiving operation result
         * @param {quat4} q Rotation quaternion
         * @param {vec3} v Translation vector
         * @param {vec3} s Scaling vector
         * @param {vec3} o The origin vector around which to scale and rotate
         * @returns {mat4} out
         */
        mat4.fromRotationTranslationScaleOrigin = function (out, q, v, s, o) {
            // Quaternion math
            var x = q[0],
                y = q[1],
                z = q[2],
                w = q[3],
                x2 = x + x,
                y2 = y + y,
                z2 = z + z,
                xx = x * x2,
                xy = x * y2,
                xz = x * z2,
                yy = y * y2,
                yz = y * z2,
                zz = z * z2,
                wx = w * x2,
                wy = w * y2,
                wz = w * z2,
                sx = s[0],
                sy = s[1],
                sz = s[2],
                ox = o[0],
                oy = o[1],
                oz = o[2];

            out[0] = (1 - (yy + zz)) * sx;
            out[1] = (xy + wz) * sx;
            out[2] = (xz - wy) * sx;
            out[3] = 0;
            out[4] = (xy - wz) * sy;
            out[5] = (1 - (xx + zz)) * sy;
            out[6] = (yz + wx) * sy;
            out[7] = 0;
            out[8] = (xz + wy) * sz;
            out[9] = (yz - wx) * sz;
            out[10] = (1 - (xx + yy)) * sz;
            out[11] = 0;
            out[12] = v[0] + ox - (out[0] * ox + out[4] * oy + out[8] * oz);
            out[13] = v[1] + oy - (out[1] * ox + out[5] * oy + out[9] * oz);
            out[14] = v[2] + oz - (out[2] * ox + out[6] * oy + out[10] * oz);
            out[15] = 1;

            return out;
        };

        /**
         * Calculates a 4x4 matrix from the given quaternion
         *
         * @param {mat4} out mat4 receiving operation result
         * @param {quat} q Quaternion to create matrix from
         *
         * @returns {mat4} out
         */
        mat4.fromQuat = function (out, q) {
            var x = q[0],
                y = q[1],
                z = q[2],
                w = q[3],
                x2 = x + x,
                y2 = y + y,
                z2 = z + z,
                xx = x * x2,
                yx = y * x2,
                yy = y * y2,
                zx = z * x2,
                zy = z * y2,
                zz = z * z2,
                wx = w * x2,
                wy = w * y2,
                wz = w * z2;

            out[0] = 1 - yy - zz;
            out[1] = yx + wz;
            out[2] = zx - wy;
            out[3] = 0;

            out[4] = yx - wz;
            out[5] = 1 - xx - zz;
            out[6] = zy + wx;
            out[7] = 0;

            out[8] = zx + wy;
            out[9] = zy - wx;
            out[10] = 1 - xx - yy;
            out[11] = 0;

            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 1;

            return out;
        };

        /**
         * Generates a frustum matrix with the given bounds
         *
         * @param {mat4} out mat4 frustum matrix will be written into
         * @param {Number} left Left bound of the frustum
         * @param {Number} right Right bound of the frustum
         * @param {Number} bottom Bottom bound of the frustum
         * @param {Number} top Top bound of the frustum
         * @param {Number} near Near bound of the frustum
         * @param {Number} far Far bound of the frustum
         * @returns {mat4} out
         */
        mat4.frustum = function (out, left, right, bottom, top, near, far) {
            var rl = 1 / (right - left),
                tb = 1 / (top - bottom),
                nf = 1 / (near - far);
            out[0] = near * 2 * rl;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = near * 2 * tb;
            out[6] = 0;
            out[7] = 0;
            out[8] = (right + left) * rl;
            out[9] = (top + bottom) * tb;
            out[10] = (far + near) * nf;
            out[11] = -1;
            out[12] = 0;
            out[13] = 0;
            out[14] = far * near * 2 * nf;
            out[15] = 0;
            return out;
        };

        /**
         * Generates a perspective projection matrix with the given bounds
         *
         * @param {mat4} out mat4 frustum matrix will be written into
         * @param {number} fovy Vertical field of view in radians
         * @param {number} aspect Aspect ratio. typically viewport width/height
         * @param {number} near Near bound of the frustum
         * @param {number} far Far bound of the frustum
         * @returns {mat4} out
         */
        mat4.perspective = function (out, fovy, aspect, near, far) {
            var f = 1.0 / Math.tan(fovy / 2),
                nf = 1 / (near - far);
            out[0] = f / aspect;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = f;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = (far + near) * nf;
            out[11] = -1;
            out[12] = 0;
            out[13] = 0;
            out[14] = 2 * far * near * nf;
            out[15] = 0;
            return out;
        };

        /**
         * Generates a perspective projection matrix with the given field of view.
         * This is primarily useful for generating projection matrices to be used
         * with the still experiemental WebVR API.
         *
         * @param {mat4} out mat4 frustum matrix will be written into
         * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
         * @param {number} near Near bound of the frustum
         * @param {number} far Far bound of the frustum
         * @returns {mat4} out
         */
        mat4.perspectiveFromFieldOfView = function (out, fov, near, far) {
            var upTan = Math.tan(fov.upDegrees * Math.PI / 180.0),
                downTan = Math.tan(fov.downDegrees * Math.PI / 180.0),
                leftTan = Math.tan(fov.leftDegrees * Math.PI / 180.0),
                rightTan = Math.tan(fov.rightDegrees * Math.PI / 180.0),
                xScale = 2.0 / (leftTan + rightTan),
                yScale = 2.0 / (upTan + downTan);

            out[0] = xScale;
            out[1] = 0.0;
            out[2] = 0.0;
            out[3] = 0.0;
            out[4] = 0.0;
            out[5] = yScale;
            out[6] = 0.0;
            out[7] = 0.0;
            out[8] = -((leftTan - rightTan) * xScale * 0.5);
            out[9] = (upTan - downTan) * yScale * 0.5;
            out[10] = far / (near - far);
            out[11] = -1.0;
            out[12] = 0.0;
            out[13] = 0.0;
            out[14] = far * near / (near - far);
            out[15] = 0.0;
            return out;
        };

        /**
         * Generates a orthogonal projection matrix with the given bounds
         *
         * @param {mat4} out mat4 frustum matrix will be written into
         * @param {number} left Left bound of the frustum
         * @param {number} right Right bound of the frustum
         * @param {number} bottom Bottom bound of the frustum
         * @param {number} top Top bound of the frustum
         * @param {number} near Near bound of the frustum
         * @param {number} far Far bound of the frustum
         * @returns {mat4} out
         */
        mat4.ortho = function (out, left, right, bottom, top, near, far) {
            var lr = 1 / (left - right),
                bt = 1 / (bottom - top),
                nf = 1 / (near - far);
            out[0] = -2 * lr;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = -2 * bt;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 2 * nf;
            out[11] = 0;
            out[12] = (left + right) * lr;
            out[13] = (top + bottom) * bt;
            out[14] = (far + near) * nf;
            out[15] = 1;
            return out;
        };

        /**
         * Generates a look-at matrix with the given eye position, focal point, and up axis
         *
         * @param {mat4} out mat4 frustum matrix will be written into
         * @param {vec3} eye Position of the viewer
         * @param {vec3} center Point the viewer is looking at
         * @param {vec3} up vec3 pointing up
         * @returns {mat4} out
         */
        mat4.lookAt = function (out, eye, center, up) {
            var x0,
                x1,
                x2,
                y0,
                y1,
                y2,
                z0,
                z1,
                z2,
                len,
                eyex = eye[0],
                eyey = eye[1],
                eyez = eye[2],
                upx = up[0],
                upy = up[1],
                upz = up[2],
                centerx = center[0],
                centery = center[1],
                centerz = center[2];

            if (Math.abs(eyex - centerx) < glMatrix.EPSILON && Math.abs(eyey - centery) < glMatrix.EPSILON && Math.abs(eyez - centerz) < glMatrix.EPSILON) {
                return mat4.identity(out);
            }

            z0 = eyex - centerx;
            z1 = eyey - centery;
            z2 = eyez - centerz;

            len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
            z0 *= len;
            z1 *= len;
            z2 *= len;

            x0 = upy * z2 - upz * z1;
            x1 = upz * z0 - upx * z2;
            x2 = upx * z1 - upy * z0;
            len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
            if (!len) {
                x0 = 0;
                x1 = 0;
                x2 = 0;
            } else {
                len = 1 / len;
                x0 *= len;
                x1 *= len;
                x2 *= len;
            }

            y0 = z1 * x2 - z2 * x1;
            y1 = z2 * x0 - z0 * x2;
            y2 = z0 * x1 - z1 * x0;

            len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
            if (!len) {
                y0 = 0;
                y1 = 0;
                y2 = 0;
            } else {
                len = 1 / len;
                y0 *= len;
                y1 *= len;
                y2 *= len;
            }

            out[0] = x0;
            out[1] = y0;
            out[2] = z0;
            out[3] = 0;
            out[4] = x1;
            out[5] = y1;
            out[6] = z1;
            out[7] = 0;
            out[8] = x2;
            out[9] = y2;
            out[10] = z2;
            out[11] = 0;
            out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
            out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
            out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
            out[15] = 1;

            return out;
        };

        /**
         * Returns a string representation of a mat4
         *
         * @param {mat4} mat matrix to represent as a string
         * @returns {String} string representation of the matrix
         */
        mat4.str = function (a) {
            return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' + a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
        };

        /**
         * Returns Frobenius norm of a mat4
         *
         * @param {mat4} a the matrix to calculate Frobenius norm of
         * @returns {Number} Frobenius norm
         */
        mat4.frob = function (a) {
            return Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) + Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2));
        };

        /**
         * Adds two mat4's
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the first operand
         * @param {mat4} b the second operand
         * @returns {mat4} out
         */
        mat4.add = function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            out[3] = a[3] + b[3];
            out[4] = a[4] + b[4];
            out[5] = a[5] + b[5];
            out[6] = a[6] + b[6];
            out[7] = a[7] + b[7];
            out[8] = a[8] + b[8];
            out[9] = a[9] + b[9];
            out[10] = a[10] + b[10];
            out[11] = a[11] + b[11];
            out[12] = a[12] + b[12];
            out[13] = a[13] + b[13];
            out[14] = a[14] + b[14];
            out[15] = a[15] + b[15];
            return out;
        };

        /**
         * Subtracts matrix b from matrix a
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the first operand
         * @param {mat4} b the second operand
         * @returns {mat4} out
         */
        mat4.subtract = function (out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            out[3] = a[3] - b[3];
            out[4] = a[4] - b[4];
            out[5] = a[5] - b[5];
            out[6] = a[6] - b[6];
            out[7] = a[7] - b[7];
            out[8] = a[8] - b[8];
            out[9] = a[9] - b[9];
            out[10] = a[10] - b[10];
            out[11] = a[11] - b[11];
            out[12] = a[12] - b[12];
            out[13] = a[13] - b[13];
            out[14] = a[14] - b[14];
            out[15] = a[15] - b[15];
            return out;
        };

        /**
         * Alias for {@link mat4.subtract}
         * @function
         */
        mat4.sub = mat4.subtract;

        /**
         * Multiply each element of the matrix by a scalar.
         *
         * @param {mat4} out the receiving matrix
         * @param {mat4} a the matrix to scale
         * @param {Number} b amount to scale the matrix's elements by
         * @returns {mat4} out
         */
        mat4.multiplyScalar = function (out, a, b) {
            out[0] = a[0] * b;
            out[1] = a[1] * b;
            out[2] = a[2] * b;
            out[3] = a[3] * b;
            out[4] = a[4] * b;
            out[5] = a[5] * b;
            out[6] = a[6] * b;
            out[7] = a[7] * b;
            out[8] = a[8] * b;
            out[9] = a[9] * b;
            out[10] = a[10] * b;
            out[11] = a[11] * b;
            out[12] = a[12] * b;
            out[13] = a[13] * b;
            out[14] = a[14] * b;
            out[15] = a[15] * b;
            return out;
        };

        /**
         * Adds two mat4's after multiplying each element of the second operand by a scalar value.
         *
         * @param {mat4} out the receiving vector
         * @param {mat4} a the first operand
         * @param {mat4} b the second operand
         * @param {Number} scale the amount to scale b's elements by before adding
         * @returns {mat4} out
         */
        mat4.multiplyScalarAndAdd = function (out, a, b, scale) {
            out[0] = a[0] + b[0] * scale;
            out[1] = a[1] + b[1] * scale;
            out[2] = a[2] + b[2] * scale;
            out[3] = a[3] + b[3] * scale;
            out[4] = a[4] + b[4] * scale;
            out[5] = a[5] + b[5] * scale;
            out[6] = a[6] + b[6] * scale;
            out[7] = a[7] + b[7] * scale;
            out[8] = a[8] + b[8] * scale;
            out[9] = a[9] + b[9] * scale;
            out[10] = a[10] + b[10] * scale;
            out[11] = a[11] + b[11] * scale;
            out[12] = a[12] + b[12] * scale;
            out[13] = a[13] + b[13] * scale;
            out[14] = a[14] + b[14] * scale;
            out[15] = a[15] + b[15] * scale;
            return out;
        };

        /**
         * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
         *
         * @param {mat4} a The first matrix.
         * @param {mat4} b The second matrix.
         * @returns {Boolean} True if the matrices are equal, false otherwise.
         */
        mat4.exactEquals = function (a, b) {
            return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
        };

        /**
         * Returns whether or not the matrices have approximately the same elements in the same position.
         *
         * @param {mat4} a The first matrix.
         * @param {mat4} b The second matrix.
         * @returns {Boolean} True if the matrices are equal, false otherwise.
         */
        mat4.equals = function (a, b) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3],
                a4 = a[4],
                a5 = a[5],
                a6 = a[6],
                a7 = a[7],
                a8 = a[8],
                a9 = a[9],
                a10 = a[10],
                a11 = a[11],
                a12 = a[12],
                a13 = a[13],
                a14 = a[14],
                a15 = a[15];

            var b0 = b[0],
                b1 = b[1],
                b2 = b[2],
                b3 = b[3],
                b4 = b[4],
                b5 = b[5],
                b6 = b[6],
                b7 = b[7],
                b8 = b[8],
                b9 = b[9],
                b10 = b[10],
                b11 = b[11],
                b12 = b[12],
                b13 = b[13],
                b14 = b[14],
                b15 = b[15];

            return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15));
        };

        module.exports = mat4;
    }, { "./common.js": 20 }], 25: [function (require, module, exports) {
        /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
        
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
        
        The above copyright notice and this permission notice shall be included in
        all copies or substantial portions of the Software.
        
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE. */

        var glMatrix = require("./common.js");
        var mat3 = require("./mat3.js");
        var vec3 = require("./vec3.js");
        var vec4 = require("./vec4.js");

        /**
         * @class Quaternion
         * @name quat
         */
        var quat = {};

        /**
         * Creates a new identity quat
         *
         * @returns {quat} a new quaternion
         */
        quat.create = function () {
            var out = new glMatrix.ARRAY_TYPE(4);
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        };

        /**
         * Sets a quaternion to represent the shortest rotation from one
         * vector to another.
         *
         * Both vectors are assumed to be unit length.
         *
         * @param {quat} out the receiving quaternion.
         * @param {vec3} a the initial vector
         * @param {vec3} b the destination vector
         * @returns {quat} out
         */
        quat.rotationTo = function () {
            var tmpvec3 = vec3.create();
            var xUnitVec3 = vec3.fromValues(1, 0, 0);
            var yUnitVec3 = vec3.fromValues(0, 1, 0);

            return function (out, a, b) {
                var dot = vec3.dot(a, b);
                if (dot < -0.999999) {
                    vec3.cross(tmpvec3, xUnitVec3, a);
                    if (vec3.length(tmpvec3) < 0.000001) vec3.cross(tmpvec3, yUnitVec3, a);
                    vec3.normalize(tmpvec3, tmpvec3);
                    quat.setAxisAngle(out, tmpvec3, Math.PI);
                    return out;
                } else if (dot > 0.999999) {
                    out[0] = 0;
                    out[1] = 0;
                    out[2] = 0;
                    out[3] = 1;
                    return out;
                } else {
                    vec3.cross(tmpvec3, a, b);
                    out[0] = tmpvec3[0];
                    out[1] = tmpvec3[1];
                    out[2] = tmpvec3[2];
                    out[3] = 1 + dot;
                    return quat.normalize(out, out);
                }
            };
        }();

        /**
         * Sets the specified quaternion with values corresponding to the given
         * axes. Each axis is a vec3 and is expected to be unit length and
         * perpendicular to all other specified axes.
         *
         * @param {vec3} view  the vector representing the viewing direction
         * @param {vec3} right the vector representing the local "right" direction
         * @param {vec3} up    the vector representing the local "up" direction
         * @returns {quat} out
         */
        quat.setAxes = function () {
            var matr = mat3.create();

            return function (out, view, right, up) {
                matr[0] = right[0];
                matr[3] = right[1];
                matr[6] = right[2];

                matr[1] = up[0];
                matr[4] = up[1];
                matr[7] = up[2];

                matr[2] = -view[0];
                matr[5] = -view[1];
                matr[8] = -view[2];

                return quat.normalize(out, quat.fromMat3(out, matr));
            };
        }();

        /**
         * Creates a new quat initialized with values from an existing quaternion
         *
         * @param {quat} a quaternion to clone
         * @returns {quat} a new quaternion
         * @function
         */
        quat.clone = vec4.clone;

        /**
         * Creates a new quat initialized with the given values
         *
         * @param {Number} x X component
         * @param {Number} y Y component
         * @param {Number} z Z component
         * @param {Number} w W component
         * @returns {quat} a new quaternion
         * @function
         */
        quat.fromValues = vec4.fromValues;

        /**
         * Copy the values from one quat to another
         *
         * @param {quat} out the receiving quaternion
         * @param {quat} a the source quaternion
         * @returns {quat} out
         * @function
         */
        quat.copy = vec4.copy;

        /**
         * Set the components of a quat to the given values
         *
         * @param {quat} out the receiving quaternion
         * @param {Number} x X component
         * @param {Number} y Y component
         * @param {Number} z Z component
         * @param {Number} w W component
         * @returns {quat} out
         * @function
         */
        quat.set = vec4.set;

        /**
         * Set a quat to the identity quaternion
         *
         * @param {quat} out the receiving quaternion
         * @returns {quat} out
         */
        quat.identity = function (out) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        };

        /**
         * Sets a quat from the given angle and rotation axis,
         * then returns it.
         *
         * @param {quat} out the receiving quaternion
         * @param {vec3} axis the axis around which to rotate
         * @param {Number} rad the angle in radians
         * @returns {quat} out
         **/
        quat.setAxisAngle = function (out, axis, rad) {
            rad = rad * 0.5;
            var s = Math.sin(rad);
            out[0] = s * axis[0];
            out[1] = s * axis[1];
            out[2] = s * axis[2];
            out[3] = Math.cos(rad);
            return out;
        };

        /**
         * Gets the rotation axis and angle for a given
         *  quaternion. If a quaternion is created with
         *  setAxisAngle, this method will return the same
         *  values as providied in the original parameter list
         *  OR functionally equivalent values.
         * Example: The quaternion formed by axis [0, 0, 1] and
         *  angle -90 is the same as the quaternion formed by
         *  [0, 0, 1] and 270. This method favors the latter.
         * @param  {vec3} out_axis  Vector receiving the axis of rotation
         * @param  {quat} q     Quaternion to be decomposed
         * @return {Number}     Angle, in radians, of the rotation
         */
        quat.getAxisAngle = function (out_axis, q) {
            var rad = Math.acos(q[3]) * 2.0;
            var s = Math.sin(rad / 2.0);
            if (s != 0.0) {
                out_axis[0] = q[0] / s;
                out_axis[1] = q[1] / s;
                out_axis[2] = q[2] / s;
            } else {
                // If s is zero, return any axis (no rotation - axis does not matter)
                out_axis[0] = 1;
                out_axis[1] = 0;
                out_axis[2] = 0;
            }
            return rad;
        };

        /**
         * Adds two quat's
         *
         * @param {quat} out the receiving quaternion
         * @param {quat} a the first operand
         * @param {quat} b the second operand
         * @returns {quat} out
         * @function
         */
        quat.add = vec4.add;

        /**
         * Multiplies two quat's
         *
         * @param {quat} out the receiving quaternion
         * @param {quat} a the first operand
         * @param {quat} b the second operand
         * @returns {quat} out
         */
        quat.multiply = function (out, a, b) {
            var ax = a[0],
                ay = a[1],
                az = a[2],
                aw = a[3],
                bx = b[0],
                by = b[1],
                bz = b[2],
                bw = b[3];

            out[0] = ax * bw + aw * bx + ay * bz - az * by;
            out[1] = ay * bw + aw * by + az * bx - ax * bz;
            out[2] = az * bw + aw * bz + ax * by - ay * bx;
            out[3] = aw * bw - ax * bx - ay * by - az * bz;
            return out;
        };

        /**
         * Alias for {@link quat.multiply}
         * @function
         */
        quat.mul = quat.multiply;

        /**
         * Scales a quat by a scalar number
         *
         * @param {quat} out the receiving vector
         * @param {quat} a the vector to scale
         * @param {Number} b amount to scale the vector by
         * @returns {quat} out
         * @function
         */
        quat.scale = vec4.scale;

        /**
         * Rotates a quaternion by the given angle about the X axis
         *
         * @param {quat} out quat receiving operation result
         * @param {quat} a quat to rotate
         * @param {number} rad angle (in radians) to rotate
         * @returns {quat} out
         */
        quat.rotateX = function (out, a, rad) {
            rad *= 0.5;

            var ax = a[0],
                ay = a[1],
                az = a[2],
                aw = a[3],
                bx = Math.sin(rad),
                bw = Math.cos(rad);

            out[0] = ax * bw + aw * bx;
            out[1] = ay * bw + az * bx;
            out[2] = az * bw - ay * bx;
            out[3] = aw * bw - ax * bx;
            return out;
        };

        /**
         * Rotates a quaternion by the given angle about the Y axis
         *
         * @param {quat} out quat receiving operation result
         * @param {quat} a quat to rotate
         * @param {number} rad angle (in radians) to rotate
         * @returns {quat} out
         */
        quat.rotateY = function (out, a, rad) {
            rad *= 0.5;

            var ax = a[0],
                ay = a[1],
                az = a[2],
                aw = a[3],
                by = Math.sin(rad),
                bw = Math.cos(rad);

            out[0] = ax * bw - az * by;
            out[1] = ay * bw + aw * by;
            out[2] = az * bw + ax * by;
            out[3] = aw * bw - ay * by;
            return out;
        };

        /**
         * Rotates a quaternion by the given angle about the Z axis
         *
         * @param {quat} out quat receiving operation result
         * @param {quat} a quat to rotate
         * @param {number} rad angle (in radians) to rotate
         * @returns {quat} out
         */
        quat.rotateZ = function (out, a, rad) {
            rad *= 0.5;

            var ax = a[0],
                ay = a[1],
                az = a[2],
                aw = a[3],
                bz = Math.sin(rad),
                bw = Math.cos(rad);

            out[0] = ax * bw + ay * bz;
            out[1] = ay * bw - ax * bz;
            out[2] = az * bw + aw * bz;
            out[3] = aw * bw - az * bz;
            return out;
        };

        /**
         * Calculates the W component of a quat from the X, Y, and Z components.
         * Assumes that quaternion is 1 unit in length.
         * Any existing W component will be ignored.
         *
         * @param {quat} out the receiving quaternion
         * @param {quat} a quat to calculate W component of
         * @returns {quat} out
         */
        quat.calculateW = function (out, a) {
            var x = a[0],
                y = a[1],
                z = a[2];

            out[0] = x;
            out[1] = y;
            out[2] = z;
            out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
            return out;
        };

        /**
         * Calculates the dot product of two quat's
         *
         * @param {quat} a the first operand
         * @param {quat} b the second operand
         * @returns {Number} dot product of a and b
         * @function
         */
        quat.dot = vec4.dot;

        /**
         * Performs a linear interpolation between two quat's
         *
         * @param {quat} out the receiving quaternion
         * @param {quat} a the first operand
         * @param {quat} b the second operand
         * @param {Number} t interpolation amount between the two inputs
         * @returns {quat} out
         * @function
         */
        quat.lerp = vec4.lerp;

        /**
         * Performs a spherical linear interpolation between two quat
         *
         * @param {quat} out the receiving quaternion
         * @param {quat} a the first operand
         * @param {quat} b the second operand
         * @param {Number} t interpolation amount between the two inputs
         * @returns {quat} out
         */
        quat.slerp = function (out, a, b, t) {
            // benchmarks:
            //    http://jsperf.com/quaternion-slerp-implementations

            var ax = a[0],
                ay = a[1],
                az = a[2],
                aw = a[3],
                bx = b[0],
                by = b[1],
                bz = b[2],
                bw = b[3];

            var omega, cosom, sinom, scale0, scale1;

            // calc cosine
            cosom = ax * bx + ay * by + az * bz + aw * bw;
            // adjust signs (if necessary)
            if (cosom < 0.0) {
                cosom = -cosom;
                bx = -bx;
                by = -by;
                bz = -bz;
                bw = -bw;
            }
            // calculate coefficients
            if (1.0 - cosom > 0.000001) {
                // standard case (slerp)
                omega = Math.acos(cosom);
                sinom = Math.sin(omega);
                scale0 = Math.sin((1.0 - t) * omega) / sinom;
                scale1 = Math.sin(t * omega) / sinom;
            } else {
                // "from" and "to" quaternions are very close 
                //  ... so we can do a linear interpolation
                scale0 = 1.0 - t;
                scale1 = t;
            }
            // calculate final values
            out[0] = scale0 * ax + scale1 * bx;
            out[1] = scale0 * ay + scale1 * by;
            out[2] = scale0 * az + scale1 * bz;
            out[3] = scale0 * aw + scale1 * bw;

            return out;
        };

        /**
         * Performs a spherical linear interpolation with two control points
         *
         * @param {quat} out the receiving quaternion
         * @param {quat} a the first operand
         * @param {quat} b the second operand
         * @param {quat} c the third operand
         * @param {quat} d the fourth operand
         * @param {Number} t interpolation amount
         * @returns {quat} out
         */
        quat.sqlerp = function () {
            var temp1 = quat.create();
            var temp2 = quat.create();

            return function (out, a, b, c, d, t) {
                quat.slerp(temp1, a, d, t);
                quat.slerp(temp2, b, c, t);
                quat.slerp(out, temp1, temp2, 2 * t * (1 - t));

                return out;
            };
        }();

        /**
         * Calculates the inverse of a quat
         *
         * @param {quat} out the receiving quaternion
         * @param {quat} a quat to calculate inverse of
         * @returns {quat} out
         */
        quat.invert = function (out, a) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3],
                dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3,
                invDot = dot ? 1.0 / dot : 0;

            // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

            out[0] = -a0 * invDot;
            out[1] = -a1 * invDot;
            out[2] = -a2 * invDot;
            out[3] = a3 * invDot;
            return out;
        };

        /**
         * Calculates the conjugate of a quat
         * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
         *
         * @param {quat} out the receiving quaternion
         * @param {quat} a quat to calculate conjugate of
         * @returns {quat} out
         */
        quat.conjugate = function (out, a) {
            out[0] = -a[0];
            out[1] = -a[1];
            out[2] = -a[2];
            out[3] = a[3];
            return out;
        };

        /**
         * Calculates the length of a quat
         *
         * @param {quat} a vector to calculate length of
         * @returns {Number} length of a
         * @function
         */
        quat.length = vec4.length;

        /**
         * Alias for {@link quat.length}
         * @function
         */
        quat.len = quat.length;

        /**
         * Calculates the squared length of a quat
         *
         * @param {quat} a vector to calculate squared length of
         * @returns {Number} squared length of a
         * @function
         */
        quat.squaredLength = vec4.squaredLength;

        /**
         * Alias for {@link quat.squaredLength}
         * @function
         */
        quat.sqrLen = quat.squaredLength;

        /**
         * Normalize a quat
         *
         * @param {quat} out the receiving quaternion
         * @param {quat} a quaternion to normalize
         * @returns {quat} out
         * @function
         */
        quat.normalize = vec4.normalize;

        /**
         * Creates a quaternion from the given 3x3 rotation matrix.
         *
         * NOTE: The resultant quaternion is not normalized, so you should be sure
         * to renormalize the quaternion yourself where necessary.
         *
         * @param {quat} out the receiving quaternion
         * @param {mat3} m rotation matrix
         * @returns {quat} out
         * @function
         */
        quat.fromMat3 = function (out, m) {
            // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
            // article "Quaternion Calculus and Fast Animation".
            var fTrace = m[0] + m[4] + m[8];
            var fRoot;

            if (fTrace > 0.0) {
                // |w| > 1/2, may as well choose w > 1/2
                fRoot = Math.sqrt(fTrace + 1.0); // 2w
                out[3] = 0.5 * fRoot;
                fRoot = 0.5 / fRoot; // 1/(4w)
                out[0] = (m[5] - m[7]) * fRoot;
                out[1] = (m[6] - m[2]) * fRoot;
                out[2] = (m[1] - m[3]) * fRoot;
            } else {
                // |w| <= 1/2
                var i = 0;
                if (m[4] > m[0]) i = 1;
                if (m[8] > m[i * 3 + i]) i = 2;
                var j = (i + 1) % 3;
                var k = (i + 2) % 3;

                fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
                out[i] = 0.5 * fRoot;
                fRoot = 0.5 / fRoot;
                out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
                out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
                out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
            }

            return out;
        };

        /**
         * Returns a string representation of a quatenion
         *
         * @param {quat} vec vector to represent as a string
         * @returns {String} string representation of the vector
         */
        quat.str = function (a) {
            return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
        };

        /**
         * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
         *
         * @param {quat} a The first quaternion.
         * @param {quat} b The second quaternion.
         * @returns {Boolean} True if the vectors are equal, false otherwise.
         */
        quat.exactEquals = vec4.exactEquals;

        /**
         * Returns whether or not the quaternions have approximately the same elements in the same position.
         *
         * @param {quat} a The first vector.
         * @param {quat} b The second vector.
         * @returns {Boolean} True if the vectors are equal, false otherwise.
         */
        quat.equals = vec4.equals;

        module.exports = quat;
    }, { "./common.js": 20, "./mat3.js": 23, "./vec3.js": 27, "./vec4.js": 28 }], 26: [function (require, module, exports) {
        /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
        
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
        
        The above copyright notice and this permission notice shall be included in
        all copies or substantial portions of the Software.
        
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE. */

        var glMatrix = require("./common.js");

        /**
         * @class 2 Dimensional Vector
         * @name vec2
         */
        var vec2 = {};

        /**
         * Creates a new, empty vec2
         *
         * @returns {vec2} a new 2D vector
         */
        vec2.create = function () {
            var out = new glMatrix.ARRAY_TYPE(2);
            out[0] = 0;
            out[1] = 0;
            return out;
        };

        /**
         * Creates a new vec2 initialized with values from an existing vector
         *
         * @param {vec2} a vector to clone
         * @returns {vec2} a new 2D vector
         */
        vec2.clone = function (a) {
            var out = new glMatrix.ARRAY_TYPE(2);
            out[0] = a[0];
            out[1] = a[1];
            return out;
        };

        /**
         * Creates a new vec2 initialized with the given values
         *
         * @param {Number} x X component
         * @param {Number} y Y component
         * @returns {vec2} a new 2D vector
         */
        vec2.fromValues = function (x, y) {
            var out = new glMatrix.ARRAY_TYPE(2);
            out[0] = x;
            out[1] = y;
            return out;
        };

        /**
         * Copy the values from one vec2 to another
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the source vector
         * @returns {vec2} out
         */
        vec2.copy = function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            return out;
        };

        /**
         * Set the components of a vec2 to the given values
         *
         * @param {vec2} out the receiving vector
         * @param {Number} x X component
         * @param {Number} y Y component
         * @returns {vec2} out
         */
        vec2.set = function (out, x, y) {
            out[0] = x;
            out[1] = y;
            return out;
        };

        /**
         * Adds two vec2's
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {vec2} out
         */
        vec2.add = function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            return out;
        };

        /**
         * Subtracts vector b from vector a
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {vec2} out
         */
        vec2.subtract = function (out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            return out;
        };

        /**
         * Alias for {@link vec2.subtract}
         * @function
         */
        vec2.sub = vec2.subtract;

        /**
         * Multiplies two vec2's
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {vec2} out
         */
        vec2.multiply = function (out, a, b) {
            out[0] = a[0] * b[0];
            out[1] = a[1] * b[1];
            return out;
        };

        /**
         * Alias for {@link vec2.multiply}
         * @function
         */
        vec2.mul = vec2.multiply;

        /**
         * Divides two vec2's
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {vec2} out
         */
        vec2.divide = function (out, a, b) {
            out[0] = a[0] / b[0];
            out[1] = a[1] / b[1];
            return out;
        };

        /**
         * Alias for {@link vec2.divide}
         * @function
         */
        vec2.div = vec2.divide;

        /**
         * Math.ceil the components of a vec2
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a vector to ceil
         * @returns {vec2} out
         */
        vec2.ceil = function (out, a) {
            out[0] = Math.ceil(a[0]);
            out[1] = Math.ceil(a[1]);
            return out;
        };

        /**
         * Math.floor the components of a vec2
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a vector to floor
         * @returns {vec2} out
         */
        vec2.floor = function (out, a) {
            out[0] = Math.floor(a[0]);
            out[1] = Math.floor(a[1]);
            return out;
        };

        /**
         * Returns the minimum of two vec2's
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {vec2} out
         */
        vec2.min = function (out, a, b) {
            out[0] = Math.min(a[0], b[0]);
            out[1] = Math.min(a[1], b[1]);
            return out;
        };

        /**
         * Returns the maximum of two vec2's
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {vec2} out
         */
        vec2.max = function (out, a, b) {
            out[0] = Math.max(a[0], b[0]);
            out[1] = Math.max(a[1], b[1]);
            return out;
        };

        /**
         * Math.round the components of a vec2
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a vector to round
         * @returns {vec2} out
         */
        vec2.round = function (out, a) {
            out[0] = Math.round(a[0]);
            out[1] = Math.round(a[1]);
            return out;
        };

        /**
         * Scales a vec2 by a scalar number
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the vector to scale
         * @param {Number} b amount to scale the vector by
         * @returns {vec2} out
         */
        vec2.scale = function (out, a, b) {
            out[0] = a[0] * b;
            out[1] = a[1] * b;
            return out;
        };

        /**
         * Adds two vec2's after scaling the second operand by a scalar value
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @param {Number} scale the amount to scale b by before adding
         * @returns {vec2} out
         */
        vec2.scaleAndAdd = function (out, a, b, scale) {
            out[0] = a[0] + b[0] * scale;
            out[1] = a[1] + b[1] * scale;
            return out;
        };

        /**
         * Calculates the euclidian distance between two vec2's
         *
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {Number} distance between a and b
         */
        vec2.distance = function (a, b) {
            var x = b[0] - a[0],
                y = b[1] - a[1];
            return Math.sqrt(x * x + y * y);
        };

        /**
         * Alias for {@link vec2.distance}
         * @function
         */
        vec2.dist = vec2.distance;

        /**
         * Calculates the squared euclidian distance between two vec2's
         *
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {Number} squared distance between a and b
         */
        vec2.squaredDistance = function (a, b) {
            var x = b[0] - a[0],
                y = b[1] - a[1];
            return x * x + y * y;
        };

        /**
         * Alias for {@link vec2.squaredDistance}
         * @function
         */
        vec2.sqrDist = vec2.squaredDistance;

        /**
         * Calculates the length of a vec2
         *
         * @param {vec2} a vector to calculate length of
         * @returns {Number} length of a
         */
        vec2.length = function (a) {
            var x = a[0],
                y = a[1];
            return Math.sqrt(x * x + y * y);
        };

        /**
         * Alias for {@link vec2.length}
         * @function
         */
        vec2.len = vec2.length;

        /**
         * Calculates the squared length of a vec2
         *
         * @param {vec2} a vector to calculate squared length of
         * @returns {Number} squared length of a
         */
        vec2.squaredLength = function (a) {
            var x = a[0],
                y = a[1];
            return x * x + y * y;
        };

        /**
         * Alias for {@link vec2.squaredLength}
         * @function
         */
        vec2.sqrLen = vec2.squaredLength;

        /**
         * Negates the components of a vec2
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a vector to negate
         * @returns {vec2} out
         */
        vec2.negate = function (out, a) {
            out[0] = -a[0];
            out[1] = -a[1];
            return out;
        };

        /**
         * Returns the inverse of the components of a vec2
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a vector to invert
         * @returns {vec2} out
         */
        vec2.inverse = function (out, a) {
            out[0] = 1.0 / a[0];
            out[1] = 1.0 / a[1];
            return out;
        };

        /**
         * Normalize a vec2
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a vector to normalize
         * @returns {vec2} out
         */
        vec2.normalize = function (out, a) {
            var x = a[0],
                y = a[1];
            var len = x * x + y * y;
            if (len > 0) {
                //TODO: evaluate use of glm_invsqrt here?
                len = 1 / Math.sqrt(len);
                out[0] = a[0] * len;
                out[1] = a[1] * len;
            }
            return out;
        };

        /**
         * Calculates the dot product of two vec2's
         *
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {Number} dot product of a and b
         */
        vec2.dot = function (a, b) {
            return a[0] * b[0] + a[1] * b[1];
        };

        /**
         * Computes the cross product of two vec2's
         * Note that the cross product must by definition produce a 3D vector
         *
         * @param {vec3} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {vec3} out
         */
        vec2.cross = function (out, a, b) {
            var z = a[0] * b[1] - a[1] * b[0];
            out[0] = out[1] = 0;
            out[2] = z;
            return out;
        };

        /**
         * Performs a linear interpolation between two vec2's
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @param {Number} t interpolation amount between the two inputs
         * @returns {vec2} out
         */
        vec2.lerp = function (out, a, b, t) {
            var ax = a[0],
                ay = a[1];
            out[0] = ax + t * (b[0] - ax);
            out[1] = ay + t * (b[1] - ay);
            return out;
        };

        /**
         * Generates a random vector with the given scale
         *
         * @param {vec2} out the receiving vector
         * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
         * @returns {vec2} out
         */
        vec2.random = function (out, scale) {
            scale = scale || 1.0;
            var r = glMatrix.RANDOM() * 2.0 * Math.PI;
            out[0] = Math.cos(r) * scale;
            out[1] = Math.sin(r) * scale;
            return out;
        };

        /**
         * Transforms the vec2 with a mat2
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the vector to transform
         * @param {mat2} m matrix to transform with
         * @returns {vec2} out
         */
        vec2.transformMat2 = function (out, a, m) {
            var x = a[0],
                y = a[1];
            out[0] = m[0] * x + m[2] * y;
            out[1] = m[1] * x + m[3] * y;
            return out;
        };

        /**
         * Transforms the vec2 with a mat2d
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the vector to transform
         * @param {mat2d} m matrix to transform with
         * @returns {vec2} out
         */
        vec2.transformMat2d = function (out, a, m) {
            var x = a[0],
                y = a[1];
            out[0] = m[0] * x + m[2] * y + m[4];
            out[1] = m[1] * x + m[3] * y + m[5];
            return out;
        };

        /**
         * Transforms the vec2 with a mat3
         * 3rd vector component is implicitly '1'
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the vector to transform
         * @param {mat3} m matrix to transform with
         * @returns {vec2} out
         */
        vec2.transformMat3 = function (out, a, m) {
            var x = a[0],
                y = a[1];
            out[0] = m[0] * x + m[3] * y + m[6];
            out[1] = m[1] * x + m[4] * y + m[7];
            return out;
        };

        /**
         * Transforms the vec2 with a mat4
         * 3rd vector component is implicitly '0'
         * 4th vector component is implicitly '1'
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the vector to transform
         * @param {mat4} m matrix to transform with
         * @returns {vec2} out
         */
        vec2.transformMat4 = function (out, a, m) {
            var x = a[0],
                y = a[1];
            out[0] = m[0] * x + m[4] * y + m[12];
            out[1] = m[1] * x + m[5] * y + m[13];
            return out;
        };

        /**
         * Perform some operation over an array of vec2s.
         *
         * @param {Array} a the array of vectors to iterate over
         * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
         * @param {Number} offset Number of elements to skip at the beginning of the array
         * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
         * @param {Function} fn Function to call for each vector in the array
         * @param {Object} [arg] additional argument to pass to fn
         * @returns {Array} a
         * @function
         */
        vec2.forEach = function () {
            var vec = vec2.create();

            return function (a, stride, offset, count, fn, arg) {
                var i, l;
                if (!stride) {
                    stride = 2;
                }

                if (!offset) {
                    offset = 0;
                }

                if (count) {
                    l = Math.min(count * stride + offset, a.length);
                } else {
                    l = a.length;
                }

                for (i = offset; i < l; i += stride) {
                    vec[0] = a[i];vec[1] = a[i + 1];
                    fn(vec, vec, arg);
                    a[i] = vec[0];a[i + 1] = vec[1];
                }

                return a;
            };
        }();

        /**
         * Returns a string representation of a vector
         *
         * @param {vec2} vec vector to represent as a string
         * @returns {String} string representation of the vector
         */
        vec2.str = function (a) {
            return 'vec2(' + a[0] + ', ' + a[1] + ')';
        };

        /**
         * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
         *
         * @param {vec2} a The first vector.
         * @param {vec2} b The second vector.
         * @returns {Boolean} True if the vectors are equal, false otherwise.
         */
        vec2.exactEquals = function (a, b) {
            return a[0] === b[0] && a[1] === b[1];
        };

        /**
         * Returns whether or not the vectors have approximately the same elements in the same position.
         *
         * @param {vec2} a The first vector.
         * @param {vec2} b The second vector.
         * @returns {Boolean} True if the vectors are equal, false otherwise.
         */
        vec2.equals = function (a, b) {
            var a0 = a[0],
                a1 = a[1];
            var b0 = b[0],
                b1 = b[1];
            return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1));
        };

        module.exports = vec2;
    }, { "./common.js": 20 }], 27: [function (require, module, exports) {
        /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
        
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
        
        The above copyright notice and this permission notice shall be included in
        all copies or substantial portions of the Software.
        
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE. */

        var glMatrix = require("./common.js");

        /**
         * @class 3 Dimensional Vector
         * @name vec3
         */
        var vec3 = {};

        /**
         * Creates a new, empty vec3
         *
         * @returns {vec3} a new 3D vector
         */
        vec3.create = function () {
            var out = new glMatrix.ARRAY_TYPE(3);
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            return out;
        };

        /**
         * Creates a new vec3 initialized with values from an existing vector
         *
         * @param {vec3} a vector to clone
         * @returns {vec3} a new 3D vector
         */
        vec3.clone = function (a) {
            var out = new glMatrix.ARRAY_TYPE(3);
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            return out;
        };

        /**
         * Creates a new vec3 initialized with the given values
         *
         * @param {Number} x X component
         * @param {Number} y Y component
         * @param {Number} z Z component
         * @returns {vec3} a new 3D vector
         */
        vec3.fromValues = function (x, y, z) {
            var out = new glMatrix.ARRAY_TYPE(3);
            out[0] = x;
            out[1] = y;
            out[2] = z;
            return out;
        };

        /**
         * Copy the values from one vec3 to another
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the source vector
         * @returns {vec3} out
         */
        vec3.copy = function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            return out;
        };

        /**
         * Set the components of a vec3 to the given values
         *
         * @param {vec3} out the receiving vector
         * @param {Number} x X component
         * @param {Number} y Y component
         * @param {Number} z Z component
         * @returns {vec3} out
         */
        vec3.set = function (out, x, y, z) {
            out[0] = x;
            out[1] = y;
            out[2] = z;
            return out;
        };

        /**
         * Adds two vec3's
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {vec3} out
         */
        vec3.add = function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            return out;
        };

        /**
         * Subtracts vector b from vector a
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {vec3} out
         */
        vec3.subtract = function (out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            return out;
        };

        /**
         * Alias for {@link vec3.subtract}
         * @function
         */
        vec3.sub = vec3.subtract;

        /**
         * Multiplies two vec3's
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {vec3} out
         */
        vec3.multiply = function (out, a, b) {
            out[0] = a[0] * b[0];
            out[1] = a[1] * b[1];
            out[2] = a[2] * b[2];
            return out;
        };

        /**
         * Alias for {@link vec3.multiply}
         * @function
         */
        vec3.mul = vec3.multiply;

        /**
         * Divides two vec3's
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {vec3} out
         */
        vec3.divide = function (out, a, b) {
            out[0] = a[0] / b[0];
            out[1] = a[1] / b[1];
            out[2] = a[2] / b[2];
            return out;
        };

        /**
         * Alias for {@link vec3.divide}
         * @function
         */
        vec3.div = vec3.divide;

        /**
         * Math.ceil the components of a vec3
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a vector to ceil
         * @returns {vec3} out
         */
        vec3.ceil = function (out, a) {
            out[0] = Math.ceil(a[0]);
            out[1] = Math.ceil(a[1]);
            out[2] = Math.ceil(a[2]);
            return out;
        };

        /**
         * Math.floor the components of a vec3
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a vector to floor
         * @returns {vec3} out
         */
        vec3.floor = function (out, a) {
            out[0] = Math.floor(a[0]);
            out[1] = Math.floor(a[1]);
            out[2] = Math.floor(a[2]);
            return out;
        };

        /**
         * Returns the minimum of two vec3's
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {vec3} out
         */
        vec3.min = function (out, a, b) {
            out[0] = Math.min(a[0], b[0]);
            out[1] = Math.min(a[1], b[1]);
            out[2] = Math.min(a[2], b[2]);
            return out;
        };

        /**
         * Returns the maximum of two vec3's
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {vec3} out
         */
        vec3.max = function (out, a, b) {
            out[0] = Math.max(a[0], b[0]);
            out[1] = Math.max(a[1], b[1]);
            out[2] = Math.max(a[2], b[2]);
            return out;
        };

        /**
         * Math.round the components of a vec3
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a vector to round
         * @returns {vec3} out
         */
        vec3.round = function (out, a) {
            out[0] = Math.round(a[0]);
            out[1] = Math.round(a[1]);
            out[2] = Math.round(a[2]);
            return out;
        };

        /**
         * Scales a vec3 by a scalar number
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the vector to scale
         * @param {Number} b amount to scale the vector by
         * @returns {vec3} out
         */
        vec3.scale = function (out, a, b) {
            out[0] = a[0] * b;
            out[1] = a[1] * b;
            out[2] = a[2] * b;
            return out;
        };

        /**
         * Adds two vec3's after scaling the second operand by a scalar value
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @param {Number} scale the amount to scale b by before adding
         * @returns {vec3} out
         */
        vec3.scaleAndAdd = function (out, a, b, scale) {
            out[0] = a[0] + b[0] * scale;
            out[1] = a[1] + b[1] * scale;
            out[2] = a[2] + b[2] * scale;
            return out;
        };

        /**
         * Calculates the euclidian distance between two vec3's
         *
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {Number} distance between a and b
         */
        vec3.distance = function (a, b) {
            var x = b[0] - a[0],
                y = b[1] - a[1],
                z = b[2] - a[2];
            return Math.sqrt(x * x + y * y + z * z);
        };

        /**
         * Alias for {@link vec3.distance}
         * @function
         */
        vec3.dist = vec3.distance;

        /**
         * Calculates the squared euclidian distance between two vec3's
         *
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {Number} squared distance between a and b
         */
        vec3.squaredDistance = function (a, b) {
            var x = b[0] - a[0],
                y = b[1] - a[1],
                z = b[2] - a[2];
            return x * x + y * y + z * z;
        };

        /**
         * Alias for {@link vec3.squaredDistance}
         * @function
         */
        vec3.sqrDist = vec3.squaredDistance;

        /**
         * Calculates the length of a vec3
         *
         * @param {vec3} a vector to calculate length of
         * @returns {Number} length of a
         */
        vec3.length = function (a) {
            var x = a[0],
                y = a[1],
                z = a[2];
            return Math.sqrt(x * x + y * y + z * z);
        };

        /**
         * Alias for {@link vec3.length}
         * @function
         */
        vec3.len = vec3.length;

        /**
         * Calculates the squared length of a vec3
         *
         * @param {vec3} a vector to calculate squared length of
         * @returns {Number} squared length of a
         */
        vec3.squaredLength = function (a) {
            var x = a[0],
                y = a[1],
                z = a[2];
            return x * x + y * y + z * z;
        };

        /**
         * Alias for {@link vec3.squaredLength}
         * @function
         */
        vec3.sqrLen = vec3.squaredLength;

        /**
         * Negates the components of a vec3
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a vector to negate
         * @returns {vec3} out
         */
        vec3.negate = function (out, a) {
            out[0] = -a[0];
            out[1] = -a[1];
            out[2] = -a[2];
            return out;
        };

        /**
         * Returns the inverse of the components of a vec3
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a vector to invert
         * @returns {vec3} out
         */
        vec3.inverse = function (out, a) {
            out[0] = 1.0 / a[0];
            out[1] = 1.0 / a[1];
            out[2] = 1.0 / a[2];
            return out;
        };

        /**
         * Normalize a vec3
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a vector to normalize
         * @returns {vec3} out
         */
        vec3.normalize = function (out, a) {
            var x = a[0],
                y = a[1],
                z = a[2];
            var len = x * x + y * y + z * z;
            if (len > 0) {
                //TODO: evaluate use of glm_invsqrt here?
                len = 1 / Math.sqrt(len);
                out[0] = a[0] * len;
                out[1] = a[1] * len;
                out[2] = a[2] * len;
            }
            return out;
        };

        /**
         * Calculates the dot product of two vec3's
         *
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {Number} dot product of a and b
         */
        vec3.dot = function (a, b) {
            return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        };

        /**
         * Computes the cross product of two vec3's
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {vec3} out
         */
        vec3.cross = function (out, a, b) {
            var ax = a[0],
                ay = a[1],
                az = a[2],
                bx = b[0],
                by = b[1],
                bz = b[2];

            out[0] = ay * bz - az * by;
            out[1] = az * bx - ax * bz;
            out[2] = ax * by - ay * bx;
            return out;
        };

        /**
         * Performs a linear interpolation between two vec3's
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @param {Number} t interpolation amount between the two inputs
         * @returns {vec3} out
         */
        vec3.lerp = function (out, a, b, t) {
            var ax = a[0],
                ay = a[1],
                az = a[2];
            out[0] = ax + t * (b[0] - ax);
            out[1] = ay + t * (b[1] - ay);
            out[2] = az + t * (b[2] - az);
            return out;
        };

        /**
         * Performs a hermite interpolation with two control points
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @param {vec3} c the third operand
         * @param {vec3} d the fourth operand
         * @param {Number} t interpolation amount between the two inputs
         * @returns {vec3} out
         */
        vec3.hermite = function (out, a, b, c, d, t) {
            var factorTimes2 = t * t,
                factor1 = factorTimes2 * (2 * t - 3) + 1,
                factor2 = factorTimes2 * (t - 2) + t,
                factor3 = factorTimes2 * (t - 1),
                factor4 = factorTimes2 * (3 - 2 * t);

            out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
            out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
            out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

            return out;
        };

        /**
         * Performs a bezier interpolation with two control points
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @param {vec3} c the third operand
         * @param {vec3} d the fourth operand
         * @param {Number} t interpolation amount between the two inputs
         * @returns {vec3} out
         */
        vec3.bezier = function (out, a, b, c, d, t) {
            var inverseFactor = 1 - t,
                inverseFactorTimesTwo = inverseFactor * inverseFactor,
                factorTimes2 = t * t,
                factor1 = inverseFactorTimesTwo * inverseFactor,
                factor2 = 3 * t * inverseFactorTimesTwo,
                factor3 = 3 * factorTimes2 * inverseFactor,
                factor4 = factorTimes2 * t;

            out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
            out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
            out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

            return out;
        };

        /**
         * Generates a random vector with the given scale
         *
         * @param {vec3} out the receiving vector
         * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
         * @returns {vec3} out
         */
        vec3.random = function (out, scale) {
            scale = scale || 1.0;

            var r = glMatrix.RANDOM() * 2.0 * Math.PI;
            var z = glMatrix.RANDOM() * 2.0 - 1.0;
            var zScale = Math.sqrt(1.0 - z * z) * scale;

            out[0] = Math.cos(r) * zScale;
            out[1] = Math.sin(r) * zScale;
            out[2] = z * scale;
            return out;
        };

        /**
         * Transforms the vec3 with a mat4.
         * 4th vector component is implicitly '1'
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the vector to transform
         * @param {mat4} m matrix to transform with
         * @returns {vec3} out
         */
        vec3.transformMat4 = function (out, a, m) {
            var x = a[0],
                y = a[1],
                z = a[2],
                w = m[3] * x + m[7] * y + m[11] * z + m[15];
            w = w || 1.0;
            out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
            out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
            out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
            return out;
        };

        /**
         * Transforms the vec3 with a mat3.
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the vector to transform
         * @param {mat4} m the 3x3 matrix to transform with
         * @returns {vec3} out
         */
        vec3.transformMat3 = function (out, a, m) {
            var x = a[0],
                y = a[1],
                z = a[2];
            out[0] = x * m[0] + y * m[3] + z * m[6];
            out[1] = x * m[1] + y * m[4] + z * m[7];
            out[2] = x * m[2] + y * m[5] + z * m[8];
            return out;
        };

        /**
         * Transforms the vec3 with a quat
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the vector to transform
         * @param {quat} q quaternion to transform with
         * @returns {vec3} out
         */
        vec3.transformQuat = function (out, a, q) {
            // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

            var x = a[0],
                y = a[1],
                z = a[2],
                qx = q[0],
                qy = q[1],
                qz = q[2],
                qw = q[3],


            // calculate quat * vec
            ix = qw * x + qy * z - qz * y,
                iy = qw * y + qz * x - qx * z,
                iz = qw * z + qx * y - qy * x,
                iw = -qx * x - qy * y - qz * z;

            // calculate result * inverse quat
            out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
            return out;
        };

        /**
         * Rotate a 3D vector around the x-axis
         * @param {vec3} out The receiving vec3
         * @param {vec3} a The vec3 point to rotate
         * @param {vec3} b The origin of the rotation
         * @param {Number} c The angle of rotation
         * @returns {vec3} out
         */
        vec3.rotateX = function (out, a, b, c) {
            var p = [],
                r = [];
            //Translate point to the origin
            p[0] = a[0] - b[0];
            p[1] = a[1] - b[1];
            p[2] = a[2] - b[2];

            //perform rotation
            r[0] = p[0];
            r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
            r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);

            //translate to correct position
            out[0] = r[0] + b[0];
            out[1] = r[1] + b[1];
            out[2] = r[2] + b[2];

            return out;
        };

        /**
         * Rotate a 3D vector around the y-axis
         * @param {vec3} out The receiving vec3
         * @param {vec3} a The vec3 point to rotate
         * @param {vec3} b The origin of the rotation
         * @param {Number} c The angle of rotation
         * @returns {vec3} out
         */
        vec3.rotateY = function (out, a, b, c) {
            var p = [],
                r = [];
            //Translate point to the origin
            p[0] = a[0] - b[0];
            p[1] = a[1] - b[1];
            p[2] = a[2] - b[2];

            //perform rotation
            r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
            r[1] = p[1];
            r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);

            //translate to correct position
            out[0] = r[0] + b[0];
            out[1] = r[1] + b[1];
            out[2] = r[2] + b[2];

            return out;
        };

        /**
         * Rotate a 3D vector around the z-axis
         * @param {vec3} out The receiving vec3
         * @param {vec3} a The vec3 point to rotate
         * @param {vec3} b The origin of the rotation
         * @param {Number} c The angle of rotation
         * @returns {vec3} out
         */
        vec3.rotateZ = function (out, a, b, c) {
            var p = [],
                r = [];
            //Translate point to the origin
            p[0] = a[0] - b[0];
            p[1] = a[1] - b[1];
            p[2] = a[2] - b[2];

            //perform rotation
            r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
            r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
            r[2] = p[2];

            //translate to correct position
            out[0] = r[0] + b[0];
            out[1] = r[1] + b[1];
            out[2] = r[2] + b[2];

            return out;
        };

        /**
         * Perform some operation over an array of vec3s.
         *
         * @param {Array} a the array of vectors to iterate over
         * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
         * @param {Number} offset Number of elements to skip at the beginning of the array
         * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
         * @param {Function} fn Function to call for each vector in the array
         * @param {Object} [arg] additional argument to pass to fn
         * @returns {Array} a
         * @function
         */
        vec3.forEach = function () {
            var vec = vec3.create();

            return function (a, stride, offset, count, fn, arg) {
                var i, l;
                if (!stride) {
                    stride = 3;
                }

                if (!offset) {
                    offset = 0;
                }

                if (count) {
                    l = Math.min(count * stride + offset, a.length);
                } else {
                    l = a.length;
                }

                for (i = offset; i < l; i += stride) {
                    vec[0] = a[i];vec[1] = a[i + 1];vec[2] = a[i + 2];
                    fn(vec, vec, arg);
                    a[i] = vec[0];a[i + 1] = vec[1];a[i + 2] = vec[2];
                }

                return a;
            };
        }();

        /**
         * Get the angle between two 3D vectors
         * @param {vec3} a The first operand
         * @param {vec3} b The second operand
         * @returns {Number} The angle in radians
         */
        vec3.angle = function (a, b) {

            var tempA = vec3.fromValues(a[0], a[1], a[2]);
            var tempB = vec3.fromValues(b[0], b[1], b[2]);

            vec3.normalize(tempA, tempA);
            vec3.normalize(tempB, tempB);

            var cosine = vec3.dot(tempA, tempB);

            if (cosine > 1.0) {
                return 0;
            } else {
                return Math.acos(cosine);
            }
        };

        /**
         * Returns a string representation of a vector
         *
         * @param {vec3} vec vector to represent as a string
         * @returns {String} string representation of the vector
         */
        vec3.str = function (a) {
            return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
        };

        /**
         * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
         *
         * @param {vec3} a The first vector.
         * @param {vec3} b The second vector.
         * @returns {Boolean} True if the vectors are equal, false otherwise.
         */
        vec3.exactEquals = function (a, b) {
            return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
        };

        /**
         * Returns whether or not the vectors have approximately the same elements in the same position.
         *
         * @param {vec3} a The first vector.
         * @param {vec3} b The second vector.
         * @returns {Boolean} True if the vectors are equal, false otherwise.
         */
        vec3.equals = function (a, b) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2];
            var b0 = b[0],
                b1 = b[1],
                b2 = b[2];
            return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2));
        };

        module.exports = vec3;
    }, { "./common.js": 20 }], 28: [function (require, module, exports) {
        /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.
        
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:
        
        The above copyright notice and this permission notice shall be included in
        all copies or substantial portions of the Software.
        
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE. */

        var glMatrix = require("./common.js");

        /**
         * @class 4 Dimensional Vector
         * @name vec4
         */
        var vec4 = {};

        /**
         * Creates a new, empty vec4
         *
         * @returns {vec4} a new 4D vector
         */
        vec4.create = function () {
            var out = new glMatrix.ARRAY_TYPE(4);
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            return out;
        };

        /**
         * Creates a new vec4 initialized with values from an existing vector
         *
         * @param {vec4} a vector to clone
         * @returns {vec4} a new 4D vector
         */
        vec4.clone = function (a) {
            var out = new glMatrix.ARRAY_TYPE(4);
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            return out;
        };

        /**
         * Creates a new vec4 initialized with the given values
         *
         * @param {Number} x X component
         * @param {Number} y Y component
         * @param {Number} z Z component
         * @param {Number} w W component
         * @returns {vec4} a new 4D vector
         */
        vec4.fromValues = function (x, y, z, w) {
            var out = new glMatrix.ARRAY_TYPE(4);
            out[0] = x;
            out[1] = y;
            out[2] = z;
            out[3] = w;
            return out;
        };

        /**
         * Copy the values from one vec4 to another
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the source vector
         * @returns {vec4} out
         */
        vec4.copy = function (out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            return out;
        };

        /**
         * Set the components of a vec4 to the given values
         *
         * @param {vec4} out the receiving vector
         * @param {Number} x X component
         * @param {Number} y Y component
         * @param {Number} z Z component
         * @param {Number} w W component
         * @returns {vec4} out
         */
        vec4.set = function (out, x, y, z, w) {
            out[0] = x;
            out[1] = y;
            out[2] = z;
            out[3] = w;
            return out;
        };

        /**
         * Adds two vec4's
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {vec4} out
         */
        vec4.add = function (out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            out[3] = a[3] + b[3];
            return out;
        };

        /**
         * Subtracts vector b from vector a
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {vec4} out
         */
        vec4.subtract = function (out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            out[3] = a[3] - b[3];
            return out;
        };

        /**
         * Alias for {@link vec4.subtract}
         * @function
         */
        vec4.sub = vec4.subtract;

        /**
         * Multiplies two vec4's
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {vec4} out
         */
        vec4.multiply = function (out, a, b) {
            out[0] = a[0] * b[0];
            out[1] = a[1] * b[1];
            out[2] = a[2] * b[2];
            out[3] = a[3] * b[3];
            return out;
        };

        /**
         * Alias for {@link vec4.multiply}
         * @function
         */
        vec4.mul = vec4.multiply;

        /**
         * Divides two vec4's
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {vec4} out
         */
        vec4.divide = function (out, a, b) {
            out[0] = a[0] / b[0];
            out[1] = a[1] / b[1];
            out[2] = a[2] / b[2];
            out[3] = a[3] / b[3];
            return out;
        };

        /**
         * Alias for {@link vec4.divide}
         * @function
         */
        vec4.div = vec4.divide;

        /**
         * Math.ceil the components of a vec4
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a vector to ceil
         * @returns {vec4} out
         */
        vec4.ceil = function (out, a) {
            out[0] = Math.ceil(a[0]);
            out[1] = Math.ceil(a[1]);
            out[2] = Math.ceil(a[2]);
            out[3] = Math.ceil(a[3]);
            return out;
        };

        /**
         * Math.floor the components of a vec4
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a vector to floor
         * @returns {vec4} out
         */
        vec4.floor = function (out, a) {
            out[0] = Math.floor(a[0]);
            out[1] = Math.floor(a[1]);
            out[2] = Math.floor(a[2]);
            out[3] = Math.floor(a[3]);
            return out;
        };

        /**
         * Returns the minimum of two vec4's
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {vec4} out
         */
        vec4.min = function (out, a, b) {
            out[0] = Math.min(a[0], b[0]);
            out[1] = Math.min(a[1], b[1]);
            out[2] = Math.min(a[2], b[2]);
            out[3] = Math.min(a[3], b[3]);
            return out;
        };

        /**
         * Returns the maximum of two vec4's
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {vec4} out
         */
        vec4.max = function (out, a, b) {
            out[0] = Math.max(a[0], b[0]);
            out[1] = Math.max(a[1], b[1]);
            out[2] = Math.max(a[2], b[2]);
            out[3] = Math.max(a[3], b[3]);
            return out;
        };

        /**
         * Math.round the components of a vec4
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a vector to round
         * @returns {vec4} out
         */
        vec4.round = function (out, a) {
            out[0] = Math.round(a[0]);
            out[1] = Math.round(a[1]);
            out[2] = Math.round(a[2]);
            out[3] = Math.round(a[3]);
            return out;
        };

        /**
         * Scales a vec4 by a scalar number
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the vector to scale
         * @param {Number} b amount to scale the vector by
         * @returns {vec4} out
         */
        vec4.scale = function (out, a, b) {
            out[0] = a[0] * b;
            out[1] = a[1] * b;
            out[2] = a[2] * b;
            out[3] = a[3] * b;
            return out;
        };

        /**
         * Adds two vec4's after scaling the second operand by a scalar value
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @param {Number} scale the amount to scale b by before adding
         * @returns {vec4} out
         */
        vec4.scaleAndAdd = function (out, a, b, scale) {
            out[0] = a[0] + b[0] * scale;
            out[1] = a[1] + b[1] * scale;
            out[2] = a[2] + b[2] * scale;
            out[3] = a[3] + b[3] * scale;
            return out;
        };

        /**
         * Calculates the euclidian distance between two vec4's
         *
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {Number} distance between a and b
         */
        vec4.distance = function (a, b) {
            var x = b[0] - a[0],
                y = b[1] - a[1],
                z = b[2] - a[2],
                w = b[3] - a[3];
            return Math.sqrt(x * x + y * y + z * z + w * w);
        };

        /**
         * Alias for {@link vec4.distance}
         * @function
         */
        vec4.dist = vec4.distance;

        /**
         * Calculates the squared euclidian distance between two vec4's
         *
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {Number} squared distance between a and b
         */
        vec4.squaredDistance = function (a, b) {
            var x = b[0] - a[0],
                y = b[1] - a[1],
                z = b[2] - a[2],
                w = b[3] - a[3];
            return x * x + y * y + z * z + w * w;
        };

        /**
         * Alias for {@link vec4.squaredDistance}
         * @function
         */
        vec4.sqrDist = vec4.squaredDistance;

        /**
         * Calculates the length of a vec4
         *
         * @param {vec4} a vector to calculate length of
         * @returns {Number} length of a
         */
        vec4.length = function (a) {
            var x = a[0],
                y = a[1],
                z = a[2],
                w = a[3];
            return Math.sqrt(x * x + y * y + z * z + w * w);
        };

        /**
         * Alias for {@link vec4.length}
         * @function
         */
        vec4.len = vec4.length;

        /**
         * Calculates the squared length of a vec4
         *
         * @param {vec4} a vector to calculate squared length of
         * @returns {Number} squared length of a
         */
        vec4.squaredLength = function (a) {
            var x = a[0],
                y = a[1],
                z = a[2],
                w = a[3];
            return x * x + y * y + z * z + w * w;
        };

        /**
         * Alias for {@link vec4.squaredLength}
         * @function
         */
        vec4.sqrLen = vec4.squaredLength;

        /**
         * Negates the components of a vec4
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a vector to negate
         * @returns {vec4} out
         */
        vec4.negate = function (out, a) {
            out[0] = -a[0];
            out[1] = -a[1];
            out[2] = -a[2];
            out[3] = -a[3];
            return out;
        };

        /**
         * Returns the inverse of the components of a vec4
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a vector to invert
         * @returns {vec4} out
         */
        vec4.inverse = function (out, a) {
            out[0] = 1.0 / a[0];
            out[1] = 1.0 / a[1];
            out[2] = 1.0 / a[2];
            out[3] = 1.0 / a[3];
            return out;
        };

        /**
         * Normalize a vec4
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a vector to normalize
         * @returns {vec4} out
         */
        vec4.normalize = function (out, a) {
            var x = a[0],
                y = a[1],
                z = a[2],
                w = a[3];
            var len = x * x + y * y + z * z + w * w;
            if (len > 0) {
                len = 1 / Math.sqrt(len);
                out[0] = x * len;
                out[1] = y * len;
                out[2] = z * len;
                out[3] = w * len;
            }
            return out;
        };

        /**
         * Calculates the dot product of two vec4's
         *
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {Number} dot product of a and b
         */
        vec4.dot = function (a, b) {
            return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
        };

        /**
         * Performs a linear interpolation between two vec4's
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @param {Number} t interpolation amount between the two inputs
         * @returns {vec4} out
         */
        vec4.lerp = function (out, a, b, t) {
            var ax = a[0],
                ay = a[1],
                az = a[2],
                aw = a[3];
            out[0] = ax + t * (b[0] - ax);
            out[1] = ay + t * (b[1] - ay);
            out[2] = az + t * (b[2] - az);
            out[3] = aw + t * (b[3] - aw);
            return out;
        };

        /**
         * Generates a random vector with the given scale
         *
         * @param {vec4} out the receiving vector
         * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
         * @returns {vec4} out
         */
        vec4.random = function (out, scale) {
            scale = scale || 1.0;

            //TODO: This is a pretty awful way of doing this. Find something better.
            out[0] = glMatrix.RANDOM();
            out[1] = glMatrix.RANDOM();
            out[2] = glMatrix.RANDOM();
            out[3] = glMatrix.RANDOM();
            vec4.normalize(out, out);
            vec4.scale(out, out, scale);
            return out;
        };

        /**
         * Transforms the vec4 with a mat4.
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the vector to transform
         * @param {mat4} m matrix to transform with
         * @returns {vec4} out
         */
        vec4.transformMat4 = function (out, a, m) {
            var x = a[0],
                y = a[1],
                z = a[2],
                w = a[3];
            out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
            out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
            out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
            out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
            return out;
        };

        /**
         * Transforms the vec4 with a quat
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the vector to transform
         * @param {quat} q quaternion to transform with
         * @returns {vec4} out
         */
        vec4.transformQuat = function (out, a, q) {
            var x = a[0],
                y = a[1],
                z = a[2],
                qx = q[0],
                qy = q[1],
                qz = q[2],
                qw = q[3],


            // calculate quat * vec
            ix = qw * x + qy * z - qz * y,
                iy = qw * y + qz * x - qx * z,
                iz = qw * z + qx * y - qy * x,
                iw = -qx * x - qy * y - qz * z;

            // calculate result * inverse quat
            out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
            out[3] = a[3];
            return out;
        };

        /**
         * Perform some operation over an array of vec4s.
         *
         * @param {Array} a the array of vectors to iterate over
         * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
         * @param {Number} offset Number of elements to skip at the beginning of the array
         * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
         * @param {Function} fn Function to call for each vector in the array
         * @param {Object} [arg] additional argument to pass to fn
         * @returns {Array} a
         * @function
         */
        vec4.forEach = function () {
            var vec = vec4.create();

            return function (a, stride, offset, count, fn, arg) {
                var i, l;
                if (!stride) {
                    stride = 4;
                }

                if (!offset) {
                    offset = 0;
                }

                if (count) {
                    l = Math.min(count * stride + offset, a.length);
                } else {
                    l = a.length;
                }

                for (i = offset; i < l; i += stride) {
                    vec[0] = a[i];vec[1] = a[i + 1];vec[2] = a[i + 2];vec[3] = a[i + 3];
                    fn(vec, vec, arg);
                    a[i] = vec[0];a[i + 1] = vec[1];a[i + 2] = vec[2];a[i + 3] = vec[3];
                }

                return a;
            };
        }();

        /**
         * Returns a string representation of a vector
         *
         * @param {vec4} vec vector to represent as a string
         * @returns {String} string representation of the vector
         */
        vec4.str = function (a) {
            return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
        };

        /**
         * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
         *
         * @param {vec4} a The first vector.
         * @param {vec4} b The second vector.
         * @returns {Boolean} True if the vectors are equal, false otherwise.
         */
        vec4.exactEquals = function (a, b) {
            return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
        };

        /**
         * Returns whether or not the vectors have approximately the same elements in the same position.
         *
         * @param {vec4} a The first vector.
         * @param {vec4} b The second vector.
         * @returns {Boolean} True if the vectors are equal, false otherwise.
         */
        vec4.equals = function (a, b) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3];
            var b0 = b[0],
                b1 = b[1],
                b2 = b[2],
                b3 = b[3];
            return Math.abs(a0 - b0) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= glMatrix.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3));
        };

        module.exports = vec4;
    }, { "./common.js": 20 }], 29: [function (require, module, exports) {
        module.exports = add;

        /**
         * Adds two vec3's
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {vec3} out
         */
        function add(out, a, b) {
            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];
            return out;
        }
    }, {}], 30: [function (require, module, exports) {
        module.exports = copy;

        /**
         * Copy the values from one vec3 to another
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the source vector
         * @returns {vec3} out
         */
        function copy(out, a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            return out;
        }
    }, {}], 31: [function (require, module, exports) {
        module.exports = cross;

        /**
         * Computes the cross product of two vec3's
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {vec3} out
         */
        function cross(out, a, b) {
            var ax = a[0],
                ay = a[1],
                az = a[2],
                bx = b[0],
                by = b[1],
                bz = b[2];

            out[0] = ay * bz - az * by;
            out[1] = az * bx - ax * bz;
            out[2] = ax * by - ay * bx;
            return out;
        }
    }, {}], 32: [function (require, module, exports) {
        module.exports = dot;

        /**
         * Calculates the dot product of two vec3's
         *
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {Number} dot product of a and b
         */
        function dot(a, b) {
            return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        }
    }, {}], 33: [function (require, module, exports) {
        module.exports = normalize;

        /**
         * Normalize a vec3
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a vector to normalize
         * @returns {vec3} out
         */
        function normalize(out, a) {
            var x = a[0],
                y = a[1],
                z = a[2];
            var len = x * x + y * y + z * z;
            if (len > 0) {
                //TODO: evaluate use of glm_invsqrt here?
                len = 1 / Math.sqrt(len);
                out[0] = a[0] * len;
                out[1] = a[1] * len;
                out[2] = a[2] * len;
            }
            return out;
        }
    }, {}], 34: [function (require, module, exports) {
        module.exports = scale;

        /**
         * Scales a vec3 by a scalar number
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the vector to scale
         * @param {Number} b amount to scale the vector by
         * @returns {vec3} out
         */
        function scale(out, a, b) {
            out[0] = a[0] * b;
            out[1] = a[1] * b;
            out[2] = a[2] * b;
            return out;
        }
    }, {}], 35: [function (require, module, exports) {
        module.exports = scaleAndAdd;

        /**
         * Adds two vec3's after scaling the second operand by a scalar value
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @param {Number} scale the amount to scale b by before adding
         * @returns {vec3} out
         */
        function scaleAndAdd(out, a, b, scale) {
            out[0] = a[0] + b[0] * scale;
            out[1] = a[1] + b[1] * scale;
            out[2] = a[2] + b[2] * scale;
            return out;
        }
    }, {}], 36: [function (require, module, exports) {
        module.exports = set;

        /**
         * Set the components of a vec3 to the given values
         *
         * @param {vec3} out the receiving vector
         * @param {Number} x X component
         * @param {Number} y Y component
         * @param {Number} z Z component
         * @returns {vec3} out
         */
        function set(out, x, y, z) {
            out[0] = x;
            out[1] = y;
            out[2] = z;
            return out;
        }
    }, {}], 37: [function (require, module, exports) {
        module.exports = squaredDistance;

        /**
         * Calculates the squared euclidian distance between two vec3's
         *
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {Number} squared distance between a and b
         */
        function squaredDistance(a, b) {
            var x = b[0] - a[0],
                y = b[1] - a[1],
                z = b[2] - a[2];
            return x * x + y * y + z * z;
        }
    }, {}], 38: [function (require, module, exports) {
        module.exports = subtract;

        /**
         * Subtracts vector b from vector a
         *
         * @param {vec3} out the receiving vector
         * @param {vec3} a the first operand
         * @param {vec3} b the second operand
         * @returns {vec3} out
         */
        function subtract(out, a, b) {
            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];
            return out;
        }
    }, {}], 39: [function (require, module, exports) {
        module.exports = set;

        /**
         * Set the components of a vec4 to the given values
         *
         * @param {vec4} out the receiving vector
         * @param {Number} x X component
         * @param {Number} y Y component
         * @param {Number} z Z component
         * @param {Number} w W component
         * @returns {vec4} out
         */
        function set(out, x, y, z, w) {
            out[0] = x;
            out[1] = y;
            out[2] = z;
            out[3] = w;
            return out;
        }
    }, {}], 40: [function (require, module, exports) {
        module.exports = transformMat4;

        /**
         * Transforms the vec4 with a mat4.
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the vector to transform
         * @param {mat4} m matrix to transform with
         * @returns {vec4} out
         */
        function transformMat4(out, a, m) {
            var x = a[0],
                y = a[1],
                z = a[2],
                w = a[3];
            out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
            out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
            out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
            out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
            return out;
        }
    }, {}], 41: [function (require, module, exports) {
        exports.generatePerlinNoise = generatePerlinNoise;
        exports.generateWhiteNoise = generateWhiteNoise;

        function generatePerlinNoise(width, height, options) {
            options = options || {};
            var octaveCount = options.octaveCount || 4;
            var amplitude = options.amplitude || 0.1;
            var persistence = options.persistence || 0.2;
            var whiteNoise = generateWhiteNoise(width, height);

            var smoothNoiseList = new Array(octaveCount);
            var i;
            for (i = 0; i < octaveCount; ++i) {
                smoothNoiseList[i] = generateSmoothNoise(i);
            }
            var perlinNoise = new Array(width * height);
            var totalAmplitude = 0;
            // blend noise together
            for (i = octaveCount - 1; i >= 0; --i) {
                amplitude *= persistence;
                totalAmplitude += amplitude;

                for (var j = 0; j < perlinNoise.length; ++j) {
                    perlinNoise[j] = perlinNoise[j] || 0;
                    perlinNoise[j] += smoothNoiseList[i][j] * amplitude;
                }
            }
            // normalization
            for (i = 0; i < perlinNoise.length; ++i) {
                perlinNoise[i] /= totalAmplitude;
            }

            return perlinNoise;

            function generateSmoothNoise(octave) {
                var noise = new Array(width * height);
                var samplePeriod = Math.pow(2, octave);
                var sampleFrequency = 1 / samplePeriod;
                var noiseIndex = 0;
                for (var y = 0; y < height; ++y) {
                    var sampleY0 = Math.floor(y / samplePeriod) * samplePeriod;
                    var sampleY1 = (sampleY0 + samplePeriod) % height;
                    var vertBlend = (y - sampleY0) * sampleFrequency;
                    for (var x = 0; x < width; ++x) {
                        var sampleX0 = Math.floor(x / samplePeriod) * samplePeriod;
                        var sampleX1 = (sampleX0 + samplePeriod) % width;
                        var horizBlend = (x - sampleX0) * sampleFrequency;

                        // blend top two corners
                        var top = interpolate(whiteNoise[sampleY0 * width + sampleX0], whiteNoise[sampleY1 * width + sampleX0], vertBlend);
                        // blend bottom two corners
                        var bottom = interpolate(whiteNoise[sampleY0 * width + sampleX1], whiteNoise[sampleY1 * width + sampleX1], vertBlend);
                        // final blend
                        noise[noiseIndex] = interpolate(top, bottom, horizBlend);
                        noiseIndex += 1;
                    }
                }
                return noise;
            }
        }
        function generateWhiteNoise(width, height) {
            var noise = new Array(width * height);
            for (var i = 0; i < noise.length; ++i) {
                noise[i] = Math.random();
            }
            return noise;
        }
        function interpolate(x0, x1, alpha) {
            return x0 * (1 - alpha) + alpha * x1;
        }
    }, {}], 42: [function (require, module, exports) {
        module.exports = require('./lib/camera-perspective');
    }, { "./lib/camera-perspective": 45 }], 43: [function (require, module, exports) {
        var assign = require('object-assign');
        var Ray = require('ray-3d');

        var cameraProject = require('camera-project');
        var cameraUnproject = require('camera-unproject');
        var cameraLookAt = require('./camera-look-at');
        var cameraPickRay = require('camera-picking-ray');

        var add = require('gl-vec3/add');
        var multiply4x4 = require('gl-mat4/multiply');
        var invert4x4 = require('gl-mat4/invert');
        var identity4x4 = require('gl-mat4/identity');
        var setVec3 = require('gl-vec3/set');

        // this could also be useful for a orthographic camera
        module.exports = function cameraBase(opt) {
            opt = opt || {};

            var camera = {
                projection: identity4x4([]),
                view: identity4x4([]),
                position: opt.position || [0, 0, 0],
                direction: opt.direction || [0, 0, -1],
                up: opt.up || [0, 1, 0],
                viewport: opt.viewport || [-1, -1, 1, 1],
                projView: identity4x4([]),
                invProjView: identity4x4([])
            };

            function update() {
                multiply4x4(camera.projView, camera.projection, camera.view);
                var valid = invert4x4(camera.invProjView, camera.projView);
                if (!valid) {
                    throw new Error('camera projection * view is non-invertible');
                }
            }

            function lookAt(target) {
                cameraLookAt(camera.direction, camera.up, camera.position, target);
                return camera;
            }

            function identity() {
                setVec3(camera.position, 0, 0, 0);
                setVec3(camera.direction, 0, 0, -1);
                setVec3(camera.up, 0, 1, 0);
                identity4x4(camera.view);
                identity4x4(camera.projection);
                identity4x4(camera.projView);
                identity4x4(camera.invProjView);
                return camera;
            }

            function translate(vec) {
                add(camera.position, camera.position, vec);
                return camera;
            }

            function createPickingRay(mouse) {
                var ray = new Ray();
                cameraPickRay(ray.origin, ray.direction, mouse, camera.viewport, camera.invProjView);
                return ray;
            }

            function project(point) {
                return cameraProject([], point, camera.viewport, camera.projView);
            }

            function unproject(point) {
                return cameraUnproject([], point, camera.viewport, camera.invProjView);
            }

            return assign(camera, {
                translate: translate,
                identity: identity,
                lookAt: lookAt,
                createPickingRay: createPickingRay,
                update: update,
                project: project,
                unproject: unproject
            });
        };
    }, { "./camera-look-at": 44, "camera-picking-ray": 9, "camera-project": 10, "camera-unproject": 11, "gl-mat4/identity": 14, "gl-mat4/invert": 15, "gl-mat4/multiply": 17, "gl-vec3/add": 29, "gl-vec3/set": 36, "object-assign": 46, "ray-3d": 47 }], 44: [function (require, module, exports) {
        // could be modularized...
        var cross = require('gl-vec3/cross');
        var sub = require('gl-vec3/subtract');
        var normalize = require('gl-vec3/normalize');
        var copy = require('gl-vec3/copy');
        var dot = require('gl-vec3/dot');
        var scale = require('gl-vec3/scale');

        var tmp = [0, 0, 0];
        var epsilon = 0.000000001;

        // modifies direction & up vectors in place
        module.exports = function (direction, up, position, target) {
            sub(tmp, target, position);
            normalize(tmp, tmp);
            var isZero = tmp[0] === 0 && tmp[1] === 0 && tmp[2] === 0;
            if (!isZero) {
                var d = dot(tmp, up);
                if (Math.abs(d - 1) < epsilon) {
                    // collinear
                    scale(up, direction, -1);
                } else if (Math.abs(d + 1) < epsilon) {
                    // collinear opposite
                    copy(up, direction);
                }
                copy(direction, tmp);

                // normalize up vector
                cross(tmp, direction, up);
                normalize(tmp, tmp);

                cross(up, tmp, direction);
                normalize(up, up);
            }
        };
    }, { "gl-vec3/copy": 30, "gl-vec3/cross": 31, "gl-vec3/dot": 32, "gl-vec3/normalize": 33, "gl-vec3/scale": 34, "gl-vec3/subtract": 38 }], 45: [function (require, module, exports) {
        var create = require('./camera-base');
        var assign = require('object-assign');
        var defined = require('defined');

        var perspective = require('gl-mat4/perspective');
        var lookAt4x4 = require('gl-mat4/lookAt');
        var add = require('gl-vec3/add');

        module.exports = function cameraPerspective(opt) {
            opt = opt || {};

            var camera = create(opt);
            camera.fov = defined(opt.fov, Math.PI / 4);
            camera.near = defined(opt.near, 1);
            camera.far = defined(opt.far, 100);

            var center = [0, 0, 0];

            var updateCombined = camera.update;

            function update() {
                var aspect = camera.viewport[2] / camera.viewport[3];

                // build projection matrix
                perspective(camera.projection, camera.fov, aspect, Math.abs(camera.near), Math.abs(camera.far));

                // build view matrix
                add(center, camera.position, camera.direction);
                lookAt4x4(camera.view, camera.position, center, camera.up);

                // update projection * view and invert
                updateCombined();
                return camera;
            }

            // set it up initially from constructor options
            update();
            return assign(camera, {
                update: update
            });
        };
    }, { "./camera-base": 43, "defined": 13, "gl-mat4/lookAt": 16, "gl-mat4/perspective": 18, "gl-vec3/add": 29, "object-assign": 46 }], 46: [function (require, module, exports) {
        'use strict';

        function ToObject(val) {
            if (val == null) {
                throw new TypeError('Object.assign cannot be called with null or undefined');
            }

            return Object(val);
        }

        module.exports = Object.assign || function (target, source) {
            var from;
            var keys;
            var to = ToObject(target);

            for (var s = 1; s < arguments.length; s++) {
                from = arguments[s];
                keys = Object.keys(Object(from));

                for (var i = 0; i < keys.length; i++) {
                    to[keys[i]] = from[keys[i]];
                }
            }

            return to;
        };
    }, {}], 47: [function (require, module, exports) {
        var intersectRayTriangle = require('ray-triangle-intersection');
        var intersectRayPlane = require('ray-plane-intersection');
        var intersectRaySphere = require('ray-sphere-intersection');
        var intersectRayBox = require('ray-aabb-intersection');
        var copy3 = require('gl-vec3/copy');

        var tmpTriangle = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

        var tmp3 = [0, 0, 0];

        module.exports = Ray;
        function Ray(origin, direction) {
            this.origin = origin || [0, 0, 0];
            this.direction = direction || [0, 0, -1];
        }

        Ray.prototype.set = function (origin, direction) {
            this.origin = origin;
            this.direction = direction;
        };

        Ray.prototype.copy = function (other) {
            copy3(this.origin, other.origin);
            copy3(this.direction, other.direction);
        };

        Ray.prototype.clone = function () {
            var other = new Ray();
            other.copy(this);
            return other;
        };

        Ray.prototype.intersectsSphere = function (center, radius) {
            return intersectRaySphere(tmp3, this.origin, this.direction, center, radius);
        };

        Ray.prototype.intersectsPlane = function (normal, distance) {
            return intersectRayPlane(tmp3, this.origin, this.direction, normal, distance);
        };

        Ray.prototype.intersectsTriangle = function (triangle) {
            return intersectRayTriangle(tmp3, this.origin, this.direction, triangle);
        };

        Ray.prototype.intersectsBox = function (aabb) {
            return intersectRayBox(tmp3, this.origin, this.direction, aabb);
        };

        Ray.prototype.intersectsTriangleCell = function (cell, positions) {
            var a = cell[0],
                b = cell[1],
                c = cell[2];
            tmpTriangle[0] = positions[a];
            tmpTriangle[1] = positions[b];
            tmpTriangle[2] = positions[c];
            return this.intersectsTriangle(tmpTriangle);
        };
    }, { "gl-vec3/copy": 30, "ray-aabb-intersection": 48, "ray-plane-intersection": 49, "ray-sphere-intersection": 50, "ray-triangle-intersection": 51 }], 48: [function (require, module, exports) {
        module.exports = intersection;
        module.exports.distance = distance;

        function intersection(out, ro, rd, aabb) {
            var d = distance(ro, rd, aabb);
            if (d === Infinity) {
                out = null;
            } else {
                out = out || [];
                for (var i = 0; i < ro.length; i++) {
                    out[i] = ro[i] + rd[i] * d;
                }
            }

            return out;
        }

        function distance(ro, rd, aabb) {
            var dims = ro.length;
            var lo = -Infinity;
            var hi = +Infinity;

            for (var i = 0; i < dims; i++) {
                var dimLo = (aabb[0][i] - ro[i]) / rd[i];
                var dimHi = (aabb[1][i] - ro[i]) / rd[i];

                if (dimLo > dimHi) {
                    var tmp = dimLo;
                    dimLo = dimHi;
                    dimHi = tmp;
                }

                if (dimHi < lo || dimLo > hi) {
                    return Infinity;
                }

                if (dimLo > lo) lo = dimLo;
                if (dimHi < hi) hi = dimHi;
            }

            return lo > hi ? Infinity : lo;
        }
    }, {}], 49: [function (require, module, exports) {
        var dot = require('gl-vec3/dot');
        var add = require('gl-vec3/add');
        var scale = require('gl-vec3/scale');
        var copy = require('gl-vec3/copy');

        module.exports = intersectRayPlane;

        var v0 = [0, 0, 0];

        function intersectRayPlane(out, origin, direction, normal, dist) {
            var denom = dot(direction, normal);
            if (denom !== 0) {
                var t = -(dot(origin, normal) + dist) / denom;
                if (t < 0) {
                    return null;
                }
                scale(v0, direction, t);
                return add(out, origin, v0);
            } else if (dot(normal, origin) + dist === 0) {
                return copy(out, origin);
            } else {
                return null;
            }
        }
    }, { "gl-vec3/add": 29, "gl-vec3/copy": 30, "gl-vec3/dot": 32, "gl-vec3/scale": 34 }], 50: [function (require, module, exports) {
        var squaredDist = require('gl-vec3/squaredDistance');
        var dot = require('gl-vec3/dot');
        var sub = require('gl-vec3/subtract');
        var scaleAndAdd = require('gl-vec3/scaleAndAdd');
        var scale = require('gl-vec3/scale');
        var add = require('gl-vec3/add');

        var tmp = [0, 0, 0];

        module.exports = intersectRaySphere;
        function intersectRaySphere(out, origin, direction, center, radius) {
            sub(tmp, center, origin);
            var len = dot(direction, tmp);
            if (len < 0) {
                // sphere is behind ray
                return null;
            }

            scaleAndAdd(tmp, origin, direction, len);
            var dSq = squaredDist(center, tmp);
            var rSq = radius * radius;
            if (dSq > rSq) {
                return null;
            }

            scale(out, direction, len - Math.sqrt(rSq - dSq));
            return add(out, out, origin);
        }
    }, { "gl-vec3/add": 29, "gl-vec3/dot": 32, "gl-vec3/scale": 34, "gl-vec3/scaleAndAdd": 35, "gl-vec3/squaredDistance": 37, "gl-vec3/subtract": 38 }], 51: [function (require, module, exports) {
        var cross = require('gl-vec3/cross');
        var dot = require('gl-vec3/dot');
        var sub = require('gl-vec3/subtract');

        var EPSILON = 0.000001;
        var edge1 = [0, 0, 0];
        var edge2 = [0, 0, 0];
        var tvec = [0, 0, 0];
        var pvec = [0, 0, 0];
        var qvec = [0, 0, 0];

        module.exports = intersectTriangle;

        function intersectTriangle(out, pt, dir, tri) {
            sub(edge1, tri[1], tri[0]);
            sub(edge2, tri[2], tri[0]);

            cross(pvec, dir, edge2);
            var det = dot(edge1, pvec);

            if (det < EPSILON) return null;
            sub(tvec, pt, tri[0]);
            var u = dot(tvec, pvec);
            if (u < 0 || u > det) return null;
            cross(qvec, tvec, edge1);
            var v = dot(dir, qvec);
            if (v < 0 || u + v > det) return null;

            var t = dot(edge2, qvec) / det;
            out[0] = pt[0] + t * dir[0];
            out[1] = pt[1] + t * dir[1];
            out[2] = pt[2] + t * dir[2];
            return out;
        }
    }, { "gl-vec3/cross": 31, "gl-vec3/dot": 32, "gl-vec3/subtract": 38 }], 52: [function (require, module, exports) {
        module.exports = function parse(params) {
            var template = "precision mediump float; \n" + " \n" + "uniform vec4 u_color; \n" + "varying float v_depth; \n" + " \n" + "void main() { \n" + "  float d = 1.0 - v_depth/10.; \n" + "  gl_FragColor = u_color * d * d; \n" + "} \n" + " \n";
            params = params || {};
            for (var key in params) {
                var matcher = new RegExp("{{" + key + "}}", "g");
                template = template.replace(matcher, params[key]);
            }
            return template;
        };
    }, {}], 53: [function (require, module, exports) {
        module.exports = function parse(params) {
            var template = "uniform mat4 u_mat; \n" + "attribute vec4 a_position; \n" + "varying float v_depth; \n" + " \n" + "void main() { \n" + "  v_depth = a_position.z; \n" + "  gl_Position = u_mat * a_position; \n" + "} \n" + " \n";
            params = params || {};
            for (var key in params) {
                var matcher = new RegExp("{{" + key + "}}", "g");
                template = template.replace(matcher, params[key]);
            }
            return template;
        };
    }, {}] }, {}, [8]);