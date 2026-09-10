# Production deployment

Recommended server: Ubuntu 24.04 LTS (or another currently supported Linux LTS) with Node.js 22 LTS.

## 1. Create service user and persistent directories

```bash
sudo useradd --system --home /var/lib/alliance4growth --shell /usr/sbin/nologin alliance4growth
sudo mkdir -p /var/www/alliance4growth /var/lib/alliance4growth/uploads /var/backups/alliance4growth
sudo chown -R alliance4growth:alliance4growth /var/www/alliance4growth /var/lib/alliance4growth
sudo chmod 750 /var/lib/alliance4growth
```

## 2. Install application

Put the backend under `/var/www/alliance4growth/backend` and the built frontend under `/var/www/alliance4growth/frontend/dist`.

Copy the supplied database to `/var/lib/alliance4growth/a4g_database.sqlite` and the uploads directory to `/var/lib/alliance4growth/uploads`.

## 3. Configure environment

Create `/etc/alliance4growth/alliance4growth.env` from `backend/.env.example` and replace all placeholders. Restrict it to root/service access:

```bash
sudo chown root:alliance4growth /etc/alliance4growth/alliance4growth.env
sudo chmod 640 /etc/alliance4growth/alliance4growth.env
```

## 4. Initialize

```bash
cd /var/www/alliance4growth/backend
sudo -u alliance4growth npm ci --omit=dev
sudo -u alliance4growth npm run init-db
```

If migrating the supplied database, do not overwrite it with a new empty database.

## 5. systemd

Copy `alliance4growth.service.example` to `/etc/systemd/system/alliance4growth.service`, then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now alliance4growth
sudo systemctl status alliance4growth
```

## 6. Nginx

Copy `nginx/alliance4growth.conf.example` to your Nginx sites directory and replace the example domain. Proxy `/api` and `/health` to Node and serve the React `dist` directory directly.

## 7. HTTPS

Use your host's supported certificate tooling or Certbot. Redirect HTTP to HTTPS after certificate issuance.

## 8. Backups

Install the SQLite CLI (`sqlite3`) and schedule `scripts/backup.sh` with a system timer/cron. Store copies off the server.

## 9. Go-live checks

- `GET /health` returns HTTP 200.
- Public pages load over HTTPS.
- Login/register work.
- Approved members can register for events.
- Admin routes reject non-admin users.
- Uploads work and are persistent.
- Bank transfer details show the configured CIC account, not placeholders.
- Card donation UI is not advertised until a real provider integration is enabled.
- Restore a backup to a separate test directory and verify the application can read it.
