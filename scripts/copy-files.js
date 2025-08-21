// scripts/copy-files.js (ESM; в пакете type:"module")
import fs from "node:fs";
import path from "node:path";

const from = path.resolve("src/data-files");
const to = path.resolve("dist/data-files");

function copyDir(src, dst) {
	fs.mkdirSync(dst, {
		recursive: true
	});
	for (const entry of fs.readdirSync(src, {
			withFileTypes: true
		})) {
		const s = path.join(src, entry.name);
		const d = path.join(dst, entry.name);
		if (entry.isDirectory()) copyDir(s, d);
		else fs.copyFileSync(s, d);
	}
}

if (fs.existsSync(from)) {
	copyDir(from, to);
	console.log(`[copy-files] ${from} -> ${to}`);
} else {
	console.log(`[copy-files] skip: ${from} does not exist`);
}