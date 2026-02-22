import { createRequire } from 'module'; const require = createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../home/runner/workspace/node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "../../home/runner/workspace/node_modules/ws/lib/stream.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data))
          ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed)
          return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed)
          return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called)
            callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy)
          ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null)
          return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted)
            duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused)
          ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module.exports = createWebSocketStream2;
  }
});

// ../../home/runner/workspace/node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "../../home/runner/workspace/node_modules/ws/lib/constants.js"(exports, module) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob)
      BINARY_TYPES.push("blob");
    module.exports = {
      BINARY_TYPES,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// ../../home/runner/workspace/node_modules/node-gyp-build/node-gyp-build.js
var require_node_gyp_build = __commonJS({
  "../../home/runner/workspace/node_modules/node-gyp-build/node-gyp-build.js"(exports, module) {
    var fs3 = __require("fs");
    var path4 = __require("path");
    var os = __require("os");
    var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : __require;
    var vars = process.config && process.config.variables || {};
    var prebuildsOnly = !!process.env.PREBUILDS_ONLY;
    var abi = process.versions.modules;
    var runtime = isElectron() ? "electron" : isNwjs() ? "node-webkit" : "node";
    var arch = process.env.npm_config_arch || os.arch();
    var platform = process.env.npm_config_platform || os.platform();
    var libc = process.env.LIBC || (isAlpine(platform) ? "musl" : "glibc");
    var armv = process.env.ARM_VERSION || (arch === "arm64" ? "8" : vars.arm_version) || "";
    var uv = (process.versions.uv || "").split(".")[0];
    module.exports = load;
    function load(dir) {
      return runtimeRequire(load.resolve(dir));
    }
    load.resolve = load.path = function(dir) {
      dir = path4.resolve(dir || ".");
      try {
        var name = runtimeRequire(path4.join(dir, "package.json")).name.toUpperCase().replace(/-/g, "_");
        if (process.env[name + "_PREBUILD"])
          dir = process.env[name + "_PREBUILD"];
      } catch (err) {
      }
      if (!prebuildsOnly) {
        var release = getFirst(path4.join(dir, "build/Release"), matchBuild);
        if (release)
          return release;
        var debug = getFirst(path4.join(dir, "build/Debug"), matchBuild);
        if (debug)
          return debug;
      }
      var prebuild = resolve(dir);
      if (prebuild)
        return prebuild;
      var nearby = resolve(path4.dirname(process.execPath));
      if (nearby)
        return nearby;
      var target = [
        "platform=" + platform,
        "arch=" + arch,
        "runtime=" + runtime,
        "abi=" + abi,
        "uv=" + uv,
        armv ? "armv=" + armv : "",
        "libc=" + libc,
        "node=" + process.versions.node,
        process.versions.electron ? "electron=" + process.versions.electron : "",
        typeof __webpack_require__ === "function" ? "webpack=true" : ""
        // eslint-disable-line
      ].filter(Boolean).join(" ");
      throw new Error("No native build was found for " + target + "\n    loaded from: " + dir + "\n");
      function resolve(dir2) {
        var tuples = readdirSync(path4.join(dir2, "prebuilds")).map(parseTuple);
        var tuple = tuples.filter(matchTuple(platform, arch)).sort(compareTuples)[0];
        if (!tuple)
          return;
        var prebuilds = path4.join(dir2, "prebuilds", tuple.name);
        var parsed = readdirSync(prebuilds).map(parseTags);
        var candidates = parsed.filter(matchTags(runtime, abi));
        var winner = candidates.sort(compareTags(runtime))[0];
        if (winner)
          return path4.join(prebuilds, winner.file);
      }
    };
    function readdirSync(dir) {
      try {
        return fs3.readdirSync(dir);
      } catch (err) {
        return [];
      }
    }
    function getFirst(dir, filter) {
      var files = readdirSync(dir).filter(filter);
      return files[0] && path4.join(dir, files[0]);
    }
    function matchBuild(name) {
      return /\.node$/.test(name);
    }
    function parseTuple(name) {
      var arr = name.split("-");
      if (arr.length !== 2)
        return;
      var platform2 = arr[0];
      var architectures = arr[1].split("+");
      if (!platform2)
        return;
      if (!architectures.length)
        return;
      if (!architectures.every(Boolean))
        return;
      return { name, platform: platform2, architectures };
    }
    function matchTuple(platform2, arch2) {
      return function(tuple) {
        if (tuple == null)
          return false;
        if (tuple.platform !== platform2)
          return false;
        return tuple.architectures.includes(arch2);
      };
    }
    function compareTuples(a, b) {
      return a.architectures.length - b.architectures.length;
    }
    function parseTags(file) {
      var arr = file.split(".");
      var extension = arr.pop();
      var tags = { file, specificity: 0 };
      if (extension !== "node")
        return;
      for (var i = 0; i < arr.length; i++) {
        var tag = arr[i];
        if (tag === "node" || tag === "electron" || tag === "node-webkit") {
          tags.runtime = tag;
        } else if (tag === "napi") {
          tags.napi = true;
        } else if (tag.slice(0, 3) === "abi") {
          tags.abi = tag.slice(3);
        } else if (tag.slice(0, 2) === "uv") {
          tags.uv = tag.slice(2);
        } else if (tag.slice(0, 4) === "armv") {
          tags.armv = tag.slice(4);
        } else if (tag === "glibc" || tag === "musl") {
          tags.libc = tag;
        } else {
          continue;
        }
        tags.specificity++;
      }
      return tags;
    }
    function matchTags(runtime2, abi2) {
      return function(tags) {
        if (tags == null)
          return false;
        if (tags.runtime && tags.runtime !== runtime2 && !runtimeAgnostic(tags))
          return false;
        if (tags.abi && tags.abi !== abi2 && !tags.napi)
          return false;
        if (tags.uv && tags.uv !== uv)
          return false;
        if (tags.armv && tags.armv !== armv)
          return false;
        if (tags.libc && tags.libc !== libc)
          return false;
        return true;
      };
    }
    function runtimeAgnostic(tags) {
      return tags.runtime === "node" && tags.napi;
    }
    function compareTags(runtime2) {
      return function(a, b) {
        if (a.runtime !== b.runtime) {
          return a.runtime === runtime2 ? -1 : 1;
        } else if (a.abi !== b.abi) {
          return a.abi ? -1 : 1;
        } else if (a.specificity !== b.specificity) {
          return a.specificity > b.specificity ? -1 : 1;
        } else {
          return 0;
        }
      };
    }
    function isNwjs() {
      return !!(process.versions && process.versions.nw);
    }
    function isElectron() {
      if (process.versions && process.versions.electron)
        return true;
      if (process.env.ELECTRON_RUN_AS_NODE)
        return true;
      return typeof window !== "undefined" && window.process && window.process.type === "renderer";
    }
    function isAlpine(platform2) {
      return platform2 === "linux" && fs3.existsSync("/etc/alpine-release");
    }
    load.parseTags = parseTags;
    load.matchTags = matchTags;
    load.compareTags = compareTags;
    load.parseTuple = parseTuple;
    load.matchTuple = matchTuple;
    load.compareTuples = compareTuples;
  }
});

// ../../home/runner/workspace/node_modules/node-gyp-build/index.js
var require_node_gyp_build2 = __commonJS({
  "../../home/runner/workspace/node_modules/node-gyp-build/index.js"(exports, module) {
    var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : __require;
    if (typeof runtimeRequire.addon === "function") {
      module.exports = runtimeRequire.addon.bind(runtimeRequire);
    } else {
      module.exports = require_node_gyp_build();
    }
  }
});

// ../../home/runner/workspace/node_modules/bufferutil/fallback.js
var require_fallback = __commonJS({
  "../../home/runner/workspace/node_modules/bufferutil/fallback.js"(exports, module) {
    "use strict";
    var mask = (source, mask2, output, offset, length) => {
      for (var i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask2[i & 3];
      }
    };
    var unmask = (buffer, mask2) => {
      const length = buffer.length;
      for (var i = 0; i < length; i++) {
        buffer[i] ^= mask2[i & 3];
      }
    };
    module.exports = { mask, unmask };
  }
});

// ../../home/runner/workspace/node_modules/bufferutil/index.js
var require_bufferutil = __commonJS({
  "../../home/runner/workspace/node_modules/bufferutil/index.js"(exports, module) {
    "use strict";
    try {
      module.exports = require_node_gyp_build2()(__dirname);
    } catch (e) {
      module.exports = require_fallback();
    }
  }
});

// ../../home/runner/workspace/node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "../../home/runner/workspace/node_modules/ws/lib/buffer-util.js"(exports, module) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0)
        return EMPTY_BUFFER;
      if (list.length === 1)
        return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data))
        return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require_bufferutil();
        module.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48)
            _mask(source, mask, output, offset, length);
          else
            bufferUtil.mask(source, mask, output, offset, length);
        };
        module.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32)
            _unmask(buffer, mask);
          else
            bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// ../../home/runner/workspace/node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "../../home/runner/workspace/node_modules/ws/lib/limiter.js"(exports, module) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency)
          return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module.exports = Limiter;
  }
});

// ../../home/runner/workspace/node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "../../home/runner/workspace/node_modules/ws/lib/permessage-deflate.js"(exports, module) {
    "use strict";
    var zlib = __require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       * @param {Boolean} [isServer=false] Create the instance in either server or
       *     client mode
       * @param {Number} [maxPayload=0] The maximum allowed message length
       */
      constructor(options, isServer, maxPayload) {
        this._maxPayload = maxPayload | 0;
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._isServer = !!isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin)
          this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module.exports = PerMessageDeflate;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// ../../home/runner/workspace/node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "../../home/runner/workspace/node_modules/ws/lib/validation.js"(exports, module) {
    "use strict";
    var { isUtf8 } = __require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = __require("utf-8-validate");
        module.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// ../../home/runner/workspace/node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "../../home/runner/workspace/node_modules/ws/lib/receiver.js"(exports, module) {
    "use strict";
    var { Writable } = __require("stream");
    var PerMessageDeflate = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO)
          return cb();
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length)
          return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored)
          cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented)
          this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126)
          this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127)
          this._state = GET_PAYLOAD_LENGTH_64;
        else
          this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked)
          this._state = GET_MASK;
        else
          this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err)
            return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO)
            this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module.exports = Receiver2;
  }
});

