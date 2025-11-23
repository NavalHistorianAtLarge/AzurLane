// Create PixiJS app with transparency enabled
const app = new PIXI.Application({
  width: 800,
  height: 600,
  transparent: true   // background transparency
});
document.body.appendChild(app.view);

// Registry for all loaded chibis
const chibis = {};

// Loader function for any chibi
function loadChibi(name, path, options = {}) {
  PIXI.loader
    .add(name, path)
    .load((loader, resources) => {
      const spineChar = new PIXI.spine.Spine(resources[name].spineData);

      // Positioning defaults with optional overrides
      spineChar.x = options.x || 300;
      spineChar.y = options.y || 600;
      spineChar.scale.set(options.scale || 0.5);

      // Default idle animation
      spineChar.state.setAnimation(0, options.defaultAnim || 'normal', true);

      // Add to stage and registry
      app.stage.addChild(spineChar);
      chibis[name] = spineChar;
    });
}

// Animate any chibi by name
function animateChibi(name, action, loop = false) {
  const spineChar = chibis[name];
  if (spineChar) {
    spineChar.state.setAnimation(0, action, loop);
  } else {
    console.warn(`Chibi "${name}" not found.`);
  }
}

// Example usage
loadChibi('zuikaku', '/assets/spine/zuikaku.json', { x: 300, y: 600, scale: 0.5 });
loadChibi('shoukaku', '/assets/spine/shoukaku.json', { x: 500, y: 600, scale: 0.5 });

// Later, trigger animations dynamically
// animateChibi('zuikaku', 'attack');
// animateChibi('shoukaku', 'victory', true);
