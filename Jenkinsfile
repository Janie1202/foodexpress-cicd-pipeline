pipeline {
    agent any

    environment {
        APP_NAME    = "foodexpress-api"
        IMAGE_NAME  = "foodexpress-api"
        IMAGE_TAG   = "${BUILD_NUMBER}"
        CONTAINER_NAME = "foodexpress-container"
        APP_PORT    = "3000"
        HOST_PORT   = "3000"
    }

    triggers {
        // Triggered automatically by GitHub Webhook
        githubPush()
    }

    stages {

        // Stage 1: Checkout 
        stage("Checkout") {
            steps {
                echo "Cloning repository..."
                checkout scm
            }
        }

        // Stage 2: Install Dependencies 
        stage("Install Dependencies") {
            steps {
                echo "Installing Node.js dependencies..."
                sh "npm install"
            }
        }

        // Stage 3: Run Tests
        stage("Run Tests") {
            steps {
                echo "Running unit tests..."
                sh "npm test"
            }
        }

        // ── Stage 4: Build Docker Image ────────────────────────────────────
        stage("Build Docker Image") {
            steps {
                echo "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
            }
        }

        // ── Stage 5: Stop & Remove Old Container ──────────────────────────
        stage("Remove Old Container") {
            steps {
                echo "Removing old container if it exists..."
                sh """
                    docker stop ${CONTAINER_NAME} || true
                    docker rm   ${CONTAINER_NAME} || true
                """
            }
        }

        // ── Stage 6: Deploy New Container ─────────────────────────────────
        stage("Deploy") {
            steps {
                echo "Deploying new container..."
                sh """
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        --restart unless-stopped \
                        -p ${HOST_PORT}:${APP_PORT} \
                        ${IMAGE_NAME}:latest
                """
            }
        }

        // ── Stage 7: Health Check ──────────────────────────────────────────
        stage("Health Check") {
            steps {
                echo "Waiting for container to start..."
                sh "sleep 5"
                sh """
                    curl -f http://localhost:${HOST_PORT}/ || \
                    (echo 'Health check FAILED' && exit 1)
                """
                echo "Application is healthy and running!"
            }
        }

    }

    // ── Post Actions ───────────────────────────────────────────────────────────
    post {
        success {
            echo "Pipeline completed successfully! FoodExpress API is live."
            echo "Access at: http://<YOUR_EC2_PUBLIC_IP>:${HOST_PORT}/api/menu"
        }
        failure {
            echo "Pipeline FAILED. Check logs above for details."
            // Optional: add email/Slack notification here
        }
        always {
            echo "Cleaning up dangling Docker images..."
            sh "docker image prune -f || true"
        }
    }
}
