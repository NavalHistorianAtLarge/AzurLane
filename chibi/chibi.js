const app = new PIXI.Application({
  width: 600,
  height: 600,
  backgroundAlpha: 0
});
document.getElementById('chibiCanvas').appendChild(app.view);


const chibiData = JSON.parse(document.getElementById('chibiData').textContent);
const chibiInput = document.getElementById('chibiSelectorInput');
const skinSelector = document.getElementById('skinSelector');

chibiInput.addEventListener('change', () => {
  const chibi = chibiInput.value.trim();
  if (chibiData[chibi]) {
    populateSkins(chibi);
    loadChibi(chibiData[chibi][0]); // Load default skin
  }
});

skinSelector.addEventListener('change', () => {
  const skinFile = skinSelector.value;
  loadChibi(skinFile);
});

function populateSkins(chibi) {
  skinSelector.innerHTML = '';
  chibiData[chibi].forEach(filename => {
    const label = filename === chibi ? 'default' : `skin ${filename.replace(chibi, '')}`;
    const option = document.createElement('option');
    option.value = filename;
    option.textContent = label;
    skinSelector.appendChild(option);
  });
}

function loadChibi(filename) {
  app.stage.removeChildren();
  PIXI.loader.reset();

  PIXI.loader
    .add(filename, `/chibi/assets/spine/${filename}/${filename}.skel`, { metadata: { spineSkeletonScale: 1 } })
    .load((loader, resources) => {
      const spineChar = new PIXI.spine.Spine(resources[filename].spineData);
      
      const animationNames = spineChar.spineData.animations.map(anim => anim.name);

      animationSelector.innerHTML = '';
      animationNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        animationSelector.appendChild(option);
      });

    // Step 1: Add spineChar to stage temporarily to compute bounds
    app.stage.addChild(spineChar);

// Step 2: Get unscaled bounds
    const rawBounds = spineChar.getBounds();

// Step 3: Compute scale to fit within canvas
const maxWidth = app.renderer.width * 0.8;
const maxHeight = app.renderer.height * 0.8;
const scaleX = maxWidth / rawBounds.width;
const scaleY = maxHeight / rawBounds.height;
const scale = Math.min(scaleX, scaleY, 1); // Prevent upscaling

// Step 4: Apply scale
spineChar.scale.set(scale);

// Step 5: Get scaled bounds
const scaledBounds = spineChar.getBounds();

// Step 6: Center the character
spineChar.x = app.renderer.width / 2 - scaledBounds.x - scaledBounds.width / 2;
spineChar.y = app.renderer.height / 2 - scaledBounds.y - scaledBounds.height / 2;
    });
}
function playSelectedAnimation() {
  const anim = animationSelector.value;
  const spineChar = app.stage.children.find(c => c instanceof PIXI.spine.Spine);
  if (spineChar && anim) {
    spineChar.state.setAnimation(0, anim, false);
  }
}
document.querySelector('button').addEventListener('click', playSelectedAnimation);

function showAnimationDuration() {
  const animName = animationSelector.value;
  const spineChar = app.stage.children.find(c => c instanceof PIXI.spine.Spine);
  if (!spineChar || !animName) return;

  const animation = spineChar.spineData.findAnimation(animName);
  if (!animation) {
    console.warn(`Animation "${animName}" not found`);
    return;
  }

  const duration = animation.duration.toFixed(2); // seconds
  const output = document.getElementById('animationDuration');
  output.textContent = `⏱ Duration: ${duration} seconds`;
}







