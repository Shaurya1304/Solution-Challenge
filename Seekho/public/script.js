const API_KEY = "12aeb2f7d3msh8563b96ace941a8p18db70jsn3a67856c290c"; // Replace with your valid API key
const videoContainer = document.getElementById("video-container");
const playlistContainer = document.getElementById("playlist-container");
const searchInput = document.getElementById("yt-search");
const searchButton = document.getElementById("search-button");
const loadMoreBtn = document.getElementById("load-more-btn");

let nextPageToken = "";
let query = "";

// Ensure the event listener is attached properly
document.addEventListener("DOMContentLoaded", function () {
    searchButton.addEventListener("click", () => {
        query = searchInput.value.trim();
        if (query) {
            console.log("🔎 Searching for:", query); // Debugging
            fetchVideos(query, true);
            fetchPlaylists(query, true);
        } else {
            console.warn("⚠️ Search input is empty.");
        }
    });

    loadMoreBtn.addEventListener("click", () => {
        if (query) {
            fetchVideos(query, false);
        }
    });
});

// Function to fetch YouTube videos
async function fetchVideos(query, isNewSearch) {
    try {
        let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`;
        if (!isNewSearch && nextPageToken) {
            url += `&pageToken=${nextPageToken}`;
        }

        console.log("📡 Fetching videos from:", url);
        const response = await fetch(url);
        const data = await response.json();

        console.log("📊 API Response:", data);

        if (!data.items) {
            throw new Error("⚠️ No 'items' found in response.");
        }

        nextPageToken = data.nextPageToken || "";

        if (isNewSearch) {
            videoContainer.innerHTML = "";
        }

        if (data.items.length > 0) {
            data.items.forEach((item) => {
                if (!item.id.videoId) return;

                const videoId = item.id.videoId;
                const videoTitle = item.snippet.title;
                const videoThumbnail = item.snippet.thumbnails.medium.url;

                const videoElement = document.createElement("div");
                videoElement.className = "w-64 bg-white p-2 rounded-lg shadow-lg flex-none";
                videoElement.innerHTML = `
                    <img src="${videoThumbnail}" alt="${videoTitle}" class="w-full rounded">
                    <h3 class="mt-2 text-sm font-bold">${videoTitle}</h3>
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="watch-btn bg-blue-500 text-white px-4 py-1 rounded mt-2 block text-center">Watch</a>
                `;
                videoContainer.appendChild(videoElement);
            });

            loadMoreBtn.style.display = nextPageToken ? "block" : "none";
        } else {
            videoContainer.innerHTML = "<p class='text-gray-600'>No videos found.</p>";
        }
    } catch (error) {
        console.error("❌ Error fetching videos:", error);
        videoContainer.innerHTML = "<p class='text-red-600'>Failed to load videos.</p>";
    }
}

// Function to fetch YouTube Playlists
async function fetchPlaylists(query, isNewSearch) {
    try {
        let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=playlist&key=${API_KEY}`;

        console.log("📡 Fetching playlists from:", url);
        const response = await fetch(url);
        const data = await response.json();

        console.log("📊 Playlist API Response:", data);

        if (!data.items) {
            throw new Error("⚠️ No 'items' found in response.");
        }

        if (isNewSearch) {
            playlistContainer.innerHTML = "";
        }

        if (data.items.length > 0) {
            data.items.forEach((item) => {
                if (!item.id.playlistId) return;

                const playlistId = item.id.playlistId;
                const playlistTitle = item.snippet.title;
                const playlistThumbnail = item.snippet.thumbnails.medium.url;

                const playlistElement = document.createElement("div");
                playlistElement.className = "w-64 bg-white p-2 rounded-lg shadow-lg flex-none";
                playlistElement.innerHTML = `
                    <img src="${playlistThumbnail}" alt="${playlistTitle}" class="w-full rounded">
                    <h3 class="mt-2 text-sm font-bold">${playlistTitle}</h3>
                    <a href="https://www.youtube.com/playlist?list=${playlistId}" target="_blank" class="bg-purple-500 text-white px-4 py-1 rounded mt-2 block text-center">View</a>
                `;
                playlistContainer.appendChild(playlistElement);
            });
        } else {
            playlistContainer.innerHTML = "<p class='text-gray-600'>No playlists found.</p>";
        }
    } catch (error) {
        console.error("❌ Error fetching playlists:", error);
        playlistContainer.innerHTML = "<p class='text-red-600'>Failed to load playlists.</p>";
    }
}