// ../../home/runner/workspace/node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "../../home/runner/workspace/node_modules/ws/lib/sender.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    var { randomFillSync } = __require("crypto");
    var PerMessageDeflate = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1)
          target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask)
          return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking)
          return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else {
            buf.set(data, 2);
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin)
          this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {Buffer[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function")
        cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function")
          callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// ../../home/runner/workspace/node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "../../home/runner/workspace/node_modules/ws/lib/event-target.js"(exports, module) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = Symbol("kCode");
    var kData = Symbol("kData");
    var kError = Symbol("kError");
    var kMessage = Symbol("kMessage");
    var kReason = Symbol("kReason");
    var kTarget = Symbol("kTarget");
    var kType = Symbol("kType");
    var kWasClean = Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// ../../home/runner/workspace/node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "../../home/runner/workspace/node_modules/ws/lib/extension.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0)
        dest[name] = [elem];
      else
        dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1)
              start = i;
            else if (!mustUnescape)
              mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1)
                start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1)
        end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension) => {
        let configurations = extensions[extension];
        if (!Array.isArray(configurations))
          configurations = [configurations];
        return configurations.map((params) => {
          return [extension].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values))
                values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module.exports = { format, parse };
  }
});

// ../../home/runner/workspace/node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "../../home/runner/workspace/node_modules/ws/lib/websocket.js"(exports, module) {
    "use strict";
    var EventEmitter3 = __require("events");
    var https = __require("https");
    var http = __require("http");
    var net = __require("net");
    var tls = __require("tls");
    var { randomBytes, createHash } = __require("crypto");
    var { Duplex, Readable } = __require("stream");
    var { URL } = __require("url");
    var PerMessageDeflate = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var closeTimeout = 30 * 1e3;
    var kAborted = Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter3 {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type))
          return;
        this._binaryType = type;
        if (this._receiver)
          this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket)
          return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout)
          socket.setTimeout(0);
        if (socket.setNoDelay)
          socket.setNoDelay();
        if (head.length > 0)
          socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate.extensionName]) {
          this._extensions[PerMessageDeflate.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED)
          return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err)
            return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain)
          this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED)
          return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute])
              return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function")
            return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        protocolVersion: protocolVersions[1],
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL(address);
        } catch (e) {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate(
          opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
          false,
          opts.maxPayload
        );
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost)
              delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted])
          return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING)
          return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt)
          websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket)
          websocket._sender._bufferedBytes += length;
        else
          websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0)
        return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005)
        websocket.close();
      else
        websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused)
        websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong)
        websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED)
        return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      let chunk;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && (chunk = websocket._socket.read()) !== null) {
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// ../../home/runner/workspace/node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "../../home/runner/workspace/node_modules/ws/lib/subprotocol.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1)
            end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module.exports = { parse };
  }
});

// ../../home/runner/workspace/node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "../../home/runner/workspace/node_modules/ws/lib/websocket-server.js"(exports, module) {
    "use strict";
    var EventEmitter3 = __require("events");
    var http = __require("http");
    var { Duplex } = __require("stream");
    var { createHash } = __require("crypto");
    var extension = require_extension();
    var PerMessageDeflate = require_permessage_deflate();
    var subprotocol = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter3 {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true)
          options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server)
          return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb)
          this.once("close", cb);
        if (this._state === CLOSING)
          return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path)
            return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 8 && version !== 13) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate(
            this.options.perMessageDeflate,
            true,
            this.options.maxPayload
          );
          try {
            const offers = extension.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
              extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info))
            return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable)
          return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING)
          return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate.extensionName]) {
          const params = extensions[PerMessageDeflate.extensionName].params;
          const value = extension.format({
            [PerMessageDeflate.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map))
        server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message);
      }
    }
  }
});

// ../../home/runner/workspace/bridge/src/index.ts
import { createServer } from "http";

// ../../home/runner/workspace/packages/protocol/src/constants.ts
var PROTOCOL_VERSION = "1.0.0";
var HEARTBEAT_INTERVAL_MS = 6e4;

// ../../home/runner/workspace/bridge/src/config.ts
function loadConfig() {
  const haUrl = process.env.HA_URL || process.env.SUPERVISOR_URL || "http://supervisor/core";
  const haToken = process.env.HA_TOKEN || process.env.SUPERVISOR_TOKEN || "";
  const cloudUrl = process.env.CLOUD_URL || "https://helm.replit.app";
  const bridgeId = process.env.BRIDGE_ID || generateBridgeId();
  const credentialPath = process.env.CREDENTIAL_PATH || "/data/credentials.json";
  if (!haToken) {
    console.error("\u274C HA_TOKEN environment variable is required");
    process.exit(1);
  }
  return {
    haUrl: haUrl.replace(/\/$/, ""),
    haToken,
    cloudUrl: cloudUrl.replace(/\/$/, ""),
    bridgeId,
    credentialPath,
    heartbeatInterval: HEARTBEAT_INTERVAL_MS,
    protocolVersion: PROTOCOL_VERSION
  };
}
function generateBridgeId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "helm-bridge-";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// ../../home/runner/workspace/bridge/src/ha-rest-client.ts
var HARestClient = class {
  config;
  haVersion = "unknown";
  constructor(config) {
    this.config = config;
  }
  async request(path4, options = {}) {
    const url = `${this.config.haUrl}${path4}`;
    const headers = {
      "Authorization": `Bearer ${this.config.haToken}`,
      "Content-Type": "application/json",
      ...options.headers
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HA API error: ${response.status} ${response.statusText} - ${text}`);
    }
    return response.json();
  }
  async getConfig() {
    const config = await this.request("/api/config");
    this.haVersion = config.version;
    return config;
  }
  async getVersion() {
    if (this.haVersion === "unknown") {
      const config = await this.getConfig();
      return config.version;
    }
    return this.haVersion;
  }
  async getStates() {
    return this.request("/api/states");
  }
  async getState(entityId) {
    return this.request(`/api/states/${entityId}`);
  }
  async getServices() {
    return this.request("/api/services");
  }
  async callService(domain, service, data) {
    return this.request(`/api/services/${domain}/${service}`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  async checkConnection() {
    try {
      await this.getConfig();
      return true;
    } catch (error) {
      console.error("HA connection check failed:", error);
      return false;
    }
  }
  mapAreaToProtocol(area) {
    return {
      id: area.area_id,
      name: area.name,
      picture: area.picture ?? void 0
    };
  }
  mapDeviceToProtocol(device) {
    return {
      id: device.id,
      name: device.name_by_user || device.name || null,
      manufacturer: device.manufacturer ?? null,
      model: device.model ?? null,
      areaId: device.area_id ?? null,
      identifiers: device.identifiers ?? [],
      swVersion: device.sw_version ?? null,
      hwVersion: device.hw_version ?? null,
      configurationUrl: device.configuration_url ?? null
    };
  }
  mapStateToProtocol(state, entityRegistry) {
    const domain = state.entity_id.split(".")[0];
    return {
      entityId: state.entity_id,
      domain,
      friendlyName: state.attributes?.friendly_name ?? null,
      deviceId: entityRegistry?.device_id ?? null,
      areaId: entityRegistry?.area_id ?? null,
      state: state.state,
      attributes: state.attributes ?? {},
      lastChanged: state.last_changed ?? (/* @__PURE__ */ new Date()).toISOString(),
      lastUpdated: state.last_updated ?? (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  mapServiceToProtocol(serviceDomain) {
    return {
      domain: serviceDomain.domain,
      services: serviceDomain.services ?? {}
    };
  }
};

// ../../home/runner/workspace/node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);
var wrapper_default = import_websocket.default;

// ../../home/runner/workspace/bridge/src/ha-ws-client.ts
import { EventEmitter } from "events";
var HAWebSocketClient = class extends EventEmitter {
  config;
  ws = null;
  messageId = 1;
  reconnectTimer = null;
  authenticated = false;
  eventSubscriptionId = null;
  reconnectAttempts = 0;
  maxReconnectAttempts = 10;
  reconnectDelay = 1e3;
  shouldReconnect = true;
  pendingResponses = /* @__PURE__ */ new Map();
  constructor(config) {
    super();
    this.config = config;
  }
  getWebSocketUrl() {
    const httpUrl = this.config.haUrl;
    const wsUrl = httpUrl.replace(/^http/, "ws");
    if (httpUrl.includes("supervisor/core") || httpUrl.includes("supervisor:80/core")) {
      return `${wsUrl}/websocket`;
    }
    return `${wsUrl}/api/websocket`;
  }
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        const url = this.getWebSocketUrl();
        console.log("\u{1F50C} Connecting to HA WebSocket:", url);
        this.ws = new wrapper_default(url);
        this.ws.on("open", () => {
          console.log("\u{1F4E1} HA WebSocket connected");
          this.reconnectAttempts = 0;
        });
        this.ws.on("message", (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(message, resolve, reject);
          } catch (error) {
            console.error("Failed to parse HA WebSocket message:", error);
          }
        });
        this.ws.on("close", (code, reason) => {
          console.log(`\u{1F50C} HA WebSocket closed: ${code} - ${reason.toString()}`);
          this.authenticated = false;
          this.eventSubscriptionId = null;
          this.emit("disconnected", code, reason.toString());
          if (this.shouldReconnect) {
            this.scheduleReconnect();
          }
        });
        this.ws.on("error", (error) => {
          console.error("\u274C HA WebSocket error:", error);
          this.emit("error", error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  handleMessage(message, connectResolve, connectReject) {
    switch (message.type) {
      case "auth_required":
        this.sendAuth();
        break;
      case "auth_ok":
        console.log("\u2705 HA WebSocket authenticated");
        this.authenticated = true;
        this.emit("authenticated");
        this.subscribeToEvents();
        if (connectResolve)
          connectResolve();
        break;
      case "auth_invalid":
        const authError = new Error(`HA auth failed: ${message.message}`);
        console.error("\u274C HA WebSocket auth failed:", message.message);
        this.emit("auth_failed", message.message);
        if (connectReject)
          connectReject(authError);
        break;
      case "event":
        this.handleEvent(message);
        break;
      case "result":
        this.handleResult(message);
        break;
      default:
        break;
    }
  }
  sendAuth() {
    this.send({
      type: "auth",
      access_token: this.config.haToken
    });
  }
  async subscribeToEvents() {
    const id = this.getNextId();
    this.eventSubscriptionId = id;
    this.send({
      id,
      type: "subscribe_events",
      event_type: "state_changed"
    });
    console.log("\u{1F4ED} Subscribed to state_changed events");
  }
  handleEvent(message) {
    const event = message.event;
    if (event && event.event_type === "state_changed") {
      this.emit("state_changed", event);
    }
  }
  handleResult(message) {
    const id = message.id;
    if (id && this.pendingResponses.has(id)) {
      const { resolve, reject } = this.pendingResponses.get(id);
      this.pendingResponses.delete(id);
      if (message.success) {
        resolve(message.result);
      } else {
        reject(new Error(message.error?.message || "Unknown error"));
      }
    }
  }
  getNextId() {
    return this.messageId++;
  }
  send(message) {
    if (this.ws && this.ws.readyState === wrapper_default.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
  async sendCommand(type, data = {}) {
    return new Promise((resolve, reject) => {
      if (!this.authenticated) {
        reject(new Error("Not authenticated"));
        return;
      }
      const id = this.getNextId();
      this.pendingResponses.set(id, {
        resolve,
        reject
      });
      this.send({
        id,
        type,
        ...data
      });
      setTimeout(() => {
        if (this.pendingResponses.has(id)) {
          this.pendingResponses.delete(id);
          reject(new Error("Command timeout"));
        }
      }, 3e4);
    });
  }
  async callService(domain, service, serviceData = {}) {
    return this.sendCommand("call_service", {
      domain,
      service,
      service_data: serviceData
    });
  }
  async getAreas() {
    return this.sendCommand("config/area_registry/list");
  }
  async getDevices() {
    return this.sendCommand("config/device_registry/list");
  }
  async getEntities() {
    return this.sendCommand("config/entity_registry/list");
  }
  async getStates() {
    return this.sendCommand("get_states");
  }
  async getServices() {
    return this.sendCommand("get_services");
  }
  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("\u274C Max reconnect attempts reached");
      return;
    }
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      3e4
    );
    this.reconnectAttempts++;
    console.log(`\u23F3 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error("Reconnect failed:", error);
      }
    }, delay);
  }
  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.authenticated = false;
    this.pendingResponses.clear();
  }
  isConnected() {
    return this.ws !== null && this.ws.readyState === wrapper_default.OPEN && this.authenticated;
  }
};

