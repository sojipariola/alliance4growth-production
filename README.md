# Alliance4Growth — Production Deployment Package

Alliance4Growth is a full-stack community organisation application using:

- React + Vite frontend
- Node.js + Express API
- SQLite database
- Persistent image uploads

## Production layout

```text
Internet -> Nginx/HTTPS -> React static files
                       \-> Node.js API -> SQLite + uploads
```

## Important

This package is prepared for production deployment, but you must supply your own production secrets and organisation-specific banking/payment details. Never commit `.env` files, passwords, JWT secrets, or production credentials.

The included `backend/data/a4g_database.sqlite` is the database supplied with the project. Treat it as sensitive and migrate it to the server's persistent data directory before go-live.

## Build

```bash
cd frontend
npm ci
npm run build
```

```bash
cd ../backend
npm ci --omit=dev
```

## Configuration

Copy `backend/.env.example` to a secure server location (for example `/etc/alliance4growth/alliance4growth.env`) and set:

- `FRONTEND_URL`
- `JWT_SECRET`
- `DB_PATH`
- `UPLOAD_DIR`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` for initial setup

Generate a secret with:

```bash
openssl rand -base64 48
```

## Database initialization

Do not seed sample data in production. Run the database initialization after setting the required environment variables:

```bash
npm run init-db
```

The initializer will refuse to create a default administrator password.

## Deployment

1. Build the frontend.
2. Copy `frontend/dist` to `/var/www/alliance4growth/frontend/dist`.
3. Copy the backend application to `/var/www/alliance4growth/backend`.
4. Put the database and uploads under `/var/lib/alliance4growth`.
5. Install the example systemd unit and Nginx configuration, replacing the domain.
6. Configure HTTPS.
7. Start the Node service.
8. Verify `/health` and the public site.
9. Configure automated off-server backups.

## Payment warning

The current application records donation submissions in SQLite. It must not represent an unverified card payment as completed. A real card payment integration (for example Stripe with server-side verification/webhooks) is required before accepting live card payments. Bank transfers remain `pending` until an administrator confirms receipt.

## SQLite

SQLite is suitable for an initial deployment with moderate traffic. Keep the database on persistent local storage, enable regular backups, and do not place the database on ephemeral storage.

## Security checklist

- Use HTTPS only.
- Use a unique, long JWT secret.
- Use a strong unique admin password.
- Restrict SSH access and enable a firewall.
- Keep Node.js and OS packages patched.
- Store production data outside the application source directory.
- Back up both SQLite and uploads.
- Test restoration.
- Review GDPR/privacy, retention, access-control and payment processes before launch.
