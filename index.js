import fs from "fs/promises"; // Modul untuk file system
import path from "path"; // Modul untuk manipulasi path
import jwt from "jsonwebtoken"; // Modul untuk JWT

const dbPath = path.join("db", "users.json"); // Lokasi file database JSON
const JWT_SECRET = "your_secret_key"; // Ganti dengan secret key yang aman

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
    // Membuat JWT token
    const token = jwt.sign(
      { username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" } // Token valid selama 1 jam
    );

    return {
      success: true,
      message: `Welcome, ${user.role}: ${user.username}`,
      token, // Kirim token kepada user
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

/**
 * Middleware untuk memverifikasi token JWT
 */
function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, message: "Token tidak ditemukan atau tidak valid" };
  }

  const token = authHeader.split(" ")[1]; // Ambil token setelah "Bearer"
  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verifikasi token
    return { valid: true, decoded };
  } catch (error) {
    return {
      valid: false,
      message: "Token tidak valid atau sudah kedaluwarsa",
    };
  }
}

/**
 * Middleware untuk Role-Based Access Control (RBAC)
 */
function checkRole(authHeader, allowedRoles) {
  const { valid, decoded, message } = verifyToken(authHeader);

  if (!valid) {
    return { allowed: false, message };
  }

  if (!allowedRoles.includes(decoded.role)) {
    return {
      allowed: false,
      message: "Akses ditolak. Anda tidak memiliki izin yang sesuai.",
    };
  }

  return { allowed: true, decoded };
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

    // Protected route untuk user biasa
    if (req.method === "GET" && url.pathname === "/user") {
      const authHeader = req.headers.get("Authorization");
      const { allowed, decoded, message } = checkRole(authHeader, [
        "user",
        "admin",
      ]);

      if (!allowed) {
        return new Response(JSON.stringify({ success: false, message }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Halo ${decoded.role}, ${decoded.username}. Ini adalah halaman untuk user biasa.`,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Protected route untuk admin
    if (req.method === "GET" && url.pathname === "/admin") {
      const authHeader = req.headers.get("Authorization");
      const { allowed, decoded, message } = checkRole(authHeader, ["admin"]);

      if (!allowed) {
        return new Response(JSON.stringify({ success: false, message }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Selamat datang, Admin ${decoded.username}!`,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ message: "Route not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log("Server berjalan di http://localhost:4000");
