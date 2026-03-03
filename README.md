# Holi Celebration 2026 - Digital Carnival

Interactive web experience built for Holi 2026. Users can register, upload a photo, and burst colorful balloons in a game. Data (ID, name, score, photo) is stored locally and optionally synced to MySQL via PHP API.

## 📁 Repository
https://github.com/ayushwchat-hue/holiwebsite

## 🚀 Features
- Glass-morphism UI with animations
- Register/login using unique ID (1–9999) & name
- Upload Holi photo (click to animate & trigger game)
- Balloon burst game: tap or hover to pop; score tracking with confetti
- Leaderboard sorted by score
- Export data (local CSV) – removed in final build
- Session persistence until manual logout
- Mobile-friendly design with responsive breakpoints
- PHP/MySQL backend APIs (`api/`) for live storage

## 🛠️ Setup & Deployment
### Local testing
1. Clone repo: `git clone https://github.com/ayushwchat-hue/holiwebsite.git`
2. Navigate: `cd holiwebsite`
3. Install PHP if needed; ensure MySQL is available.
4. Import database schema:
   ```bash
   mysql -u root -p < api/schema.sql
   ```
5. Run PHP server:
   ```bash
   php -S localhost:8000 -t .
   ```
6. Browse [http://localhost:8000](http://localhost:8000). 

### Production
- Host on any PHP 8+ / MySQL server (shared or VPS).
- Clone repository to webroot.
- Create database using `api/schema.sql`.
- Update `api/config.php` with database credentials.
- Point domain to folder; ensure `mod_rewrite`/PHP enabled.

## 🗂 API Endpoints
- `POST /api/save_user.php` — save/update user metadata
- `POST /api/save_photo.php` — store Base64 photo string
- `GET /api/list_users.php` — list users (for debugging)

## 🎨 Customization
- Change animations in `style.css`.
- Modify game speed/score in `app.js`.

## 💡 Notes
- Uses localStorage fallback when backend not reachable.
- Designed for low-bandwidth mobile usage.
- Export CSV is still in code but button removed; accessible via console function call.

## 📄 License
MIT © 2026
