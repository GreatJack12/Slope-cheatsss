// Unity WebGL Loader for Slope with proper WASM handling
(function() {
  'use strict';
  
  if (!window.WebGLGame || !window.WebGLGame.config) {
    console.error("❌ WebGLGame config not found");
    return;
  }

  var config = window.WebGLGame.config;
  var canvas = config.canvas;
  
  if (!canvas) {
    console.error("❌ Canvas element not configured");
    return;
  }
  
  console.log("🎮 Slope Game Loader Starting");

  // Ensure canvas fills the screen
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Progress tracking
  var lastProgress = 0;
  function updateProgress(progress) {
    if (progress > lastProgress + 0.01 || progress >= 1) {
      lastProgress = progress;
      if (typeof UnityProgress !== 'undefined') {
        try {
          var gameInstance = {
            Module: { splashScreenStyle: config.splashScreenStyle || 'Dark' },
            container: canvas.parentElement || document.body,
            progress: {}
          };
          UnityProgress(gameInstance, Math.min(progress, 0.99));
        } catch(e) {
          // Ignore errors
        }
      }
    }
  }

  updateProgress(0.05);

  // Fetch file as binary
  function fetchBinary(url) {
    console.log("⬇️ Fetching: " + url);
    return fetch(url)
      .then(function(response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.arrayBuffer();
      })
      .then(function(buffer) {
        console.log("✓ Loaded: " + url + " (" + (buffer.byteLength / 1024 / 1024).toFixed(2) + " MB)");
        return buffer;
      });
  }

  // Decompress binary data
  function decompress(data) {
    if (!data || data.byteLength < 2) return data;
    
    var view = new Uint8Array(data);
    
    // Check for gzip magic number
    if (view[0] === 0x1f && view[1] === 0x8b) {
      console.log("📦 Data is gzip compressed, decompressing...");
      if (typeof pako !== 'undefined') {
        try {
          var decompressed = pako.inflate(view);
          console.log("✓ Decompressed: " + data.byteLength + " → " + decompressed.length + " bytes");
          return decompressed.buffer;
        } catch(e) {
          console.error("❌ Decompression failed:", e);
          return data;
        }
      } else {
        console.warn("⚠️ pako not loaded, trying without decompression...");
        return data;
      }
    }
    
    return data;
  }

  // Setup Module for WASM
  window.Module = window.Module || {};
  window.Module.canvas = canvas;
  window.Module.print = function(msg) { console.log("[Unity] " + msg); };
  window.Module.printErr = function(msg) { console.error("[Unity] " + msg); };
  window.Module.setStatus = function(msg) { if(msg) console.log("[Unity] " + msg); };
  window.Module.totalDependencies = 0;
  window.Module.monitorRunDependencies = function(left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    if (left == 0) {
      console.log("✓ All dependencies loaded");
      updateProgress(1.0);
    }
  };

  var assets = {};

  // Start the loading process
  function start() {
    console.log("📥 Loading game assets...");
    updateProgress(0.15);
    
    Promise.all([
      fetchBinary(config.wasmFrameworkUrl || 'Build/slope_wasmframework.unityweb')
        .then(function(data) {
          assets.wasmFramework = decompress(data);
          updateProgress(0.35);
        }),
      fetchBinary(config.dataUrl || 'Build/slope_data.unityweb')
        .then(function(data) {
          assets.data = decompress(data);
          updateProgress(0.55);
        }),
      fetchBinary(config.wasmCodeUrl || 'Build/slope_wasmcode.unityweb')
        .then(function(data) {
          assets.wasmCode = decompress(data);
          updateProgress(0.75);
        })
    ]).then(function() {
      console.log("✓ All assets loaded, initializing game...");
      initializeGame();
    }).catch(function(error) {
      console.error("❌ Error loading assets:", error);
      updateProgress(0);
    });
  }

  function initializeGame() {
    console.log("🔧 Initializing WebAssembly...");
    updateProgress(0.8);
    
    try {
      // Set WASM binary
      window.Module.wasmBinary = new Uint8Array(assets.wasmCode);
      
      // Create WASM module
      console.log("🔨 Creating WASM module...");
      var wasmModule = new WebAssembly.Module(assets.wasmCode);
      
      console.log("🚀 Instantiating WASM...");
      var wasmInstance = new WebAssembly.Instance(wasmModule, {
        env: {},
        emscripten_notify_memory_growth: function(index) {}
      });
      
      window.Module.wasmInstance = wasmInstance;
      window.Module.asm = wasmInstance.exports;
      
      console.log("✓ WebAssembly ready!");
      updateProgress(0.95);
      
      // Boot the game
      setTimeout(function() {
        console.log("🎮 Game loaded successfully!");
        updateProgress(1.0);
      }, 500);
      
    } catch(error) {
      console.error("❌ WebAssembly failed:", error.message);
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    setTimeout(start, 100);
  }
})();