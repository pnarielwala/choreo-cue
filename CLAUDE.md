# Choreo Cue

A React Native / Expo mobile app for music playback with cue marking. Users import audio files (from Dropbox or device storage), play them with tempo control, and set timestamped cues for choreography practice.

## Quick Reference

```bash
yarn install          # install dependencies
yarn start            # start Expo dev server (NODE_ENV=development)
yarn test             # run tests in watch mode
yarn tsc              # typecheck
yarn ios              # run on iOS simulator
yarn android          # run on Android emulator
```

Node version: see `.nvmrc` (currently 22.12.0). Use `nvm use` before running commands.

Package manager: **yarn** (yarn.lock is the lockfile — never use npm or bun).

## Project Structure

```
src/
├── api/
│   ├── db/               # SQLite database layer (Knex query builder)
│   │   ├── client.ts     # Knex client configured with expo-sqlite dialect
│   │   ├── migrations.ts # Sequential numbered migrations (manual, not Knex CLI)
│   │   ├── audio.ts      # Audio table queries
│   │   └── cues.ts       # Cues table queries
│   ├── dropboxClient.ts  # Axios instances for Dropbox API (files + downloads)
│   └── filesystemClient.ts
├── screens/
│   ├── Main/             # Home screen — list of imported audio files
│   ├── MusicPlayer/      # Playback screen with cues, tempo, transport controls
│   │   └── components/   # TrackSlider, Controls, Tempo, Cues
│   ├── DropboxNavigator/ # Browse and import files from Dropbox
│   └── SelectSource/     # Choose import source (Dropbox, device)
├── design/               # Shared UI primitives (Button, Input, Pressable, Icon, ButtonGroup)
│   ├── theme.ts          # Dripsy theme (colors, spacing, fonts, text variants)
│   └── useTheme.ts
├── hooks/
│   ├── useMusicPlayer.ts # Wraps expo-av — playback state, seek, tempo
│   ├── useDropboxAuth.ts # OAuth2 flow via expo-auth-session + SecureStore
│   └── useIsScreenActive.ts
├── types/
│   └── Dropbox.ts        # Dropbox API response types
├── components/
│   └── ErrorBoundary.tsx
├── resources/            # Rollbar analytics/error tracking
├── __test-utils__/       # Test infrastructure (see Testing section)
├── __mocks__/            # Manual Jest mocks for Expo modules
└── index.tsx             # App entry point
```

Config files at root: `app.config.js` (Expo config), `eas.json` (EAS Build profiles), `babel.config.js` (module aliases + SVG), `metro.config.js` (SVG resolver), `jest.config.js`.

## Tech Stack

- **Framework**: Expo 52 (managed workflow) + React Native 0.76
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation (stack navigator)
- **State/Data**: TanStack React Query for async state
- **Database**: SQLite via `expo-sqlite` + Knex query builder (`@expo/knex-expo-sqlite-dialect`)
- **Styling**: Dripsy (theme-based styling)
- **Audio**: `expo-av`
- **Auth**: `expo-auth-session` (Dropbox OAuth2), tokens in `expo-secure-store`
- **Error tracking**: Rollbar
- **External API**: Dropbox (file browsing + downloads via Axios)

## Path Aliases

`babel.config.js` auto-creates aliases for every directory under `src/`, so you can import `design/theme` instead of `../../design/theme`. The `tsconfig.json` base URL is also `src/`.

## Database

Local SQLite with a custom migration system in `src/api/db/migrations.ts`. Migrations are numbered functions in a `migrations` object — the app tracks the current version in a `migrations` table and runs any newer migrations on startup.

**Schema:**
- `audio` — id, name, path, source (enum: iCloud/Dropbox/Spotify/YT/Apple), created_at
- `cues` — id, audio_id, start (ms), cue_number

To add a migration: add a new numbered entry to the `migrations` object in `migrations.ts`. The version number must be the next integer after the last entry.

## Testing

Test runner: **Jest** with `jest-expo` preset. Config in `jest.config.js`.

### Conventions

- Test files live next to the code they test, named `*.spec.tsx`
- Every screen has a spec file; component-level specs exist for MusicPlayer subcomponents

### Test utilities (`src/__test-utils__/`)

