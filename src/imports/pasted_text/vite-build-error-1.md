The Netlify deploy errored, with the following guidance provided:

Diagnosis

- Relevant log lines: the build command run is shown at [line 53](#L53), Vite fails at [line 55](#L55)–[line 58](#L58) and the specific resolution error is at [line 60](#L60) with the file location at [line 61](#L61).
- Error type: Module resolution error from Vite/Rollup: "Could not resolve './components/Layout' from 'src/app/routes.tsx'".
- Likely cause: The import path "./components/Layout" in src/app/routes.tsx does not match any committed file in the repository (common causes are the file is missing/uncommitted, the filename has different casing — e.g. layout vs Layout — or the actual file is at a different path or as index.tsx inside a differently-named folder).

Solution

1) Verify the file exists and was committed
- From your repo root run:
```bash
ls -la src/app/components
git ls-files | grep -i 'src/app/components/.*layout'
```
- Confirm you see a file like Layout.tsx, Layout.jsx, index.tsx inside a Layout folder, etc. If the file is missing, add it and commit: git add && git commit && git push. Re-run the Netlify build.

2) If the file exists locally but the build still fails, check filename casing
- Netlify builds on Linux (case-sensitive). If your local dev environment is Windows or macOS (case-insensitive), an import like:
```tsx
// in src/app/routes.tsx
import Layout from './components/Layout'
```
will fail if the committed file is named layout.tsx (lowercase). Make sure the import exactly matches the filename:
- Rename the file or update the import so casing matches:
```tsx
// if file is layout.tsx
import Layout from './components/layout'
```
or rename the file to Layout.tsx and commit the rename:
```bash
git mv src/app/components/layout.tsx src/app/components/Layout.tsx
git commit -m "Fix filename case for Layout component"
git push
```

3) If the component is exported from an index file inside a folder
- If your components folder has a subfolder Layout/index.tsx, ensure the folder name and import match exactly:
```tsx
import Layout from './components/Layout' // folder must be named 'Layout'
```
or import the index explicitly:
```tsx
import Layout from './components/Layout/index'
```

4) If you used a path alias or custom resolver
- Ensure any tsconfig/alias is configured for production builds in Vite. But your error shows a relative import, so fix the real file/path first.

5) After fixing, push the change and trigger a new Netlify build.

Optional checks
- Run a local production build to reproduce before pushing:
```bash
npm run build
# or if you use vite directly
node_modules/.bin/vite build
```

If you still see the same error after confirming the file exists and casing is correct, paste the import line from src/app/routes.tsx and the exact filenames in src/app/components so I can propose a precise change.

The relevant error logs are:

Line 0: build-image version: ac6eb13fbf000e5c09ad677efd8b7c3c2d0142b6 (noble-new-builds)
Line 1: buildbot version: a4e69ecd307ba0c352dfef5d0d39913f2dec70dc
Line 2: Fetching cached dependencies
Line 3: Failed to fetch cache, continuing with build
Line 4: Fetching build zip file
Line 5: Starting to prepare the repo for build
Line 6: Custom publish path detected. Proceeding with the specified path: 'dist'
Line 7: Custom build command detected. Proceeding with the specified command: 'node_modules/.bin/vite build'
Line 8: Installing dependencies
Line 9: mise ~/.config/mise/config.toml tools: python@3.14.3
Line 10: mise ~/.config/mise/config.toml tools: ruby@3.4.8
Line 11: mise ~/.config/mise/config.toml tools: go@1.26.2
Line 12: Downloading and installing node v22.22.3...
Line 13: Downloading https://nodejs.org/dist/v22.22.3/node-v22.22.3-linux-x64.tar.xz...
Line 46: ​
Line 47: ❯ Context
Line 48:   production
Line 49: ​
Line 50: build.command from netlify.toml                               
Line 51: ────────────────────────────────────────────────────────────────
Line 52: ​
Line 53: $ node_modules/.bin/vite build
Line 54: vite v6.3.5 building for production...
Line 55: transforming...
Line 56: Failed during stage 'building site': Build script returned non-zero exit code: 2
Line 57: ✓ 22 modules transformed.
Line 58: ✗ Build failed in 380ms
Line 59: error during build:
Line 60: Could not resolve "./components/Layout" from "src/app/routes.tsx"
Line 61: file: /opt/build/repo/src/app/routes.tsx
Line 62:     at getRollupError (file:///opt/build/repo/node_modules/rollup/dist/es/shared/parseAst.js:317:41)
Line 63:     at error (file:///opt/build/repo/node_modules/rollup/dist/es/shared/parseAst.js:313:42)
Line 64:     at ModuleLoader.handleInvalidResolvedId (file:///opt/build/repo/node_modules/rollup/dist/es/shared/node-entry.js:22144:24)
Line 65:     at file:///opt/build/repo/node_modules/rollup/dist/es/shared/node-entry.js:22104:26
Line 66: ​
Line 67: "build.command" failed                                        
Line 68: ────────────────────────────────────────────────────────────────
Line 69: ​
Line 70:   Error message
Line 71:   Command failed with exit code 1: node_modules/.bin/vite build
Line 72: ​
Line 73:   Error location
Line 74:   In build.command from netlify.toml:
Line 75:   node_modules/.bin/vite build
Line 76: ​
Line 77:   Resolved config
Line 78:   build:
Line 79:     command: node_modules/.bin/vite build
Line 80:     commandOrigin: config
Line 81:     publish: /opt/build/repo/dist
Line 82:     publishOrigin: config
Line 83:   redirects:
Line 84:     - from: /*
      status: 200
      to: /index.html
  redirectsOrigin: config
Line 85: Build failed due to a user error: Build script returned non-zero exit code: 2
Line 86: Failing build: Failed to build site
Line 87: Finished processing build request in 34.574s