# NES Emulator Tutorial — TDD

Static website presenting the step-by-step tutorial for building a NES emulator in Python using Test Driven Development (356 lessons).

## Live site

**https://linkfy.github.io/nes-tutorial-web/**

## Repository structure

- `main`: site source code (Next.js, static export).
- `gh-pages`: prebuilt site. This is the branch served by GitHub Pages (root `/`).

## Local development

```bash
yarn install
yarn dev
```

## Building for GitHub Pages

The repository name must be exactly `nes-tutorial-web`, since the `basePath` is hardcoded to `/nes-tutorial-web`.

```bash
cp next.config.github.js next.config.js
yarn build
```

The output is written to `out/`. Push its contents to the root of the `gh-pages` branch to publish.
