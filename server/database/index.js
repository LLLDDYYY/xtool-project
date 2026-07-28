"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");
const dbPath = path.join(process.cwd(), "xtool.db");
let db = null;
async function initDatabase() {
    const SQL = await initSqlJs();
    let fileBuffer = null;
    if (fs.existsSync(dbPath)) {
        fileBuffer = fs.readFileSync(dbPath);
    }
    db = new SQL.Database(fileBuffer);
    initTables();
    if (!fileBuffer) {
        seedData();
    }
    saveDatabase();
    return db;
}
function saveDatabase() {
    if (!db)
        return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
}
function initTables() {
    db.run(`
    CREATE TABLE IF NOT EXISTS styles (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      value TEXT NOT NULL,
      label TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS machines (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      value TEXT NOT NULL,
      label TEXT DEFAULT '',
      supported_types TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      value TEXT NOT NULL,
      label TEXT DEFAULT '',
      category TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS drawings (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      type TEXT NOT NULL,
      style TEXT DEFAULT 'default',
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS samples (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      material TEXT NOT NULL,
      drawing_type TEXT NOT NULL,
      machine TEXT DEFAULT 'F2U UV',
      refer_power INTEGER DEFAULT 0,
      refer_speed INTEGER DEFAULT 0,
      refer_count INTEGER DEFAULT 0,
      refer_density INTEGER DEFAULT 0,
      refer_freq TEXT DEFAULT '',
      refer_custom TEXT DEFAULT '[]',
      refer_dot_time INTEGER DEFAULT 0,
      refer_dpi INTEGER DEFAULT 0,
      refer_layer_height INTEGER DEFAULT 0,
      refer_spacing INTEGER DEFAULT 0,
      image_refer TEXT DEFAULT '',
      image_shallow TEXT DEFAULT '',
      image_deep TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_accounts (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT DEFAULT '',
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
function seedData() {
    const existingMachines = db.exec("SELECT COUNT(*) as c FROM machines");
    if (existingMachines[0] && existingMachines[0].values[0][0] > 0)
        return;
    const defaultMachines = [
        { value: "F2U UV", label: "xTool F2 Ultra UV", supportedTypes: ["vector", "bitmap", "depth"] },
        { value: "xTool M2", label: "xTool M2", supportedTypes: ["vector", "bitmap"] },
        { value: "xTool F1U", label: "xTool F1U", supportedTypes: ["vector", "bitmap"] },
        { value: "xTool M3", label: "xTool M3", supportedTypes: ["vector", "bitmap", "depth"] },
    ];
    for (const m of defaultMachines) {
        db.run("INSERT INTO machines (value, label, supported_types) VALUES (?, ?, ?)", [m.value, m.label, JSON.stringify(m.supportedTypes)]);
    }
    const defaultMaterials = [
        { value: "木材", label: "木材" },
        { value: "金属", label: "金属" },
        { value: "塑料", label: "塑料" },
        { value: "硅胶", label: "硅胶" },
        { value: "玻璃", label: "玻璃" },
        { value: "皮革", label: "皮革" },
        { value: "布料", label: "布料" },
    ];
    for (const mat of defaultMaterials) {
        db.run("INSERT INTO materials (value, label) VALUES (?, ?)", [mat.value, mat.label]);
    }
    const defaultStyles = [
        { value: "default", label: "默认样式" },
        { value: "精细", label: "精细样式" },
        { value: "粗犷", label: "粗犷样式" },
    ];
    for (const s of defaultStyles) {
        db.run("INSERT INTO styles (value, label) VALUES (?, ?)", [s.value, s.label]);
    }
    const adminHash = require("crypto").createHash("md5").update("admin123").digest("hex");
    db.run("INSERT INTO admin_accounts (username, password_hash, display_name, role) VALUES (?, ?, ?, ?)", ["admin", adminHash, "管理员", "superadmin"]);
    console.log("[Database] Seeded default data");
}
function getDb() {
    return db;
}
module.exports = { initDatabase, getDb, saveDatabase };
exports.db = { initDatabase, getDb, saveDatabase };
