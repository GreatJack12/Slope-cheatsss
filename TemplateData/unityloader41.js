// Unity WebGL Loader for Slope
(function() {
  'use strict';
  
  if (!window.WebGLGame || !window.WebGLGame.config) {
    console.error("WebGLGame config not found");
    return;
  }

  var config = window.WebGLGame.config;
  var canvas = config.canvas;
  
  if (!canvas) {
    console.error("Canvas element not configured");
    return;
  }

  // Ensure canvas fills the screen
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Setup module for Unity WASM
  window.Module = {
    canvas: canvas,
    instantiateWasm: null,
    onRuntimeInitialized: function() {
      console.log("Unity runtime initialized");
    },
    print: function(text) {
      console.log("[Unity] " + text);
    },
    printErr: function(text) {
      console.error("[Unity] " + text);
    },
    setStatus: function(text) {
      console.log("[Status] " + text);
    },
    totalDependencies: 0,
    monitorRunDependencies: function(left) {
      this.totalDependencies = Math.max(this.totalDependencies, left);
      if (left == 0) {
        console.log("All dependencies loaded");
      }
    }
  };

  // Progress tracking
  var lastProgress = 0;
  function updateProgress(progress) {
    if (progress > lastProgress) {
      lastProgress = progress;
      if (typeof UnityProgress !== 'undefined') {
        try {
          var gameInstance = {
            Module: { splashScreenStyle: config.splashScreenStyle || 'Dark' },
            container: canvas.parentElement || document.body,
            progress: {}
          };
          UnityProgress(gameInstance, progress);
        } catch(e) {
          console.warn("Progress update error:", e);
        }
      }
    }
  }

  updateProgress(0.1);

  // Load WASM files with progress tracking
  function loadFile(url, onProgress) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      
      xhr.onprogress = function(event) {
        if (event.lengthComputable && onProgress) {
          onProgress(event.loaded / event.total);
        }
      };
      
      xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 0) {
          console.log("Loaded: " + url);
          resolve(xhr.response);
        } else {
          reject(new Error("Failed to load " + url + " (status: " + xhr.status + ")"));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error("Network error loading " + url));
      };
      
      xhr.send();
    });
  }

  // Load all necessary files
  function loadGameFiles() {
    var filesToLoad = [
      { url: config.wasmFrameworkUrl || 'Build/slope_wasmframework.unityweb', name: 'WASM Framework' },
      { url: config.dataUrl || 'Build/slope_data.unityweb', name: 'Game Data' },
      { url: config.wasmCodeUrl || 'Build/slope_wasmcode.unityweb', name: 'WASM Code' }
    ];

    var totalSize = 0;
    var loadedSize = 0;
    var fileBuffers = {};

    // First, get file sizes
    return Promise.all(filesToLoad.map(function(file) {
      return new Promise(function(resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', file.url);
        xhr.onload = function() {
          var size = parseInt(xhr.getResponseHeader('content-length'), 10);
          if (size) {
            totalSize += size;
          }
          resolve();
        };
        xhr.onerror = function() {
          resolve(); // Continue even if HEAD fails
        };
        xhr.send();
      });
    })).then(function() {
      // Now load files with progress
      return Promise.all(filesToLoad.map(function(file, index) {
        updateProgress(0.1 + (index * 0.2));
        return loadFile(file.url, function(progress) {
          loadedSize += progress * (file.estimatedSize || 1000000);
          if (totalSize > 0) {
            updateProgress(0.1 + ((loadedSize / totalSize) * 0.7));
          }
        }).then(function(buffer) {
          fileBuffers[file.name] = buffer;
          console.log("Loaded " + file.name);
        }).catch(function(error) {
          console.warn("Error loading " + file.name + ":", error.message);
        });
      }));
    }).then(function() {
      // Inject files into Module for Unity
      window.Module.wasmBinary = fileBuffers['WASM Code'];
      
      updateProgress(0.85);
      
      // Load and execute the game code
      var script = document.createElement('script');
      script.src = config.codeUrl || 'Build/slope_wasmcode.unityweb';
      script.async = true;
      
      script.onload = function() {
        console.log("Game code loaded");
        updateProgress(1.0);
      };
      
      script.onerror = function() {
        console.error("Failed to load game code from:", script.src);
        updateProgress(0);
      };
      
      document.body.appendChild(script);
    }).catch(function(error) {
      console.error("Error in load process:", error);
      updateProgress(0);
    });
  }

  // Start loading when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log("DOM loaded, starting game files...");
      loadGameFiles();
    });
  } else {
    console.log("Starting game files...");
    loadGameFiles();
  }
})();