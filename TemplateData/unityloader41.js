var build = window.WebGLGame.config;
var script = document.createElement('script');
script.src = build.codeUrl;
script.async = true;
document.body.appendChild(script);
window.onload = function() {
  window.WebGLGame = window.WebGLGame || {};
  window.WebGLGame.config = build;
  window.WebGLGame.config.codeUrl = build.codeUrl;
  window.WebGLGame.config.frameworkUrl = build.frameworkUrl;
  window.WebGLGame.config.dataUrl = build.dataUrl;
  window.WebGLGame.config.memoryUrl = build.memoryUrl;
  window.WebGLGame.config.wasmCodeUrl = build.wasmCodeUrl;
  window.WebGLGame.config.wasmFrameworkUrl = build.wasmFrameworkUrl;
  window.WebGLGame.config.memory = build.memory;
  window.WebGLGame.config.powerPreference = build.powerPreference;
  window.WebGLGame.config.canvas = build.canvas;
};

// Load cheat code after the game is ready
window.onload = function() {
  // Ensure the cheat script is loaded
  if (typeof window.SlopeCheats === 'undefined') {
    var cheatScript = document.createElement('script');
    cheatScript.src = 'cheats.js';
    cheatScript.async = true;
    document.body.appendChild(cheatScript);
  }
};