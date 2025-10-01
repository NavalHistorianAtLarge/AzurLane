const app = new PIXI.Application({
  width: 600,
  height: 600,
  backgroundAlpha: 0
});
document.body.appendChild(app.view);

const loader = PIXI.Loader.shared;

if (!loader.resources['zuikaku']) {
  loader
    .add('zuikaku', '/assets/spine/zuikaku/zuikaku.json')
    .load((loader, resources) => {
      if (!PIXI.spine) {
        console.error("Spine runtime not loaded");
        return;
      }

      const spineChar = new PIXI.spine.Spine(resources.zuikaku.spineData);
      spineChar.x = app.screen.width / 2;
      spineChar.y = app.screen.height;
      spineChar.scale.set(0.5);
      spineChar.state.setAnimation(0, 'idle', true);
      app.stage.addChild(spineChar);

      window.animateZuikaku = function(action) {
        spineChar.state.setAnimation(0, action, false);
      };
    });
}
