# 🚀 create-nest-starter

[![npm version](https://img.shields.io/npm/v/create-nest-starter?color=green&style=flat-square)](https://www.npmjs.com/package/create-nest-starter)
[![GitHub stars](https://img.shields.io/github/stars/samueladdisu/nestjs-starter-template?style=social)](https://github.com/samueladdisu/nestjs-starter-template)

A clean, modular CLI to scaffold a NestJS backend project with optional features like Email, Logger, Auth, and more.

---

## ✨ Features

- ✅ Modular and production-ready NestJS structure
- ✅ Pick features like Email, Logger, Auth, and more
- ✅ Uses React Email for email templating
- ✅ Nodemailer for SMTP delivery
- ✅ Built-in validation, filters, config structure

---

## 🚀 Quick Start

```bash
npx create-nest-starter my-app
```

🧩 Available Modules
Module Description
auth JWT-based authentication
email SMTP email with React templates
logger Winston logging integration

📦 Project Structure

```css
my-app/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── modules/
│   │   ├── email/
│   │   └── logger/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

🧪 Local Dev

```bash
git clone https://github.com/samueladdisu/create-nest-starter.git
cd create-nest-starter
npm install
npm link
create-nest-starter my-api
```

🛠 Requirements

Node.js ≥ 18

npm or pnpm

📄 License
MIT © [Samuel Addisu](https://github.com/samueladdisu)

```

```
