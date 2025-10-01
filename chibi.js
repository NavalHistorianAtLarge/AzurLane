const app = new PIXI.Application({
  width: 1, // temporary, will resize later
  height: 1,
  backgroundAlpha: 0, // transparent
  autoDensity: true,
  resolution: window.devicePixelRatio || 1

});
document.body.appendChild(app.view);

const container = document.createElement('div');
container.className = 'chibiCanvas';
container.appendChild(app.view);

const loader = PIXI.Loader.shared;

document.body.appendChild(app.view);

const loader = PIXI.Loader.shared;
const loadedCharacters = {};

function loadSpineCharacter(name, options = {}) {
  const basePath = `/assets/spine/${name}/`;
  const resourceKey = `${name}-spine`;

  if (loadedCharacters[name]) {
    // Already loaded — just animate
    loadedCharacters[name].state.setAnimation(0, options.animation || 'idle', false);
    return;
  }

  if (loader.loading) {
    console.warn("Loader is busy — try again after load completes.");
    return;
  }

  loader
    .add(resourceKey, `${basePath}${name}.json`)
    .load((_, resources) => {
      if (!PIXI.spine) {
        console.error("Spine runtime not loaded");
        return;
      }

      const spineChar = new PIXI.spine.Spine(resources[resourceKey].spineData);
      spineChar.x = options.x || app.screen.width / 2;
      spineChar.y = options.y || app.screen.height;
      spineChar.scale.set(options.scale || 0.5);
      spineChar.state.setAnimation(0, options.animation || 'idle', false);

      const spineChar = new PIXI.spine.Spine(resources[resourceKey].spineData);

      // Resize canvas to fit character bounds
      const bounds = spineChar.getBounds();
      app.renderer.resize(bounds.width, bounds.height);

      // Position character at origin
      spineChar.x = -bounds.x;
      spineChar.y = -bounds.y;

      app.stage.removeChildren(); // clear previous
      app.stage.addChild(spineChar);
      loadedCharacters[name] = spineChar;

      if (options.onReady) options.onReady(spineChar);
    });
}







