const chibiData = {
  zuikaku: ['default', 'ceremonial_crane', 'summer_dancer'],
  akagi: ['default', 'dark_fox'],
  kaga: ['default', 'white_wolf'],
  shoukaku: ['default', 'phoenix_feathers'],
  taihou: ['default', 'midnight_empress']
};

const app = new PIXI.Application({ width: 600, height: 600, backgroundAlpha: 0 });
document.body.appendChild(app.view);

const skinSelector = document.getElementById('skinSelector');
const animationSelector = document.getElementById('animationSelector');
const chibiInput = document.getElementById('chibiSelectorInput');

let spineChar = null;

chibiInput.addEventListener('change', () => {
  const chibi = chibiInput.value.trim();
  if (chibiData[chibi]) {
    populateSkins(chibi);
    loadChibi(chibi, chibiData[chibi][0]); // Load default skin
  } else {
    skinSelector.innerHTML = '';
    animationSelector.innerHTML = '';
  }
});

skinSelector.addEventListener('change', () => {
  const chibi = chibiInput.value.trim();
  const skin = skinSelector.value;
  loadChibi(chibi, skin);
});

function populateSkins(chibi) {
  skinSelector.innerHTML = '';
  chibiData[chibi].forEach(skin => {
    const option = document.createElement('option');
    option.value = skin;
    option.textContent = skin.replace(/_/g, ' ');
    skinSelector.appendChild(option);
  });
}

function loadChibi(chibi, skin) {
  app.stage.removeChildren();
  PIXI.loader.reset();

  const key = `${chibi}_${skin}`;
  const path = `/assets/spine/${key}.skel`;

  PIXI.loader
    .add(key, path, { metadata: { spineSkeletonScale: 1 } })
    .load((loader, resources) => {
      spineChar = new PIXI.spine.Spine(resources[key].spineData);
      spineChar.x = 300;
      spineChar.y = 600;
      spineChar.scale.set(0.5);
      spineChar.state.setAnimation(0, 'idle', true);
      app.stage.addChild(spineChar);

      const animations = Object.keys(spineChar.spineData.animations);
      animationSelector.innerHTML = '';
      animations.forEach(anim => {
        const option = document.createElement('option');
        option.value = anim;
        option.textContent = anim;
        animationSelector.appendChild(option);
      });
    });
}

function playSelectedAnimation() {
  const anim = animationSelector.value;
  if (spineChar) {
    spineChar.state.setAnimation(0, anim, false);
  }
}













