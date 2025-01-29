function logout() {
  localStorage.removeItem("token"); // Hapus token dari localStorage
  alert("Anda telah logout");
  window.location.href = "/login.html"; // Arahkan kembali ke halaman login
}
