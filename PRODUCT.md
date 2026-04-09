# JOB COPILOT — Document Produit Canonique

> **Ce document est la source unique de vérité pour le développement, l'architecture et les décisions produit.**
> Il doit être lu par les développeurs et les agents IA (Claude) comme contexte de projet.

---

## 1. Vision produit

Un copilote intelligent de recherche d'emploi qui montre les bons jobs, dit quoi faire maintenant, et aide à postuler plus vite.

Ce n'est pas un job board. C'est un outil de décision et d'action.

**Promesse :** "Les bonnes offres, au bon moment, avec un plan d'action clair."

---

## 2. Principes fondateurs

| # | Principe | Implication concrète |
|---|---|---|
| 1 | Activation rapide | Valeur visible < 2 min après onboarding |
| 2 | Onboarding progressif | 3-5 champs max, pas de formulaire lourd |
| 3 | Action-first | Chaque écran guide vers une action suivante |
| 4 | IA utile uniquement | Pas de gadget, chaque output IA est actionnable |
| 5 | Priorisation > exhaustivité | Mieux vaut 10 jobs pertinents que 500 bruts |
| 6 | Tolérance aux données manquantes | L'app fonctionne même si salaire, remote, etc. sont absents |

---

## 3. Utilisateurs cibles

**Persona principal :** Chercheur d'emploi actif (CDI/CDD/freelance), francophone, qui postule régulièrement et veut gagner du temps.

**Contexte :**

- Postule sur plusieurs plateformes
- Perd du temps à trier les offres
- Ne sait pas toujours comment prioriser
- Veut un suivi simple de ses candidatures

---

## 4. Scope MVP (strict)

### Inclus dans le MVP

