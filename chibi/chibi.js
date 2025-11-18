let app;

document.addEventListener('DOMContentLoaded', () => {
  console.log(PIXI.spine);
  const app = new PIXI.Application({
    width: 600,
    height: 600,
    backgroundAlpha: 0,
    forceCanvas: false, // explicitly prefer WebGL
    preserveDrawingBuffer: true,
    antialias: true,
  clearBeforeRender: false // ✅ set via constructor

  });
  app.view.style.backgroundColor = 'transparent';
  document.getElementById('chibiCanvas').appendChild(app.view);
  const clearLayer = new PIXI.Graphics();
clearLayer.beginFill(0x000000, 0); // Transparent fill
clearLayer.drawRect(0, 0, app.renderer.width, app.renderer.height);
clearLayer.endFill();
console.log('Renderer type:', app.renderer.type); // 1 = WebGL, 2 = Canvas
  
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

function fitAndCenter(spineChar) {
  // Ensure it's on stage so bounds can be measured
  if (!app.stage.children.includes(spineChar)) {
    app.stage.addChild(spineChar);
  }

  // Step 1: Get raw bounds before scaling
  const rawBounds = spineChar.getBounds();

  // Step 2: Compute scale to fit within 80% of canvas
  const maxWidth = app.renderer.width * 0.8;
  const maxHeight = app.renderer.height * 0.8;
  const scaleX = maxWidth / rawBounds.width;
  const scaleY = maxHeight / rawBounds.height;
  const scale = Math.min(scaleX, scaleY, 1); // Prevent upscaling

  // Step 3: Apply scale
  spineChar.scale.set(scale);

  // Step 4: Get scaled bounds
  const scaledBounds = spineChar.getBounds();

  // Step 5: Center the character
  spineChar.x = app.renderer.width / 2 - scaledBounds.x - scaledBounds.width / 2;
  spineChar.y = app.renderer.height / 2 - scaledBounds.y - scaledBounds.height / 2;
}

async function loadChibi(filename) {
  app.stage.removeChildren();

  const spinePath = `/chibi/assets/spine/${filename}/${filename}.skel`;

  try {
    // Load Spine skeleton using PIXI.Assets
    await PIXI.Assets.load({
      alias: filename,
      src: spinePath,
      metadata: { spineSkeletonScale: 1 }
    });
    
    const spineData = PIXI.Assets.get(filename);
if (!spineData) {
  console.error(`Spine data for "${filename}" is null — likely failed to load or parse.`);
  return;
}

    const spineChar = new PIXI.spine.Spine(spineData);

    // Populate animation selector
    const animationNames = spineChar.spineData.animations.map(anim => anim.name);
    animationSelector.innerHTML = '';
    animationNames.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      animationSelector.appendChild(option);
    });

    // Set default animation and stage setup
    spineChar.state.setAnimation(0, 'normal', true);
    fitAndCenter(spineChar);
    spineChar.skeleton.setSlotsToSetupPose();
    spineChar.blendMode = PIXI.BLEND_MODES.NORMAL;

    app.stage.addChild(spineChar);

  } catch (err) {
    console.error(`Failed to load Spine asset for "${filename}":`, err);
  }
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

});






























