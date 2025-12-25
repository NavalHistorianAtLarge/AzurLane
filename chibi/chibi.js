const app = new PIXI.Application({
  width: 800,
  height: 800,
  resolution: window.devicePixelRatio,
  autoDensity: true,
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

    fetch('https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/chibiFiles.json')
  .then(res => res.json())
  .then(data => {
    chibiData = data.chibis;

    chibiData.sort((a, b) => a.name.localeCompare(b.name));

    renderChibiList(chibiData);
  });

const rarityBackgrounds = {
  N: "url('https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/bg/normal.png')",
  R: "url('https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/bg/rare.png')",
  E: "url('https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/bg/elite.png')",
  SR: "url('https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/bg/sr.png')",
  UR: "url('https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/bg/ur.png')",
  DR: "url('https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/bg/decisive.png')",
  PR: "url('https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/bg/priority.png')",
  MSR: "url('https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/bg/msr.png')",
  MELITE: "url('https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/bg/melite.png')",
  MUR: "url('https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/bg/mur.png')"
};
const rarityBorders = {
  N: "grey",
  R: "blue",
  E: "#963eb6",
  SR: "gold",
  UR: "pink",
  DR: "pink",
  PR: "gold"
};

function renderChibiList(list) {
  chibiList.innerHTML = '';

  list.forEach(chibi => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('chibi-item');

    // ✅ Apply rarity background
    if (chibi.rarity && rarityBackgrounds[chibi.rarity]) {
      wrapper.style.backgroundImage = rarityBackgrounds[chibi.rarity];
      wrapper.style.backgroundSize = "cover";
      wrapper.style.backgroundRepeat = "no-repeat";
    }

    if (rarityBorders[chibi.rarity]) {
        wrapper.style.border = `1px solid ${rarityBorders[chibi.rarity]}`;
      }

    const img = document.createElement('img');
    img.src = `https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/thumbnails/${chibi.name}.png`;
    img.alt = chibi.name;
    img.addEventListener('click', () => showSkins(chibi.skins));

    const caption = document.createElement('div');
    caption.classList.add('chibi-caption');
    caption.textContent = chibi.name;

    wrapper.appendChild(img);
    wrapper.appendChild(caption);
    chibiList.appendChild(wrapper);
  });
}

  const searchInput = document.getElementById('chibiSearch');

  searchInput.addEventListener('input', () => {
  const term = searchInput.value.toLowerCase();

  const filtered = chibiData.filter(chibi =>
  chibi.name.toLowerCase().includes(term)
  );

  renderChibiList(filtered);
});

  const filterButtons = document.querySelectorAll('#options button');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    let filtered = chibiData;

    if (filter !== 'all') {
      filtered = chibiData.filter(chibi =>
        chibi.faction === filter ||
        chibi.type === filter ||
        (chibi.groups && chibi.groups.includes(filter))
      );
    }

    renderChibiList(filtered);
  });
});

let dragTarget = null;

function onDragStart(event) {
  dragTarget = this;
  this.data = event.data;
  this.dragOffset = this.data.getLocalPosition(this.parent);
  this.dragging = true;
}

function onDragEnd() {
  this.dragging = false;
  this.data = null;
  dragTarget = null;
}

function onDragMove() {
  if (!this.dragging) return;

  const newPos = this.data.getLocalPosition(this.parent);
  this.x = newPos.x;
  this.y = newPos.y;
}

function flipChibiX() {
  if (currentChibi) {
    currentChibi.scale.x *= -1;
  }
}

function flipChibiY() {
  if (currentChibi) {
    currentChibi.scale.y *= -1;
  }
}

document.getElementById('flipX').addEventListener('click', flipChibiX);
document.getElementById('flipY').addEventListener('click', flipChibiY);

// Load skin into PixiJS
function loadSkin(skin) {
  const loader = new PIXI.loaders.Loader();
  loader.add(skin.id, skin.path).load((l, resources) => {
    if (currentChibi) app.stage.removeChild(currentChibi);

    const spineChar = new PIXI.spine.Spine(resources[skin.id].spineData);
    spineChar.x = app.renderer.width / 2;
    spineChar.y = app.renderer.height * 0.75;
    spineChar.scale.set(1.0);
    spineChar.state.setAnimation(0, 'normal', true);

    app.stage.addChild(spineChar);
    currentChibi = spineChar;
    currentSkin = skin;

    // Enable dragging
    spineChar.interactive = true;
    spineChar.buttonMode = true; // cursor: pointer

    spineChar
  .on('pointerdown', onDragStart)
  .on('pointerup', onDragEnd)
  .on('pointerupoutside', onDragEnd)
  .on('pointermove', onDragMove);

    showAnimations();
  });
}
function setChibiScale(value) {
  if (currentChibi) {
    currentChibi.scale.set(value);
  }
}

document.getElementById('scaleSlider').addEventListener('input', e => {
  setChibiScale(parseFloat(e.target.value));
});

