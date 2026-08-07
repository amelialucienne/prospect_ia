# CREADIF AI

Plateforme SaaS de prospection B2B automatisée — génération de leads, scoring, outreach et mini CRM.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Playwright** (automatisation LinkedIn)

## Démarrage

```bash
npm install
npx playwright install chromium
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Connexion LinkedIn (sans mot de passe)

L'automatisation LinkedIn utilise un **profil navigateur persistant** — aucun mot de passe n'est stocké dans l'application.

```bash
npm run linkedin:auth
```

1. Un navigateur Chromium s'ouvre sur LinkedIn
2. Connectez-vous **manuellement** à votre compte
3. Fermez le navigateur une fois connecté
4. La session est sauvegardée dans `.linkedin-profile/` (ignoré par git)

Variables d'environnement optionnelles :

| Variable | Description | Défaut |
|----------|-------------|--------|
| `LINKEDIN_USER_DATA_DIR` | Chemin du profil navigateur | `.linkedin-profile/` |
| `LINKEDIN_HEADLESS` | Mode headless (`false` pour voir le navigateur) | `true` |
| `LINKEDIN_AUTOMATION_ENABLED` | Activer/désactiver l'automatisation | `true` |

## ⚠️ Avant de déployer en production

Le module **LinkedIn Automation** (`src/services/linkedin/`) pilote un vrai
navigateur Chromium via Playwright avec une session cookie persistante
(`.linkedin-profile/`). Deux points importants :

1. **Ça ne tourne pas sur Vercel.** Le filesystem des fonctions Vercel est
   éphémère et sans état entre les requêtes, il n'y a pas de session
   navigateur persistante possible, et le binaire Chromium de Playwright
   dépasse largement les limites de taille des fonctions serverless. Ce
   module reste utilisable en local (`npm run linkedin:auth`) mais est
   **désactivé par défaut** (`LINKEDIN_AUTOMATION_ENABLED=false`) et ne doit
   pas être activé sur un déploiement Vercel.
2. **Le module "maison" automatise des actions sur un vrai compte LinkedIn**
   en dehors des outils officiels de LinkedIn, ce que ses conditions
   d'utilisation interdisent (risque de restriction/bannissement du compte).

**Pour la production, utilise l'intégration Waalaxy** (`src/services/waalaxy.ts`)
à la place : elle pousse le lead dans une campagne Waalaxy via leur API
officielle, et c'est Waalaxy (avec sa propre extension, connectée au compte
LinkedIn de son propriétaire) qui envoie réellement le message. Voir
"Connecter Waalaxy" ci-dessous.

## Connecter Waalaxy

1. Le propriétaire du compte Waalaxy va dans **Paramètres > CRM Sync** et
   clique sur **Generate API key** (visible une seule fois — à copier
   immédiatement dans un gestionnaire de secrets).
2. Récupère l'ID de la liste de prospects cible :
   `GET https://api.waalaxy.com/prospectLists/getProspectLists` avec le
   header `Authorization: Bearer <clé>`.
3. (Optionnel) Récupère l'ID d'une campagne existante :
   `GET https://api.waalaxy.com/campaigns/getAll`.
4. Renseigne dans les variables d'environnement (locales ou Vercel) :
   - `WAALAXY_API_KEY`
   - `WAALAXY_LIST_ID`
   - `WAALAXY_CAMPAIGN_ID` (optionnel)
5. Dans l'app, bouton **"Lancer via Waalaxy"** sur une fiche lead → le lead
   est ajouté à la liste/campagne, et la séquence (message initial + relances
   J+2/J+5, déjà configurée côté Waalaxy) part depuis le compte LinkedIn du
   propriétaire de la clé API.

La clé API Waalaxy est un secret : elle ne doit vivre que dans les variables
d'environnement Vercel, jamais commitée ni collée dans un chat.

## Modules

| Module | Description |
|--------|-------------|
| **ICP Engine** | Définition du Profil Client Idéal (secteur, taille, rôles, pain points, signaux d'achat) |
| **Prospect Engine** | Génération de 5–10 leads structurés avec score et température |
| **Outreach Engine** | Messages LinkedIn + relances J+2 et J+5 personnalisés |
| **LinkedIn Automation** | Envoi automatisé via Playwright (session persistante) |
| **Mini CRM** | Tableau de bord avec filtres température/score et statuts |

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── pipeline/route.ts
│   │   └── linkedin/
│   │       ├── session/route.ts      # Vérification session
│   │       └── send/
│   │           ├── route.ts          # Création job d'envoi
│   │           └── [jobId]/route.ts  # Suivi job
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── icp/                          # ICP Engine
│   ├── pipeline/                     # Animation & automatisation
│   ├── crm/                          # Mini CRM
│   ├── outreach/                     # Outreach Engine + LinkedIn UI
│   ├── layout/                       # Sidebar, TopBar
│   └── ui/                           # Composants réutilisables
├── services/
│   ├── leadGeneration.ts
│   ├── scoring.ts
│   ├── messageGeneration.ts
│   ├── pipeline.ts
│   └── linkedin/
│       ├── browser.ts                # Contexte Playwright persistant
│       ├── session.ts                # Vérification authentification
│       ├── sendMessage.ts            # Envoi message sur profil
│       └── jobStore.ts               # File d'envoi asynchrone
├── lib/
│   ├── linkedin/
│   │   ├── config.ts
│   │   └── outreachHelpers.ts
│   ├── constants.ts
│   └── utils.ts
└── types/
    ├── icp.ts
    ├── lead.ts
    ├── linkedin.ts
    ├── outreach.ts
    └── pipeline.ts

scripts/
└── linkedin-auth.ts                  # Connexion manuelle initiale
```

## API

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/pipeline` | POST | Exécute le pipeline et retourne les leads enrichis |
| `/api/linkedin/session` | GET | Vérifie si la session LinkedIn est active |
| `/api/linkedin/send` | POST | Lance l'envoi d'un message LinkedIn |
| `/api/linkedin/send/[jobId]` | GET | Suit l'état d'un job d'envoi |

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Serveur production |
| `npm run linkedin:auth` | Connexion LinkedIn manuelle (une fois) |
