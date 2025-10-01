const app = new PIXI.Application({
  width: 100,
  height: 100,
  backgroundAlpha: 1
});
document.body.appendChild(app.view);

const loader = PIXI.Loader.shared;

if (!loader.resources['zuikaku']) {
  loader
    .add('zuikaku', '/assets/spine/zuikaku/ruihe.skel')
    .load((loader, resources) => {
      if (!PIXI.spine) {
        console.error("Spine runtime not loaded");
        return;
      }

      const spineChar = new PIXI.spine.Spine(resources.zuikaku.spineData);
      spineChar.x = app.screen.width / 2;
      spineChar.y = app.screen.height;
      spineChar.scale.set(0.5);
      spineChar.state.setAnimation(0, 'stand2', true);
      app.stage.addChild(spineChar);

      window.animateZuikaku = function(action) {
        spineChar.state.setAnimation(0, action, false);
      };
    });
}




