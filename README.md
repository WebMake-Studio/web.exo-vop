<div align="center">

# 🎮 EXO VORP — Site Officiel

**Site web officiel du studio Roblox indépendant Exo Vorp**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/Licence-Privée-red?style=for-the-badge)](./LICENSE)

*Construit avec passion. Déployé avec ambition.*

</div>

---

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Structure du projet](#-structure-du-projet)
- [Installation](#-installation)
- [Configuration Supabase](#-configuration-supabase)
- [Panel d'administration](#-panel-dadministration)
- [Déploiement](#-déploiement)
- [Architecture technique](#-architecture-technique)
- [Copyright](#-copyright)

---

## 🌐 Aperçu

Site vitrine **dark sci-fi** pour le studio de jeux Roblox **Exo Vorp**, présentant les jeux du studio, l'équipe et les annonces. Entièrement dynamique via **Supabase** comme backend — les jeux, membres d'équipe, annonces et messages de contact sont gérés sans toucher au code.

| Page | Description |
|------|-------------|
| `index.html` | Accueil — hero, aperçu jeux, équipe |
| `jeux.html` | Catalogue des jeux + annonces filtrables |
| `team.html` | Présentation de l'équipe |
| `contact.html` | Formulaire de contact + liens Discord / Roblox |
| `admin/index.html` | Login sécurisé (Supabase Auth) |
| `admin/dashboard.html` | Panel CRUD — jeux, annonces, équipe, messages |

---

## ✨ Fonctionnalités

### Site public
- ⚡ **100% dynamique** — jeux, équipe et annonces chargés depuis Supabase
- 🌍 **Bilingue FR / EN** — système i18n complet, persisté en localStorage
- 🎨 **Design dark sci-fi** — canvas étoilé animé, effets glow, animations CSS
- 📱 **Responsive** — mobile, tablette et desktop
- 🔍 **Filtres annonces** — par jeu, en temps réel

### Panel d'administration
- 🔐 **Authentification sécurisée** via Supabase Auth
- 🎮 **Gestion des jeux** — ajout, modification, suppression, ordre d'affichage
- 📢 **Gestion des annonces** — avec sélecteur dynamique des jeux créés
- 👥 **Gestion de l'équipe** — membres, rôles, avatars
- 📬 **Messages de contact** — lecture et réponse par mailto
- 📊 **Vue d'ensemble** — statistiques en temps réel

---

## 📁 Structure du projet

```
exo-vorp/
│
├── index.html              # Page d'accueil
├── jeux.html               # Page jeux + annonces
├── team.html               # Page équipe
├── contact.html            # Page contact
│
├── admin/
│   ├── index.html          # Page de connexion admin
│   └── dashboard.html      # Panel d'administration
│
├── css/
│   ├── global.css          # Variables, reset, navbar, footer, étoiles
│   ├── home.css            # Styles page d'accueil
│   ├── games.css           # Styles page jeux & annonces
│   ├── team-contact.css    # Styles pages équipe & contact
│   └── admin.css           # Styles panel admin
│
└── js/
    ├── config.js           # ⚠️  Configuration Supabase (à éditer)
    ├── global.js           # Étoiles, navbar, i18n, toast, reveal
    ├── home.js             # Chargement dynamique jeux (accueil)
    ├── games.js            # Jeux + annonces filtrables
    ├── team-contact.js     # Équipe + formulaire contact
    └── admin.js            # CRUD complet panel admin
```

---

## 🚀 Installation

### Prérequis

- Un compte [Supabase](https://supabase.com) (gratuit)
- Un hébergement statique (Netlify, Vercel, GitHub Pages, OVH…)
- Aucune dépendance npm — projet 100% vanilla

### Étapes

**1. Cloner le dépôt**
```bash
git clone https://github.com/votre-username/exo-vorp.git
cd exo-vorp
```

**2. Configurer Supabase** *(voir section dédiée ci-dessous)*

**3. Ouvrir localement**
```bash
# Avec Python
python3 -m http.server 8080

# Avec Node.js
npx serve .
```

---

## 🗄️ Configuration Supabase

### 1. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Noter l'**URL du projet** et la **clé `anon public`** (Settings → API)

### 2. Éditer `js/config.js`

```javascript
const SUPABASE_URL      = 'https://VOTRE_PROJET.supabase.co';
const SUPABASE_ANON_KEY = 'VOTRE_CLE_ANON_PUBLIQUE';
```

### 3. Créer les tables (SQL Editor → New query)

```sql
-- Table des jeux
CREATE TABLE IF NOT EXISTS games (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name         text NOT NULL,
  slug         text NOT NULL UNIQUE,
  genre        text,
  description  text,
  cover_url    text,
  roblox_url   text,
  max_players  integer DEFAULT 10,
  active       boolean DEFAULT true,
  sort_order   integer DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

-- Table des annonces
CREATE TABLE IF NOT EXISTS announcements (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title      text NOT NULL,
  content    text NOT NULL,
  game       text,
  image_url  text,
  published  boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des membres d'équipe
CREATE TABLE IF NOT EXISTS team_members (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text NOT NULL,
  role            text NOT NULL,
  description     text,
  avatar_initial  text,
  avatar_url      text,
  sort_order      integer DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- Table des messages de contact
CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text,
  email      text,
  subject    text,
  message    text,
  created_at timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE games             ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages  ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "public_read_games" ON games            FOR SELECT USING (active = true);
CREATE POLICY "public_read_ann"   ON announcements    FOR SELECT USING (published = true);
CREATE POLICY "public_read_team"  ON team_members     FOR SELECT USING (true);
CREATE POLICY "public_insert_msg" ON contact_messages FOR INSERT WITH CHECK (true);

-- Accès admin (utilisateur connecté)
CREATE POLICY "admin_select_msg"  ON contact_messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_delete_msg"  ON contact_messages FOR DELETE USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all_games"    ON games             FOR ALL   USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all_ann"      ON announcements     FOR ALL   USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all_team"     ON team_members      FOR ALL   USING (auth.uid() IS NOT NULL);
```

> **Note :** Si la table `announcements` existait déjà avec une ancienne contrainte `CHECK (game IN (...))`, supprimez-la :
> ```sql
> ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_game_check;
> ```

### 4. Créer un compte administrateur

**Supabase → Authentication → Users → Add user**

---

## 🔐 Panel d'administration

Accès via `votre-site.com/admin/`

| Section | Fonctionnalités |
|---------|----------------|
| **Vue d'ensemble** | Stats temps réel, mini-liste jeux, actions rapides |
| **Jeux** | Créer / modifier / supprimer des jeux. Slug auto-généré. L'ordre contrôle l'affichage sur le site. |
| **Annonces** | CRUD complet. Le sélecteur de jeu liste dynamiquement les jeux créés. |
| **Équipe** | Membres avec avatar, rôle, description et ordre d'affichage. |
| **Messages** | Consultation des messages contact, réponse via mailto. |
| **Paramètres** | Rappel de configuration et SQL de référence. |

---

## 🌍 Déploiement

### Netlify *(recommandé)*

```bash
npm install -g netlify-cli
netlify deploy --prod --dir .
```

Ou glisser-déposer le dossier sur [app.netlify.com](https://app.netlify.com).

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages

1. Push le projet sur GitHub
2. Settings → Pages → Source : `main` / `root`
3. Disponible sur `https://username.github.io/exo-vorp/`

### ⚠️ Placeholders à remplacer avant mise en ligne

| Placeholder | Valeur |
|-------------|--------|
| `#LIEN_DISCORD_ICI` | `https://discord.gg/XXXXXXX` |
| `#LIEN_GROUPE_ROBLOX_ICI` | `https://www.roblox.com/groups/XXXXXXX` |

> Les liens Roblox des jeux se configurent depuis **Panel Admin → Jeux**.

---

## 🏗️ Architecture technique

```
┌──────────────────────────────────────────────────────────┐
│                      NAVIGATEUR                          │
│                                                          │
│  index.html   ──► home.js          ─────────────────┐   │
│  jeux.html    ──► games.js         ─────────────────┤   │
│  team.html    ──► team-contact.js  ─────────────────┼──► Supabase │
│  contact.html ──► team-contact.js  ─────────────────┤   (PostgreSQL │
│  admin/       ──► admin.js         ─────────────────┘    + Auth)    │
│                                                          │
│  global.js  ── partagé : i18n, canvas étoilé, navbar    │
│  config.js  ── credentials Supabase                     │
└──────────────────────────────────────────────────────────┘
```

**Stack technique**

| Couche | Technologie |
|--------|-------------|
| Frontend | HTML5 / CSS3 / JavaScript Vanilla |
| Backend | Supabase (PostgreSQL + Auth + REST) |
| Fonts | Orbitron + Exo 2 (Google Fonts) |
| Icônes | SVG inline (aucune dépendance) |
| i18n | Système custom FR/EN (localStorage) |
| Animations | CSS keyframes + IntersectionObserver |

---

## 📄 Copyright

```
© 2025 Rafael ISTE / FarTekTV — Tous droits réservés.
Studio indépendant non affilié à Roblox Corporation.
```

> Ce projet est propriétaire. Toute reproduction, distribution ou utilisation
> commerciale sans autorisation explicite est interdite.

---

<div align="center">
  <sub>Fait avec ♥ par <strong>FarTekTV</strong></sub>
</div>
