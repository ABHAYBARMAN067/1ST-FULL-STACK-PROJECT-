// public/js/map.js

const mapDiv = document.getElementById("map");

if (mapDiv) {
  const locationText = mapDiv.dataset.location || "New Delhi, India";

  const defaultLatLng = [28.6139, 77.2090]; // fallback: New Delhi

  const map = L.map("map").setView(defaultLatLng, 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Use basic geocoding via Nominatim
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${locationText}`)
    .then((res) => res.json())
    .then((data) => {
      if (data && data[0]) {
        const lat = data[0].lat;
        const lon = data[0].lon;

        map.setView([lat, lon], 13);
        L.marker([lat, lon]).addTo(map).bindPopup(locationText).openPopup();
      } else {
        L.marker(defaultLatLng).addTo(map).bindPopup("Default: New Delhi").openPopup();
      }
    })
    .catch((err) => {
      console.error("Geocoding failed:", err);
      L.marker(defaultLatLng).addTo(map).bindPopup("Default: New Delhi").openPopup();
    });
}
