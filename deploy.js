const inquirer = require("inquirer");
const { execSync } = require("child_process");

// Prompt for a commit message
inquirer
  .prompt([
    {
      type: "input",
      name: "commitMessage",
      message: "Enter a commit message for the deploy:",
      default: "Deploying to GitHub Pages",
    },
  ])
  .then((answers) => {
    // Run build and deploy with the provided commit message
    console.log("Building project...");
    execSync("npm run build", { stdio: "inherit" });

    console.log("Deploying to GitHub Pages...");
    execSync(`gh-pages -a -d dist -m "${answers.commitMessage}"`, {
      stdio: "inherit",
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });
