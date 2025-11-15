const app = new PIXI.Application({
  width: 600,
  height: 600,
  backgroundAlpha: 0, // transparent background
});
document.body.appendChild(app.view);

let spineChar;

PIXI.loader.shared
  .add('zuikaku', '/assets/spine/zuikaku.json')
  .load((loader, resources) => {
    spineChar = new PIXI.spine.Spine(resources.zuikaku.spineData);
    spineChar.x = 300;
    spineChar.y = 600;
    spineChar.scale.set(0.5);

    spineChar.state.setAnimation(0, 'idle', true);
    app.stage.addChild(spineChar);
  });

function animateZuikaku(action) {
  if (spineChar) {
    spineChar.state.setAnimation(0, action, false);
  }
}