// ../../home/runner/workspace/bridge/src/cloud-client.ts
import { EventEmitter as EventEmitter2 } from "events";
var CloudClient = class extends EventEmitter2 {
  config;
  credentialStore;
  ws = null;
  authenticated = false;
  tenantId = null;
  reconnectTimer = null;
  heartbeatTimer = null;
  reconnectAttempts = 0;
  maxReconnectAttempts = 10;
  reconnectDelay = 1e3;
  shouldReconnect = true;
  lastEventAt = null;
  haVersion = "unknown";
  entityCount = 0;
  uptime = 0;
  startTime = /* @__PURE__ */ new Date();
  reconnectCount = 0;
  constructor(config, credentialStore) {
    super();
    this.config = config;
    this.credentialStore = credentialStore;
  }
  getWebSocketUrl() {
    const httpUrl = this.config.cloudUrl;
    const wsUrl = httpUrl.replace(/^http/, "ws");
    return `${wsUrl}/ws/bridge`;
  }
  async connect() {
    if (!this.credentialStore.isPaired()) {
      console.log("\u26A0\uFE0F Cannot connect to cloud: not paired");
      return;
    }
    return new Promise((resolve, reject) => {
      try {
        const url = this.getWebSocketUrl();
        console.log("\u2601\uFE0F Connecting to Cloud:", url);
        this.ws = new wrapper_default(url);
        this.ws.on("open", () => {
          console.log("\u{1F4E1} Cloud WebSocket connected");
          this.reconnectAttempts = 0;
          this.emit("connected");
          this.sendAuth();
        });
        this.ws.on("message", (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(message, resolve, reject);
          } catch (error) {
            console.error("Failed to parse cloud message:", error);
          }
        });
        this.ws.on("close", (code, reason) => {
          console.log(`\u2601\uFE0F Cloud WebSocket closed: ${code} - ${reason.toString()}`);
          this.authenticated = false;
          this.stopHeartbeat();
          this.emit("disconnected", code, reason.toString());
          if (this.shouldReconnect) {
            this.scheduleReconnect();
          }
        });
        this.ws.on("error", (error) => {
          console.error("\u274C Cloud WebSocket error:", error);
          this.emit("error", error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  handleMessage(message, connectResolve, connectReject) {
    switch (message.type) {
      case "auth_result":
        this.handleAuthResult(message, connectResolve, connectReject);
        break;
      case "command":
        this.handleCommand(message);
        break;
      case "request_full_sync":
        console.log("\u{1F4CA} Cloud requested full sync:", message.reason);
        this.emit("request_full_sync", message.reason);
        break;
      case "request_heartbeat":
        this.sendHeartbeat();
        break;
      case "disconnect":
        console.log("\u{1F50C} Cloud requested disconnect:", message.reason);
        this.shouldReconnect = false;
        if (message.reason === "user_disconnected" || message.reason === "user_reset") {
          console.log("\u{1F5D1}\uFE0F Clearing local credentials (user disconnected from cloud UI)...");
          this.credentialStore.clear();
          console.log("");
          console.log("\u26A0\uFE0F Bridge was disconnected from Helm Cloud.");
          console.log("   Restart the add-on to generate a new pairing code.");
          console.log("");
        }
        this.disconnect();
        break;
      case "request_logs":
        console.log("\u{1F4CB} Cloud requested diagnostic logs");
        this.emit("request_logs", message);
        break;
      default:
        console.log("Unknown cloud message type:", message.type);
    }
  }
  sendAuth() {
    const credential = this.credentialStore.get();
    if (!credential) {
      console.error("No credentials available");
      return;
    }
    const message = {
      type: "authenticate",
      bridgeId: this.config.bridgeId,
      bridgeCredential: credential.bridgeCredential,
      protocolVersion: this.config.protocolVersion
    };
    this.send(message);
  }
  handleAuthResult(message, connectResolve, connectReject) {
    if (message.success) {
      this.authenticated = true;
      this.tenantId = message.tenantId;
      console.log(`\u2705 Authenticated with cloud, tenant: ${this.tenantId}`);
      this.emit("authenticated", this.tenantId);
      this.startHeartbeat();
      if (connectResolve)
        connectResolve();
    } else {
      console.error("\u274C Cloud auth failed:", message.error);
      const error = message.error || "Unknown error";
      if (error.toLowerCase().includes("revoked") || error.toLowerCase().includes("invalid")) {
        console.log("\u{1F5D1}\uFE0F Clearing local credentials due to auth failure...");
        this.credentialStore.clear();
        console.log("");
        console.log("\u26A0\uFE0F Your bridge credentials were revoked or are invalid.");
        console.log("   Please restart the add-on to generate a new pairing code.");
        console.log("");
        this.shouldReconnect = false;
      }
      this.emit("auth_failed", error);
      if (connectReject)
        connectReject(new Error(error));
    }
  }
  handleCommand(message) {
    console.log(`\u{1F3AE} Received command: ${message.commandType} (${message.cmdId})`);
    if (message.requiresAck) {
      this.sendCommandAck(message.cmdId);
    }
    this.emit("command", message);
  }
  sendCommandAck(cmdId) {
    const ack = {
      type: "command_ack",
      cmdId,
      status: "acknowledged",
      receivedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.send(ack);
  }
  sendCommandResult(cmdId, status, result, error) {
    const message = {
      type: "command_result",
      cmdId,
      status,
      completedAt: (/* @__PURE__ */ new Date()).toISOString(),
      result,
      error
    };
    this.send(message);
  }
  sendFullSync(data) {
    const message = {
      type: "full_sync",
      data: {
        syncedAt: (/* @__PURE__ */ new Date()).toISOString(),
        haVersion: this.haVersion,
        ...data
      }
    };
    this.send(message);
    console.log(`\u{1F4E4} Sent full sync: ${data.entities.length} entities`);
  }
  sendStateBatch(changes) {
    if (changes.length === 0)
      return;
    const message = {
      type: "state_batch",
      data: {
        batchId: crypto.randomUUID(),
        batchedAt: (/* @__PURE__ */ new Date()).toISOString(),
        events: changes,
        isOverflow: false
      }
    };
    this.send(message);
  }
  sendDiagnosticLogs(logs, diagnostics) {
    if (!this.authenticated)
      return;
    const message = {
      type: "bridge_logs",
      bridgeId: this.config.bridgeId,
      sentAt: (/* @__PURE__ */ new Date()).toISOString(),
      logs,
      ...diagnostics ? { diagnostics } : {}
    };
    this.send(message);
  }
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  sendHeartbeat() {
    if (!this.authenticated)
      return;
    const message = {
      type: "heartbeat",
      bridgeId: this.config.bridgeId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      bridgeVersion: process.env.BRIDGE_VERSION || "1.0.0",
      protocolVersion: this.config.protocolVersion,
      haVersion: this.haVersion,
      haConnected: true,
      cloudConnected: true,
      lastEventAt: this.lastEventAt?.toISOString() ?? null,
      entityCount: this.entityCount,
      reconnectCount: this.reconnectCount,
      uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1e3)
    };
    this.send(message);
  }
  send(message) {
    if (this.ws && this.ws.readyState === wrapper_default.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("\u274C Max cloud reconnect attempts reached");
      return;
    }
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      6e4
    );
    this.reconnectAttempts++;
    this.reconnectCount++;
    console.log(`\u23F3 Reconnecting to cloud in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error("Cloud reconnect failed:", error);
      }
    }, delay);
  }
  updateStats(haVersion, entityCount, lastEventAt) {
    this.haVersion = haVersion;
    this.entityCount = entityCount;
    this.lastEventAt = lastEventAt;
  }
  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.authenticated = false;
  }
  isConnected() {
    return this.ws !== null && this.ws.readyState === wrapper_default.OPEN && this.authenticated;
  }
  getTenantId() {
    return this.tenantId;
  }
};

// ../../home/runner/workspace/bridge/src/credential-store.ts
import * as fs from "fs";
import * as path from "path";
var CredentialStore = class {
  filePath;
  credentials = null;
  constructor(filePath) {
    this.filePath = filePath;
    this.load();
  }
  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, "utf8");
        this.credentials = JSON.parse(data);
        console.log("\u{1F4C2} Loaded credentials from", this.filePath);
      }
    } catch (error) {
      console.error("Failed to load credentials:", error);
      this.credentials = null;
    }
  }
  save(credentials) {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(credentials, null, 2));
      this.credentials = credentials;
      console.log("\u{1F4BE} Saved credentials to", this.filePath);
    } catch (error) {
      console.error("Failed to save credentials:", error);
      throw error;
    }
  }
  get() {
    return this.credentials;
  }
  isPaired() {
    return this.credentials !== null && !!this.credentials.bridgeCredential;
  }
  clear() {
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
      this.credentials = null;
      console.log("\u{1F5D1}\uFE0F Cleared credentials");
    } catch (error) {
      console.error("Failed to clear credentials:", error);
      throw error;
    }
  }
  getTenantId() {
    return this.credentials?.tenantId ?? null;
  }
  getBridgeCredential() {
    return this.credentials?.bridgeCredential ?? null;
  }
};

// ../../home/runner/workspace/bridge/src/local-db.ts
import path2 from "path";
import fs2 from "fs";
var NoOpDatabase = class {
  available = false;
  recordStateChange() {
  }
  getStateHistory() {
    return [];
  }
  getCorrelatedEntities() {
    return /* @__PURE__ */ new Map();
  }
  getEntitiesWithSameContext() {
    return [];
  }
  createEntityGroup(name, primaryEntityId, memberEntityIds) {
    throw new Error("SQLite not available - device merge features disabled");
  }
  getEntityGroup() {
    return null;
  }
  getAllEntityGroups() {
    return [];
  }
  updateEntityGroup() {
    return null;
  }
  deleteEntityGroup() {
    return false;
  }
  getGroupByEntityId() {
    return null;
  }
  getMergeHistory() {
    return [];
  }
  pruneOldHistory() {
    return 0;
  }
  close() {
  }
};
var LocalDatabase = class {
  db;
  dbPath;
  available = true;
  constructor(dataDir, sqliteModule) {
    if (!fs2.existsSync(dataDir)) {
      fs2.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = path2.join(dataDir, "helm-bridge.db");
    this.db = new sqliteModule(this.dbPath);
    this.db.pragma("journal_mode = WAL");
    this.initializeTables();
  }
  initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS entity_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        primary_entity_id TEXT NOT NULL,
        member_entity_ids TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS state_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_id TEXT NOT NULL,
        state TEXT NOT NULL,
        attributes TEXT NOT NULL,
        timestamp TEXT NOT NULL DEFAULT (datetime('now')),
        context_id TEXT
      );

      CREATE TABLE IF NOT EXISTS merge_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        group_id INTEGER NOT NULL,
        details TEXT NOT NULL,
        timestamp TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_state_history_entity ON state_history(entity_id);
      CREATE INDEX IF NOT EXISTS idx_state_history_timestamp ON state_history(timestamp);
      CREATE INDEX IF NOT EXISTS idx_state_history_context ON state_history(context_id);
      CREATE INDEX IF NOT EXISTS idx_entity_groups_primary ON entity_groups(primary_entity_id);
    `);
    console.log("\u{1F4E6} Local database initialized");
  }
  recordStateChange(entityId, state, attributes, contextId) {
    const stmt = this.db.prepare(`
      INSERT INTO state_history (entity_id, state, attributes, context_id)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(entityId, state, JSON.stringify(attributes), contextId);
  }
  getStateHistory(entityId, limit = 100) {
    const stmt = this.db.prepare(`
      SELECT id, entity_id as entityId, state, attributes, timestamp, context_id as contextId
      FROM state_history
      WHERE entity_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    const rows = stmt.all(entityId, limit);
    return rows.map((row) => ({
      ...row,
      attributes: JSON.parse(row.attributes)
    }));
  }
  getCorrelatedEntities(entityId, windowMs = 2e3) {
    const stmt = this.db.prepare(`
      SELECT h2.entity_id, COUNT(*) as correlation_count
      FROM state_history h1
      JOIN state_history h2 ON h2.entity_id != h1.entity_id
        AND abs(strftime('%s', h2.timestamp) - strftime('%s', h1.timestamp)) * 1000 <= ?
      WHERE h1.entity_id = ?
      GROUP BY h2.entity_id
      ORDER BY correlation_count DESC
      LIMIT 20
    `);
    const rows = stmt.all(windowMs, entityId);
    const correlations = /* @__PURE__ */ new Map();
    rows.forEach((row) => correlations.set(row.entity_id, row.correlation_count));
    return correlations;
  }
  getEntitiesWithSameContext(limit = 100) {
    const stmt = this.db.prepare(`
      SELECT context_id, GROUP_CONCAT(DISTINCT entity_id) as entities, COUNT(DISTINCT entity_id) as count
      FROM state_history
      WHERE context_id IS NOT NULL
      GROUP BY context_id
      HAVING COUNT(DISTINCT entity_id) > 1
      ORDER BY count DESC
      LIMIT ?
    `);
    const rows = stmt.all(limit);
    return rows.map((row) => ({
      contextId: row.context_id,
      entities: row.entities.split(","),
      count: row.count
    }));
  }
  createEntityGroup(name, primaryEntityId, memberEntityIds) {
    const stmt = this.db.prepare(`
      INSERT INTO entity_groups (name, primary_entity_id, member_entity_ids)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(name, primaryEntityId, JSON.stringify(memberEntityIds));
    const group = this.getEntityGroup(result.lastInsertRowid);
    this.logMergeHistory("create", group.id, { name, primaryEntityId, memberEntityIds });
    return group;
  }
  getEntityGroup(id) {
    const stmt = this.db.prepare(`
      SELECT id, name, primary_entity_id as primaryEntityId, member_entity_ids as memberEntityIds,
             created_at as createdAt, updated_at as updatedAt
      FROM entity_groups
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row)
      return null;
    return {
      ...row,
      memberEntityIds: JSON.parse(row.memberEntityIds)
    };
  }
  getAllEntityGroups() {
    const stmt = this.db.prepare(`
      SELECT id, name, primary_entity_id as primaryEntityId, member_entity_ids as memberEntityIds,
             created_at as createdAt, updated_at as updatedAt
      FROM entity_groups
      ORDER BY updated_at DESC
    `);
    const rows = stmt.all();
    return rows.map((row) => ({
      ...row,
      memberEntityIds: JSON.parse(row.memberEntityIds)
    }));
  }
  updateEntityGroup(id, updates) {
    const current = this.getEntityGroup(id);
    if (!current)
      return null;
    const name = updates.name ?? current.name;
    const primaryEntityId = updates.primaryEntityId ?? current.primaryEntityId;
    const memberEntityIds = updates.memberEntityIds ?? current.memberEntityIds;
    const stmt = this.db.prepare(`
      UPDATE entity_groups
      SET name = ?, primary_entity_id = ?, member_entity_ids = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    stmt.run(name, primaryEntityId, JSON.stringify(memberEntityIds), id);
    const group = this.getEntityGroup(id);
    this.logMergeHistory("update", id, updates);
    return group;
  }
  deleteEntityGroup(id) {
    const group = this.getEntityGroup(id);
    if (!group)
      return false;
    const stmt = this.db.prepare(`DELETE FROM entity_groups WHERE id = ?`);
    stmt.run(id);
    this.logMergeHistory("delete", id, { deletedGroup: group });
    return true;
  }
  getGroupByEntityId(entityId) {
    const stmt = this.db.prepare(`
      SELECT id, name, primary_entity_id as primaryEntityId, member_entity_ids as memberEntityIds,
             created_at as createdAt, updated_at as updatedAt
      FROM entity_groups
      WHERE primary_entity_id = ? OR member_entity_ids LIKE ?
    `);
    const row = stmt.get(entityId, `%"${entityId}"%`);
    if (!row)
      return null;
    return {
      ...row,
      memberEntityIds: JSON.parse(row.memberEntityIds)
    };
  }
  logMergeHistory(action, groupId, details) {
    const stmt = this.db.prepare(`
      INSERT INTO merge_history (action, group_id, details)
      VALUES (?, ?, ?)
    `);
    stmt.run(action, groupId, JSON.stringify(details));
  }
  getMergeHistory(limit = 50) {
    const stmt = this.db.prepare(`
      SELECT id, action, group_id as groupId, details, timestamp
      FROM merge_history
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    const rows = stmt.all(limit);
    return rows.map((row) => ({
      ...row,
      details: JSON.parse(row.details)
    }));
  }
  pruneOldHistory(daysToKeep = 30) {
    const stmt = this.db.prepare(`
      DELETE FROM state_history
      WHERE timestamp < datetime('now', '-' || ? || ' days')
    `);
    const result = stmt.run(daysToKeep);
    return result.changes;
  }
  close() {
    this.db.close();
  }
};
function createLocalDatabase(dataDir) {
  try {
    const Database = __require("better-sqlite3");
    const db = new LocalDatabase(dataDir, Database);
    console.log("\u2705 SQLite loaded - device merge features enabled");
    return db;
  } catch (error) {
    console.warn("\u26A0\uFE0F better-sqlite3 not available - device merge features disabled");
    console.warn("   Core bridge features (pairing, cloud sync, device control) will work normally.");
    return new NoOpDatabase();
  }
}

// ../../home/runner/workspace/bridge/src/web-server.ts
import express, { Router } from "express";
import path3 from "path";

// ../../home/runner/workspace/bridge/src/duplicate-detector.ts
var DuplicateDetector = class {
  db;
  constructor(db) {
    this.db = db;
  }
  detectDuplicates(entities, devices, areas) {
    const suggestions = [];
    const processedEntityIds = /* @__PURE__ */ new Set();
    const existingGroups = this.db.getAllEntityGroups();
    const groupedEntityIds = /* @__PURE__ */ new Set();
    existingGroups.forEach((group) => {
      groupedEntityIds.add(group.primaryEntityId);
      group.memberEntityIds.forEach((id) => groupedEntityIds.add(id));
    });
    const deviceMap = new Map(devices.map((d) => [d.id, d]));
    const areaMap = new Map(areas.map((a) => [a.id, a]));
    const lightEntities = entities.filter(
      (e) => (e.domain === "light" || e.domain === "switch") && !groupedEntityIds.has(e.entityId)
    );
    for (const entity of lightEntities) {
      if (processedEntityIds.has(entity.entityId))
        continue;
      const candidates = this.findCandidates(entity, lightEntities, deviceMap, areaMap);
      if (candidates.length > 0) {
        const allEntities = [entity, ...candidates];
        const reasons = [];
        let confidence = "low";
        const nameMatch = this.checkNameSimilarity(allEntities);
        if (nameMatch.similar) {
          reasons.push(`Similar names: ${nameMatch.commonPart}`);
          confidence = nameMatch.confidence === "high" ? "high" : "medium";
        }
        const historyCorrelation = this.checkHistoryCorrelation(allEntities);
        if (historyCorrelation.correlated) {
          reasons.push(`State changes together (${historyCorrelation.correlationScore}% correlation)`);
          if (historyCorrelation.correlationScore > 80) {
            confidence = "high";
          } else if (confidence !== "high") {
            confidence = "medium";
          }
        }
        const sameArea = this.checkSameArea(allEntities, areaMap);
        if (sameArea) {
          reasons.push(`Same room: ${sameArea}`);
        }
        const sameDevice = this.checkSameDevice(allEntities, deviceMap);
        if (sameDevice) {
          reasons.push(`Same physical device: ${sameDevice}`);
          confidence = "high";
        }
        if (reasons.length > 0) {
          allEntities.forEach((e) => processedEntityIds.add(e.entityId));
          suggestions.push({
            entities: allEntities,
            confidence,
            reasons,
            suggestedName: this.suggestGroupName(allEntities, deviceMap, areaMap),
            suggestedPrimary: this.suggestPrimaryEntity(allEntities)
          });
        }
      }
    }
    return suggestions.sort((a, b) => {
      const confidenceOrder = { high: 0, medium: 1, low: 2 };
      return confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
    });
  }
  findCandidates(entity, allEntities, deviceMap, areaMap) {
    const candidates = [];
    const entityName = this.normalizeName(entity.friendlyName || entity.entityId);
    for (const other of allEntities) {
      if (other.entityId === entity.entityId)
        continue;
      const otherName = this.normalizeName(other.friendlyName || other.entityId);
      if (this.stringSimilarity(entityName, otherName) > 0.6) {
        candidates.push(other);
        continue;
      }
      if (entity.areaId && entity.areaId === other.areaId) {
        const nameWords = entityName.split(/\s+/);
        const otherWords = otherName.split(/\s+/);
        const commonWords = nameWords.filter((w) => otherWords.includes(w));
        if (commonWords.length > 0 && commonWords.some((w) => w.length > 3)) {
          candidates.push(other);
          continue;
        }
      }
      if (entity.deviceId && entity.deviceId === other.deviceId) {
        candidates.push(other);
        continue;
      }
    }
    return candidates;
  }
  checkNameSimilarity(entities) {
    const names = entities.map((e) => this.normalizeName(e.friendlyName || e.entityId));
    const words = names.map((n) => n.split(/\s+/));
    const commonWords = words[0].filter(
      (word) => word.length > 2 && words.every((w) => w.includes(word))
    );
    if (commonWords.length > 0) {
      const commonPart = commonWords.join(" ");
      const avgSimilarity = this.averagePairwiseSimilarity(names);
      return {
        similar: true,
        commonPart,
        confidence: avgSimilarity > 0.8 ? "high" : avgSimilarity > 0.5 ? "medium" : "low"
      };
    }
    return { similar: false, commonPart: "", confidence: "low" };
  }
  checkHistoryCorrelation(entities) {
    if (entities.length < 2)
      return { correlated: false, correlationScore: 0 };
    const correlationScores = [];
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const correlationsA = this.db.getCorrelatedEntities(entities[i].entityId, 2e3);
        const correlationsB = this.db.getCorrelatedEntities(entities[j].entityId, 2e3);
        const scoreAB = correlationsA.get(entities[j].entityId) || 0;
        const scoreBA = correlationsB.get(entities[i].entityId) || 0;
        const avgScore = (scoreAB + scoreBA) / 2;
        const historyA = this.db.getStateHistory(entities[i].entityId, 1);
        const historyB = this.db.getStateHistory(entities[j].entityId, 1);
        const totalEventsA = historyA.length > 0 ? Math.max(1, this.db.getStateHistory(entities[i].entityId, 1e3).length) : 1;
        const totalEventsB = historyB.length > 0 ? Math.max(1, this.db.getStateHistory(entities[j].entityId, 1e3).length) : 1;
        const minEvents = Math.min(totalEventsA, totalEventsB);
        const normalizedScore = minEvents > 5 ? Math.min(100, Math.round(avgScore / minEvents * 100)) : 0;
        correlationScores.push(normalizedScore);
      }
    }
    if (correlationScores.length === 0)
      return { correlated: false, correlationScore: 0 };
    const avgCorrelation = Math.round(correlationScores.reduce((a, b) => a + b, 0) / correlationScores.length);
    return {
      correlated: avgCorrelation > 15,
      correlationScore: avgCorrelation
    };
  }
  checkSameArea(entities, areaMap) {
    const areaIds = entities.map((e) => e.areaId).filter(Boolean);
    if (areaIds.length < 2)
      return null;
    const allSameArea = areaIds.every((id) => id === areaIds[0]);
    if (allSameArea && areaIds[0]) {
      const area = areaMap.get(areaIds[0]);
      return area?.name || null;
    }
    return null;
  }
  checkSameDevice(entities, deviceMap) {
    const deviceIds = entities.map((e) => e.deviceId).filter(Boolean);
    if (deviceIds.length < 2)
      return null;
    const allSameDevice = deviceIds.every((id) => id === deviceIds[0]);
    if (allSameDevice && deviceIds[0]) {
      const device = deviceMap.get(deviceIds[0]);
      return device?.name || null;
    }
    return null;
  }
  suggestGroupName(entities, deviceMap, areaMap) {
    const deviceId = entities.find((e) => e.deviceId)?.deviceId;
    if (deviceId) {
      const device = deviceMap.get(deviceId);
      if (device?.name)
        return device.name;
    }
    const names = entities.map((e) => this.normalizeName(e.friendlyName || e.entityId));
    const words = names.map((n) => n.split(/\s+/));
    const commonWords = words[0].filter(
      (word) => word.length > 2 && words.every((w) => w.includes(word))
    );
    if (commonWords.length > 0) {
      return commonWords.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
    const areaId = entities.find((e) => e.areaId)?.areaId;
    if (areaId) {
      const area = areaMap.get(areaId);
      if (area) {
        return `${area.name} Light`;
      }
    }
    return entities[0].friendlyName || entities[0].entityId.split(".")[1];
  }
  suggestPrimaryEntity(entities) {
    const lightEntities = entities.filter((e) => e.domain === "light");
    if (lightEntities.length > 0) {
      const withBrightness = lightEntities.find(
        (e) => e.attributes && typeof e.attributes["brightness"] !== "undefined"
      );
      if (withBrightness)
        return withBrightness.entityId;
      const withColor = lightEntities.find(
        (e) => e.attributes && (typeof e.attributes["rgb_color"] !== "undefined" || typeof e.attributes["hs_color"] !== "undefined" || typeof e.attributes["color_temp"] !== "undefined")
      );
      if (withColor)
        return withColor.entityId;
      return lightEntities[0].entityId;
    }
    return entities[0].entityId;
  }
  normalizeName(name) {
    return name.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
  }
  stringSimilarity(a, b) {
    if (a === b)
      return 1;
    if (a.length === 0 || b.length === 0)
      return 0;
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    const longerLength = longer.length;
    if (longerLength === 0)
      return 1;
    const distance = this.levenshteinDistance(longer, shorter);
    return (longerLength - distance) / longerLength;
  }
  levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
  averagePairwiseSimilarity(names) {
    if (names.length < 2)
      return 1;
    let totalSimilarity = 0;
    let pairs = 0;
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        totalSimilarity += this.stringSimilarity(names[i], names[j]);
        pairs++;
      }
    }
    return pairs > 0 ? totalSimilarity / pairs : 0;
  }
};

// ../../home/runner/workspace/bridge/src/web-server.ts
var WebServer = class {
  app;
  db;
  wsClient;
  detector;
  port;
  ingressToken;
  cachedEntities = [];
  cachedDevices = [];
  cachedAreas = [];
  _isListening = false;
  constructor(config) {
    this.app = express();
    this.db = config.db;
    this.wsClient = config.wsClient;
    this.detector = new DuplicateDetector(this.db);
    this.port = config.port;
    this.ingressToken = config.ingressToken || process.env.SUPERVISOR_TOKEN || null;
    this.setupMiddleware();
    this.setupRoutes();
  }
  setupMiddleware() {
    this.app.use(express.json());
    const allowedOrigins = [
      "http://supervisor/core",
      "http://homeassistant.local:8123",
      "http://localhost:8123",
      /^https?:\/\/[a-z0-9-]+\.local(:\d+)?$/i,
      /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
      /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
      /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/
    ];
    this.app.use((req, res, next) => {
      const origin = req.get("origin") || "";
      const referer = req.get("referer") || "";
      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === "string") {
          return origin === allowed || referer.startsWith(allowed);
        }
        return allowed.test(origin) || allowed.test(referer);
      });
      if (isAllowed || !origin) {
        res.header("Access-Control-Allow-Origin", origin || "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, X-Ingress-Path, Authorization");
        res.header("Access-Control-Allow-Credentials", "true");
      }
      if (req.method === "OPTIONS") {
        return res.sendStatus(200);
      }
      next();
    });
    this.app.use("/api", (req, res, next) => {
      if (req.path === "/health") {
        return next();
      }
      const ingressPath = req.get("X-Ingress-Path");
      const authHeader = req.get("Authorization");
      const referer = req.get("referer") || "";
      const isFromHA = ingressPath !== void 0 || referer.includes("/hassio/ingress/") || referer.includes("homeassistant") || req.ip === "127.0.0.1" || req.ip === "::1";
      if (!isFromHA) {
        return res.status(403).json({ error: "Access denied. Use Home Assistant ingress." });
      }
      next();
    });
  }
  setupRoutes() {
    const api = Router();
    api.get("/health", (req, res) => {
      res.json({
        status: "ok",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        wsConnected: this.wsClient.isConnected()
      });
    });
    api.get("/devices", async (req, res) => {
      try {
        await this.refreshCache();
        const groups = this.db.getAllEntityGroups();
        const groupedEntityIds = /* @__PURE__ */ new Set();
        groups.forEach((g) => {
          groupedEntityIds.add(g.primaryEntityId);
          g.memberEntityIds.forEach((id) => groupedEntityIds.add(id));
        });
        const devices = this.cachedEntities.map((entity) => ({
          ...entity,
          isGrouped: groupedEntityIds.has(entity.entityId),
          group: groups.find(
            (g) => g.primaryEntityId === entity.entityId || g.memberEntityIds.includes(entity.entityId)
          ) || null
        }));
        res.json({
          entities: devices,
          devices: this.cachedDevices,
          areas: this.cachedAreas,
          groups
        });
      } catch (error) {
        console.error("Error fetching devices:", error);
        res.status(500).json({ error: "Failed to fetch devices" });
      }
    });
    api.get("/duplicates", async (req, res) => {
      try {
        await this.refreshCache();
        const suggestions = this.detector.detectDuplicates(
          this.cachedEntities,
          this.cachedDevices,
          this.cachedAreas
        );
        res.json({
          suggestions,
          totalEntities: this.cachedEntities.length,
          totalSuggestions: suggestions.length
        });
      } catch (error) {
        console.error("Error detecting duplicates:", error);
        res.status(500).json({ error: "Failed to detect duplicates" });
      }
    });
    api.get("/groups", (req, res) => {
      try {
        const groups = this.db.getAllEntityGroups();
        res.json({ groups });
      } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ error: "Failed to fetch groups" });
      }
    });
    api.get("/groups/:id", (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const group = this.db.getEntityGroup(id);
        if (!group) {
          return res.status(404).json({ error: "Group not found" });
        }
        const entities = this.cachedEntities.filter(
          (e) => e.entityId === group.primaryEntityId || group.memberEntityIds.includes(e.entityId)
        );
        res.json({ group, entities });
      } catch (error) {
        console.error("Error fetching group:", error);
        res.status(500).json({ error: "Failed to fetch group" });
      }
    });
    api.post("/groups", (req, res) => {
      try {
        const { name, primaryEntityId, memberEntityIds } = req.body;
        if (!name || !primaryEntityId || !Array.isArray(memberEntityIds)) {
          return res.status(400).json({ error: "Missing required fields" });
        }
        const existingGroup = this.db.getGroupByEntityId(primaryEntityId);
        if (existingGroup) {
          return res.status(400).json({ error: "Primary entity is already in a group" });
        }
        for (const entityId of memberEntityIds) {
          const existing = this.db.getGroupByEntityId(entityId);
          if (existing) {
            return res.status(400).json({ error: `Entity ${entityId} is already in a group` });
          }
        }
        const group = this.db.createEntityGroup(name, primaryEntityId, memberEntityIds);
        console.log(`\u{1F4E6} Created entity group: ${name} (${memberEntityIds.length + 1} entities)`);
        res.json({ success: true, group });
      } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ error: "Failed to create group" });
      }
    });
    api.put("/groups/:id", (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const updates = req.body;
        const currentGroup = this.db.getEntityGroup(id);
        if (!currentGroup) {
          return res.status(404).json({ error: "Group not found" });
        }
        if (updates.primaryEntityId && updates.primaryEntityId !== currentGroup.primaryEntityId) {
          const existingGroup = this.db.getGroupByEntityId(updates.primaryEntityId);
          if (existingGroup && existingGroup.id !== id) {
            return res.status(400).json({ error: "Primary entity is already in another group" });
          }
        }
        if (updates.memberEntityIds) {
          for (const entityId of updates.memberEntityIds) {
            if (entityId === currentGroup.primaryEntityId)
              continue;
            if (currentGroup.memberEntityIds.includes(entityId))
              continue;
            const existing = this.db.getGroupByEntityId(entityId);
            if (existing && existing.id !== id) {
              return res.status(400).json({ error: `Entity ${entityId} is already in another group` });
            }
          }
        }
        const group = this.db.updateEntityGroup(id, updates);
        if (!group) {
          return res.status(404).json({ error: "Group not found" });
        }
        console.log(`\u{1F4E6} Updated entity group: ${group.name}`);
        res.json({ success: true, group });
      } catch (error) {
        console.error("Error updating group:", error);
        res.status(500).json({ error: "Failed to update group" });
      }
    });
    api.delete("/groups/:id", (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const deleted = this.db.deleteEntityGroup(id);
        if (!deleted) {
          return res.status(404).json({ error: "Group not found" });
        }
        console.log(`\u{1F5D1}\uFE0F Deleted entity group ${id}`);
        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ error: "Failed to delete group" });
      }
    });
    api.post("/groups/:id/control", async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const { action, serviceData } = req.body;
        const group = this.db.getEntityGroup(id);
        if (!group) {
          return res.status(404).json({ error: "Group not found" });
        }
        const primaryEntity = this.cachedEntities.find((e) => e.entityId === group.primaryEntityId);
        if (!primaryEntity) {
          return res.status(404).json({ error: "Primary entity not found" });
        }
        const domain = primaryEntity.domain;
        const service = action || "toggle";
        await this.wsClient.callService(domain, service, {
          entity_id: group.primaryEntityId,
          ...serviceData
        });
        console.log(`\u{1F3AE} Controlled group ${group.name}: ${domain}.${service}`);
        res.json({ success: true });
      } catch (error) {
        console.error("Error controlling group:", error);
        res.status(500).json({ error: "Failed to control group" });
      }
    });
    api.get("/history", (req, res) => {
      try {
        const history = this.db.getMergeHistory(50);
        res.json({ history });
      } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ error: "Failed to fetch history" });
      }
    });
    api.get("/correlations/:entityId", (req, res) => {
      try {
        const { entityId } = req.params;
        const windowMs = parseInt(req.query.window) || 2e3;
        const correlations = this.db.getCorrelatedEntities(entityId, windowMs);
        const result = Array.from(correlations.entries()).map(([id, count]) => ({
          entityId: id,
          correlationCount: count,
          entity: this.cachedEntities.find((e) => e.entityId === id) || null
        }));
        res.json({ entityId, correlations: result });
      } catch (error) {
        console.error("Error fetching correlations:", error);
        res.status(500).json({ error: "Failed to fetch correlations" });
      }
    });
    api.post("/refresh", async (req, res) => {
      try {
        await this.refreshCache(true);
        res.json({ success: true, entityCount: this.cachedEntities.length });
      } catch (error) {
        console.error("Error refreshing cache:", error);
        res.status(500).json({ error: "Failed to refresh cache" });
      }
    });
    this.app.use("/api", api);
    this.app.use(express.static(path3.join(__dirname, "../public")));
    const fs3 = __require("fs");
    const htmlPath = path3.join(__dirname, "../public/index.html");
    const htmlTemplate = fs3.readFileSync(htmlPath, "utf-8");
    this.app.get("*", (req, res) => {
      if (!req.path.startsWith("/api")) {
        const rawIngress = req.get("X-Ingress-Path") || "";
        const ingressPath = /^\/api\/hassio_ingress\/[a-zA-Z0-9_-]+$/.test(rawIngress) ? rawIngress : "";
        const safeValue = JSON.stringify(ingressPath);
        const html = htmlTemplate.replace(
          "const INGRESS_PATH = window.__INGRESS_PATH || '';",
          `const INGRESS_PATH = ${safeValue};`
        );
        res.type("html").send(html);
      }
    });
  }
  async refreshCache(force = false) {
    if (!force && this.cachedEntities.length > 0) {
      return;
    }
    if (!this.wsClient.isConnected()) {
      throw new Error("WebSocket not connected");
    }
    const [statesRaw, devicesRaw, areasRaw, entityRegistryRaw] = await Promise.all([
      this.wsClient.getStates(),
      this.wsClient.getDevices(),
      this.wsClient.getAreas(),
      this.wsClient.getEntities()
    ]);
    const entityRegistry = new Map(
      entityRegistryRaw.map((e) => [e.entity_id, e])
    );
    this.cachedEntities = statesRaw.map((state) => {
      const registry = entityRegistry.get(state.entity_id);
      return {
        entityId: state.entity_id,
        domain: state.entity_id.split(".")[0],
        friendlyName: state.attributes?.friendly_name || null,
        deviceId: registry?.device_id || null,
        areaId: registry?.area_id || null,
        state: state.state,
        attributes: state.attributes || {}
      };
    });
    this.cachedDevices = devicesRaw.map((device) => ({
      id: device.id,
      name: device.name_by_user || device.name || null,
      manufacturer: device.manufacturer || null,
      model: device.model || null,
      areaId: device.area_id || null
    }));
    this.cachedAreas = areasRaw.map((area) => ({
      id: area.area_id,
      name: area.name
    }));
    console.log(`\u{1F504} Cache refreshed: ${this.cachedEntities.length} entities, ${this.cachedDevices.length} devices, ${this.cachedAreas.length} areas`);
  }
  updateCachedEntity(entityId, state, attributes) {
    const index = this.cachedEntities.findIndex((e) => e.entityId === entityId);
    if (index >= 0) {
      this.cachedEntities[index] = {
        ...this.cachedEntities[index],
        state,
        attributes
      };
    }
  }
  get isListening() {
    return this._isListening;
  }
  start() {
    const server = this.app.listen(this.port, "0.0.0.0", () => {
      this._isListening = true;
      console.log(`\u{1F310} Web UI available at http://localhost:${this.port}`);
    });
    server.on("error", (err) => {
      this._isListening = false;
      console.error(`\u274C Web server failed to start on port ${this.port}: ${err.message}`, {
        code: err.code,
        port: this.port
      });
    });
  }
};

