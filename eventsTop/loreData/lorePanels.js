function togglePanel(panelId) {
            const targetPanel = document.getElementById(panelId);
            const allPanels = Array.from(document.getElementsByClassName("panel"))
           
            if (targetPanel) {
                allPanels.forEach(panel => {
                    if (panel !== targetPanel) {
                        panel.style.width = "0";
                        panel.classList.remove("open")
                    }
                });

            const isOpen = targetPanel.classList.contains("open");
            targetPanel.style.width = isOpen ? "0" : "450px";
            targetPanel.classList.toggle("open");
                 }
                }
async function loadLorePanels() {
  try {
    const response = await fetch('loreData/lorePanels.json');
    const loreData = await response.json();

    document.querySelectorAll('[data-lore-id]').forEach(async panel => {
      const id = panel.getAttribute('data-lore-id');   // ✅ THIS MUST EXIST
      const lore = loreData[id];

      console.log("Loading lore for:", id, lore);       // ✅ Debug line

      if (!lore) return;

      // Title
      const h2 = panel.querySelector('h2');
      if (h2) h2.textContent = lore.title;

      // Image
      const img = panel.querySelector('img');
      if (img && lore.image) img.src = lore.image;

      // Remove placeholder <p> and <hr>
      const contentNodes = panel.querySelectorAll('p, hr');
      contentNodes.forEach(n => n.remove());

      // Load external HTML file
    const html = await fetch('loreData/' + lore.html).then(r => r.text());
      panel.insertAdjacentHTML('beforeend', html);
      
    });

  } catch (err) {
    console.error("Lore loading failed:", err);
  }
}

document.addEventListener('DOMContentLoaded', loadLorePanels);