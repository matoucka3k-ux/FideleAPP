# FidèleApp — Guide de démarrage

## 1. Créer ton compte Supabase (5 min)

1. Va sur **supabase.com** → "Start your project" → compte gratuit
2. Crée un nouveau projet (choisis une région Europe)
3. Va dans **SQL Editor** → colle tout le contenu de `supabase_schema.sql` → clique **Run**
4. Va dans **Settings → API** → copie :
   - `Project URL` → ton VITE_SUPABASE_URL
   - `anon public` key → ton VITE_SUPABASE_ANON_KEY

## 2. Configurer le projet

1. Copie `.env.example` en `.env.local`
2. Remplis les deux valeurs Supabase
3. Lance : `npm install && npm run dev`

## 3. Déployer sur Vercel

1. Push sur GitHub (ou drag & drop sur vercel.com)
2. Dans Vercel → Settings → Environment Variables, ajoute :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Redéploie

## Routes

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/inscription` | Création compte commerçant |
| `/bienvenue` | Onboarding + config points |
| `/dashboard` | Dashboard commerçant |
| `/dashboard/encaisser` | QR + encaissement |
| `/dashboard/clients` | Liste clients |
| `/dashboard/points` | Système de points |
| `/dashboard/compte` | Mon compte |
| `/rejoindre/:slug` | Inscription client (via QR boutique) |
| `/ma-carte` | Carte fidélité du client |
