# How To Create An NPM Package

Matt Pocock

In this guide, we'll go through every single step you need to take to publish a package to npm. This is not a minimal guide. We'll be setting up a fully production-ready package from an empty directory. This will include:

- Git for version control
- TypeScript for writing our code and keeping it type-safe
- Prettier for formatting our code
- @arethetypeswrong/cli for checking our exports
- tsup for compiling our TypeScript code into CJS and ESM
- Vitest for running our tests
- GitHub Actions for running our CI process
- Changesets for versioning and publishing our package

---

## 1. Git

### 1.1: Initialize the repo

```sh
git init
```

### 1.2: Set up a .gitignore

Create a `.gitignore` file in the root of your project and add:

```
node_modules
dist
```

### 1.3: Create an initial commit

```sh
git add .
git commit -m "Initial commit"
```

### 1.4: Create a new repository on GitHub

Using the GitHub CLI:

```sh
gh repo create my-npm-package --source=. --public
```

### 1.5: Push to GitHub

```sh
git push --set-upstream origin main
```

---

## 2. package.json

Create a `package.json` file with these values:

```json
{
  "name": "my-npm-package",
  "version": "1.0.0",
  "description": "A demo package for Total TypeScript",
  "keywords": ["demo", "typescript"],
  "homepage": "https://github.com/yourname/my-npm-package",
  "bugs": { "url": "https://github.com/yourname/my-npm-package/issues" },
  "author": "Your Name <your@email.com>",
  "repository": { "type": "git", "url": "git+https://github.com/yourname/my-npm-package.git" },
  "files": ["dist"],
  "type": "module"
}
```

---

## 3. TypeScript

### 3.1: Install TypeScript

```sh
npm install --save-dev typescript
```

### 3.2: Set up a tsconfig.json

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "es2022",
    "allowJs": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "module": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

---

## 4. Prettier

### 4.1: Install Prettier

```sh
npm install --save-dev prettier
```

### 4.2: Set up a .prettierrc

```json
{
  "singleQuote": true,
  "semi": true
}
```

---

## 5. Exports, main and @arethetypeswrong/cli

### 5.1: Install @arethetypeswrong/cli

```sh
npm install --save-dev @arethetypeswrong/cli
```

---

## 6. Using tsup to Dual Publish

### 6.1: Install tsup

```sh
npm install --save-dev tsup
```

---

## 7. Testing with Vitest

### 7.1: Install vitest

```sh
npm install --save-dev vitest
```

---

## 8. Set up our CI with GitHub Actions

### 8.1: Creating our workflow

Create a `.github/workflows/ci.yml` file:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm test
```

---

## 9. Publishing with Changesets

### 9.1: Install @changesets/cli

```sh
npm install --save-dev @changesets/cli
```

### 9.2: Initialize Changesets

```sh
npx changeset init
```

---

For the full guide, visit [How To Create An NPM Package](https://www.totaltypescript.com/how-to-create-an-npm-package). 