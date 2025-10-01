const app = new PIXI.Application({
  width: 600,
  height: 600,
  backgroundAlpha: 0, // transparent background
});
let spineChar;

PIXI.loader
  .add('zuikaku', '/assets/spine/zuikaku.json')
  .load((loader, resources) => {
    spineChar = new PIXI.spine.Spine(resources.zuikaku.spineData);
    spineChar.x = 300;
    spineChar.y = 600;
    spineChar.scale.set(0.5);

    spineChar.state.setAnimation(0, 'idle', true);

    const app = new PIXI.Application({ width: 600, height: 600, backgroundAlpha: 0 });
    document.body.appendChild(app.view);
    app.stage.addChild(spineChar);
  });

function animateZuikaku(action) {
  if (spineChar) {
    spineChar.state.setAnimation(0, action, false);
  }
}
document.body.appendChild(app.view);
function animateZuikaku(action) {
  const spineChar = app.stage.children.find(c => c instanceof PIXI.spine.Spine);
  spineChar.state.setAnimation(0, action, false);

}
