let chibiData = {};
let soundEffects = {};
let humptyData = {};
let bgmLinks = {}; 

function getSkinIdForEntry(entry, el) {
  // 1. HTML override
  if (el.dataset.skin) return el.dataset.skin;

  // 2. If the element ID matches a skin.id, use it
  const direct = entry.skins.find(s => s.id === el.id);
  if (direct) return direct.id;

  // 3. Retrofit
  if (el.dataset.retrofit === "true") {
    const retro = entry.skins.find(s => s.id.includes("Retrofit"));
    if (retro) return retro.id;
  }

  // 4. Default
  if (entry.skins && entry.skins.length > 0) {
    return entry.skins[0].id;
  }
 
  // 5. Banner-only fallback
  return null;
}

function getBannerUrl(skinId) {
  return `https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/banner/${skinId}.png`;
}

function getChibiThumbnailUrl(skinId) {
  return `https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/thumbnails/${skinId}.png`;
}

/**
 * Returns a Promise that resolves with either:
 * - the thumbnail URL (if it exists)
 * - or the banner URL (fallback)
 */
function resolveChibiOrBanner(skinId) {
  return new Promise(resolve => {
    const thumbUrl = getChibiThumbnailUrl(skinId);
    const img = new Image();

    img.onload = () => resolve(thumbUrl);
    img.onerror = () => resolve(getBannerUrl(skinId));

    img.src = thumbUrl;

  });
}

async function renderName() {
  const elements = document.querySelectorAll(".friendlyName, .enemyName");

  for (const el of elements) {
    const id = el.id;
    const entry = chibiData[id];
    if (!entry) continue;

    const skinId = getSkinIdForEntry(entry, el);

    let finalUrl = null;
    if (skinId) {
      finalUrl = await resolveChibiOrBanner(skinId);
    }

    const displayName = el.dataset.name || entry.name;

    el.innerHTML = `
      <div class="nameText">${displayName}</div>
      ${finalUrl ? `<img src="${finalUrl}" class="chibi" title="${entry.name}">` : ""}
    `;
  }
}

function renderSpeakers() {
  document.querySelectorAll(".speaker").forEach(el => {
    const id = el.id;
    const entry = chibiData[id];
    if (!entry) return;

    const skinId = getSkinIdForEntry(entry, el);

    const bannerUrl = skinId
      ? getBannerUrl(skinId)
      : getBannerUrl(id); // fallback for Sirens/META
    
    const displayName = el.dataset.name || entry.name;

    el.innerHTML = `
      <img src="${bannerUrl}" class="banner" title="${entry.name}">
      <p class="shipName">${displayName}</p>
    `;
  });
}


fetch("https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/refs/heads/main/chibiFiles.json")
  .then(r => r.json())
  .then(data => {
    data.chibis.forEach(entry => {
      chibiData[entry.fileName] = entry;

      entry.skins.forEach(skin => {
      chibiData[skin.id] = entry
    })
    });

    renderName();
    renderSpeakers();
  });
async function applyBackgroundFromClass() {
  try {
    // Load your JSON file
    const response = await fetch("https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/backgrounds.json");
    const bgData = await response.json();

    // Get the class on the <body>
    const body = document.body;
    const classList = Array.from(body.classList);

    if (classList.length === 0) {
      console.warn("No class found on <body>.");
      return;
    }

    // Find the first class that matches an entry in the JSON
    const match = bgData.find(entry => classList.includes(entry.class));

    if (!match) {
      console.warn("No matching background found for body classes:", classList);
      return;
    }

    // Apply the background
    body.style.backgroundImage = `url(${match.link})`;
    body.style.backgroundSize = "cover";
    body.style.backgroundAttachment = "fixed";

  } catch (err) {
    console.error("Error loading background:", err);
  }
}

document.addEventListener("DOMContentLoaded", applyBackgroundFromClass);

