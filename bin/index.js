#!/usr/bin/env node
import path from "path"
import fs from "fs-extra"
import inquirer from "inquirer"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const cliAppName = process.argv[2]

let appName = cliAppName
let features

if (cliAppName) {
  console.log(`Using project name: ${cliAppName}`)

  const answers = await inquirer.prompt([
    {
      type: "checkbox",
      name: "features",
      message: "Select optional modules to include:",
      choices: ["auth", "notification", "email"],
    },
  ])

  features = answers.features
} else {
  const response = await inquirer.prompt([
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
  appName = response.appName
  features = response.features
}

const targetPath = path.resolve(process.cwd(), appName)
const baseTemplate = path.join(__dirname, "../templates/base")

// Copy base files
fs.copySync(baseTemplate, targetPath)

// Copy selected modules
features.forEach(feature => {
  const modulePath = path.join(__dirname, `../templates/modules/${feature}`)
  fs.copySync(modulePath, path.join(targetPath, "src/modules", feature))
})

// 🛠 Update app.module.ts with imports and module list
const appModulePath = path.join(targetPath, "src/app.module.ts")
let appModuleContent = fs.readFileSync(appModulePath, "utf8")

features.forEach(feature => {
  const className = `${capitalize(feature)}Module`
  const importStatement = `import { ${className} } from './modules/${feature}/${feature}.module';`

  appModuleContent = appModuleContent
    .replace(
      "// __IMPORT_MODULES__",
      `${importStatement}\n// __IMPORT_MODULES__`
    )
    .replace("// __MODULES__", `${className},\n    // __MODULES__`)
})

fs.writeFileSync(appModulePath, appModuleContent)

console.log(`\n✅ Project "${appName}" created successfully!`)
console.log(`\nNext steps:`)
console.log(`  cd ${appName}`)
console.log(`  npm install`)
console.log(`  npm run start:dev`)

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
