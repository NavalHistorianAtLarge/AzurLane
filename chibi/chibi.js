const app = new PIXI.Application({
  width: 600,
  height: 600,
  backgroundAlpha: 0, // transparent background
});
document.body.appendChild(app.view);

let spineChar;

function loadChibiSkel(name) {
  app.stage.removeChildren();
  PIXI.loader.reset();
  PIXI.loader
    .add(name, `/assets/spine/${name}.skel`, { metadata: { spineSkeletonScale: 1 } })
    .load((loader, resources) => {
      const spineChar = new PIXI.spine.Spine(resources[name].spineData);
      const animationNames = Object.keys(spineChar.spineData.animations);
      updateAnimationOptions(animationNames);

      spineChar.x = 300;
      spineChar.y = 600;
      spineChar.scale.set(0.5);
      spineChar.state.setAnimation(0, 'idle', true);
      app.stage.addChild(spineChar);
    });
}













