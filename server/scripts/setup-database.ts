import "dotenv/config";
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

const MIGRATIONS = [
  "0000_amusing_marvel_zombies.sql",
  "0001_loving_champions.sql",
  "0002_auth_system.sql",
];

async function applyMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required in .env");
    process.exit(1);
  }

  const connection = await mysql.createConnection(url);
  console.log("Connected to database.");

  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`__drizzle_migrations\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const file of MIGRATIONS) {
    const [rows] = await connection.query<{ name: string }[]>(
      "SELECT name FROM __drizzle_migrations WHERE name = ?",
      [file]
    );
    if (rows.length > 0) {
      console.log(`Skip (already applied): ${file}`);
      continue;
    }

    const sqlPath = path.join(process.cwd(), "drizzle", file);
    const raw = fs.readFileSync(sqlPath, "utf8");
    const statements = raw
      .split(/--> statement-breakpoint/)
      .map((s) => s.trim())
      .filter(Boolean);

    console.log(`Applying ${file} (${statements.length} statements)...`);
    for (const statement of statements) {
      await connection.query(statement);
    }

    await connection.query("INSERT INTO __drizzle_migrations (name) VALUES (?)", [file]);
    console.log(`Applied: ${file}`);
  }

  await connection.end();
  console.log("Database migrations complete.");
}

applyMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
