const app = new PIXI.Application({
  width: 800,
  height: 600,
  transparent: true
});
document.getElementById('chibiCanvas').appendChild(app.view);


let currentChibi = null;
let currentSkin = null;

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

const chibiSelect = document.getElementById('chibiSelect');
const skinSelect = document.getElementById('skinSelect');
const animSelect = document.getElementById('animSelect');

let chibiData = null;

// Load chibiFiles.json
fetch('chibiFiles.json')
  .then(res => res.json())
  .then(data => {
    chibiData = data.chibis;

    // Populate chibi dropdown
    chibiData.forEach(chibi => {
      const opt = document.createElement('option');
      opt.value = chibi.name;
      opt.textContent = chibi.name;
      chibiSelect.appendChild(opt);
    });

    // Auto-load first chibi + first skin
    if (chibiData.length > 0) {
      const first = chibiData[0];
      chibiSelect.value = first.name;
      populateSkins(first);
      loadSkin(first.skins[0]);
    }
  });

// Populate skins dropdown for a given chibi
function populateSkins(chibi) {
  skinSelect.innerHTML = '';
  chibi.skins.forEach(skin => {
    const opt = document.createElement('option');
    opt.value = skin.id;
    opt.textContent = skin.label;
    opt.dataset.path = skin.path;
    skinSelect.appendChild(opt);
  });
  skinSelect.value = chibi.skins[0].id;
}

// Load a specific skin
function loadSkin(skin) {
  const loader = new PIXI.loaders.Loader();
  loader.add(skin.id, skin.path).load((l, resources) => {
    // Remove previous
    if (currentChibi) {
      app.stage.removeChild(currentChibi);
    }

    const spineChar = new PIXI.spine.Spine(resources[skin.id].spineData);
    spineChar.x = app.renderer.width / 2;
    spineChar.y = app.renderer.height * 0.75;   
    spineChar.scale.set(1.0);
    spineChar.state.setAnimation(0, 'normal', true);

    app.stage.addChild(spineChar);
    currentChibi = spineChar;
    currentSkin = skin;

    // Populate animation dropdown
    animSelect.innerHTML = '';
    const anims = spineChar.spineData.animations.map(a => a.name);
    anims.forEach(anim => {
      const opt = document.createElement('option');
      opt.value = anim;
      opt.textContent = anim;
      animSelect.appendChild(opt);
    });
    animSelect.value = anims[0];
  });
}

// Event: change chibi
chibiSelect.addEventListener('change', e => {
  const chibi = chibiData.find(c => c.name === e.target.value);
  populateSkins(chibi);
  loadSkin(chibi.skins[0]);
});

// Event: change skin
skinSelect.addEventListener('change', e => {
  const chibi = chibiData.find(c => c.name === chibiSelect.value);
  const skin = chibi.skins.find(s => s.id === e.target.value);
  loadSkin(skin);
});

// Event: change animation
animSelect.addEventListener('change', e => {
  if (currentChibi) {
    currentChibi.state.setAnimation(0, e.target.value, true);
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
    a.download = `${chibiSelect.value}_${currentSkin.id}_animations.zip`;
    a.click();
  });
});

const sidebar = document.getElementById('sidebar');
const chibiView = document.getElementById('chibiView');
const animView = document.getElementById('animView');
const chibiList = document.getElementById('chibiList');
const backBtn = document.getElementById('backBtn');

// Load chibiFiles.json
fetch('chibiFiles.json')
  .then(res => res.json())
  .then(data => {
    data.chibis.forEach(chibi => {
      // Use PNG thumbnail for each chibi
      const img = document.createElement('img');
      img.src = `/chibi/assets/thumbnails/${chibi.name}.png`; // adjust path
      img.alt = chibi.name;
      img.addEventListener('click', () => {
        // Load first skin of chosen chibi
        currentSkin = chibi.skins[0];
        loadSkin(currentSkin);

        // Switch to animation view
        showAnimations(chibi);
      });
      chibiList.appendChild(img);
    });

    // Open sidebar initially
    sidebar.classList.add('open');
  });

// Populate animation buttons
function showAnimations(chibi) {
  chibiView.classList.add('hidden');
  animView.classList.remove('hidden');

  const animList = document.getElementById('animList');
let selectedAnimations = [];
  
  // Clear both views
  animList.innerHTML = '';
  animSelect.innerHTML = '';
  selectedAnimations = [];

  const anims = currentChibi.spineData.animations.map(a => a.name);
  anims.forEach(anim => {
    // Button view
    const btn = document.createElement('button');
    btn.textContent = anim;
    btn.classList.add('anim-btn');
    btn.addEventListener('click', () => {
      currentChibi.state.setAnimation(0, anim, true);
      sidebar.classList.remove('open');
    });
    animList.appendChild(btn);

    // Dropdown view
    const opt = document.createElement('option');
    opt.value = anim;
    opt.textContent = anim;
    animSelect.appendChild(opt);
  });
}

function populateAnimationButtons(spineChar) {
  animList.innerHTML = '';
  selectedAnimations = [];

  const anims = spineChar.spineData.animations.map(a => a.name);
  anims.forEach(anim => {
    const btn = document.createElement('button');
    btn.textContent = anim;
    btn.classList.add('anim-btn');
    btn.addEventListener('click', () => {
      if (selectedAnimations.includes(anim)) {
        selectedAnimations = selectedAnimations.filter(a => a !== anim);
        btn.classList.remove('selected');
      } else {
        selectedAnimations.push(anim);
        btn.classList.add('selected');
      }
    });
    animList.appendChild(btn);
  });
}










