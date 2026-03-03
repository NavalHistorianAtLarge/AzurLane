const app = new PIXI.Application({
  width: 800,
  height: 800,
  resolution: window.devicePixelRatio,
  transparent: true
});
document.getElementById('chibiCanvas').appendChild(app.view);
app.renderer.autoResize = false;
app.renderer.resize(2048, 2048); // or whatever fixed size you want


let currentChibi = null;
let currentSkin = null;
let currentCaptureContainer = null;

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

function getChibiThumbnail(chibi) {
  const firstSkin = chibi.skins[0];
  return `https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/thumbnails/${firstSkin.id}.png`;
}

function renderSingleChibi(chibi, rarity, isRetrofit = false) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('chibi-item');
  wrapper.classList.add(`rarity-${rarity}`);
  if (isRetrofit) wrapper.classList.add('retrofit-entry');

  const img = document.createElement('img');

  // --- THIS IS THE IMPORTANT PART ---
   let thumbId;

  if (isRetrofit) {
    const retroSkin = chibi.skins.find(s =>
      s.label.toLowerCase().includes("retrofit") ||
      s.id.toLowerCase().endsWith("g")
    );

    thumbId = retroSkin ? retroSkin.id : chibi.skins[0].id;
  } else {
    thumbId = chibi.skins[0].id;
  }

  img.src = `https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/thumbnails/${thumbId}.png`;

  img.alt = isRetrofit ? `${chibi.name} (Retrofit)` : chibi.name;

  img.addEventListener('click', () => showSkins(chibi, isRetrofit));

  const caption = document.createElement('div');
  caption.classList.add('chibi-caption');
  caption.textContent = isRetrofit ? `${chibi.name} (Retrofit)` : chibi.name;

 if (chibi.oversize) {
  img.classList.add("chibi-smaller");
}
  wrapper.appendChild(img);
  wrapper.appendChild(caption);
  chibiList.appendChild(wrapper);
}

