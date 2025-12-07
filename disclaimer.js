document.addEventListener("DOMContentLoaded", function() {
  // Fetch the disclaimer text file
  fetch("wisdomcubenetwork.xyz/disclaimer.txt")
    .catch(error => {
        console.error("disclaimer.txt could not be fetched:", error)
    })
    .then(response => response.text())
    .then(text => {
      // Create a container for the disclaimer
      const disclaimer = document.createElement("div");
      disclaimer.innerText = text;

      // Style it as subtle footer text
      disclaimer.style.position = "fixed";
      disclaimer.style.bottom = "0";
      disclaimer.style.left = "0";
      disclaimer.style.fontSize = "0.75em";
      disclaimer.style.color = "#666";
      disclaimer.style.textAlign = "center";
      disclaimer.style.marginTop = "2em";
      disclaimer.style.padding = "1em 0";

      // Attach to the bottom of the page
      document.body.appendChild(disclaimer);
    })
    .catch(error => {
      console.error("Could not load disclaimer:", error);
    });
});
