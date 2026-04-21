function createUnityInstance(canvas, config, onProgress) {
  var container = canvas.parentElement || document.body;
  var buildConfig = config || {};
  
  // Create game instance object
  var gameInstance = {
    Module: {
      canvas: canvas,
      preRun: [],
      postRun: [],
      print: function(text) { console.log(text); },
      printErr: function(text) { console.error(text); },
      locateFile: function(path) {
        if (path.endsWith('.wasm')) {
          return buildConfig.wasmCodeUrl || 'Build/slope_wasmcode.unityweb';
        }
        return path;
      },
      TOTAL_MEMORY: buildConfig.TOTAL_MEMORY || 268435456,
      wasmBinary: null,
      setStatus: function(text) {}
    },
    container: container,
    progress: {},
    splashScreenStyle: buildConfig.splashScreenStyle || 'Dark'
  };

  // Create progress handler
  var progressHandler = function(progress) {
    if (typeof onProgress === 'function') {
      onProgress(progress);
    }
    if (typeof UnityProgress !== 'undefined') {
      try {
        UnityProgress(gameInstance, progress);
      } catch(e) {
        console.error("Error in UnityProgress:", e);
      }
    }
  };

  // Preload files
  var filesToLoad = [
    { url: buildConfig.wasmFrameworkUrl || 'Build/slope_wasmframework.unityweb', name: 'framework' },
    { url: buildConfig.wasmCodeUrl || 'Build/slope_wasmcode.unityweb', name: 'code' },
    { url: buildConfig.dataUrl || 'Build/slope_data.unityweb', name: 'data' }
  ];

  var loadedCount = 0;
  var totalCount = filesToLoad.length;

  function loadNextFile() {
    if (loadedCount >= totalCount) {
      // All files loaded, initialize the game
      progressHandler(1.0);
      initializeGame();
      return;
    }

    var file = filesToLoad[loadedCount];
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    
    xhr.onprogress = function(e) {
      var itemProgress = e.loaded / e.total;
      var totalProgress = (loadedCount + itemProgress) / totalCount;
      progressHandler(totalProgress);
    };

    xhr.onload = function() {
      loadedCount++;
      progressHandler(loadedCount / totalCount);
      loadNextFile();
    };

    xhr.onerror = function() {
      console.warn("Could not load " + file.name + " from " + file.url);
      loadedCount++;
      loadNextFile();
    };

    xhr.open('GET', file.url);
    xhr.send();
  }

  function initializeGame() {
    // Load the actual code  
    var codeScript = document.createElement('script');
    codeScript.src = buildConfig.codeUrl || 'Build/slope_wasmcode.unityweb';
    
    codeScript.onload = function() {
      console.log("Game initialized successfully");
    };
    
    codeScript.onerror = function() {
      console.error("Failed to load game code");
    };
    
    document.body.appendChild(codeScript);
  }

  // Start loading
  loadNextFile();

  return Promise.resolve(gameInstance);
}

// Try to load based on config
if (typeof window.WebGLGame !== 'undefined' && typeof window.WebGLGame.config !== 'undefined') {
  var config = window.WebGLGame.config;
  var canvas = config.canvas || document.getElementById('unity-canvas') || document.querySelector('canvas');
  
  if (canvas) {
    window.unityInstance = createUnityInstance(canvas, config, function(progress) {
      if (typeof UnityProgress !== 'undefined') {
        var gameInstance = {
          Module: { splashScreenStyle: 'Dark' },
          container: canvas.parentElement || document.body
        };
        UnityProgress(gameInstance, progress);
      }
    });
  }
}