function renderChibiList(list) {
  chibiList.innerHTML = '';
 list.forEach(chibi => {
       // --- RETROFIT-ONLY MODE ---
    if (activeFilters.special?.has("hasRetrofit")) {

      // Skip ships with no retrofit data
      if (!chibi.retrofit) return;

      // Render ONLY the retrofit version
      renderSingleChibi(chibi, chibi.retrofit.rarity, true);
      return;
    }

    // --- NORMAL MODE (base chibi) ---
    renderSingleChibi(chibi, chibi.rarity, false);
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
  if (current) app.stage.removeChild(current);

  const spineChar = new PIXI.spine.Spine(resources[skin.id].spineData);

const bounds = spineChar.getBounds();
const w = bounds.width;
const h = bounds.height;

const MAX_SIZE = 600; // or 700, or whatever fits your canvas

let baseScale = 1;

if (w > MAX_SIZE || h > MAX_SIZE) {
    // shrink proportionally so the largest dimension fits MAX_SIZE
    baseScale = MAX_SIZE / Math.max(w, h);

    spineChar.skeleton.scaleX = baseScale;
    spineChar.skeleton.scaleY = baseScale;
    spineChar.skeleton.updateWorldTransform();
}
    
  spineChar.x = 512;
  spineChar.y = 500; // whatever looks right
    
  spineChar.scale.set(1.0);
  spineChar.state.setAnimation(0, 'normal', true);

 // Create capture container ONCE per skin load
const captureContainer = new PIXI.Container();
captureContainer.x = 0;
captureContainer.y = 0;
captureContainer.hitArea = new PIXI.Rectangle(-400, -800, 800, 1200);
captureContainer.interactive = true;
captureContainer.cursor = 'grab';

let dragging = false;
let dragOffset = { x: 0, y: 0 };

captureContainer.on('pointerdown', (e) => {
  dragging = true;
  captureContainer.cursor = 'grabbing';
  const pos = e.data.getLocalPosition(captureContainer.parent);
  dragOffset.x = pos.x - captureContainer.x;
  dragOffset.y = pos.y - captureContainer.y;
});

captureContainer.on('pointerup', () => {
  dragging = false;
  captureContainer.cursor = 'grab';
});

captureContainer.on('pointerupoutside', () => {
  dragging = false;
  captureContainer.cursor = 'grab';
});

captureContainer.on('pointermove', (e) => {
  if (!dragging) return;
  const pos = e.data.getLocalPosition(captureContainer.parent);
  captureContainer.x = pos.x - dragOffset.x;
  captureContainer.y = pos.y - dragOffset.y;
});
    // Add container to stage
app.stage.addChild(captureContainer);

// Add chibi into the container
captureContainer.addChild(spineChar);

// Save references
currentChibi = spineChar;
currentCaptureContainer = captureContainer;
    
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

let baseScale = 1;

function setChibiScale(userScale) {
    if (currentChibi) {
        currentChibi.scale.set(baseScale * userScale);
    }
}
document.getElementById("fitToCanvasBtn").addEventListener("click", () => {
    if (!currentChibi) return;

    // 1. Get canvas size
    const canvasWidth = app.renderer.width;
    const canvasHeight = app.renderer.height;

    // 2. Reset scale temporarily so we measure true bounds
    currentChibi.scale.set(1);
    currentChibi.skeleton.scaleX = 1;
    currentChibi.skeleton.scaleY = 1;
    currentChibi.skeleton.updateWorldTransform();

    // 3. Measure natural bounds
    const sbounds = currentChibi.getBounds();
    const w = sbounds.width;
    const h = sbounds.height;

    // 4. Compute scale needed to fit inside canvas
    const scaleX = canvasWidth / w;
    const scaleY = canvasHeight / h;
    baseScale = Math.min(scaleX, scaleY) * 0.9; 
    // 0.9 gives a little padding so it doesn't touch edges

    // 5. Apply base scale to skeleton
    currentChibi.skeleton.scaleX = baseScale;
    currentChibi.skeleton.scaleY = baseScale;
    currentChibi.skeleton.updateWorldTransform();

    // 6. Apply user scale on top (if you have a slider)
    if (typeof userScale !== "undefined") {
        currentChibi.scale.set(baseScale * userScale);
    } else {
        currentChibi.scale.set(baseScale);
    }

    console.log("Fit-to-canvas applied:", baseScale);
});
document.getElementById('scaleSlider').addEventListener('input', e => {
  setChibiScale(parseFloat(e.target.value));
});

// Step 2: show skins for chosen chibi
function showSkins(chibi, isRetrofit = false) {
  chibiView.classList.add('hidden');
  skinView.classList.remove('hidden');
  skinList.innerHTML = '';

  chibi.skins.forEach(skin => {
    const skinWrap = document.createElement('div');
    skinWrap.classList.add('skin-item');

    const isRetrofitSkin =
    skin.label.toLowerCase().includes("retrofit") ||
    skin.id.toLowerCase().endsWith("g");
    
    const rarity = skin.rarity ||
    (isRetrofitSkin && chibi.retrofit?.rarity) ||
    chibi.rarity;
    
    skinWrap.classList.add(`rarity-${rarity}`);
    if (isRetrofitSkin) skinWrap.classList.add("retrofit-skin");

    // --- THUMBNAIL ---
    const thumbId = skin.id;
    const img = document.createElement('img');
    img.src = `https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/thumbnails/${thumbId}.png`;
    img.alt = skin.label;
    img.title = skin.label;
    
    if (skin.oversize) {
    img.classList.add("chibi-smaller");
  }


    img.addEventListener('click', () => {
      currentSkin = skin;
      loadSkin(skin);
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


async function captureAnimationFrames(spineChar, animationName, fps = 60, zipFolder) {
  return new Promise((resolve) => {
    // Find animation duration
    const anim = spineChar.spineData.animations.find(a => a.name === animationName);
    if (!anim) {
      console.error(`Animation "${animationName}" not found.`);
      resolve();
      return;
    }

    const duration = anim.duration; // in seconds
    const frameCount = Math.ceil(duration * fps);
    
    // Set animation
    spineChar.state.setAnimation(0, animationName, true);

    let frame = 0;
    let elapsed = 0;
    let lastTime = performance.now();

    function step() {
      const now = performance.now();
      const delta = (now - lastTime) / 1000; // seconds
      lastTime = now;

      // Advance animation by real time
      spineChar.update(delta);

      // Capture frames at fixed intervals
      const targetTime = frame * (1 / fps);
      if (elapsed + delta >= targetTime) {
        // Render and save frame
        app.renderer.render(app.stage);
        const canvas = app.renderer.extract.canvas(currentCaptureContainer);
        const dataURL = canvas.toDataURL("image/png");

        zipFolder.file(
          `${animationName}_frame_${String(frame).padStart(3, '0')}.png`,
          dataURL.split(',')[1],
          { base64: true }
        );

        frame++;
      }

      elapsed += delta;

      if (frame < frameCount) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(step);
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
  const fps = parseInt(document.getElementById("fpsInput").value) || 60;
  for (const animName of selected) {
await captureAnimationFrames(currentChibi, animName, fps, folder);
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
  event: new Set(),
  special: new Set(),
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
    }
    if (activeFilters[category].has(value)) {
      activeFilters[category].delete(value);
      btn.classList.remove('active');
    } else {
      activeFilters[category].add(value);
      btn.classList.add('active');
    }
    applyFilters();
  });

  const rarityAliases = {
  E: ["E", "MELITE"],
  SR: ["SR", "MSR"],  
  UR: ["UR", "MUR"],
};

function isMetaFactionSelected() {
  return activeFilters.faction.has("meta");
}
const softExclude = {
  faction: new Set(),
  type: new Set(),
  rarity: new Set()
};
document.querySelectorAll('[data-softexclude]').forEach(box => {
  box.addEventListener('change', () => {
    const category = box.dataset.softexclude;
    const value = box.value;

    if (box.checked) {
      softExclude[category].add(value);
    } else {
      softExclude[category].delete(value);
    }

    saveSoftExclusions();
    applyFilters();
  });
});


function saveSoftExclusions() {
  localStorage.setItem("softExclude", JSON.stringify(
    Object.fromEntries(
      Object.entries(softExclude).map(([k, v]) => [k, [...v]])
    )
  ));
}
function loadSoftExclusions() {
  const saved = JSON.parse(localStorage.getItem("softExclude"));
  if (!saved) return;

  for (const [category, values] of Object.entries(saved)) {
    values.forEach(v => softExclude[category].add(v));
  }

  // Restore checkbox states
  document.querySelectorAll('[data-softexclude]').forEach(box => {
    if (softExclude[box.dataset.softexclude].has(box.value)) {
      box.checked = true;
    }
  });
}

loadSoftExclusions();


function applyFilters() {


  const results = chibiData.filter(chibi => {

    // If "Has Retrofit" is selected, only show ships WITH retrofits
if (activeFilters.special.has("hasRetrofit")) {
  if (!chibi.retrofit) return false; // hide ships without retrofit
}
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
if (isMetaFactionSelected()) {

  // Only META ships should be considered
  if (chibi.faction !== "META") return false;

  if (activeFilters.metaClass.size > 0 &&
      !activeFilters.metaClass.has(chibi.metaClass)) return false;
}

// META Origin
if (isMetaFactionSelected()) {

  // Only META ships should be considered
  if (chibi.faction !== "META") return false;

  if (activeFilters.metaOrigin.size > 0 &&
      !activeFilters.metaOrigin.has(chibi.metaOrigin)) return false;
}

    // Group
    if (activeFilters.group.size > 0 &&
        !activeFilters.group.has(chibi.group)) return false;

    // Event
    if (activeFilters.event.size > 0 &&
        !activeFilters.event.has(chibi.event)) return false;

    // Soft exclusions (default hidden)
if (softExclude.faction.has(chibi.faction)) return false;
if (softExclude.type.has(chibi.type)) return false;
if (softExclude.rarity.has(chibi.rarity)) return false;
    
    return true;
  });
  
  
  renderChibiList(results);
}})
































































































