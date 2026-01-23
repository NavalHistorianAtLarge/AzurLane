async function applyBackgroundFromClass() {
  try {
    // Load your JSON file
    const response = await fetch("/json/backgrounds.json");
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
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundPosition = "center";

  } catch (err) {
    console.error("Error loading background:", err);
  }
}

document.addEventListener("DOMContentLoaded", applyBackgroundFromClass);

async function applyEventImages() {
  try {
    const response = await fetch("retranslate/json/backgrounds.json");
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

