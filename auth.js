import fs from "fs/promises";
import path from "path";

const dbPath = path.join("db", "users.json");

// Fungsi membaca database
async function readDatabase() {
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Gagal membaca database:", error.message);
    return [];
  }
}

// Fungsi login
export async function login(username, password) {
  const users = await readDatabase();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    return {
      success: true,
      message: `Login berhasil! Selamat datang, ${user.role}: ${user.username}`,
      username: user.username,
      role: user.role,
    };
  }

  return {
    success: false,
    message: "Login gagal! Username atau password salah.",
  };
  fetch("http://localhost:4000/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`, // Kirim token
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Profil pengguna:", data.data);
      } else {
        console.log("Gagal mengakses profil:", data.message);
      }
    });
}
