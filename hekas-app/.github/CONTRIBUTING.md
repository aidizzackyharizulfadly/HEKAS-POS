# Contributing ke HEKAS POS FE

Terima kasih sudah tertarik contribute! 🎉

## 🚀 Quick Start

1. **Fork** repo ini
2. **Clone** fork Anda: `git clone https://github.com/YOUR_USERNAME/HEKAS-POS-FE.git`
3. **Install** dependencies: `npm install`
4. **Buat branch**: `git checkout -b feat/nama-fitur`
5. **Develop** + **test** (lihat [Testing](#-testing))
6. **Push** + buka **Pull Request**

## 📋 Development Workflow

### Branch Naming

```
feat/nama-fitur        # New feature
fix/nama-bug           # Bug fix
refactor/nama-refactor # Refactor (no functional change)
docs/nama-docs         # Documentation only
test/nama-test         # Test addition/improvement
chore/nama-chore       # Build/config/tooling
```

### Commit Messages

Ikuti [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `style`

**Examples**:
```
feat(cart): add quick-cash preset buttons to PaymentModal
fix(auth): clamp PIN attempts to 5 (was unlimited)
docs(progress): update Q.18 E2E section
test(utils): add edge case tests for cart-totals
```

### Pull Request Process

1. Update `PROGRESS.md` jika menambah/mengubah fitur
2. Pastikan semua tests pass
3. Pastikan `svelte-check` 0 errors
4. Request review dari CODEOWNERS untuk path yang Anda ubah
5. Setelah approve + CI pass, merge via squash

## 🧪 Testing

```bash
# Unit tests
npx vitest run

# Unit tests + coverage
npx vitest run --coverage

# E2E tests
npx playwright install  # first time
npx playwright test

# Type + a11y check
npm run check

# Build verification
npm run build
```

Pastikan semua pass sebelum push.

## 🎨 Code Style

### TypeScript

- **Strict mode** — `tsconfig.json` strict enabled
- **No `any`** kecuali benar-benar diperlukan (kasih `// eslint-disable-next-line` + comment)
- **Prefer `$derived`** untuk kalkulasi reaktif di Svelte 5

### Svelte 5 Conventions

- **Runes only** — `$state`, `$derived`, `$effect`, `$props`
- **Props destructuring**: `let { foo, bar }: Props = $props();`
- **Callbacks**: `on{Action}` naming convention
- **Snippets** (bukan slots)
- **Accessibility first** — `aria-label`, `role`, `tabindex` di mana perlu

### File Organization

```
src/lib/
├── api/          # HTTP + mock API clients
├── auth/         # Session, guard, PIN
├── components/
│   ├── ui/       # shadcn-svelte primitives
│   ├── shared/   # Cross-role widgets
│   ├── kasir/    # POS flow
│   ├── gudang/   # Warehouse flow
│   └── manager/  # Admin flow
├── types/        # Domain types (Transaction, Product, etc.)
└── utils/        # Pure helper functions (testable)
```

## 🐛 Reporting Bugs

Pakai [Bug Report template](../issues/new?template=bug_report.md). Include:

- Steps to reproduce
- Expected vs actual behavior
- Browser/OS/version
- Screenshots (jika UI issue)
- Console errors (jika ada)

## 💡 Feature Requests

Pakai [Feature Request template](../issues/new?template=feature_request.md). Jelaskan:

- Problem yang dipecahkan
- Solusi yang diusulkan
- Acceptance criteria
- Impact (users affected, frequency)

## 📝 Documentation

- **Code comments** — Jelaskan WHY, bukan WHAT
- **PROGRESS.md** — Update untuk setiap perubahan fitur
- **README.md** — Update untuk setup/onboarding changes

## 🔒 Security

Untuk vulnerability reports, **JANGAN** buka public issue. Email ke security@hekas.id.

## 📜 License

By contributing, Anda agree bahwa kontribusi Anda akan dilisensikan under [MIT License](LICENSE).
