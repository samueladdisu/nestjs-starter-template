#!/usr/bin/env node
import path from "path"
import fs from "fs-extra"
import inquirer from "inquirer"
import { execSync } from "child_process"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const { appName, features } = await inquirer.prompt([
  {
    type: "input",
    name: "appName",
    message: "Project name:",
    default: "nestjs-app",
  },
  {
    type: "checkbox",
    name: "features",
    message: "Select optional modules to include:",
    choices: ["auth", "notification", "email"],
  },
])

const targetPath = path.resolve(process.cwd(), appName)
const baseTemplate = path.join(__dirname, "../templates/base")
fs.copySync(baseTemplate, targetPath)

features.forEach(feature => {
  const modulePath = path.join(__dirname, `../templates/modules/${feature}`)
  fs.copySync(modulePath, path.join(targetPath, "src/modules", feature))
})

console.log("Installing dependencies...")
execSync("npm install", { cwd: targetPath, stdio: "inherit" })

console.log(`\n✅ Project "${appName}" created successfully!`)