async function applyEventImages() {
  try {
    const response = await fetch("https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/refs/heads/main/backgrounds.json");
    const bgData = await response.json();

    // Select ONLY images that should get backgrounds
    const eventImages = document.querySelectorAll("img[class]");

    eventImages.forEach(img => {
      // Get the FIRST class on the <img>
      const eventClass = img.classList[0];

      const match = bgData.find(entry => entry.class === eventClass);

      if (!match) {
        console.warn(`No background found for class: ${eventClass}`);
        return;
      }

      img.src = match.link;
    });

  } catch (err) {
    console.error("Error loading event images:", err);
  }
}

document.addEventListener("DOMContentLoaded", applyEventImages);



async function loadSoundEffects() {

  const res = await fetch(
    "https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/soundEffects.json"
  );

  const data = await res.json();

  soundEffects = {};

  data.soundEffects.forEach(sfx => {
    soundEffects[sfx.id] = sfx.url;
  });

  console.log("Loaded SFX:", soundEffects);
}

async function loadHumptyData() {

  const eventName = document.body.classList[1];

  const res = await fetch(
    `/retranslate/json/${eventName}.json`
  );

  if (!res.ok) {

    console.log(
        `No event JSON found for ${eventName}`
    );

    humptyData = {};

    return;
}

humptyData = await res.json();

  console.log("Loaded Humpty data");
}

function attachSoundEffect(el, url) {

  if (el.querySelector(".sfxButton")) {
    return;
  }

  const btn = document.createElement("button");

  btn.type = "button";
  btn.className = "sfxButton";
  btn.textContent = "🔊";

  const audio = new Audio(url);

  btn.addEventListener("click", () => {

    audio.currentTime = 0;

    audio.play().catch(err => {
      console.error(
        "Audio playback failed:",
        err
      );
    });

  });

  el.appendChild(document.createTextNode(" "));
  el.appendChild(btn);
}

function renderHumpty() {

      if (
        Object.keys(humptyData).length === 0
    ) {
        return;
    }

  document.querySelectorAll(".humpty").forEach(el => {

    const flow = el.closest(".flow");

    if (!flow) return;

    const id = flow.id;

    const text = humptyData[id]?.text;

    if (text) {
      el.innerHTML = text;
    }

    const sfxId = el.dataset.sfx;

    if (!sfxId) return;

    const url = soundEffects[sfxId];

    if (!url) {

      console.warn(
        "Missing sound effect:",
        sfxId
      );

      return;
    }

    attachSoundEffect(el, url);

  });
}

function renderPoemLines() {

      if (
        Object.keys(humptyData).length === 0
    ) {
        return;
    }

document.querySelectorAll(".poem")
    .forEach(poem => {

        poem.querySelectorAll("br[id]")
            .forEach(br => {

                const text =
                    humptyData[br.id];

                if (!text) {
                    return;
                }

                const next =
                    br.nextSibling;

                if (
                    next &&
                    next.nodeType === Node.TEXT_NODE
                ) {

                    next.textContent = text;

                } else {

                    br.after(
                        document.createTextNode(text)
                    );

                }

            });

    });
}

async function loadBgmLinks() {

    const res = await fetch(
        "https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/audioLinks.json"
    );

    const data = await res.json();

    bgmLinks = {};
    data.music.forEach(track => {
        if (track.id) {
            bgmLinks[track.id] = track;
        }
    });

    console.log("Loaded BGM:", bgmLinks);
}

function renderBgm() {

    console.log(
        "BGM elements:",
        document.querySelectorAll(".bgm")
    );

    document.querySelectorAll(".bgm").forEach(el => {

        const trackId = el.id;

        console.log(
            "Looking up:",
            trackId
        );

        const track = bgmLinks[trackId];

        console.log(
            "Found track:",
            track
        );

        if (!track) {

            console.warn(
                "Missing BGM:",
                trackId
            );

            return;
        }

        attachBgmButton(el, track);
    });
}
let currentBgm = null;
let currentButton = null;

