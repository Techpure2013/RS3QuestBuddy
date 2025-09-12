// build-script.mjs
import { execSync } from "child_process";
import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";

console.log("🚀 Starting post-build versioning script...");

try {
	// 1. Get the latest git commit hash
	const gitHash = execSync("git rev-parse --short HEAD").toString().trim();
	console.log(`✅ Git Hash: ${gitHash}`);

	// 2. Create the version.json file in the build output directory ('dist')
	const versionInfo = { version: gitHash };
	const buildDir = resolve(process.cwd(), "dist");
	writeFileSync(
		resolve(buildDir, "version.json"),
		JSON.stringify(versionInfo, null, 2),
	);
	console.log(`✅ Created dist/version.json`);

	// 3. Inject the version into the index.html file
	const indexPath = resolve(buildDir, "index.html");
	let indexHtml = readFileSync(indexPath, "utf8");

	const metaTag = `<meta name="app-version" content="${gitHash}">`;
	if (indexHtml.includes('<meta name="app-version"')) {
		indexHtml = indexHtml.replace(
			/<meta name="app-version" content=".*">/,
			metaTag,
		);
	} else {
		indexHtml = indexHtml.replace("</head>", `  ${metaTag}\n</head>`);
	}

	writeFileSync(indexPath, indexHtml);
	console.log(`✅ Injected version meta tag into dist/index.html`);
} catch (error) {
	console.error("❌ Error during post-build versioning script:", error);
	process.exit(1);
}

console.log("✨ Versioning script completed successfully!");
