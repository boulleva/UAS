import fs from "fs/promises"; // Modul untuk file system
import path from "path"; // Modul untuk manipulasi path

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
    return {
      success: true,
      message: `Welcome, ${user.role}: ${user.username}`,
      role: user.role,
    };
  } else {
    return {
      success: false,
      message: "Login gagal! Username atau password salah.",
    };
  }
}

/**
 * Fungsi untuk menambahkan user baru
 */
async function addUser(username, password, role) {
  const users = await readDatabase();

  if (users.find((u) => u.username === username)) {
    return {
      success: false,
      message: "Gagal menambahkan user: Username sudah ada.",
    };
  }

  const newUser = {
    id: users.length + 1,
    username,
    password,
    role,
  };

  users.push(newUser);
  await writeDatabase(users);
  return {
    success: true,
    message: "User berhasil ditambahkan.",
    user: newUser,
  };
}

// Menjalankan server dengan Bun.js
Bun.serve({
  port: 4000, // Pastikan port sesuai dan tidak digunakan oleh proses lain
  async fetch(req) {
    const url = new URL(req.url, `http://${req.headers.get("host")}`);
    console.log(`Request received: ${req.method} ${url.pathname}`);

    // Register user
    if (req.method === "POST" && url.pathname === "/register") {
      try {
        const { username, password, role } = await req.json();

        if (!username || !password || !role) {
          return new Response(
            JSON.stringify({ message: "Semua field harus diisi" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const response = await addUser(username, password, role);
        return new Response(JSON.stringify(response), {
          headers: { "Content-Type": "application/json" },
          status: response.success ? 200 : 400,
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ message: "Invalid request format" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Login user
    if (req.method === "POST" && url.pathname === "/login") {
      try {
        const { username, password } = await req.json();

        if (!username || !password) {
          return new Response(
            JSON.stringify({ message: "Username dan password wajib diisi" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const response = await login(username, password);
        return new Response(JSON.stringify(response), {
          headers: { "Content-Type": "application/json" },
          status: response.success ? 200 : 401,
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ message: "Invalid request format" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(JSON.stringify({ message: "Route not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log("Server berjalan di http://localhost:4000");
