document.addEventListener("DOMContentLoaded", function() {
  // Fetch the disclaimer text file
  fetch("https://wisdomcubenetwork.xyz/disclaimer.txt")
    .catch(error => {
        console.error("disclaimer.txt could not be fetched:", error)
    })
    .then(response => response.text())
    .then(text => {
      // Create a container for the disclaimer
      const disclaimer = document.createElement("div");
      disclaimer.innerText = text;
      // Style it as subtle footer text"
      disclaimer.style.width = "50%";
      disclaimer.style.fontSize = "0.5em";
      disclaimer.style.textAlign = "left";
      // Attach to the bottom of the page
      document.body.appendChild(disclaimer);
    })
    .catch(error => {
      console.error("Could not load disclaimer:", error);
    });
});





