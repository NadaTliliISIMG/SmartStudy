pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        NODE_IMAGE = 'node:20-slim'
        PY_IMAGE   = 'python:3.12-slim'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // Runs on every branch and every pull request
        stage('Test and validate') {
            parallel {
                stage('Backend') {
                    steps {
                        sh '''
                            docker run --rm --user "$(id -u):$(id -g)" -e HOME=/tmp \
                              -v "$PWD/backend":/app -w /app $NODE_IMAGE \
                              sh -c "npm ci && npm test"
                        '''
                    }
                }
                stage('Frontend') {
                    steps {
                        sh '''
                            docker run --rm --user "$(id -u):$(id -g)" -e HOME=/tmp \
                              -v "$PWD/frontend":/app -w /app $NODE_IMAGE \
                              sh -c "npm ci && npm run build"
                        '''
                    }
                }
                stage('AI service') {
                    steps {
                        sh '''
                            docker run --rm --user "$(id -u):$(id -g)" -e HOME=/tmp \
                              -v "$PWD/ai-service":/app -w /app $PY_IMAGE \
                              sh -c "pip install --user -q -r requirements.txt && python -m pytest -q"
                        '''
                    }
                }
            }
        }

        // The steps below run only after a merge into main
        stage('Build images') {
            when { branch 'main' }
            steps {
                sh 'docker compose build'
            }
        }

        stage('Deploy') {
            when { branch 'main' }
            steps {
                // JWT secret stored in Jenkins as a "Secret text" credential
                withCredentials([string(credentialsId: 'smartstudy-jwt-secret', variable: 'JWT_SECRET')]) {
                    sh 'docker compose up -d --remove-orphans'
                }
            }
        }

        stage('Verify deployment') {
            when { branch 'main' }
            steps {
                sh '''
                    echo "Waiting for the backend to become healthy..."
                    for i in $(seq 1 30); do
                      status=$(docker inspect -f '{{.State.Health.Status}}' smartstudy-backend 2>/dev/null || echo starting)
                      [ "$status" = "healthy" ] && break
                      sleep 5
                    done
                    docker compose ps
                    curl -fsS http://localhost:5000/api/health
                    curl -fsS http://localhost:8000/health
                    curl -fsS -o /dev/null http://localhost:3000/
                '''
                sh '''
                    docker run --rm --network host -v "$PWD/scripts":/scripts $NODE_IMAGE \
                      node /scripts/integration-test.js
                '''
            }
        }
    }

    post {
        failure {
            sh 'docker compose logs --tail=100 || true'
        }
        always {
            sh 'docker compose ps || true'
        }
    }
}