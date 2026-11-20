# Workflow Git

Branches : `main` (stable, protégée) <- `develop` <- `feature/*`.
Commits : Conventional Commits (`feat(backend): ...`, `fix(ai): ...`, `docs: ...`, `chore(docker): ...`).
Pull request vers `develop`, relue par l'autre développeur, fusion en squash. PR `develop` -> `main` en fin de phase.
Avant chaque push : `git pull --rebase origin develop`.

## Propriété des dossiers
- Développeur 1 : `frontend/`, `ai-service/`
- Développeur 2 : `backend/`, `infra/vagrant/`, `infra/ansible/`
- Partagé (via PR relue) : `docker-compose.yml`, `.env.example`, `infra/jenkins/`, `infra/nagios/`, `docs/`, `README.md`