// ../../home/runner/workspace/bridge/src/diagnostic-logger.ts
var DiagnosticLogger = class {
  buffer = [];
  maxBufferSize = 500;
  flushCallback = null;
  flushTimer = null;
  flushIntervalMs = 3e4;
  originalConsoleLog;
  originalConsoleError;
  originalConsoleWarn;
  originalConsoleInfo;
  lastError = null;
  startTime = Date.now();
  stateProviders = null;
  constructor() {
    this.originalConsoleLog = console.log.bind(console);
    this.originalConsoleError = console.error.bind(console);
    this.originalConsoleWarn = console.warn.bind(console);
    this.originalConsoleInfo = console.info.bind(console);
  }
  setStateProviders(providers) {
    this.stateProviders = providers;
  }
  interceptConsole() {
    console.log = (...args) => {
      this.originalConsoleLog(...args);
      const msg = args.map((a) => typeof a === "string" ? a : JSON.stringify(a)).join(" ");
      this.addEntry("info", this.categorize(msg), msg);
    };
    console.error = (...args) => {
      this.originalConsoleError(...args);
      const msg = args.map((a) => {
        if (a instanceof Error)
          return `${a.message}
${a.stack}`;
        return typeof a === "string" ? a : JSON.stringify(a);
      }).join(" ");
      this.lastError = msg;
      this.addEntry("error", this.categorize(msg), msg);
    };
    console.warn = (...args) => {
      this.originalConsoleWarn(...args);
      const msg = args.map((a) => typeof a === "string" ? a : JSON.stringify(a)).join(" ");
      this.addEntry("warn", this.categorize(msg), msg);
    };
    console.info = (...args) => {
      this.originalConsoleInfo(...args);
      const msg = args.map((a) => typeof a === "string" ? a : JSON.stringify(a)).join(" ");
      this.addEntry("info", this.categorize(msg), msg);
    };
  }
  categorize(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes("websocket") || lower.includes("ws "))
      return "websocket";
    if (lower.includes("web ui") || lower.includes("web server") || lower.includes("listen"))
      return "webserver";
    if (lower.includes("ingress") || lower.includes("502") || lower.includes("bad gateway"))
      return "ingress";
    if (lower.includes("home assistant") || lower.includes("ha ") || lower.includes("rest api"))
      return "homeassistant";
    if (lower.includes("cloud") || lower.includes("pairing") || lower.includes("credential"))
      return "cloud";
    if (lower.includes("auth") || lower.includes("token"))
      return "auth";
    if (lower.includes("sync") || lower.includes("entity") || lower.includes("state"))
      return "sync";
    if (lower.includes("command") || lower.includes("service"))
      return "command";
    if (lower.includes("start") || lower.includes("stop") || lower.includes("bridge"))
      return "lifecycle";
    if (lower.includes("error") || lower.includes("fail") || lower.includes("\u274C"))
      return "error";
    return "general";
  }
  addEntry(level, category, message, data) {
    const entry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      category,
      message: message.substring(0, 2e3),
      ...data ? { data } : {}
    };
    this.buffer.push(entry);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer = this.buffer.slice(-this.maxBufferSize);
    }
    if (level === "error" || level === "fatal") {
      this.triggerErrorFlush();
    }
  }
  triggerErrorFlush() {
    if (this.flushCallback) {
      setTimeout(() => this.flush(), 2e3);
    }
  }
  onFlush(callback) {
    this.flushCallback = callback;
  }
  startPeriodicFlush() {
    this.stopPeriodicFlush();
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);
  }
  stopPeriodicFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
  flush() {
    if (!this.flushCallback || this.buffer.length === 0)
      return;
    const logs = [...this.buffer];
    this.buffer = [];
    const diagnostics = this.collectDiagnostics();
    this.flushCallback(logs, diagnostics);
  }
  getRecentLogs(maxEntries = 200) {
    return this.buffer.slice(-maxEntries);
  }
  collectDiagnostics() {
    const memUsage = process.memoryUsage();
    let supervisorAvailable = false;
    try {
      supervisorAvailable = !!process.env.SUPERVISOR_TOKEN;
    } catch {
    }
    return {
      memoryUsageMB: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1e3),
      nodeVersion: process.version,
      haConnected: this.stateProviders?.haConnected() ?? false,
      cloudConnected: this.stateProviders?.cloudConnected() ?? false,
      webServerListening: this.stateProviders?.webServerListening() ?? false,
      webServerPort: this.stateProviders?.webServerPort() ?? 8098,
      entityCount: this.stateProviders?.entityCount() ?? 0,
      lastError: this.lastError,
      platform: process.platform,
      supervisorAvailable
    };
  }
  logStartupDiagnostic() {
    this.addEntry("info", "lifecycle", "Bridge diagnostic logger initialized", {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      env: {
        SUPERVISOR_TOKEN: process.env.SUPERVISOR_TOKEN ? "[SET]" : "[NOT SET]",
        DATA_DIR: process.env.DATA_DIR || "[NOT SET]",
        HASSIO_TOKEN: process.env.HASSIO_TOKEN ? "[SET]" : "[NOT SET]"
      }
    });
  }
  logWebServerBind(port, success, error) {
    if (success) {
      this.addEntry("info", "webserver", `Web server successfully bound to port ${port}`, { port });
    } else {
      this.addEntry("error", "webserver", `Web server FAILED to bind to port ${port}: ${error}`, { port, error });
    }
  }
  logIngressCheck(ingressPath, headers) {
    this.addEntry("debug", "ingress", "Ingress request received", {
      ingressPath,
      hasIngressHeader: !!ingressPath,
      headers
    });
  }
  restoreConsole() {
    console.log = this.originalConsoleLog;
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
    console.info = this.originalConsoleInfo;
  }
};
var diagnosticLogger = new DiagnosticLogger();

