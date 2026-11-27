pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 40, unit: 'MINUTES')
    }

    environment {
        NODE_IMAGE = 'node:20-slim'
        PY_IMAGE   = 'python:3.12-slim'
        // Deployment target (app-vm). Jenkins connects with its own SSH key,
        // created by Ansible and authorized on app-vm.
        APP_HOST = '192.168.56.10'
        APP_USER = 'vagrant'
        APP_DIR  = '/opt/smart-study'
        SSH_OPTS = '-o StrictHostKeyChecking=accept-new -o BatchMode=yes'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        // ---------- Runs on every branch and every pull request ----------
        stage('Backend tests') {
            steps {
                sh '''
                    docker run --rm --user "$(id -u):$(id -g)" -e HOME=/tmp \
                      -v "$PWD/backend":/app -w /app $NODE_IMAGE \
                      sh -c "npm ci && npm test"
                '''
            }
        }
        stage('Frontend build') {
            steps {
                sh '''
                    docker run --rm --user "$(id -u):$(id -g)" -e HOME=/tmp \
                      -v "$PWD/frontend":/app -w /app $NODE_IMAGE \
                      sh -c "npm ci && npm run build"
                '''
            }
        }
        stage('AI service tests') {
            steps {
                sh '''
                    docker run --rm --user "$(id -u):$(id -g)" -e HOME=/tmp \
                      -v "$PWD/ai-service":/app -w /app $PY_IMAGE \
                      sh -c "pip install --user -q -r requirements.txt && python -m pytest -q"
                '''
            }
        }

        // ---------- Runs only after a merge into main ----------
        stage('Build images') {
            when { branch 'main' }
            steps {
                sh '''
                    # 1. Copy the code to app-vm (the .env file of app-vm is never touched)
                    rsync -az --delete \
                      --exclude '.git' --exclude 'node_modules' --exclude '.env' --exclude '.keys' \
                      -e "ssh $SSH_OPTS" ./ $APP_USER@$APP_HOST:$APP_DIR/
                    # 2. Build the 3 images on app-vm
                    ssh $SSH_OPTS $APP_USER@$APP_HOST "cd $APP_DIR && docker compose build"
                '''
            }
        }

        stage('Deploy') {
            when { branch 'main' }
            steps {
                sh 'ssh $SSH_OPTS $APP_USER@$APP_HOST "cd $APP_DIR && docker compose up -d --remove-orphans"'
            }
        }

        stage('Verify deployment') {
            when { branch 'main' }
            steps {
                // Checks run ON app-vm: the backend and AI ports are bound to 127.0.0.1 there
                sh '''
                    ssh $SSH_OPTS $APP_USER@$APP_HOST bash -s -- "$APP_DIR" <<'REMOTE'
                    set -e
                    cd "$1"
                    echo "Waiting for the backend to become healthy..."
                    for i in $(seq 1 40); do
                      status=$(docker inspect -f '{{.State.Health.Status}}' smartstudy-backend 2>/dev/null || echo starting)
                      [ "$status" = "healthy" ] && break
                      sleep 5
                    done
                    docker compose ps
                    curl -fsS http://localhost:5000/api/health && echo
                    curl -fsS http://localhost:8000/health && echo
                    curl -fsS -o /dev/null http://localhost:3000/ && echo "frontend OK"
REMOTE
                '''
                // End-to-end test through the public entry point of the application
                sh '''
                    docker run --rm --network host -e BASE_URL=http://$APP_HOST:3000 \
                      -v "$PWD/scripts":/scripts $NODE_IMAGE node /scripts/integration-test.js
                '''
            }
        }
    }

    post {
        failure {
            sh 'ssh $SSH_OPTS $APP_USER@$APP_HOST "cd $APP_DIR && docker compose logs --tail=80" || true'
        }
    }
}