// Step 2: show skins for chosen chibi
function showSkins(list) {
  chibiView.classList.add('hidden');
  skinView.classList.remove('hidden');
  skinList.innerHTML = '';

  list.forEach(skin => {
    const skinWrap = document.createElement('div');
    skinWrap.classList.add('skin-item');

    const img = document.createElement('img');
    img.src = `https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/thumbnails/${skin.id}.png`; // e.g. zuikaku1.png
    img.alt = skin.label;
    img.title = skin.label;
    img.addEventListener('click', () => {
      currentSkin = skin;
      loadSkin(skin)
    })

    const caption = document.createElement('div');
    caption.classList.add('skin-caption');
    caption.textContent = skin.label;

    skinWrap.appendChild(img);
    skinWrap.appendChild(caption);
    skinList.appendChild(skinWrap);
})
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
// Outer
document.querySelector('.outerHeader').addEventListener('click', () => {
  document.querySelector('.outerCollapsible').classList.toggle('open');
});

// Inner
document.querySelectorAll('.collapsibleHeader').forEach(header => {
  header.addEventListener('click', () => {
    header.parentElement.classList.toggle('open');
  });
});

let logoSources = {
  faction: null,
  type: null,
  rarity: null,
  metaOrigin: null
};

fetch('https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/refs/heads/main/logos.json')
  .then(res => res.json())
  .then(data => {
    factionData = data.factions;
    typeData = data.types;
    rarityData = data.rarity;
    logoSources.faction = factionData;
    logoSources.type = typeData;
    logoSources.rarity = rarityData;
    applyLogos();
  });

function applyLogos() {
  const buttons = document.querySelectorAll('button[data-filter]');

  buttons.forEach(btn => {
    const category = btn.dataset.category;
    const id = btn.dataset.filter;

    const dataset = logoSources[category];
    if (!dataset) return;

    const entry = dataset.find(e => e.id === id);
    if (!entry) return;

    const img = document.createElement('img');
    img.src = entry.logo;
    img.alt = entry.name + " logo";
    img.classList.add('logo');

    btn.prepend(img);
  });
}

document.querySelectorAll('.main-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    const submenu = document.getElementById(btn.dataset.filter + 'Submenu');
    submenu.classList.toggle('open');
  });
});

const activeFilters = {
  faction: new Set(),
  type: new Set(),
  rarity: new Set(),
  metaClass: new Set(),
  metaOrigin: new Set(),
  group: new Set(),
  event: new Set()
};

document.querySelectorAll('[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;   // e.g. "faction"
    const value = btn.dataset.filter;        // e.g. "IronBlood"

     // --- HANDLE "ALL" BUTTON HERE ---
    if (value === "all" && category === "faction") {
      activeFilters.faction.clear();
      document
        .querySelectorAll('[data-category="faction"]')
        .forEach(b => b.classList.remove('active'));

      applyFilters();
      return;

    if (activeFilters[category].has(value)) {
      activeFilters[category].delete(value);
      btn.classList.remove('active');
    } else {
      activeFilters[category].add(value);
      btn.classList.add('active');
    }
    applyFilters();
  }});
});

  const rarityAliases = {
  UR: ["UR", "MUR"],
};

function isMetaFactionSelected() {
  return activeFilters.faction.has("meta");
}

function applyFilters() {


  const results = chibiData.filter(chibi => {

    // Faction
    if (activeFilters.faction.size > 0 &&
        !activeFilters.faction.has(chibi.faction)) return false;

    // Type
    if (activeFilters.type.size > 0 &&
        !activeFilters.type.has(chibi.type)) return false;

    // Rarity (with alias support)
    if (activeFilters.rarity.size > 0) {
      let passesRarity = false;

      for (const selected of activeFilters.rarity) {
      // If selected rarity has aliases (e.g., UR → ["UR","mur"])
      if (rarityAliases[selected]) {
      if (rarityAliases[selected].includes(chibi.rarity)) {
        passesRarity = true;
        break;
      }
    } else {
      // Normal direct match
      if (chibi.rarity === selected) {
        passesRarity = true;
        break;
      }
    }
  }

  if (!passesRarity) return false;
}

    // META Classification
    // META Classification
    if (isMetaFactionSelected()) {
    if (activeFilters.metaClass.size > 0 &&
      !activeFilters.metaClass.has(chibi.metaClass)) return false;
}
    // META Origin
if (isMetaFactionSelected()) {
  if (activeFilters.metaOrigin.size > 0 &&
      !activeFilters.metaOrigin.has(chibi.metaOrigin)) return false;
}

    // Group
    if (activeFilters.group.size > 0 &&
        !activeFilters.group.has(chibi.group)) return false;

    // Event
    if (activeFilters.event.size > 0 &&
        !activeFilters.event.has(chibi.event)) return false;

    return true;
  });


  if (value === "all" && category === "faction") {
  activeFilters.faction.clear();
  document.querySelectorAll('[data-category="faction"]').forEach(b => b.classList.remove('active'));
  applyFilters();
  return;
}
  renderChibiList(results);
}




































