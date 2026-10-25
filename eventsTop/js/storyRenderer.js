//Globals
let soundEffects = {};
let bgmLinks = {}; 
let chibiData = {};
let backgrounds = {};
let currentBgm = null;
let currentButton = null;
//Init
document.addEventListener(
    "DOMContentLoaded",
    initRenderer
);
async function initRenderer() {
    await Promise.all([
        loadChibiData(),
        loadBgmLinks(),
        loadSoundEffects(),
        loadBackgrounds()
    ]);

    await buildStory();

    renderSpeakers();
    renderHumptySFX();
    renderBgm();
}

//Loaders
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

}
async function loadChibiData() {
    const res = await fetch("https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/refs/heads/main/chibiFiles.json");

    const data = await res.json();

    data.chibis.forEach(entry => {
        chibiData[entry.fileName] = entry;

        entry.skins.forEach(skin => {
            chibiData[skin.id] = entry;
        });
    });
}
async function loadSoundEffects() {

  const res = await fetch(
    "https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/soundEffects.json"
  );

  const data = await res.json();

  soundEffects = {};

  data.soundEffects.forEach(sfx => {
    soundEffects[sfx.id] = sfx.url;
  });

}
async function loadBackgrounds() {
    const res = await fetch(
        "https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/backgrounds.json"
    );

    const data = await res.json();

    backgrounds = {};
    data.forEach(entry => {
        backgrounds[entry.class] = entry.link;
    });
}

//Story Building
// The event abbreviation (e.g. "FW", "VDiR") is the first class on <body>.
// It names the data file and prefixes every chapter id.
function getEventAbbrev() {
    return document.body.classList[0];
}

async function buildStory() {
    const response = await fetch(`../retranslate/json/${getEventAbbrev()}.json`);
    const data = await response.json();

    const chapters = getChapters(data);

    buildTabs(chapters);

    const storyContainer = document.getElementById("storyContainer");

    chapters.forEach(chapterId => {
        const chapterElement = createChapterContainer(chapterId, data[chapterId] ||  { title: `Chapter ${chapterId.slice(getEventAbbrev().length)}`
        });
        appendChapterFlows( chapterElement, chapterId, data);
        storyContainer.appendChild(chapterElement);
    });

    const firstTab = document.querySelector(".tablink");
    if (firstTab) {firstTab.click();
    }
}
function getChapters(data) {
    const chapters = new Set();
    Object.keys(data).forEach(key => {
    const match = key.match(new RegExp(`^(${getEventAbbrev()}\\d+)`));

    if (match) {chapters.add(match[1])}
});

    return [...chapters].sort((a,b) =>
        parseInt(a.slice(getEventAbbrev().length)) - parseInt(b.slice(getEventAbbrev().length))
    );
}
function appendChapterFlows(chapterElement, chapterId, data) {
    const section = chapterElement.querySelector(".smoothtranslation");
    const chapterMeta = data[chapterId] || {};
    const flashbacks = chapterMeta.flashbacks || [];
    const flowKeys =
        Object.keys(data)
            .filter(key =>
                key.startsWith(
                    chapterId + ":"
                )
            )
            .sort(compareFlowIds);

    let currentFlashback = null;
    let flashbackDiv = null;
    let poemBuffer = [];

    flowKeys.forEach(key => {
        const value = data[key];
        const flashStart = flashbacks.find(fb => fb.start === key);

        if (flashStart) {
            flashbackDiv = document.createElement("div");
            flashbackDiv.className = "flashback";
            section.appendChild(flashbackDiv);
            currentFlashback = flashStart;
        }
        const parent = flashbackDiv || section;
        const isFlashbackEnd = currentFlashback && currentFlashback.end === key;

        /*Poem line: object with text but no speakers*/
        if (value && typeof value === "object" && !Array.isArray(value.speakers)) {
            /*New line number (e.g. 37 -> 38) starts a separate poem*/
            const lastLine = poemBuffer[poemBuffer.length - 1];
            if (lastLine && flowNumber(lastLine.id) !== flowNumber(key)) {
                parent.appendChild(createPoem(poemBuffer));
                poemBuffer = [];
            }
            poemBuffer.push({id: key, text: value.text || "", breakAfter: !!value.breakAfter});
        } else {
            if (poemBuffer.length) {
                parent.appendChild(createPoem(poemBuffer));
                poemBuffer = [];
            }
            if (value && Array.isArray(value.speakers)) {
                parent.appendChild(createFlow(key, value));
            }
        }

        if (isFlashbackEnd) {
            if (poemBuffer.length) {
                parent.appendChild(createPoem(poemBuffer));
                poemBuffer = [];
            }
            currentFlashback = null;
            flashbackDiv = null;
        }
    });
    if (poemBuffer.length) {
        (flashbackDiv || section).appendChild(createPoem(poemBuffer));
    }
}
function flowNumber(id) {
    return Number(id.match(/:(\d+)/)[1]);
}
function compareFlowIds(a,b) {
    const aNum = flowNumber(a);
    const bNum = flowNumber(b);

    if (aNum !== bNum) {
        return (aNum - bNum);
    }
    return a.localeCompare(b);
}

