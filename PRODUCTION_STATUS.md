# Production status

This package is a production-oriented hardening pass of the supplied Alliance4Growth project.

## Applied

- Production CORS uses `FRONTEND_URL` instead of localhost-only origins.
- Node binds to `127.0.0.1` for reverse-proxy deployment.
- Startup waits for SQLite initialization before accepting traffic.
- Graceful SIGTERM/SIGINT shutdown was added.
- Strong JWT secret is required in production.
- Production admin initialization no longer contains a default password.
- Demo/sample records are no longer inserted by the production initializer.
- Bank details were removed from source code and moved to environment configuration.
- Placeholder bank details cause bank-transfer donations to be disabled rather than exposing fake details.
- Card donations cannot be marked completed without a real verified payment integration.
- Donation endpoints have dedicated rate limiting.
- Approved-member middleware is required for event registrations.
- Upload routes now use the shared Multer configuration.
- Persistent database/upload paths are configurable through environment variables.
- Upload-serving headers were hardened.
- Production Nginx, systemd and backup examples are included.
- Development test/demo files and duplicate frontend files were removed from the deployment package.
- Internal error details are no longer returned to clients.
- Event/hero deletion respects the configured persistent upload directory.

## Validation performed

- All backend JavaScript files passed `node --check` syntax validation.
- The supplied SQLite database was recovered from its WAL state before packaging, so the packaged database is a consistent standalone database file.
- Frontend production build was not completed in this isolated environment because installing the project's npm dependencies timed out. Run `npm ci && npm run build` in the deployment/build environment before go-live.

## Remaining go-live requirements

1. Set real production secrets and organisation details.
2. Set real CIC bank details in the protected environment file.
3. Build the frontend with `npm ci && npm run build`.
4. Configure HTTPS and the real domain in Nginx.
5. Configure off-server backups and test restoration.
6. Review GDPR/privacy, data retention and access-control procedures.
7. Integrate and verify a real card payment provider before enabling online card payments.
8. Change/confirm the supplied production database administrator credentials before exposing the site publicly.