function attachBgmButton(el, track) {

    if (el.querySelector(".bgmButton")) {
        return;
    }

    const label = document.createElement("span");

    label.textContent = el.textContent;

    const btn = document.createElement("button");

    btn.type = "button";
    btn.className = "bgmButton";
    btn.textContent = "▶";

    const audio = new Audio(track.link);

    audio.loop = true;

    btn.addEventListener("click", () => {

        if (audio.paused) {

            if (currentBgm && currentBgm !== audio) {

                currentBgm.pause();

                if (currentButton) {
                    currentButton.textContent = "▶";
                }

            }

            audio.play();

            btn.textContent = "⏸";

            currentBgm = audio;
            currentButton = btn;

        } else {

            audio.pause();

            btn.textContent = "▶";

            if (currentBgm === audio) {
                currentBgm = null;
                currentButton = null;
            }

        }

    });

    el.textContent = "";

    el.appendChild(btn);
    el.appendChild(document.createTextNode(" "));
    el.appendChild(label);

}

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    try {

      await Promise.all([
        loadHumptyData(),
        loadSoundEffects(),
        loadBgmLinks()
      ]);

      renderHumpty();
      renderPoemLines();
      renderBgm();

    } catch (err) {

      console.error(
        "Initialization failed:",
        err
      );

    }

  }
);


document.querySelectorAll('.de-particle2').forEach(de => {
  // 1. Find the adjective by climbing to the parent .adj
  const adjnContainer = de.closest('.adjn');
  const adjn = adjnContainer
    ? adjnContainer.textContent.replace(de.textContent, '').trim()
    : null;
  const adjContainer = de.closest('.adj');
  const adj = adjContainer 
    ? adjContainer.textContent.replace(de.textContent, '').trim()
    : null;
  // 2. Find the noun by scanning forward for the next .noun sibling
  let noun = null;
  let vb = null;
  let next = adjnContainer?.nextElementSibling ||  adjContainer?.nextElementSibling;
  while (next) {
    if (next.classList.contains('noun')) {
      noun = next.textContent.trim();
      break;
    }
    else if (next.classList.contains('vb')) {
      vb = next.textContent.trim();
      break;
    }
    next = next.nextElementSibling;
  }

  // 3. Build tooltip
  if (adjn && noun) {
    de.setAttribute(
      'data-tip',
      `Allows ${adjn} to modify ${noun}`
    );
  } else if (adj && noun) {
    de.setAttribute(
      'data-tip',
      `Allows ${adj} to modify ${noun}`
    )
  } else if (adj && vb) {
    de.setAttribute(
      'data-tip',
      `Allows ${adj} to modify ${vb}`
    )
  }
});
document.querySelectorAll('.makeNoun').forEach(mkn => {
  const adjnContainer = mkn.closest('.adjn');
  const nounContainer = mkn.closest('.noun')
  const adjn = adjnContainer
    ? adjnContainer.textContent.replace(mkn.textContent, '').trim()
    : null
  const noun = nounContainer
    ? nounContainer.textContent.replace(mkn.textContent, '').trim()
    : null

 if (adjn) {
  mkn.setAttribute(
    'data-tip',
    `Makes ${adjn} a noun`
  );
} else if (noun) {
  mkn.setAttribute(
    'data-tip',
    `Makes ${noun} a noun`
  );
}
})
document.querySelectorAll('.nomod').forEach(nmd => {
  const adjContainer = nmd.closest('.adj');
  const nounContainer = nmd.closest('.noun');
  const adj = adjContainer
   ? adjContainer.textContent.replace(nmd.textContent, '').trim()
   : null
  const noun = nounContainer
   ? nounContainer.textContext.replace(nmd.textContent, '').trim()
   : null

   if (adj) {
    nmd.setAttribute(
      'data-tip',
      `Makes ${adj} an adjective`
    );
  }
    else if (noun) {
    mkn.setAttribute(
    'data-tip',
    `Modifies ${noun}`
  );
}
  })