//Tabs
function buildTabs(chapters) {

    const tabBar =document.getElementById("tabbar");
    chapters.forEach(chapterId => {
        const button = document.createElement("button");
        button.className ="tablink";
        const chapterNumber =
            chapterId.replace(getEventAbbrev(),"");

        button.textContent =`Chapter ${chapterNumber}`;
        button.onclick = () => openChapter(chapterId, button);

        tabBar.appendChild(button);
    });
}
function openChapter(chapterName, elmnt) {
    document.querySelectorAll(".tabcontent").forEach(tab => tab.style.display ="none");
    document.querySelectorAll(".tablink").forEach(btn =>btn.classList.remove("activeTab"));

    const chapter = document.getElementById(chapterName);
    if (chapter) {chapter.style.display ="block";}
    elmnt.classList.add("activeTab");
    if (chapter) {applyChapterBackground(chapter.dataset.background);}
}
function applyChapterBackground(bgClass) {
    const link = backgrounds[bgClass];
    if (!link) {
        console.warn("No matching background found for chapter:", bgClass);
        return;
    }
    document.body.style.backgroundImage = `url(${link})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
}

//Chapters
function createChapterContainer(chapterId, chapterData) {
    const tab = document.createElement("div");
    tab.className = "tabcontent";
    tab.id = chapterId;
    if (chapterData.background) {tab.dataset.background = chapterData.background;}

    const section = document.createElement("section");
    section.className = "smoothtranslation";

    const copyLink = document.createElement("a");
    copyLink.href = "javascript:";
    copyLink.className = "copySelectedLink";
    copyLink.textContent ="📷 Copy Selected";
    copyLink.onclick = () =>copySelectedFlows();
    section.appendChild(copyLink);

    const header = document.createElement("div");
    header.className = "chapterName";
    header.id =`${chapterId}t`;
    header.innerHTML =`${chapterData.title}`;

    section.appendChild( header);

    /*Optional BGM block*/

    console.log(
    chapterId,
    chapterData.bgm
);


    if (chapterData.bgm) {
    const bgm = document.createElement("div");
    bgm.className = "bgm";
    bgm.id = chapterData.bgm.id;
    bgm.textContent = chapterData.bgm.label;
    section.appendChild(bgm);
    }

    tab.appendChild(section);
    return tab;
}

//Flows
function createFlow(flowId, flowData) {
    const flow = document.createElement("div");
    flow.id = flowId;
    flow.className ="flow selectable";
    flow.onclick = () =>
        toggleFlowSelection(flow);

    if (flowData.speakers) {
    /*Endcap color follows the (first) speaker's alignment*/
    if (flowData.speakers.length) {flow.dataset.alignment = flowData.speakers[0].alignment;}

    flowData.speakers.forEach(
        speakerData => {
            flow.appendChild(createSpeakerDiv(speakerData));
        }
    );
}


    const line = document.createElement("div");
    line.className = "translatedLine";

    const p = document.createElement("p");
    p.className = "humpty";
    p.innerHTML = flowData.text || "";
    if (flowData.sfx) {p.dataset.sfx = flowData.sfx;}
    line.appendChild(p);

    const endCap = document.createElement("div");
    endCap.className = "endcap";
    endCap.innerHTML = `
        <img src="https://cdn.discordapp.com/emojis/911039555904368650.webp?size=56"
                class="noteshiro citelinks">
        <a href="javascript:"onclick="copyFlowImage(event)"class="copyLinkLinkLow">🔗
         </a>`;

    line.appendChild(endCap);
    flow.appendChild(line);

    return flow;
}
function createPoem(lines) {
    const poem = document.createElement("div")
    poem.className = "poem";
    const p = document.createElement("p");
    lines.forEach((line, i) => {

        const span = document.createElement("span");
        span.id = line.id;
        span.innerHTML = line.text;
        p.appendChild(span);

        const link = document.createElement("a");
        link.href = `#${line.id}`;
        link.className = "copyLinkLinkLow";
        link.textContent = "🔗";
        link.onclick = copyFlowURI;
        p.appendChild(link);

        /*Line break between lines; extra blank line for breakAfter*/
        if (i < lines.length - 1) {
            p.appendChild(document.createElement("br"));
            if (line.breakAfter) {p.appendChild(document.createElement("br"));}
        }
    });

    poem.appendChild(p);

    return poem;
}


//Speakers
function createSpeakerDiv(speakerData) {
    const speaker = document.createElement("div");
    speaker.className = `speaker ${speakerData.alignment}`;
    speaker.id = speakerData.id;
        if (speakerData.id !== "narr" && speakerData.id !== "robot") 
            {speaker.textContent = speakerData.id;}

    return speaker;
}
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
function renderSpeakers() {
  document.querySelectorAll(".speaker").forEach(el => {
    const id = el.id;

    if ( id === "narr" || id === "robot") 
        {el.textContent = "";  return;}

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
function getBannerUrl(skinId) {
  return `https://raw.githubusercontent.com/NavalHistorianAtLarge/AzurLaneData/main/assets/banner/${skinId}.png`;
}

//SFX
function renderHumptySFX() {
    document.querySelectorAll(".humpty[data-sfx]").forEach(el => {
        const sfxId = el.dataset.sfx;
        const url = soundEffects[sfxId];
        if (!url) return;
        attachSoundEffect(el, url);
        });
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
      console.error("Audio playback failed:", err);
    });

  });

  el.appendChild(document.createTextNode(" "));
  el.appendChild(btn);
}

//BGM
function renderBgm() {

    document.querySelectorAll(".bgm").forEach(el => {

        const trackId = el.id;
        const track = bgmLinks[trackId];

        if (!track) {
            console.warn("Missing BGM:", trackId);
            return;
        }

        attachBgmButton(el, track);
    });
}
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
