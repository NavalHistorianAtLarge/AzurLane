function copyFlowURI(evt) {
  evt.preventDefault();

  let targetID = null;

  // Case 1: Inside a .flow block
  const flowElement = evt.target.closest('.flow');
  if (flowElement?.id) {
    targetID = flowElement.id;
  }

  // Case 2: Nearest preceding <br> with an ID (for poem lines)
  if (!targetID) {
    const brWithID = [...document.querySelectorAll('br[id]')]
      .reverse()
      .find(br => br.compareDocumentPosition(evt.target) & Node.DOCUMENT_POSITION_FOLLOWING);
    if (brWithID?.id) {
      targetID = brWithID.id;
    }
  }

  // Fallback: current page URL
  const fullURL = targetID
    ? `${window.location.origin}${window.location.pathname}#${targetID}`
    : window.location.href;

  navigator.clipboard.writeText(fullURL).then(() => {
    console.log(fullURL);
  }, () => {
    console.log("Failed to copy link");
  });
}

function copyTableBlockURI(evt) {
  evt.preventDefault();

  // Find the closest parent with an ID
  const tableblockElement = evt.target.closest('.tableblock');
  const tableblockID = tableblockElement?.id;

  // Build the full URL with fragment
  const fullURL = tableblockID ? `${window.location.origin}${window.location.pathname}#${tableblockID}`: window.location.href;

  navigator.clipboard.writeText(fullURL).then(() => {
    // clipboard successfully set
    console.log(fullURL)
  }, () => {
    // clipboard write failed
    console.log("Failed to copy URL")
  });
} 
function copyDivURI(evt) {
  evt.preventDefault();

  let targetID = null;

  // Case 1: Inside a .chapterName block
  const chapterElement = evt.target.closest('.chapterName');
  if (chapterElement?.id) {
    targetID = chapterElement.id;
  }

  // Case 2: Fallback — try to find a parent with an ID
  if (!targetID) {
    const parentWithID = evt.target.closest('[id]');
    if (parentWithID?.id) {
      targetID = parentWithID.id;
    }
  }


  // Build and copy the URI
  const uri = `${location.origin}${location.pathname}#${targetID}`;
  navigator.clipboard.writeText(uri).then(() => {
    console.log(uri);
  }).catch(err => {
    console.error('Copy failed:', err);
  });
}
  function copyFlowImage(evt) {
  evt.preventDefault();
  const flowElement = evt.target.closest('.flow');
  if (!flowElement) return;

  html2canvas(flowElement).then(canvas => {
    canvas.toBlob(blob => {
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).then(() => {
        console.log("Image copied to clipboard!");
      }).catch(err => {
        console.error("Clipboard write failed", err);
      });
    });
  });
  const img = document.querySelector('.banner');
console.log(img.complete, img.naturalWidth); // true and >0 means it's loaded
}
    
function toggleFlowSelection(evt) {
  const el = evt.currentTarget;
  el.classList.toggle('selected');
}
document.querySelectorAll('.flow.selectable').forEach(el => {
  el.addEventListener('click', toggleFlowSelection);
});
    
function copySelectedFlows() {
  const selected = document.querySelectorAll('.flow.selected');
  if (selected.length === 0) return;

  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.background = 'transparent';
  tempContainer.style.width = 'fit-content';
  tempContainer.style.maxWidth = '1500px';

  let previousIndex = null;
  
  selected.forEach(flow => {
    const clone = flow.cloneNode(true);
    clone.classList.remove('selected');
     // Extract numeric index from ID (e.g., VDiR2:3t → 3)
    const idMatch = flow.id.match(/:(\d+)t$/);
    const currentIndex = idMatch ? parseInt(idMatch[1], 10) : null;

    if (previousIndex !== null && currentIndex !== null && currentIndex > previousIndex + 1) {
      // Insert symbolic separator
      const separator = document.createElement('div');
      separator.textContent = '⋯'; // or use a symbolic ripple, timestamp, etc.
      separator.style.textAlign = 'center';
      separator.style.fontSize = '24px';
      separator.style.margin = '20px 0';
      separator.style.opacity = '0.5';
      tempContainer.appendChild(separator);
    }

    tempContainer.appendChild(clone);
    previousIndex = currentIndex;
  });

  document.body.appendChild(tempContainer);

  // Wait for all images inside tempContainer to load
  const images = tempContainer.querySelectorAll('img');
  const imagePromises = Array.from(images).map(img => {
    return new Promise(resolve => {
      if (img.complete && img.naturalWidth !== 0) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = resolve;
      }
    });
  });

  // ⬇️ This is where you put html2canvas
  Promise.all(imagePromises).then(() => {
    html2canvas(tempContainer, {
      useCORS: true,
      backgroundColor: null, // preserve transparency
      scale: 1.5             // upscale the image
    }).then(canvas => {
      canvas.toBlob(blob => {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]).then(() => {
          console.log("Selected flows copied!");
          document.body.removeChild(tempContainer);
        }).catch(err => {
          console.error("Clipboard write failed", err);
          document.body.removeChild(tempContainer);
        });
      });
    });
  });
}