// Simple Unity WebGL Loader
(function() {
  if (typeof window.WebGLGame === 'undefined' || !window.WebGLGame.config) {
    console.error("WebGLGame config not found");
    return;
  }

  var config = window.WebGLGame.config;
  var canvas = config.canvas;
  
  if (!canvas) {
    console.error("Canvas not configured");
    return;
  }

  // Ensure full screen canvas
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Show progress
  function updateProgress(progress) {
    if (typeof UnityProgress !== 'undefined') {
      var gameInstance = {
        Module: { splashScreenStyle: config.splashScreenStyle || 'Dark' },
        container: canvas.parentElement || document.body,
        progress: {}
      };
      try {
        UnityProgress(gameInstance, progress);
      } catch(e) {
        // Silently ignore progress errors
      }
    }
  }

  // Load the game code
  function loadGameCode() {
    updateProgress(0.9);
    
    var script = document.createElement('script');
    script.src = config.codeUrl || 'Build/slope_wasmcode.unityweb';
    script.async = true;
    
    script.onload = function() {
      updateProgress(1.0);
    };
    
    script.onerror = function() {
      console.error("Failed to load game code from:", script.src);
      updateProgress(0);
    };
    
    document.body.appendChild(script);
  }

  // Start loading after a small delay to ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      updateProgress(0.5);
      loadGameCode();
    });
  } else {
    updateProgress(0.5);
    loadGameCode();
  }
})();