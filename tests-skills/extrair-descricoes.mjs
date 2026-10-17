import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const nomes = ["criar-landing-page", "landing-descoberta", "landing-direcao-visual", "landing-software-extra", "landing-publicar", "landing-registrar-feedback", "landing-evoluir-skill"];
for (const n of nomes) {
  const t = fs.readFileSync(path.join(os.homedir(), ".claude", "skills", n, "SKILL.md"), "utf8");
  console.log(`- ${n}: ${t.match(/^description: (.+)$/m)[1]}`);
}
console.log("- frontend-design:frontend-design: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.");
console.log("- superpowers:brainstorming: You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.");
console.log("- superpowers:writing-skills: Use when creating new skills, editing existing skills, or verifying skills work before deployment");
