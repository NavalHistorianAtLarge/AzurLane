// Event JSON lives in ../json/ relative to this script, whichever page loads it.
const EVENT_JSON_BASE = new URL("../json/", document.currentScript.src);

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
    new URL(`${eventName}.json`, EVENT_JSON_BASE)
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

  if (Object.keys(humptyData).length === 0) {
    return;
  }

  document.querySelectorAll(".poem").forEach(poem => {

    // Clear gaps added by a previous render so this can run more than once.
    poem.querySelectorAll("br[data-poem-gap]").forEach(gap => gap.remove());

    poem.querySelectorAll("br[id]").forEach(br => {

      // Entries are { text, breakAfter }; older data used a bare string.
      const entry = humptyData[br.id];
      const text = typeof entry === "string" ? entry : entry?.text;

      if (!text) {
        return;
      }

      const next = br.nextSibling;

      let textNode;

      if (next && next.nodeType === Node.TEXT_NODE) {
        next.textContent = text;
        textNode = next;
      } else {
        textNode = document.createTextNode(text);
        br.after(textNode);
      }

      // breakAfter leaves a blank line before the next line of the poem.
      if (entry?.breakAfter) {
        const gap = document.createElement("br");
        gap.dataset.poemGap = "";
        textNode.after(gap);
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


// ---------------------------------------------------------------------------
// Bonny's grammar guide: a popup explaining the part-of-speech colors.
// Swatches reuse the page's own classes (.noun, .vb, ...), so the colors always
// match retranslate.css. Edit the text below to change what Bonny says.
// ---------------------------------------------------------------------------
const BONNY_IMAGE =
  "https://i.ibb.co/v81MftX/1181px-Bon-Homme-Richard-META.png";

const PARTS_OF_SPEECH = [
  { cls: "noun",   label: "Noun",           text: "A person, place, thing or idea." },
  { cls: "vb",     label: "Verb",           text: "An action or state of being." },
  { cls: "adj",    label: "Adjective",      text: "Describes a noun or a verb. Also used for particles like 了 when they are part of another adjective." },
  { cls: "adjn",   label: "Noun-adjective", text: "I am inconsistent with this, but there are two main types: 1) A noun working as an adjective, like 我们的 “our” 2) An Adjective acting as part of a noun, as in 'Wisdom Cube', where 'Wisdom' is the adjective. You'll also see it in verbs becoming nouns, such as 'the approaching Siren'." },
  { cls: "mod",    label: "Modifier",       text: "A function word that changes how the words around it work, like 把, which puts the object before the verb." },
  { cls: "prep",   label: "Preposition",    text: "Links a noun to the rest of the sentence: in, at, to, of." },
  { cls: "conj",   label: "Conjunction",    text: "Joins clauses together: but, then, even if." },
  { cls: "phrase", label: "Phrase",         text: "Words that only make sense as a group, so I don't split them up." },
  { cls: "interj", label: "Interjection",   text: "An exclamation or reaction." }
];

const BONNY_TIPS = [
  "Hover over a word or particle until your cursor turns into a question mark to read my note on it.",
  "When a word comes in two separate parts, but remains a syntactical unit, (like 已经 and 了), hovering over one highlights both in yellow. If a word has no translation across from it, it's typically because it is part of a yellow-highlighted pair.",
  "The brown-orange box at the bottom left of each section is my commentary on the lore.",
  "The red-orange box at the bottom right of each section rates how good the original English translation was. The various permutations of MutsukiStare are for when the ENism is really bad."
];

function buildBonnyGuide() {

  if (document.getElementById("bonnyGuideButton")) {
    return;
  }

  const style = document.createElement("style");
  style.textContent = `
    #bonnyGuideButton {
      position: fixed; right: 16px; bottom: 16px; z-index: 50;
      width: 56px; height: 56px; padding: 0; cursor: pointer;
      border: 2px solid #5b3fa7; border-radius: 50%;
      background: #323455 center / cover no-repeat;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
    }
    #bonnyGuideButton:hover, #bonnyGuideButton:focus-visible { border-color: #fff; }
    #bonnyGuide {
      max-width: min(480px, calc(100vw - 32px)); max-height: 85vh;
      padding: 16px 20px; border: none; border-radius: 20px;
      background: linear-gradient(#5b3fa7, #323455); color: #fff;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.6);
    }
    #bonnyGuide::backdrop { background: rgba(0, 0, 0, 0.55); }
    #bonnyGuide .bonnyHead { display: flex; align-items: center; gap: 12px; }
    #bonnyGuide .bonnyHead img { width: 56px; height: 56px; border-radius: 50%; }
    #bonnyGuide h2 { margin: 0; font-size: 1.2em; }
    #bonnyGuide p { margin: 0.6em 0; }
    #bonnyGuide ul { margin: 0; padding: 0; list-style: none; }
    #bonnyGuide li { display: flex; align-items: baseline; gap: 10px; margin: 6px 0; }
    #bonnyGuide .swatch {
      flex: none; min-width: 7.5em; padding: 2px 8px; text-align: center;
      color: #000; font-weight: bold;
    }
    #bonnyGuide .tipsList li { display: list-item; list-style: disc inside; }
    #bonnyGuide .bonnyClose {
      display: block; margin: 12px 0 0 auto; padding: 4px 14px; cursor: pointer;
      border: none; border-radius: 10px; background: #fff; color: #323455;
    }
  `;
  document.head.appendChild(style);

  const guide = document.createElement("dialog");
  guide.id = "bonnyGuide";

  const rows = PARTS_OF_SPEECH.map(part => `
    <li>
      <span class="swatch ${part.cls}">${part.label}</span>
      <span>${part.text}</span>
    </li>`).join("");

  const tips = BONNY_TIPS.map(tip => `<li>${tip}</li>`).join("");

  guide.innerHTML = `
    <div class="bonnyHead">
      <img src="${BONNY_IMAGE}" alt="Bonny">
      <h2>BonnyTip<sup>TM</sup></h2>
    </div>
    <p>Each word in my breakdowns is colored by what it does in the sentence:</p>
    <ul>${rows}</ul>
    <p>Other things to know:</p>
    <ul class="tipsList">${tips}</ul>
    <button class="bonnyClose" type="button">"Begone, X!"</button>
  `;
  document.body.appendChild(guide);

  const button = document.createElement("button");
  button.id = "bonnyGuideButton";
  button.type = "button";
  button.title = "What do the colors mean?";
  button.setAttribute("aria-label", "What do the colors mean?");
  button.style.backgroundImage = `url(${BONNY_IMAGE})`;
  document.body.appendChild(button);

  button.addEventListener("click", () => guide.showModal());
  guide.querySelector(".bonnyClose").addEventListener("click", () => guide.close());

  // Clicking the dimmed area outside the popup closes it too.
  guide.addEventListener("click", event => {
    if (event.target === guide) guide.close();
  });
}

document.addEventListener("DOMContentLoaded", buildBonnyGuide);
