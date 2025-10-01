const app = new PIXI.Application({
  width: 1,
  height: 1,
  backgroundAlpha: 0,
  autoDensity: true,
  resolution: window.devicePixelRatio || 1
});

const container = document.createElement('div');
container.className = 'chibiCanvas';
document.body.appendChild(container);
container.appendChild(app.view);

const loader = PIXI.Loader.shared;
const loadedCharacters = {};

function loadSpineCharacter(name, options = {}) {
  const basePath = `/assets/spine/${name}/`;
  const resourceKey = `${name}-spine`;

  if (loadedCharacters[name]) {
    loadedCharacters[name].state.setAnimation(0, options.animation || 'idle', false);
    return;
  }

  if (loader.loading) {
    console.warn("Loader is busy — try again after load completes.");
    return;
  }

  loader
    .add(resourceKey, `${basePath}${name}.skel`)
    .load((_, resources) => {
      if (!PIXI.spine) {
        console.error("Spine runtime not loaded");
        return;
      }

      const spineChar = new PIXI.spine.Spine(resources[resourceKey].spineData);

      const bounds = spineChar.getBounds();
      app.renderer.resize(bounds.width, bounds.height);

      spineChar.x = -bounds.x;
      spineChar.y = -bounds.y;
      spineChar.scale.set(options.scale || 0.5);
      spineChar.state.setAnimation(0, options.animation || 'idle', false);

      app.stage.removeChildren();
      app.stage.addChild(spineChar);
      loadedCharacters[name] = spineChar;

      if (options.onReady) options.onReady(spineChar);
    });
}

