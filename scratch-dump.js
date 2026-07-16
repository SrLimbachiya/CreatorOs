const { createClient } = require("@libsql/client");
const path = require("path");

async function run() {
  const dbPath = path.join(__dirname, "creatoros.db");
  const clientConnection = createClient({
    url: `file:${dbPath}`,
  });
  
  try {
    const projects = await clientConnection.execute("SELECT * FROM projects;");
    console.log("PROJECTS IN DB:");
    console.log(projects.rows);
    
    const ideas = await clientConnection.execute("SELECT id, title, project_id, status FROM ideas;");
    console.log("\nIDEAS IN DB:");
    console.log(ideas.rows);
  } catch (err) {
    console.error("Dump failed:", err);
  } finally {
    clientConnection.close();
  }
}

run();
