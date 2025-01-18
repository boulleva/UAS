// Ambil elemen link dan bagian tujuan untuk highlight
const highlightLink = document.getElementById("highlightLink");
const highlightDestination = document.getElementById("destination");

// Ambil elemen link dan bagian tujuan untuk subscribe
const subscribeLink = document.getElementById("subscribeLink");
const subscribeDestination = document.getElementById("subscribe");

// Ketika link "highlightLink" di klik
highlightLink.addEventListener("click", function (event) {
  event.preventDefault(); // Mencegah aksi default dari <a> tag
  // Scroll ke bagian tujuan "destination" dengan efek smooth
  highlightDestination.scrollIntoView({ behavior: "smooth" });
});

// Ketika link "subscribeLink" di klik
subscribeLink.addEventListener("click", function (event) {
  event.preventDefault(); // Mencegah aksi default dari <a> tag
  // Scroll ke bagian tujuan "subscribe" dengan efek smooth
  subscribeDestination.scrollIntoView({ behavior: "smooth" });
});
