# Exécuter à la racine du projet (PowerShell). Remplacer l'URL par celle de votre dépôt.
git init -b main
git add .
git commit -m "chore: initial project structure"
git branch develop
git checkout develop
foreach ($b in "feature/frontend-auth","feature/frontend-dashboard","feature/backend-auth","feature/backend-courses","feature/ai-service","feature/devops") { git branch $b }
git remote add origin https://github.com/<votre-compte>/smart-study.git
git push -u origin main
git push -u origin develop
