import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const MARIADB_DIR = "C:\\Program Files\\MariaDB 12.3";
const mysqld = path.join(MARIADB_DIR, "bin", "mysqld.exe");
const defaultsFile = path.join(MARIADB_DIR, "data", "my.ini");

if (!fs.existsSync(mysqld)) {
  console.error("MariaDB not found at:", MARIADB_DIR);
  console.error("Install with: winget install MariaDB.Server");
  process.exit(1);
}

console.log("Starting MariaDB...");
const proc = spawn(mysqld, [`--defaults-file=${defaultsFile}`, "--standalone"], {
  stdio: "inherit",
  detached: false,
});

proc.on("error", (err) => {
  console.error("Failed to start MariaDB:", err.message);
  process.exit(1);
});

proc.on("exit", (code) => {
  console.log("MariaDB stopped with code", code);
});