- Authentification (Google + email/password via Supabase Auth)
- Onboarding minimal (3-5 champs)
- Fetch de jobs via Indeed MCP à l'onboarding
- Liste de jobs recommandés avec scoring algorithmique
- Recherche manuelle avec filtres essentiels
- Save / Dismiss (avec raison optionnelle)
- Postuler (lien externe vers l'offre)
- Suivi de candidatures (3 statuts : Sauvegardé → Postulé → Terminé)
- Profil utilisateur et préférences
- Upload et tagging de CVs (stockage uniquement, pas de parsing)
- 3 vues principales (Accueil, Mes candidatures, Profil)
- Gestion des états vides et erreurs MCP

### Hors scope MVP → voir Section 13

---

## 5. Flux utilisateur principal

```
Inscription (Google ou email/password)
       ↓
Onboarding (3-5 champs)
       ↓
Fetch jobs Indeed MCP (skeleton loading affiché)
       ↓
Page d'accueil : jobs recommandés, scorés, triés
       ↓
Actions par job : voir détail / sauvegarder / ignorer / postuler
       ↓
Suivi : Sauvegardé → Postulé → Terminé
       ↓
Retour : affiner préférences, voir nouveaux jobs
```

### Onboarding — Champs collectés

| Champ | Type | Obligatoire |
|---|---|---|
| Intitulés de poste recherchés | Texte libre / tags | Oui |
| Localisation(s) | Ville / région | Oui |
| Préférence remote | Remote / Hybride / Sur site / Indifférent | Oui |
| Salaire minimum | Nombre | Non |
| Type de contrat | CDI / CDD / Freelance / Stage | Oui |

Après validation → appel MCP Indeed → résultats stockés en base → affichés immédiatement.

---

## 6. Découpage fonctionnel

### 6.1 — Source de données (Job Engine)

- **Source primaire : Indeed via MCP**
- Les jobs récupérés sont **stockés en base** (table `jobs`) — pas de re-fetch à chaque visite
- Refresh périodique ou à la demande utilisateur
- Couche d'abstraction `JobSourceService` avec adaptateur `IndeedMCPAdapter`, prête à accueillir d'autres sources
- Normalisation des données à l'ingestion (champs manquants tolérés, valeurs par défaut)
- Déduplication V1 : hash sur `title + company + location`
- Rate limiting côté serveur sur les appels MCP (max N appels/min par utilisateur)
- Health check MCP : si indisponible, afficher l'état d'erreur approprié

### 6.2 — Scoring

Chaque job reçoit un **score de pertinence** (0-100) basé sur les préférences déclarées :

| Signal | Poids relatif |
|---|---|
| Correspondance titre | Fort |
| Localisation / remote | Fort |
| Salaire (si disponible) | Moyen |
| Type de contrat | Moyen |
| Fraîcheur de l'offre | Faible |

**Pas de behavioral learning en MVP.** Le scoring repose uniquement sur les préférences d'onboarding.

### 6.3 — Actions utilisateur sur un job

| Action | Effet |
|---|---|
| **Voir** | Enregistré comme interaction (type: view) |
| **Sauvegarder** | Ajouté à "Mes candidatures", statut = Sauvegardé |
| **Ignorer** | Masqué de la liste, raison optionnelle enregistrée |
| **Postuler** | Lien externe vers l'offre, statut = Postulé |

### 6.4 — Suivi de candidatures

Pipeline simplifié à **3 statuts** :

```
Sauvegardé → Postulé → Terminé
```

Chaque candidature peut avoir :

- Une note libre (texte court)
- Une date de dernière action (mise à jour automatique)

Pas de rappels, pas de sous-statuts en MVP.

### 6.5 — Recherche et filtres

- Recherche textuelle sur titre et entreprise
- Filtres : localisation, remote, type de contrat, salaire minimum
- Tri : pertinence (score), date de publication

### 6.6 — Profil et préférences

- Modifier les champs d'onboarding à tout moment
- Exclure des entreprises (liste noire)
- Mots-clés à inclure / exclure
- Upload de CVs vers Supabase Storage
- Tag des CVs (Dev, UX, Product, etc.)

---

## 7. Différenciateurs clés

| Différenciateur | Statut | Description |
|---|---|---|
| Scoring par pertinence | **MVP** | Chaque job est scoré selon les préférences utilisateur |
| Indicateur de fraîcheur | **MVP** | Badge visuel (Nouveau / Récent / Ancien) |
| Dismiss avec raison | **MVP** | Feedback structuré pour améliorer le système plus tard |
| Application Strategy (IA) | Phase 2 | Message personnalisé, recommandation CV |
| Today Dashboard | Phase 2 | Vue priorisée quand il y a assez de données |
| Behavioral Learning | Phase 2 | Ajustement du scoring par comportement |
| ATS vs Classic | Phase 2-3 | Recommandation de format CV |

---

## 8. Structure UX

### 3 vues principales (MVP)

| Vue | Contenu | Route |
|---|---|---|
| **Accueil** | Jobs recommandés scorés + recherche + filtres | `/` |
| **Mes candidatures** | Jobs sauvegardés + postulés + terminés (vue pipeline) | `/applications` |
| **Profil** | Préférences, CVs, entreprises exclues, mots-clés | `/profile` |

### Composants transversaux

- **Navigation** : sidebar ou top bar avec 3 items
- **Job Card** : titre, entreprise, localisation, remote badge, score, fraîcheur, actions (save/dismiss/postuler)
- **Job Detail** : description complète, lien source, actions
- **Empty States** : 3 variantes (voir ci-dessous)
- **Loading** : skeleton UI pendant le fetch MCP

### États vides — 3 cas gérés

| Cas | Message (FR) | Action proposée |
|---|---|---|
| 0 résultats au premier fetch | "Aucun job trouvé pour ces critères." | Bouton → modifier préférences |
| Tous les jobs vus/traités | "Vous êtes à jour ! On vous notifiera dès qu'il y a du nouveau." | — |
| Erreur MCP / source indisponible | "Impossible de charger les offres pour le moment. Réessayez dans quelques minutes." | Bouton → réessayer |

### Langue de l'interface

- **Tout le texte UI est en français**
- **Tout le code est en anglais**

---

## 9. Modèle de données (Supabase — Postgres)

### Tables — 5 au total

#### `profiles`

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid (PK) | = auth.users.id |
| email | text | not null |
| full_name | text | nullable |
| target_titles | text[] | not null, default '{}' |
| locations | text[] | not null, default '{}' |
| remote_preference | enum (remote, hybrid, onsite, any) | not null, default 'any' |
| min_salary | integer | nullable |
| contract_types | text[] | not null, default '{}' |
| excluded_companies | text[] | default '{}' |
| include_keywords | text[] | default '{}' |
| exclude_keywords | text[] | default '{}' |
| onboarding_completed | boolean | default false |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

#### `jobs`

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid (PK) | gen_random_uuid() |
| title | text | not null |
| company | text | not null |
| location | text | nullable |
| remote_status | enum (remote, hybrid, onsite, unknown) | default 'unknown' |
| salary_min | integer | nullable |
| salary_max | integer | nullable |
| contract_type | text | nullable |
| description | text | nullable |
| source | text | not null (ex: 'indeed') |
| source_url | text | unique, not null |
| source_id | text | nullable |
| published_at | timestamptz | nullable |
| dedup_hash | text | unique, not null |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

#### `cvs`

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid (PK) | gen_random_uuid() |
| user_id | uuid (FK → profiles.id) | not null |
| label | text | not null (ex: "CV Dev Frontend") |
| tag | text | nullable (ex: "dev", "ux", "product") |
| file_path | text | not null (chemin Supabase Storage) |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

#### `user_job_interactions`

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid (PK) | gen_random_uuid() |
| user_id | uuid (FK → profiles.id) | not null |
| job_id | uuid (FK → jobs.id) | not null |
| type | enum (view, save, dismiss, apply) | not null |
| dismiss_reason | text | nullable |
| note | text | nullable |
| score | integer | nullable (score calculé au moment de l'interaction) |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |
| | | UNIQUE(user_id, job_id, type) |

#### `applications`

| Colonne | Type | Contrainte |
|---|---|---|
| id | uuid (PK) | gen_random_uuid() |
| user_id | uuid (FK → profiles.id) | not null |
| job_id | uuid (FK → jobs.id) | not null |
| status | enum (saved, applied, done) | not null, default 'saved' |
| note | text | nullable |
| last_action_at | timestamptz | default now() |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |
| | | UNIQUE(user_id, job_id) |

### Row Level Security (RLS)

| Table | Règle |
|---|---|
| profiles | `auth.uid() = id` pour SELECT, UPDATE |
| jobs | SELECT pour tout utilisateur authentifié — INSERT/UPDATE réservé au service (service_role) |
| cvs | `auth.uid() = user_id` pour toutes les opérations |
| user_job_interactions | `auth.uid() = user_id` pour toutes les opérations |
| applications | `auth.uid() = user_id` pour toutes les opérations |

---

## 10. Architecture technique

```
┌───────────────────────────────────────────────┐
│              Vercel (Next.js App Router)       │
│                                               │
│  Pages (React Server Components)              │
│  ├── / (Accueil — jobs recommandés)           │
│  ├── /applications (Mes candidatures)         │
│  ├── /profile (Profil et préférences)         │
│  └── /onboarding (Onboarding)                 │
│                                               │
│  Server Actions / Route Handlers              │
│  ├── Fetch jobs                               │
│  ├── Score jobs                               │
│  ├── CRUD interactions                        │
│  ├── CRUD applications                        │
│  └── CRUD profile                             │
│                                               │
│  Services (server-side, /lib/services/)       │
│  ├── JobSourceService (abstraction)           │
│  │   └── IndeedMCPAdapter                     │
│  ├── ScoringService                           │
│  ├── DeduplicationService                     │
│  └── JobNormalizationService                  │
│                                               │
└────────────────────┬──────────────────────────┘
                     │
                     ▼
┌──────────────────────────────┐
│         Supabase             │
│  ├── Auth (Google + email)   │
│  ├── Postgres (+ RLS)        │
│  └── Storage (CVs)           │
└──────────────────────────────┘
```

### Stack technique

| Couche | Techno |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript |
| UI | Tailwind CSS, shadcn/ui |
| Backend | Supabase (Postgres, Auth, Storage, RLS) |
| Déploiement | Vercel |
| Source jobs | Indeed MCP via adaptateur |

### Conventions de code

- Architecture par feature : `/features/jobs/`, `/features/applications/`, `/features/profile/`
- Composants UI réutilisables dans `/components/ui/`
- Services serveur dans `/lib/services/`
- Nommage React standard : PascalCase pour les composants, camelCase pour les fonctions
- UI en français, code en anglais
- Pas de fichiers > 300 lignes
- Pas de composants "god" — découper systématiquement

### Gestion du MCP Indeed

- Appels MCP encapsulés dans `IndeedMCPAdapter` uniquement
- Résultats cachés en base après le premier fetch
- Rate limiting côté serveur (configurable)
- Health check : si MCP indisponible → état d'erreur affiché à l'utilisateur
- Le frontend ne communique jamais directement avec le MCP

---

## 11. Usage de l'IA

### MVP : aucun usage d'IA générative

Le scoring MVP est **purement algorithmique** (pondération de critères déclaratifs). Aucun LLM en Phase 1.

### Phase 2 : usages prévus

| Feature | Usage IA | Modèle suggéré |
|---|---|---|
| Message court de candidature | Génération texte personnalisé (job + profil) | GPT-4o-mini ou Claude Haiku |
| Arguments clés pour postuler | Extraction de points de match | Idem |
| Recommandation de CV | Matching CV tags ↔ job | Règles + LLM si ambiguïté |

### Contraintes IA (Phase 2+)

- Budget token limité par utilisateur (quota quotidien)
- Aucun appel IA non déclenché explicitement par l'utilisateur
- Outputs toujours éditables par l'utilisateur
- Jamais de formulation absolue — toujours nuancé

---

## 12. Logique ATS vs CV Classique (Phase 2-3)

### Concept

Le système recommande un format de CV adapté au contexte de l'offre :

| Format | Quand le recommander |
|---|---|
| **ATS** (sobre, mots-clés, sans colonnes) | Grandes entreprises, plateformes structurées, offres formelles |
| **Classique** (design, portfolio) | Startups, agences, candidatures spontanées, rôles créatifs |

### Signaux utilisés pour la décision

| Signal | Source | Fiabilité |
|---|---|---|
| Taille de l'entreprise | Enrichissement futur | Moyenne |
| Plateforme source | URL de l'offre | Bonne |
| Ton de l'annonce | Analyse du texte | Faible |
| Type de poste | Titre + description | Moyenne |
| Formulaire structuré | Détection URL | Bonne |

### Règles d'affichage

- Jamais de recommandation absolue
- Toujours un **niveau de confiance** : haute / moyenne / basse
- Toujours une **explication courte** (ex: "Grande entreprise + formulaire structuré → ATS recommandé")
- L'utilisateur choisit toujours le format final

### Implémentation prévue

- Phase 2 : règles heuristiques simples (plateforme + type de poste)
- Phase 3 : enrichissement des signaux + LLM pour les cas ambigus

---

## 13. Hors scope MVP (explicite)

Ces fonctionnalités sont **volontairement exclues** du MVP. Elles seront implémentées dans les phases ultérieures.

| Feature | Phase prévue | Raison du report |
|---|---|---|
| Today Dashboard | Phase 2 | Nécessite historique et données comportementales |
| Behavioral Learning | Phase 2 | Pas de données au lancement |
| Application Strategy IA | Phase 2 | Coûteux, complexe, pas de valeur J1 |
| ATS vs Classic CV | Phase 2-3 | Signaux insuffisants au lancement |
| Notifications in-app | Phase 2 | Pas critique pour le MVP |
| Notifications email | Phase 2 | Prématuré sans base d'utilisateurs |
| Notifications WhatsApp | Supprimé | Complexité disproportionnée |
| Rappels / reminders | Phase 2 | Pas critique pour le MVP |
| Pipeline 7 étapes | Supprimé | 3 statuts suffisent |
| Parsing de CV | Phase 3 | Projet en soi, pas nécessaire J1 |
| Enrichissement entreprise | Phase 3 | Pas de source fiable identifiée |
| Multi-source jobs | Phase 2+ | Indeed seul en V1 |
| Automatisations | Phase 3 | Prématuré |
| Intégrations tierces | Phase 3 | Prématuré |

---

## 14. Roadmap

### Phase 1 — MVP (4-6 semaines)

- Auth (Google + email via Supabase)
- Onboarding → fetch Indeed MCP → liste de jobs
- Scoring algorithmique (préférences déclarées)
- Save / Dismiss / Postuler (lien externe)
- Suivi candidatures (3 statuts)
- Profil + préférences + CVs (stockage)
- 3 vues (Accueil, Mes candidatures, Profil)
- États vides et gestion des erreurs MCP

### Phase 2 — Intelligence (6-10 semaines)

- Today Dashboard
- Behavioral learning basique
- Message court IA par job
- Recommandation de CV (heuristique)
- Notifications in-app
- Refresh périodique des jobs
- Multi-source jobs

### Phase 3 — Maturité

- ATS vs Classic (avec LLM)
- Application Strategy complète
- Notifications email
- Learning avancé
- Intégrations tierces
- Automatisations
