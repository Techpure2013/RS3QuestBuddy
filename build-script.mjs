// build-script.mjs
import { execSync } from "child_process"; // Re-add execSync for the fallback
import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";

console.log("🚀 Starting post-build versioning script...");

try {
	// 1. Attempt to read the git commit hash from the environment variable first.
	let gitHash = process.env.GIT_COMMIT_HASH;

	// 2. If the environment variable is not set, fall back to running the git command.
	//    This makes the script work both in the CI/Docker environment and locally.
	if (!gitHash) {
		console.log(
			"INFO: GIT_COMMIT_HASH env var not found. Falling back to local git command.",
		);
		try {
			gitHash = execSync("git rev-parse --short HEAD").toString().trim();
		} catch (gitError) {
			console.warn(
				"WARN: Local git command failed. Using 'local-dev' as version.",
			);
			gitHash = "local-dev"; // A final fallback to prevent the build from failing
		}
	} else {
		console.log("INFO: Found GIT_COMMIT_HASH in environment variable.");
	}

	// Final check to ensure we have a hash
	if (!gitHash) {
		throw new Error("Could not determine git hash. Build cannot continue.");
	}

	console.log(`✅ Git Hash: ${gitHash}`);

	// (The rest of the script is unchanged)

	// Create the version.json file in the build output directory ('dist')
	const versionInfo = { version: gitHash };
	const buildDir = resolve(process.cwd(), "dist");
	writeFileSync(
		resolve(buildDir, "version.json"),
		JSON.stringify(versionInfo, null, 2),
	);
	console.log(`✅ Created dist/version.json`);

	// Inject the version into the index.html file
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
