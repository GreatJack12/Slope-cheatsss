// Cheat code injection for Unity WebGL Slope game
// Injected into the game after it loads to modify runtime variables

(function() {
  'use strict';

  // Wait for the game to fully load
  window.onload = function() {
    // Wait for the WebGL game to initialize
    if (window.WebGLGame && window.WebGLGame.config) {
      window.onload = function() {
        // Initialize cheats after the game is ready
        initCheats();
      };
    }
  };

  function initCheats() {
    // Create a cheat console in the browser
    createCheatConsole();

    // Expose cheat functions globally
    window.SlopeCheats = {
      // Toggle infinite speed
      toggleInfiniteSpeed: function() {
        // Try to access the player's speed variable
        try {
          // Common variable names for speed in Unity WebGL games
          var speedVars = [
            'playerSpeed', 'speed', 'velocity', 'currentSpeed',
            'player.velocity', 'player.speed', 'player.currentSpeed'
          ];

          for (var i = 0; i < speedVars.length; i++) {
            var varName = speedVars[i];
            // Try to set speed to a high value
            window[varName] = 100; // Example: set speed to 100
            console.log('Set ' + varName + ' to 100');
          }
        } catch (e) {
          console.log('Speed cheat failed:', e);
        }
      },

      // Toggle infinite score
      toggleInfiniteScore: function() {
        try {
          var scoreVars = [
            'score', 'playerScore', 'currentScore', 'scoreValue'
          ];

          for (var i = 0; i < scoreVars.length; i++) {
            var varName = scoreVars[i];
            window[varName] = 999999; // Set score to a high value
            console.log('Set ' + varName + ' to 999999');
          }
        } catch (e) {
          console.log('Score cheat failed:', e);
        }
      },

      // Toggle gravity (make the player float)
      toggleGravity: function() {
        try {
          var gravityVars = [
            'gravity', 'playerGravity', 'currentGravity'
          ];

          for (var i = 0; i < gravityVars.length; i++) {
            var varName = gravityVars[i];
            window[varName] = 0; // Disable gravity
            console.log('Set ' + varName + ' to 0');
          }
        } catch (e) {
          console.log('Gravity cheat failed:', e);
        }
      },

      // Toggle invincibility (disable collisions)
      toggleInvincibility: function() {
        try {
          var healthVars = [
            'health', 'playerHealth', 'currentHealth', 'hp'
          ];

          for (var i = 0; i < healthVars.length; i++) {
            var varName = healthVars[i];
            window[varName] = 999999; // Set health to a high value
            console.log('Set ' + varName + ' to 999999');
          }
        } catch (e) {
          console.log('Health cheat failed:', e);
        }
      },

      // Toggle time speed (slow motion or fast forward)
      toggleTimeSpeed: function() {
        try {
          var timeVars = [
            'timeScale', 'playerTimeScale', 'currentTimeScale'
          ];

          for (var i = 0; i < timeVars.length; i++) {
            var varName = timeVars[i];
            window[varName] = 2; // Slow motion
            console.log('Set ' + varName + ' to 2');
          }
        } catch (e) {
          console.log('Time speed cheat failed:', e);
        }
      },

      // Reset game (optional)
      resetGame: function() {
        console.log('Resetting game...');
        // Try to reset the game by reloading the page
        window.location.reload();
      }
    };

    // Log to console
    console.log('SlopeCheats initialized. Use window.SlopeCheats to access functions.');
  }

  function createCheatConsole() {
    // Create a cheat console in the browser
    var consoleDiv = document.createElement('div');
    consoleDiv.id = 'cheat-console';
    consoleDiv.style.cssText = 'position: fixed; bottom: 10px; right: 10px; background: rgba(0, 0, 0, 0.8); color: #0f0; padding: 10px; font-family: monospace; font-size: 12px; border-radius: 5px; z-index: 99999;';

    consoleDiv.innerHTML = '<strong>Slope Cheats</strong><br><br>' +
      '<button onclick="window.SlopeCheats.toggleInfiniteSpeed()">Infinite Speed</button><br>' +
      '<button onclick="window.SlopeCheats.toggleInfiniteScore()">Infinite Score</button><br>' +
      '<button onclick="window.SlopeCheats.toggleGravity()">Toggle Gravity</button><br>' +
      '<button onclick="window.SlopeCheats.toggleInvincibility()">Toggle Invincibility</button><br>' +
      '<button onclick="window.SlopeCheats.toggleTimeSpeed()">Toggle Time Speed</button><br>' +
      '<button onclick="window.SlopeCheats.resetGame()">Reset Game</button><br><br>' +
      'Use <code>console.log</code> to see cheat output.';

    document.body.appendChild(consoleDiv);
  }
})();