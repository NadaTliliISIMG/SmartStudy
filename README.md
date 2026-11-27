# Smart Study

Plateforme web d'apprentissage assistée par IA. L'étudiant colle le contenu d'un cours ; l'IA génère un
**résumé structuré** et un **QCM** (4 choix, 1 bonne réponse). Résumés, quiz et scores sont enregistrés
et consultables dans un historique.

Projet universitaire de développement et de déploiement d'une application web conteneurisée :
Docker, Docker Compose, Vagrant, Ansible, Jenkins (CI/CD) et Nagios (supervision).

## 1. Architecture

### Application : 4 conteneurs

```
Navigateur --> [ Frontend : React + nginx ] --/api--> [ Backend : Node.js / Express ] --> [ MongoDB ]
                                                                     |
                                                                     +--> [ Service IA : FastAPI ] --> Ollama (modèle local)
```

| Conteneur | Technologie | Rôle |
|---|---|---|
| `frontend` | React, React Bootstrap, Redux Toolkit, nginx | Interface ; nginx transmet `/api` au backend |
| `backend` | Node.js, Express, Mongoose, JWT, bcrypt | API REST, authentification, logique métier |
| `mongo` | MongoDB 7 | Utilisateurs, cours, résumés, quiz, résultats (volume persistant) |
| `ai-service` | Python, FastAPI | Résumés et QCM via Ollama (aucune API payante) |

Règles : le frontend ne parle jamais à MongoDB ni au service IA ; seul le port 3000 est ouvert au réseau ;
MongoDB ne publie aucun port ; les conteneurs se joignent par leur nom de service (DNS interne de Docker).

### Infrastructure : 3 machines virtuelles (Vagrant + VirtualBox)

| VM | IP | Rôle | Interface |
|---|---|---|---|
| `app-vm` | 192.168.56.10 | Docker + application | http://192.168.56.10:3000 |
| `ci-vm` | 192.168.56.11 | Jenkins | http://192.168.56.11:8080 |
| `monitor-vm` | 192.168.56.12 | Nagios | http://192.168.56.12/nagios4/ |

Ollama reste sur la machine hôte (accessible depuis les VM à l'adresse 192.168.56.1:11434).

## 2. Structure du dépôt

```
Smart-Study/
├── frontend/          React
├── backend/           API Node.js
├── ai-service/        Service FastAPI
├── infrastructure/
│   ├── vagrant/       Vagrantfile (3 VM)
│   └── ansible/       playbooks et rôles (docker, app, jenkins, nrpe_agent, nagios_server)
├── monitoring/nagios/ configuration Nagios, commandes NRPE, scripts de contrôle
├── scripts/           test d'intégration
├── docs/              contrat d'API, workflow Git
├── docker-compose.yml
├── Jenkinsfile
└── .env.example
```

## 3. Prérequis

- Node.js 20+, Python 3.12+, Git
- Docker Desktop (exécution des conteneurs sur le PC)
- Ollama avec un modèle, par exemple `ollama pull qwen2.5:7b-instruct`
- VirtualBox 7 et Vagrant 2.4 (déploiement sur VM)

## 4. Variables d'environnement

Copier `.env.example` en `.env` (jamais versionné).

| Variable | Rôle |
|---|---|
| `JWT_SECRET` | Secret de signature des jetons (obligatoire pour Docker Compose) |
| `MONGO_URI` | URI MongoDB (hors Docker) |
| `AI_SERVICE_URL`, `AI_TIMEOUT_MS` | Adresse et délai du service IA (hors Docker) |
| `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `OLLAMA_TIMEOUT` | Moteur d'IA |
| `DOCKER_OLLAMA_URL` | Adresse d'Ollama vue depuis les conteneurs |
| `VITE_API_URL` | URL de l'API pour le frontend (hors Docker) |

## 5. Exécution locale (sans Docker)

```
cd backend && npm install && npm run dev                     # http://localhost:5000/api/health
cd ai-service && python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt && uvicorn app.main:app --port 8000
cd frontend && npm install && npm run dev                    # http://localhost:3000
```
MongoDB doit tourner en local (`mongodb://127.0.0.1:27017/smartstudy`).

## 6. Déploiement Docker

```
docker compose up --build        # http://localhost:3000
docker compose ps                # les 4 services doivent être "healthy"
node scripts/integration-test.js # test de bout en bout
docker compose down              # arrêt (les données sont conservées)
```

## 7. Déploiement sur les VM

```
cd infrastructure/vagrant
vagrant up                       # crée et configure les 3 VM avec Ansible
```
Détails : Vagrant crée les VM ; Ansible installe Docker, Jenkins, Nagios et prépare `/opt/smart-study`.
Pour une machine de 16 Go de RAM ou moins : `SMARTSTUDY_LIGHT=1` avant `vagrant up`.
Ollama (sur l'hôte) doit écouter sur toutes les interfaces : variable `OLLAMA_HOST=0.0.0.0` et règle de pare-feu
limitée au réseau 192.168.56.0/24.

## 8. Pipeline Jenkins

Job de type *Multibranch Pipeline* (GitHub Branch Source), analyse périodique du dépôt toutes les minutes.

| Contexte | Étapes |
|---|---|
| Pull request / branche | checkout, tests backend, build frontend, tests du service IA |
| Fusion dans `main` | + synchronisation du code vers `app-vm`, build des images, `docker compose up -d`, vérification des `/health`, test d'intégration |

Le déploiement se fait par SSH (clé propre à Jenkins, générée par Ansible). Le secret `JWT_SECRET` reste sur `app-vm`.

## 9. Supervision Nagios

| Élément | Contrôle |
|---|---|
| Disponibilité des VM | ping (état UP/DOWN) |
| CPU, mémoire, disque | NRPE : charge par cœur, mémoire utilisée, espace disque |
| Frontend | HTTP sur le port 3000 |
| Backend | NRPE : `/api/health` en local sur la VM |
| Service IA | NRPE : `/health` en local sur la VM |
| MongoDB | NRPE : état de santé du conteneur Docker |
| Jenkins | HTTP sur le port 8080 |

## 10. Tests

```
cd backend && npm test           # Jest + Supertest (57 tests)
cd ai-service && pytest          # 15 tests
cd frontend && npm run build
node scripts/integration-test.js # backend + MongoDB (RUN_AI=1 pour inclure l'IA)
```

## 11. Workflow Git

GitHub Flow : branche `main` protégée, branches courtes `feature/*` et `fix/*`, Pull Request relue par le
coéquipier et validée par Jenkins avant fusion. Voir `docs/git-workflow.md`.

## 12. Équipe

| Membre | Responsabilités |
|---|---|
| Développeur 1 (nom) | Frontend, service IA, Dockerfiles frontend et IA, supervision Nagios, documentation |
| Développeur 2 (nom) | Backend, Docker Compose, Vagrant, Ansible, pipeline Jenkins |