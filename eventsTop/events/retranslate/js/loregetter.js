let humptyData = {};

fetch("/retranslate/json/VDiR.json")
  .then(r => r.json())
  .then(data => {
    humptyData = data;
    renderHumpty();
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