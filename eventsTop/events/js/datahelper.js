let chibiData = {};

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
function renderName() {
  document.querySelectorAll(".friendlyName, .enemyName").forEach(el => {
    const id = el.id;
    const entry = chibiData[id];
    if (!entry) return;

    const skinId = getSkinIdForEntry(entry, el);
    const chibiUrl = skinId ? getChibiThumbnailUrl(skinId) : null;

    el.innerHTML = `
      <div class="nameText">${entry.name}</div>
      ${chibiUrl ? `<img src="${chibiUrl}" class="chibi" title="${entry.name}">` : ""}
    `;
  });
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

    el.innerHTML = `
      <img src="${bannerUrl}" class="banner" title="${entry.name}">
      <p class="shipName">${entry.name}</p>
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
    const response = await fetch("https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/backgrounds.json");
    const bgData = await response.json();

    const tabsChildren = document.querySelectorAll('.tabs > div');

    tabsChildren.forEach(div => {
      const classList = Array.from(div.classList);

      console.log("Checking div with classes:", classList);

      const match = bgData.find(entry => classList.includes(entry.class));

      if (!match) {
        console.warn("No matching background for:", classList);
        return;
      }

      console.log("Applying background:", match.link);

      div.style.backgroundImage = `url(${match.link})`;
      div.style.backgroundSize = "cover";
      div.style.backgroundAttachment = "fixed";
      div.style.backgroundRepeat = "no-repeat";
    });

  } catch (err) {
    console.error("Error loading background:", err);
  }
}


async function applyBackgroundToBodyFromClass() {
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

document.addEventListener("DOMContentLoaded", applyBackgroundToBodyFromClass);
document.addEventListener("DOMContentLoaded", applyBackgroundFromClass);

window.addEventListener("load", () => {
  applyBackgroundToBodyFromClass();
  applyBackgroundFromClass();
});


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
let humptyData = {};

document.addEventListener("DOMContentLoaded", () => {
  // Determine event name from body class
  const eventName = document.body.classList[0];

  fetch(`/retranslate/json/${eventName}.json`)
    .then(r => r.json())
    .then(data => {
      humptyData = data;
      renderHumpty();
      renderPoemLines();
    })
    .catch(err => console.error("Failed to load event JSON:", err));
});

function renderHumpty() {
document.querySelectorAll(".humpty").forEach(el => {
    const flow = el.closest(".flow");
    if (!flow) return;

    const id = flow.id; // e.g., "VDiR1:7t"
    const text = humptyData[id]?.text;

    if (!text) {
      console.warn("No humpty text for:", id);
      return;
    }

    el.textContent = text;
  });
}

// ------------------------------------------------------
// 2. Render poem <br id=""> lines in correct positions
// ------------------------------------------------------
function renderPoemLines() {
  const poem = document.querySelector(".poem");
  if (!poem) return;

  const brs = poem.querySelectorAll("br[id]");

  brs.forEach(br => {
    const id = br.id;
    const text = humptyData[id];

    if (!text) {
      console.warn("No poem text for:", id);
      return;
    }   

    // Insert the new text node
    br.after(document.createTextNode(text));
  });
}


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
  let next = adjnContainer?.nextElementSibling ||  adjContainer?.nextElementSibling;
  while (next) {
    if (next.classList.contains('noun')) {
      noun = next.textContent.trim();
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
  const adj = adjContainer
   ? adjContainer.textContent.replace(nmd.textContent, '').trim()
   : null

   if (adj) {
    nmd.setAttribute(
      'data-tip',
      `Modifies ${adj}`
    );
  } 
})