// ../../home/runner/workspace/bridge/src/index.ts
var HelmBridge = class {
  config;
  restClient;
  wsClient;
  cloudClient;
  credentialStore;
  localDb;
  webServer = null;
  state;
  entityRegistry = /* @__PURE__ */ new Map();
  stateChangeQueue = [];
  batchTimer = null;
  batchIntervalMs = 500;
  historyPruneTimer = null;
  constructor() {
    diagnosticLogger.interceptConsole();
    diagnosticLogger.logStartupDiagnostic();
    this.config = loadConfig();
    this.restClient = new HARestClient(this.config);
    this.wsClient = new HAWebSocketClient(this.config);
    this.credentialStore = new CredentialStore(this.config.credentialPath);
    this.cloudClient = new CloudClient(this.config, this.credentialStore);
    const dataDir = process.env.DATA_DIR || "/data";
    this.localDb = createLocalDatabase(dataDir);
    this.state = {
      config: this.config,
      haVersion: "unknown",
      haConnected: false,
      cloudConnected: false,
      isPaired: this.credentialStore.isPaired(),
      entityCount: 0,
      lastEventAt: null,
      startedAt: /* @__PURE__ */ new Date(),
      reconnectCount: 0
    };
    diagnosticLogger.setStateProviders({
      haConnected: () => this.state.haConnected,
      cloudConnected: () => this.state.cloudConnected,
      webServerListening: () => this.webServer?.isListening ?? false,
      webServerPort: () => 8098,
      entityCount: () => this.state.entityCount
    });
    diagnosticLogger.onFlush((logs, diag) => {
      this.cloudClient.sendDiagnosticLogs(logs, diag);
    });
    this.setupEventHandlers();
    this.setupCloudEventHandlers();
    this.setupHistoryPruning();
  }
  reconnectTimer = null;
  scheduleReconnect() {
    if (this.reconnectTimer)
      return;
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      console.log("\u{1F504} Retrying Home Assistant connection...");
      try {
        await this.start();
      } catch (error) {
        console.error("\u274C Reconnect attempt failed:", error);
        this.scheduleReconnect();
      }
    }, 3e4);
  }
  setupHistoryPruning() {
    this.historyPruneTimer = setInterval(() => {
      const pruned = this.localDb.pruneOldHistory(30);
      if (pruned > 0) {
        console.log(`\u{1F9F9} Pruned ${pruned} old state history entries`);
      }
    }, 24 * 60 * 60 * 1e3);
  }
  setupEventHandlers() {
    this.wsClient.on("authenticated", () => {
      console.log("\u{1F3E0} Connected to Home Assistant");
      this.state.haConnected = true;
    });
    this.wsClient.on("disconnected", () => {
      console.log("\u{1F3E0} Disconnected from Home Assistant");
      this.state.haConnected = false;
      this.state.reconnectCount++;
    });
    this.wsClient.on("state_changed", (event) => {
      this.handleStateChange(event);
    });
    this.wsClient.on("error", (error) => {
      console.error("HA WebSocket error:", error);
    });
  }
  setupCloudEventHandlers() {
    this.cloudClient.on("connected", () => {
      console.log("\u2601\uFE0F Cloud WebSocket connected");
    });
    this.cloudClient.on("authenticated", (tenantId) => {
      console.log(`\u2601\uFE0F Authenticated with cloud, tenant: ${tenantId}`);
      this.state.cloudConnected = true;
      diagnosticLogger.startPeriodicFlush();
      setTimeout(() => diagnosticLogger.flush(), 5e3);
    });
    this.cloudClient.on("disconnected", (_code, _reason) => {
      this.state.cloudConnected = false;
    });
    this.cloudClient.on("request_full_sync", async (reason) => {
      console.log(`\u{1F4CA} Cloud requested full sync: ${reason || "unknown reason"}`);
      await this.performFullSync();
    });
    this.cloudClient.on("command", async (command) => {
      await this.handleCloudCommand(command);
    });
    this.cloudClient.on("auth_failed", (error) => {
      console.error("\u274C Cloud auth failed:", error);
    });
    this.cloudClient.on("error", (error) => {
      console.error("\u274C Cloud error:", error);
    });
    this.cloudClient.on("request_logs", (message) => {
      const logs = diagnosticLogger.getRecentLogs(message.maxEntries ?? 200);
      const diagnostics = message.includeDiagnostics !== false ? diagnosticLogger.collectDiagnostics() : void 0;
      this.cloudClient.sendDiagnosticLogs(logs, diagnostics);
    });
  }
  async performFullSync() {
    try {
      const syncData = await this.collectFullSync();
      this.cloudClient.updateStats(this.state.haVersion, syncData.entities.length, this.state.lastEventAt);
      this.cloudClient.sendFullSync(syncData);
      console.log("\u2705 Full sync sent to cloud");
    } catch (error) {
      console.error("\u274C Failed to perform full sync:", error);
    }
  }
  async handleCloudCommand(command) {
    console.log(`\u{1F3AE} Executing command: ${command.commandType} (${command.cmdId})`);
    try {
      const { domain, service, serviceData } = command.payload;
      const result = await this.wsClient.callService(domain, service, serviceData || {});
      this.cloudClient.sendCommandResult(command.cmdId, "completed", {
        haResponse: result
      });
      console.log(`\u2705 Command ${command.cmdId} completed`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.cloudClient.sendCommandResult(command.cmdId, "failed", void 0, {
        code: "EXECUTION_FAILED",
        message: errorMessage
      });
      console.error(`\u274C Command ${command.cmdId} failed:`, errorMessage);
    }
  }
  async start() {
    console.log("\u{1F680} Starting Helm Bridge...");
    console.log(`   Bridge ID: ${this.config.bridgeId}`);
    console.log(`   HA URL: ${this.config.haUrl}`);
    console.log(`   Cloud URL: ${this.config.cloudUrl}`);
    console.log(`   Protocol Version: ${this.config.protocolVersion}`);
    console.log("\u2601\uFE0F Validating cloud URL...");
    try {
      const cloudCheck = await fetch(`${this.config.cloudUrl}/api/bridge/pairing-codes`, {
        method: "OPTIONS"
      }).catch(() => null);
      const statusCheck = await fetch(`${this.config.cloudUrl}/api/bridge/pairing-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bridgeId: "test-validation", bridgeVersion: "1.0.0" })
      }).catch(() => null);
      if (statusCheck) {
        const contentType = statusCheck.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("\u274C Cloud URL appears to be misconfigured!");
          console.error(`   Expected JSON response but got: ${contentType}`);
          console.error(`   Please verify CLOUD_URL is set correctly.`);
          console.error(`   Current value: ${this.config.cloudUrl}`);
          console.log("");
          console.log("   Continuing anyway, but pairing may fail...");
          console.log("");
        } else {
          console.log("\u2713 Cloud URL validated");
        }
      }
    } catch (error) {
      console.warn("\u26A0\uFE0F Could not validate cloud URL:", error);
    }
    console.log("\u{1F4E1} Checking Home Assistant connection...");
    const haConnected = await this.restClient.checkConnection();
    if (!haConnected) {
      console.error("\u274C Cannot connect to Home Assistant REST API");
      console.error("   The web UI will still be available for diagnostics.");
      console.error("   Retrying connection in 30 seconds...");
      this.scheduleReconnect();
      return;
    }
    console.log("\u2713 REST API connection verified");
    this.state.haVersion = await this.restClient.getVersion();
    console.log(`   HA Version: ${this.state.haVersion}`);
    console.log("\u{1F50C} Connecting to WebSocket...");
    try {
      await this.wsClient.connect();
      console.log("\u2713 WebSocket connected and authenticated");
    } catch (wsError) {
      console.error("\u274C WebSocket connection failed:", wsError);
      console.error("   The web UI will still be available for diagnostics.");
      console.error("   Retrying connection in 30 seconds...");
      this.scheduleReconnect();
      return;
    }
    console.log("\u{1F4CB} Loading entity registry...");
    try {
      const entities = await this.wsClient.getEntities();
      entities.forEach((e) => this.entityRegistry.set(e.entity_id, e));
      console.log(`\u2713 Loaded ${entities.length} entity registry entries`);
    } catch (entityError) {
      console.error("\u26A0\uFE0F Failed to load entity registry:", entityError);
    }
    console.log("\u{1F50D} Loading entity states...");
    try {
      const states = await this.wsClient.getStates();
      this.state.entityCount = states.length;
      console.log(`\u2713 Found ${states.length} entities`);
    } catch (statesError) {
      console.error("\u26A0\uFE0F Failed to load states:", statesError);
      this.state.entityCount = 0;
    }
    console.log("\u2705 Helm Bridge started successfully");
    if (this.credentialStore.isPaired()) {
      console.log("\u{1F517} Bridge is already paired, connecting to cloud...");
      try {
        await this.cloudClient.connect();
      } catch (error) {
        console.error("\u274C Failed to connect to cloud:", error);
      }
    } else {
      await this.requestAndDisplayPairingCode();
    }
  }
  async requestAndDisplayPairingCode() {
    console.log("\u{1F511} Requesting pairing code from cloud...");
    try {
      const response = await fetch(`${this.config.cloudUrl}/api/bridge/pairing-codes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bridgeId: this.config.bridgeId,
          bridgeVersion: this.config.protocolVersion,
          haVersion: this.state.haVersion
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get pairing code: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      const pairingCode = data.code;
      const expiresInMinutes = Math.floor(data.expiresInSeconds / 60);
      console.log("");
      console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
      console.log("\u{1F511} PAIRING CODE: " + pairingCode);
      console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
      console.log("");
      console.log("To complete setup:");
      console.log(`1. Go to ${this.config.cloudUrl}`);
      console.log("2. Navigate to Integrations \u2192 Home Assistant");
      console.log('3. Click "Add Bridge" and enter the pairing code above');
      console.log("");
      console.log(`The pairing code expires in ${expiresInMinutes} minutes.`);
      console.log("Restart the add-on to generate a new code if needed.");
      console.log("");
      this.pollForPairing(pairingCode);
    } catch (error) {
      console.error("\u274C Failed to get pairing code:", error);
      console.log("");
      console.log("\u26A0\uFE0F Could not connect to Helm Cloud to generate pairing code.");
      console.log("Please ensure your internet connection is working and try restarting the add-on.");
      console.log("");
    }
  }
  async pollForPairing(pairingCode) {
    console.log("\u{1F440} Waiting for pairing to complete...");
    const pollInterval = 5e3;
    const maxAttempts = 120;
    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        if (this.credentialStore.isPaired()) {
          console.log("\u2705 Pairing completed! Connecting to cloud...");
          await this.cloudClient.connect();
          return;
        }
        const response = await fetch(
          `${this.config.cloudUrl}/api/bridge/pairing-codes/${pairingCode}/status`
        );
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error(`\u26A0\uFE0F Received non-JSON response from cloud (${contentType}). Check cloud URL configuration.`);
          if (attempts < maxAttempts) {
            setTimeout(poll, pollInterval);
          }
          return;
        }
        if (response.ok) {
          const data = await response.json();
          if (data.status === "paired" && data.bridgeCredential) {
            console.log("\u2705 Pairing completed via cloud!");
            this.credentialStore.save({
              bridgeId: data.bridgeId,
              tenantId: data.tenantId,
              bridgeCredential: data.bridgeCredential
            });
            await this.cloudClient.connect();
            return;
          } else if (data.status === "paired") {
            if (this.credentialStore.isPaired()) {
              console.log("\u2705 Already paired! Connecting to cloud...");
              await this.cloudClient.connect();
              return;
            }
            console.log("\u26A0\uFE0F Pairing completed but credential was already claimed. Restart the add-on.");
            return;
          } else if (data.status === "expired") {
            console.log("\u23F0 Pairing code expired. Restart the add-on to get a new code.");
            return;
          }
        } else if (response.status === 404) {
          if (this.credentialStore.isPaired()) {
            console.log("\u2705 Already paired! Connecting to cloud...");
            await this.cloudClient.connect();
            return;
          }
        }
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          console.log("\u23F0 Pairing code expired. Restart the add-on to get a new code.");
        }
      } catch (error) {
        console.error("Error checking pairing status:", error);
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        }
      }
    };
    setTimeout(poll, pollInterval);
  }
  async connectToCloud() {
    if (!this.credentialStore.isPaired()) {
      throw new Error("Bridge not paired");
    }
    await this.cloudClient.connect();
  }
  handleStateChange(event) {
    this.state.lastEventAt = /* @__PURE__ */ new Date();
    this.stateChangeQueue.push(event);
    if (event.data.new_state) {
      this.localDb.recordStateChange(
        event.data.entity_id,
        event.data.new_state.state,
        event.data.new_state.attributes || {},
        event.context?.id || null
      );
      if (this.webServer) {
        this.webServer.updateCachedEntity(
          event.data.entity_id,
          event.data.new_state.state,
          event.data.new_state.attributes || {}
        );
      }
    }
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushStateChanges();
      }, this.batchIntervalMs);
    }
  }
  flushStateChanges() {
    if (this.stateChangeQueue.length === 0) {
      this.batchTimer = null;
      return;
    }
    const batch = [...this.stateChangeQueue];
    this.stateChangeQueue = [];
    this.batchTimer = null;
    console.log(`\u{1F4E6} Batched ${batch.length} state changes`);
    if (this.cloudClient.isConnected()) {
      const events = batch.map((e) => ({
        entityId: e.data.entity_id,
        oldState: e.data.old_state ? {
          state: e.data.old_state.state,
          attributes: e.data.old_state.attributes,
          lastChanged: e.data.old_state.last_changed,
          lastUpdated: e.data.old_state.last_updated
        } : null,
        newState: {
          state: e.data.new_state.state,
          attributes: e.data.new_state.attributes,
          lastChanged: e.data.new_state.last_changed,
          lastUpdated: e.data.new_state.last_updated
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }));
      this.cloudClient.sendStateBatch(events);
      this.cloudClient.updateStats(this.state.haVersion, this.state.entityCount, this.state.lastEventAt);
    }
  }
  async collectFullSync() {
    console.log("\u{1F4CA} Collecting full sync data...");
    try {
      const [areasRaw, devicesRaw, statesRaw, servicesRaw, entityRegistryRaw] = await Promise.all([
        this.wsClient.getAreas().catch((err) => {
          console.error("\u274C Failed to fetch areas:", err.message);
          return [];
        }),
        this.wsClient.getDevices().catch((err) => {
          console.error("\u274C Failed to fetch devices:", err.message);
          return [];
        }),
        this.wsClient.getStates().catch((err) => {
          console.error("\u274C Failed to fetch states:", err.message);
          return [];
        }),
        this.wsClient.getServices().catch((err) => {
          console.error("\u274C Failed to fetch services:", err.message);
          return {};
        }),
        this.wsClient.getEntities().catch((err) => {
          console.error("\u274C Failed to fetch entity registry:", err.message);
          return [];
        })
      ]);
      const entityList = Array.isArray(entityRegistryRaw) ? entityRegistryRaw : [];
      entityList.forEach((e) => this.entityRegistry.set(e.entity_id, e));
      const areasList = Array.isArray(areasRaw) ? areasRaw : [];
      const devicesList = Array.isArray(devicesRaw) ? devicesRaw : [];
      const statesList = Array.isArray(statesRaw) ? statesRaw : [];
      const areas = areasList.map((a) => this.restClient.mapAreaToProtocol(a));
      const devices = devicesList.map((d) => this.restClient.mapDeviceToProtocol(d));
      const entities = statesList.map((s) => {
        const registry = this.entityRegistry.get(s.entity_id);
        return this.restClient.mapStateToProtocol(s, registry);
      });
      const servicesDomainArray = Object.entries(servicesRaw).map(
        ([domain, serviceDefs]) => ({ domain, services: serviceDefs })
      );
      const services = servicesDomainArray.map((s) => this.restClient.mapServiceToProtocol(s));
      console.log(`   Areas: ${areas.length}`);
      console.log(`   Devices: ${devices.length}`);
      console.log(`   Entities: ${entities.length}`);
      console.log(`   Service domains: ${services.length}`);
      this.state.entityCount = entities.length;
      return { areas, devices, entities, services };
    } catch (error) {
      console.error("\u274C Full sync collection failed:", error);
      throw error;
    }
  }
  async callService(domain, service, data) {
    console.log(`\u{1F3AE} Calling service: ${domain}.${service}`);
    return this.wsClient.callService(domain, service, data);
  }
  getState() {
    return { ...this.state };
  }
  getCredentialStore() {
    return this.credentialStore;
  }
  getConfig() {
    return this.config;
  }
  async stop() {
    console.log("\u{1F6D1} Stopping Helm Bridge...");
    diagnosticLogger.stopPeriodicFlush();
    diagnosticLogger.flush();
    diagnosticLogger.restoreConsole();
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.flushStateChanges();
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.historyPruneTimer) {
      clearInterval(this.historyPruneTimer);
    }
    this.cloudClient.disconnect();
    this.wsClient.disconnect();
    this.localDb.close();
    console.log("\u2705 Helm Bridge stopped");
  }
  startWebServer(port = 8098) {
    this.webServer = new WebServer({
      port,
      db: this.localDb,
      wsClient: this.wsClient
    });
    this.webServer.start();
  }
  startHealthServer(port = 8099) {
    const server = createServer((req, res) => {
      if (req.url === "/health") {
        const health = {
          status: "ok",
          haConnected: this.state.haConnected,
          cloudConnected: this.state.cloudConnected,
          isPaired: this.state.isPaired,
          entityCount: this.state.entityCount,
          uptime: Math.floor((Date.now() - this.state.startedAt.getTime()) / 1e3)
        };
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(health));
      } else if (req.url === "/status") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(this.getState()));
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    });
    server.listen(port, () => {
      console.log(`\u{1F3E5} Health server listening on port ${port}`);
    });
  }
};
var bridge = new HelmBridge();
bridge.startHealthServer(parseInt(process.env.HEALTH_PORT || "8099"));
bridge.startWebServer(parseInt(process.env.WEB_PORT || "8098"));
process.on("SIGINT", async () => {
  await bridge.stop();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await bridge.stop();
  process.exit(0);
});
bridge.start().catch((error) => {
  console.error("\u274C Bridge startup failed:", error);
  console.error("   Web UI is still available for diagnostics.");
});
export {
  HelmBridge,
  bridge
};
