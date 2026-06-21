# GitHub Configuration

Folder ini berisi konfigurasi automasi GitHub untuk project HEKAS POS FE.

## 📁 Isi

| File | Fungsi |
|---|---|
| `workflows/ci.yml` | Lint + svelte-check + unit tests + build verification |
| `workflows/e2e.yml` | Playwright E2E tests (chromium) |
| `workflows/dependabot-auto-merge.yml` | Auto-merge patch/minor Dependabot PRs |
| `workflows/release.yml` | Buat GitHub Release saat push tag `v*.*.*` |
| `dependabot.yml` | Konfigurasi Dependabot untuk npm + GitHub Actions |
| `PULL_REQUEST_TEMPLATE.md` | Template PR |
| `ISSUE_TEMPLATE/bug_report.md` | Template bug report |
| `ISSUE_TEMPLATE/feature_request.md` | Template feature request |

## 🚀 Workflow Triggers

### CI Workflow
- **Trigger**: push ke `main`/`develop`, PR ke `main`/`develop`
- **Jobs**:
  1. `lint` — svelte-check (type + a11y)
  2. `unit-tests` — Vitest + coverage
  3. `build` — Production build
  4. `all-pass` — Aggregate status

### E2E Workflow
- **Trigger**: push ke `main`, PR ke `main`, manual dispatch
- **Matrix**: chromium (default), bisa tambah firefox/webkit
- **Output**: HTML report + traces di artifacts

### Dependabot Auto-Merge
- **Trigger**: Dependabot buka/sync PR
- **Behavior**: Auto-merge patch/minor, comment pada major

### Release
- **Trigger**: push tag `v*.*.*` (e.g. `v1.2.0`)
- **Behavior**: Extract changelog dari PROGRESS.md → buat GitHub Release

## 🔧 Setup Awal

Setelah push ke GitHub:

1. **Enable GitHub Actions** di repo Settings → Actions
2. **Optional - Codecov**: Sign up di codecov.io, tambahkan `CODECOV_TOKEN` di repo secrets
3. **Optional - Branch Protection**: Settings → Branches → Protect `main`:
   - Require status checks: `lint`, `unit-tests`, `build`
   - Require up-to-date branches

## 📊 Badge

Tambahkan ke README utama:

```markdown
![CI](https://github.com/USERNAME/REPO/workflows/CI/badge.svg)
![E2E](https://github.com/USERNAME/REPO/workflows/E2E%20Tests/badge.svg)
```

## 🐛 Debugging Failed CI

1. Buka Actions tab → pilih workflow run yang failed
2. Klik job yang failed → expand step yang error
3. Untuk E2E: download `playwright-report-*` artifact dan buka `index.html` lokal
4. Untuk unit tests: download `coverage-report` artifact

## 🔒 Secrets yang Mungkin Diperlukan

| Secret | Required? | Fungsi |
|---|---|---|
| `GITHUB_TOKEN` | Auto | Default token untuk auto-merge + release |
| `CODECOV_TOKEN` | Optional | Upload coverage ke Codecov |

Auto-provided untuk public repos. Untuk private, tambahkan manual.
