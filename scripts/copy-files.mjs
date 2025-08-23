import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const src = "src/data-files";
const dst = "dist/data-files";

await fsp.mkdir(dst, {
	recursive: true
});
for (const entry of await fsp.readdir(src, {
		withFileTypes: true
	})) {
	const from = path.join(src, entry.name);
	const to = path.join(dst, entry.name);
	if (entry.isDirectory()) {
		fs.cpSync(from, to, {
			recursive: true
		});
	} else {
		await fsp.copyFile(from, to);
	}
}