# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| Latest  | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**JANGAN** buka public issue untuk security vulnerabilities.

Email ke **security@hekas.id** dengan:

1. **Subject**: `[SECURITY] Brief description`
2. **Body**:
   - Affected version/commit
   - Steps to reproduce
   - Impact assessment
   - Suggested fix (jika ada)

## Response SLA

| Severity | First Response | Fix Target |
|---|---|---|
| Critical | 24 hours | 7 days |
| High | 48 hours | 14 days |
| Medium | 7 days | 30 days |
| Low | 14 days | Best effort |

## Disclosure Policy

- Kami akan acknowledge report dalam 24 jam
- Kami akan investigasi dan coordinate fix
- Setelah fix released, kami akan publish CVE/advisory (jika applicable)
- Reporter akan di-credit (kecuali minta anonymous)

## Security Best Practices

Untuk kontributor:

- **Never commit secrets** — pakai `.env` (di-gitignore)
- **Validate all inputs** — baik di client maupun server
- **Use parameterized queries** — hindari SQL injection
- **Sanitize HTML** — hindari XSS
- **CSRF protection** — untuk state-changing requests
- **Auth checks** — server-side, jangan percaya client

## Known Security Features

HEKAS POS FE mengimplementasikan:

- ✅ PBKDF2 untuk PIN hashing (di `lib/auth/pin.ts`)
- ✅ Session TTL 8 jam (di `lib/auth/session.ts`)
- ✅ Rate limiting 5 attempt untuk PIN (di `lib/auth/pin.ts`)
- ✅ Role-based access control (di `lib/auth/guard.ts`)
- ✅ CSRF protection via SvelteKit form actions
- ✅ HTTP-only cookies untuk session token

## Acknowledgments

Terima kasih untuk security researchers yang responsibly disclose vulnerabilities.
