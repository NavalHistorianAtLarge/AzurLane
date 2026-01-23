let chibiData = {};

fetch("https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/refs/heads/main/chibiFiles.json")
  .then(r => r.json())
  .then(data => {
    console.log("Loaded JSON:", data);
    console.log("Type:", typeof data);
    console.log("Is array:", Array.isArray(data));
    // Convert array → dictionary for fast lookup
    data.chibis.forEach(entry => {
      chibiData[entry.name] = entry;
    });

    renderName();
    renderSpeakers();
    
    function getDefaultSkinId(entry) {
  if (!entry.skins || entry.skins.length === 0) return null;
  return entry.skins[0].id; // "Zuikaku"
}

function getChibiThumbnailUrl(skinId) {
  return `https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/thumbnails/${skinId}.png`;
}

function renderName() {
  document.querySelectorAll(".friendlyName, .enemyName").forEach(el => {
    const id = el.id; // e.g., "Zuikaku"
    const entry = chibiData[id];

    if (!entry) return; // unknown speaker, leave empty

    const skinId = getDefaultSkinId(entry);
    const imgUrl = getChibiThumbnailUrl(skinId);

    el.innerHTML = `
      <div class="nameText">${entry.name}</div>
      <img src="${imgUrl}" class="chibi" title="${entry.name}">
    `;

  });
}
function getBannerUrl(skinId) {
  return `https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/banner/${skinId}.png`;
}
function renderSpeakers() {
  document.querySelectorAll(".speaker").forEach(el => {
    const id = el.id; // e.g., "Zuikaku"
    const entry = chibiData[id];

    if (!entry) return;

    const skinId = entry.skins[0].id; // default skin
    const bannerUrl = getBannerUrl(skinId);

    el.innerHTML = `
      <img src="${bannerUrl}" class="banner" title="${entry.name}">
      <p class="shipName">${entry.name}</p>
    `;
  });
}
})
