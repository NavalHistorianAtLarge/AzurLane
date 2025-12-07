            window.onload = function () {
            const bgMusic = document.getElementById("thoughts");
            if (bgMusic) {
        bgMusic.play().catch(err => {
            console.warn("Autoplay blocked:", err);
        });
    }
              window.onload = function () {
            const allImg = Array.from(document.getElementsByTagName("img"));
            allImg.forEach(img => {
               img.loading = "eager";
            })
            }
            };

        let songsData = null

          // Load JSON once at startup
                async function loadSongs() {
                const response = await fetch('https://wisdomcubenetwork.xyz/eventsTop/audioLinks.json'); // or the raw GitHub URL
                songsData = await response.json();
            }

            // Play a song by its JSON id
            async function playSong(songID) {
             if (!songsData) {
             await loadSongs();
            }

           // songsData.music is the array
                const song = songsData.music.find(s => s.id === songID);
                if (!song) {
                console.error(`❌ Song with id "${songID}" not found`);
                return;
            }

            const trackNameDisplay = document.getElementById("trackName");
        // Use the JSON metadata: prefer name, fallback to id
        const title = song.name || song.id;
        trackNameDisplay.textContent = title;

       // Stop playback if already running
        const bgMusic = document.getElementById("thoughts");
        bgMusic.pause();
        bgMusic.currentTime = 0;

        // Play the selected song from JSON
        bgMusic.src = song.link;
        bgMusic.loop = true;
        bgMusic.preload = "auto";
        bgMusic.play()
}
           
        function playSoundEffect(effectID) {
    const effect = document.getElementById(effectID);
    if (effect) {
        // Clone the node to allow overlapping effects
        const clone = effect.cloneNode();
        clone.volume = effect.volume; // preserve volume
        clone.play();
    }
}


