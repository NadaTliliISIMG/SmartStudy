# Smart Study

Plateforme web d'apprentissage assistée par IA : résumés et QCM générés à partir du contenu d'un cours.

Architecture à quatre conteneurs : frontend (React), backend (Node/Express), MongoDB, service IA (FastAPI + Ollama).

## Structure
- `frontend/` React + React Bootstrap + Redux Toolkit
- `backend/` API REST Node.js / Express / Mongoose
- `ai-service/` FastAPI (appelle Ollama)
- `infra/` Vagrant, Ansible, Jenkins, Nagios
- `docs/` contrat d'API, workflow Git

## Démarrage local (Phase 2)
```
cp .env.example .env
cd backend && npm install && npm run dev
cd ai-service && python -m venv .venv && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```
Le README complet sera finalisé en Phase 6.
