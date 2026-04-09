# Job Copilot

Un copilote intelligent de recherche d'emploi. Les bonnes offres, au bon moment, avec un plan d'action clair.

## Le problème

Chercher un emploi, c'est chronophage : trier des centaines d'offres, décider lesquelles méritent une candidature, adapter son CV, suivre ses candidatures. La plupart des outils existants sont des job boards passifs qui ne priorisent rien.

## La solution

Job Copilot va chercher les offres pertinentes pour vous, les score selon vos critères, et vous donne un suivi simple de vos candidatures — le tout dans une interface épurée et actionnable.

### Fonctionnalités clés

- **Offres personnalisées** — jobs scorés et triés selon vos préférences (titre, localisation, remote, salaire, contrat)
- **Recherche et filtres** — recherche textuelle + filtres essentiels
- **Save / Dismiss** — sauvegardez ou ignorez avec une raison
- **Suivi de candidatures** — pipeline simple : Sauvegardé → Postulé → Terminé
- **Profil enrichissable** — CVs, mots-clés, entreprises exclues

## Tech Stack

| Couche | Techno |
|---|---|
| Frontend | [Next.js](https://nextjs.org/) (App Router), React, TypeScript |
| UI | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| Backend | [Supabase](https://supabase.com/) (Postgres, Auth, Storage, RLS) |
| Déploiement | [Vercel](https://vercel.com/) |
| Source jobs | Indeed via MCP |

## Getting Started

### Prérequis

- Node.js 18+
- npm ou pnpm
- Un projet Supabase (Auth + Postgres + Storage)

### Installation

```bash
git clone https://github.com/<your-username>/job-copilot.git
cd job-copilot
npm install
```

### Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Lancer en développement

```bash
npm run dev
```

L'app sera disponible sur [http://localhost:3000](http://localhost:3000).

## Structure du projet

```
job-copilot/
├── app/                    # Pages Next.js (App Router)
├── components/ui/          # Composants UI réutilisables
├── features/               # Modules par feature
│   ├── jobs/               # Liste, recherche, scoring
│   ├── applications/       # Suivi de candidatures
│   └── profile/            # Profil et préférences
├── lib/
│   ├── services/           # Services serveur
│   │   ├── job-source/     # Abstraction source de jobs
│   │   ├── scoring/        # Scoring algorithmique
│   │   └── deduplication/  # Déduplication des offres
│   └── supabase/           # Client et helpers Supabase
├── PRODUCT.md              # Document produit canonique
└── README.md
```

## Documentation

Le document produit complet (architecture, data model, roadmap, scope) est disponible dans [`PRODUCT.md`](./PRODUCT.md).

## Roadmap

- [x] Définition produit et architecture
- [ ] **Phase 1 — MVP** : Auth, onboarding, jobs, search, save/dismiss, suivi, profil
- [ ] **Phase 2 — Intelligence** : Today dashboard, IA, behavioral learning
- [ ] **Phase 3 — Maturité** : ATS/Classic, multi-source, intégrations

## Licence

Ce projet est privé et non distribué sous licence open source.
