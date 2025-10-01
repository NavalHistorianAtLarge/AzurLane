const app = new PIXI.Application({
  width: 1,
  height: 1,
  backgroundAlpha: 0,
  transparent: true,
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
    loadedCharacters[name].state.setAnimation(0, options.animation || 'idle', true);
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
      spineChar.scale.set(options.scale || 0.3);
      spineChar.state.setAnimation(0, options.animation || 'idle', true);

      app.stage.removeChildren();
      app.stage.addChild(spineChar);
      loadedCharacters[name] = spineChar;

      // 🔧 Position canvas near target element
      const target = document.getElementById(options.targetId);
      if (target) {
        const rect = target.getBoundingClientRect();

        app.renderer.resize(rect.width, rect.height);

        app.view.style.position = 'absolute';
        app.view.style.left = `${rect.left + window.scrollX}px`;
        app.view.style.top = `${rect.top + window.scrollY}px`;
        app.view.style.width = `${rect.width}px`;
        app.view.style.height = `${rect.height}px`;
        app.view.style.pointerEvents = 'auto';
        app.view.style.zIndex = 10;
        app.view.style.background = 'transparent';

        target.style.visibility = 'hidden';

        app.view.onclick = () => {
          app.view.remove();
          target.style.visibility = 'visible';
        };
      }

      if (options.onReady) options.onReady(spineChar);
    });
}
