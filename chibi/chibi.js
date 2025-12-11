const app = new PIXI.Application({
  width: 800,
  height: 600,
  transparent: true
});
document.getElementById('chibiCanvas').appendChild(app.view);


let currentChibi = null;
let currentSkin = null;

const chibiList = document.getElementById('chibiList');
const skinList = document.getElementById('skinList');

const chibiView = document.getElementById('chibiView');
const skinView = document.getElementById('skinView');
const animView = document.getElementById('animView');

const backToChibis = document.getElementById('backToChibis');
const backToSkins = document.getElementById('backToSkins');

let chibiData = null;

fetch('chibiFiles.json')
  .then(res => res.json())
  .then(data => {
    chibiData = data.chibis;

    chibiData.forEach(chibi => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('chibi-item');

      const img = document.createElement('img');
      img.src = `/chibi/assets/thumbnails/${chibi.name}.png`;
      img.alt = chibi.name;
      img.addEventListener('click', () => {
        showSkins(chibi);
      });

      const caption = document.createElement('div');
      caption.classList.add('chibi-caption');
      caption.textContent = chibi.name;

      wrapper.appendChild(img);
      wrapper.appendChild(caption);
      chibiList.appendChild(wrapper);
    });
  })

// Load skin into PixiJS
function loadSkin(skin) {
  const loader = new PIXI.loaders.Loader();
  loader.add(skin.id, skin.path).load((l, resources) => {
    if (currentChibi) app.stage.removeChild(currentChibi);

    const spineChar = new PIXI.spine.Spine(resources[skin.id].spineData);
    spineChar.x = app.renderer.width / 2;
    spineChar.y = app.renderer.height * 0.75;
    spineChar.scale.set(0.5);
    spineChar.state.setAnimation(0, 'normal', true);

    app.stage.addChild(spineChar);
    currentChibi = spineChar;
  });
}
// Step 2: show skins for chosen chibi
function showSkins(chibi) {
  chibiView.classList.add('hidden');
  skinView.classList.remove('hidden');
  skinList.innerHTML = '';

  chibi.skins.forEach(skin => {
    const img = document.createElement('img');
    img.src = `/assets/thumbnails/${skin.id}.png`; // e.g. zuikaku1.png
    img.alt = skin.label;
    img.title = skin.label;
    img.addEventListener('click', () => {
      currentSkin = skin;
      loadSkin(skin);
      showAnimations();
    });
    skinList.appendChild(img);
  });
}

// Step 3: show animations for chosen skin
function showAnimations() {
  skinView.classList.add('hidden');
  animView.classList.remove('hidden');
  animSelect.innerHTML = '';

  const anims = currentChibi.spineData.animations.map(a => a.name);
  anims.forEach(anim => {
    const opt = document.createElement('option');
    opt.value = anim;
    opt.textContent = anim;
    animSelect.appendChild(opt);
  });

  if (anims.length > 0) {
    animSelect.value = anims[0];
    currentChibi.state.setAnimation(0, anims[0], true);
  }
}

// Back buttons
backToChibis.addEventListener('click', () => {
  skinView.classList.add('hidden');
  chibiView.classList.remove('hidden');
});
backToSkins.addEventListener('click', () => {
  animView.classList.add('hidden');
  skinView.classList.remove('hidden');
});




// Resize handler
function resizeCanvas() {
  const container = document.getElementById('chibiCanvas');
  const width = container.clientWidth;
  const height = container.clientHeight;
  app.renderer.resize(width, height);

  // Reposition current chibi if loaded
  if (currentChibi) {
    currentChibi.x = width / 2;
    currentChibi.y = height * 0.75;
  }
}

// Listen for window resize
window.addEventListener('resize', resizeCanvas);

// Call once at startup
resizeCanvas();

// Populate skins dropdown for a given chibi
function populateSkins(chibi) {
  skinList.innerHTML = '';
  chibi.skins.forEach(skin => {
    const img = document.createElement('image');
    img.value = skin.id;
    img.textContent = skin.label;
    img.dataset.path = skin.path;
    skinList.appendChild(img);
  });
  skinList.value = chibi.skins[0].id;
}

    // Populate animation dropdown
    animSelect.innerHTML = '';
    const anims = spineChar.spineData.animations.map(a => a.name);
    anims.forEach(anim => {
      const opt = document.createElement('option');
      opt.value = anim;
      opt.textContent = anim;
      animSelect.appendChild(opt);
    animSelect.value = anims[0];
}

// Event: change animation
animSelect.addEventListener('change', e => {
  if (currentChibi) {
    currentChibi.state.setAnimation(0, e.target.value, true)
  }
});


async function captureAnimationFrames(spineChar, animationName, fps = 30, zipFolder) {
  return new Promise((resolve) => {
    // Find animation duration
    const anim = spineChar.spineData.animations.find(a => a.name === animationName);
    if (!anim) {
      console.error(`Animation "${animationName}" not found.`);
      resolve();
      return;
    }
    const duration = anim.duration;
    const frameCount = Math.ceil(duration * fps);

    // Set animation
    spineChar.state.setAnimation(0, animationName, false);

    let frame = 0;
    const ticker = new PIXI.Ticker();
    ticker.add(() => {
      spineChar.update(1 / fps);
      app.renderer.render(app.stage);

      const canvas = app.renderer.extract.canvas(spineChar);
      const dataURL = canvas.toDataURL("image/png");

      zipFolder.file(
        `${animationName}_frame_${String(frame).padStart(3, '0')}.png`,
        dataURL.split(',')[1],
        { base64: true }
      );

      frame++;
      if (frame >= frameCount) {
        ticker.stop();
        resolve();
      }
    });
    ticker.start();
  });
}
document.getElementById('saveZipBtn').addEventListener('click', async () => {
  if (!currentChibi) return;

  const selected = Array.from(animSelect.selectedOptions).map(opt => opt.value);
  if (selected.length === 0) {
    alert("Please select at least one animation.");
    return;
  }

  const zip = new JSZip();
  const folder = zip.folder(currentSkin.id || currentSkin.label || "skin");

  // Capture each selected animation sequentially
  for (const animName of selected) {
    await captureAnimationFrames(currentChibi, animName, 30, folder);
  }

  // Generate zip and download
  zip.generateAsync({ type: "blob" }).then(content => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `${chibiList.value}_${currentSkin.id}_animations.zip`;
    a.click();
  });
});



