- **`rntl.tsx`** — re-exports `@testing-library/react-native` plus a custom `renderWithProviders` that wraps components in NavigationContainer, QueryClientProvider, DripsyProvider, and Toast. Always use `renderWithProviders` instead of bare `render`.
- **`setup.ts`** — global Jest setup: mocks for gesture-handler, database client (knex + mock-knex with in-memory SQLite), vector icons, secure-store, constants.
- **`builders/`** — test data factories using `@faker-js/faker`. Pattern: `aDropboxEntryFile(override?)` returns a valid object with random defaults that can be partially overridden.

### Database mocking

Tests mock `src/api/db/client` with an in-memory SQLite via `mock-knex`. Use `mockKnex.getTracker()` to intercept and respond to specific queries:

```ts
const tracker = mockKnex.getTracker()
tracker.install()
tracker.on('query', (query) => {
  if (query.method === 'select' && query.sql.includes('from `cues`')) {
    query.response([])
  }
})
```

### Manual mocks (`src/__mocks__/`)

Mocks for Expo modules that don't work in Jest: `expo-av`, `expo-constants`, `expo-linking`, `expo-updates`.

### Running tests

```bash
yarn test                    # watch mode (default)
yarn jest --coverage=false   # single run (CI uses --detectOpenHandles --forceExit)
```

## CI/CD & Deployment

All workflows live in `.github/workflows/`. The deployment pipeline uses **EAS (Expo Application Services)** for builds and updates.

### Environments

| Environment | EAS Profile   | EAS Channel  | Trigger |
|-------------|---------------|--------------|---------|
| Development | development   | —            | Local dev with dev client |
| Staging     | staging       | staging      | Push to `staging` branch |
| Production  | production    | production   | Push to `main` |

### Workflows

1. **`dev.workflow.yml`** (PR check) — on every pull request: typecheck, test, deploy EAS preview update using the PR branch name.

2. **`main.workflow.yml`** (Production deploy) — on push to `main`: typecheck, test, then smart deploy:
   - If only JS changes → OTA update via `eas update --branch production`
   - If native files changed (ios/, android/, app.config.*, package.json, yarn.lock) → full EAS build + App Store submit
   - Can force a native build via `workflow_dispatch` with `force_native_build: true`
   - Notifies Rollbar of deployments

3. **`staging.workflow.yml`** — on push to `staging`: typecheck, test, deploy OTA to staging channel.

4. **`promote-to-staging.workflow.yml`** — manual trigger: runs checks then force-pushes current HEAD to the `staging` branch.

5. **`pr_merge.workflow.yml`** — on PR merge: cleans up the EAS preview branch.

### Native vs OTA

The production workflow uses `dorny/paths-filter` to detect whether native changes occurred. Changes to `ios/`, `android/`, `app.config.*`, `eas.json`, `package.json`, or `yarn.lock` trigger a full native build. Everything else gets an OTA update, which is much faster.

### Runtime versioning

`app.config.js` uses `runtimeVersion: { policy: 'fingerprint' }` — Expo fingerprints the native dependencies to determine compatibility. OTA updates only apply to builds with matching fingerprints.

### Versioning

Semantic Release manages version bumps automatically based on conventional commits. The version in `app.config.js` is updated by the release process.

## Pre-commit Hooks

Husky + lint-staged runs on every commit:
- `tsc` on TypeScript files (typecheck)
- `prettier --write` on staged files
- `jest --findRelatedTests` on changed source files

## Code Style

- Prettier: single quotes, no semicolons, trailing commas (ES5), 2-space indent
- Conventional commits: `feat:`, `fix:`, `chore:`, etc.
- Commitizen available via `yarn cz`

## Environment Variables

- `.env` files (`.env`, `.env.development`, `.env.production`) loaded via `react-native-dotenv`
- `APP_ENV` set per EAS build profile in `eas.json`
- Secrets (EXPO_TOKEN, ROLLBAR_ACCESS_TOKEN, Apple credentials) stored as GitHub Actions secrets

## Adding a New Feature

1. **New screen**: create a directory under `src/screens/`, add the screen component and register it in the stack navigator in the app entry point.
2. **New API/data**: add query functions in `src/api/db/`, create React Query hooks to consume them, or extend the Dropbox client.
3. **New UI component**: add to `src/design/` and export from `src/design/index.ts`. Use the Dripsy `sx` prop with the theme for styling.
4. **Database changes**: add a new numbered migration function in `src/api/db/migrations.ts`.
5. **Tests**: add a `*.spec.tsx` next to the component. Use `renderWithProviders` from `__test-utils__/rntl` and mock-knex for database interactions.
