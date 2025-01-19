import fs from "fs/promises"; // Import modul file system
import path from "path"; // Untuk menangani jalur file

const dbPath = path.join("db", "users.json"); // Lokasi file database JSON

/**
 * Fungsi untuk membaca database
 */
async function readDatabase() {
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Gagal membaca database:", error.message);
    return [];
  }
}

/**
 * Fungsi untuk menulis ke database
 */
async function writeDatabase(data) {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");
    console.log("Database berhasil diperbarui!");
  } catch (error) {
    console.error("Gagal menulis ke database:", error.message);
  }
}

/**
 * Fungsi untuk login
 */
async function login(username, password) {
  const users = await readDatabase();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    console.log(
      `Login berhasil! Selamat datang, ${user.role}: ${user.username}`
    );
    if (user.role === "admin") {
      console.log("Akses: Anda dapat mengelola artikel.");
    } else {
      console.log("Akses: Anda dapat membaca artikel.");
    }
  } else {
    console.log("Login gagal! Username atau password salah.");
  }
}

/**
 * Fungsi untuk menambahkan user baru
 */
async function addUser(username, password, role) {
  const users = await readDatabase();

  if (users.find((u) => u.username === username)) {
    console.log("Gagal menambahkan user: Username sudah ada.");
    return;
  }

  const newUser = {
    id: users.length + 1,
    username,
    password,
    role,
  };

  users.push(newUser);
  await writeDatabase(users);
  console.log("User berhasil ditambahkan:", newUser);
}

// Contoh penggunaan
(async () => {
  console.log("=== Aplikasi Role-Based Account ===");
  console.log("1. Menambahkan admin baru...");
  await addUser("admin2", "adminpass", "admin");

  console.log("\n2. Login sebagai user...");
  await login("user1", "user123");

  console.log("\n3. Login sebagai admin...");
  await login("admin2", "adminpass");
})();
