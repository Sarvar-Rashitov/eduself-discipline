The Netlify deploy errored, with the following guidance provided:

Diagnosis

- The build failed because Vite/Rollup could not resolve an import: [line 62](#L62) reports "Could not resolve './components/Layout' from 'src/app/routes.tsx'". The error points to the file path involved: [line 63](#L63).
- This is a module resolution error (missing/incorrect import path or wrong file name/case), not a package install or Node-version problem.

Likely causes
- The referenced file doesn't exist at src/app/components/Layout(.tsx/.jsx/.ts/.js/index.*).
- The import path is incorrect relative to src/app/routes.tsx (wrong number of ../).
- Filename casing mismatch (e.g. file is named layout.tsx but import uses Layout) — Netlify's Linux build is case‑sensitive while some developer machines (macOS) are not.
- The file exists locally but wasn't committed to the repo.

Solution

1) Verify the file exists and was committed
- Run these in your repo root to confirm presence and correct casing:
```bash
# check path relative to repo root
ls -la src/app/components || echo "no src/app/components directory"

# look for Layout file anywhere
git ls-files | grep -i "src/.*/components/.*layout" || true
```
If the file is missing, add it and commit:
```bash
git add <path-to-Layout-file>
git commit -m "Add Layout component"
git push
```

2) Fix the import path or filename in src/app/routes.tsx
- Open src/app/routes.tsx and locate the import that fails. If routes.tsx is in src/app and your components live in src/components (a sibling directory), change:
```ts
// before (failing)
import Layout from "./components/Layout";
```
to:
```ts
// after (correct sibling path)
import Layout from "../components/Layout";
```
- If your Layout file is named with different casing (e.g. layout.tsx), rename the file or update the import to match exactly (Linux is case-sensitive).

3) If Layout is an index file inside a folder
- If Layout is at src/app/components/Layout/index.tsx you can keep:
```ts
import Layout from "./components/Layout";
```
but ensure the folder and index file are committed and casing matches.

4) Rebuild and redeploy
- Test locally:
```bash
npm ci
npm run build
```
- Push your changes and trigger a new Netlify deploy.

If you still see the same error after confirming file presence and fixing the path, reply with the output of:
```bash
ls -R src/app | sed -n '1,200p'
ls -R src/components | sed -n '1,200p'
```
so I can suggest the exact import path.

The relevant error logs are:

Line 0: build-image version: ac6eb13fbf000e5c09ad677efd8b7c3c2d0142b6 (noble-new-builds)
Line 1: buildbot version: a4e69ecd307ba0c352dfef5d0d39913f2dec70dc
Line 2: Fetching cached dependencies
Line 3: Failed to fetch cache, continuing with build
Line 4: Fetching build zip file
Line 5: Starting to prepare the repo for build
Line 6: Custom publish path detected. Proceeding with the specified path: 'dist'
Line 7: Custom build command detected. Proceeding with the specified command: 'npm run build'
Line 8: Installing dependencies
Line 9: mise ~/.config/mise/config.toml tools: python@3.14.3
Line 10: mise ~/.config/mise/config.toml tools: ruby@3.4.8
Line 11: mise ~/.config/mise/config.toml tools: go@1.26.2
Line 12: Downloading and installing node v22.22.3...
Line 13: Downloading https://nodejs.org/dist/v22.22.3/node-v22.22.3-linux-x64.tar.xz...
Line 18: No npm workspaces detected
Line 19: Installing npm packages using npm version 10.9.8
Line 20: npm warn deprecated recharts@2.15.2: 1.x and 2.x branches are no longer active. Bump to Recharts v3 to receive latest features a
Line 21: added 285 packages in 27s
Line 22: npm packages installed
Line 23: Successfully installed dependencies
Line 24: Detected 1 framework(s)
Line 25: "vite" at version "6.3.5"
Line 26: Starting build script
Line 27: Section completed: initializing
Line 28: Failed during stage 'building site': Build script returned non-zero exit code: 2
Line 29: ​
Line 30: Netlify Build                                                 
Line 31: ────────────────────────────────────────────────────────────────
Line 32: ​
Line 33: ❯ Version
Line 34:   @netlify/build 35.15.0
Line 35: ​
Line 36: ❯ Flags
Line 37:   accountId: 68f90b43a8c2cff44c81a923
Line 38:   baseRelDir: true
Line 50: ​
Line 51: build.command from netlify.toml                               
Line 52: ────────────────────────────────────────────────────────────────
Line 53: ​
Line 54: $ npm run build
Line 55: > @figma/my-make-file@0.0.1 build
Line 56: > vite build
Line 57: vite v6.3.5 building for production...
Line 58: transforming...
Line 59: ✓ 17 modules transformed.
Line 60: ✗ Build failed in 442ms
Line 61: error during build:
Line 62: Could not resolve "./components/Layout" from "src/app/routes.tsx"
Line 63: file: /opt/build/repo/src/app/routes.tsx
Line 64:     at getRollupError (file:///opt/build/repo/node_modules/rollup/dist/es/shared/parseAst.js:317:41)
Line 65:     at error (file:///opt/build/repo/node_modules/rollup/dist/es/shared/parseAst.js:313:42)
Line 66:     at ModuleLoader.handleInvalidResolvedId (file:///opt/build/repo/node_modules/rollup/dist/es/shared/node-entry.js:22144:24)
Line 67:     at file:///opt/build/repo/node_modules/rollup/dist/es/shared/node-entry.js:22104:26
Line 68: ​
Line 69: "build.command" failed                                        
Line 70: ────────────────────────────────────────────────────────────────
Line 71: ​
Line 72:   Error message
Line 73:   Command failed with exit code 1: npm run build
Line 74: ​
Line 75:   Error location
Line 76:   In build.command from netlify.toml:
Line 77:   npm run build
Line 78: ​
Line 79:   Resolved config
Line 80:   build:
Line 81:     command: npm run build
Line 82:     commandOrigin: config
Line 83:     publish: /opt/build/repo/dist
Line 84:     publishOrigin: config
Line 85: Build failed due to a user error: Build script returned non-zero exit code: 2
Line 86: Failing build: Failed to build site
Line 87: Finished processing build request in 36.399s