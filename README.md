# Rođendanska Suglasnost

## Deploy na Cloudflare Pages

### 1. Pushaj na GitHub

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/TVOJ_USERNAME/REPO_NAME.git
git push -u origin main
```

### 2. Cloudflare Pages — novi projekt

1. Idi na [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Povezi GitHub repo
3. Build settings: ostavi sve prazno (čisti HTML + Functions, nema build koraka)
4. Klikni **Save and Deploy**

### 3. KV Namespace (za log suglasnosti)

1. U Cloudflare dashboardu idi na **Workers & Pages** → **KV**
2. Klikni **Create namespace**, nazovi ga `CONSENTS`
3. Idi na tvoj Pages projekt → **Settings** → **Functions** → **KV namespace bindings**
4. Dodaj binding:
   - **Variable name:** `CONSENTS`
   - **KV namespace:** odaberi `CONSENTS` koji si upravo stvorio
5. Spremi i redeploy (svaki novi push automatski triggerira deploy)

### Struktura projekta

```
index.html              ← frontend
functions/
  api/
    consent.js          ← POST /api/consent (sprema suglasnost)
    log.js              ← GET /api/log (dohvaća listu)
_redirects
```
