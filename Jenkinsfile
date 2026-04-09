pipeline {
    agent any

    environment {
        DOCKER_USER    = "janie1202" 
        APP_NAME       = "foodexpress-api"
        IMAGE_NAME     = "${DOCKER_USER}/foodexpress-api"
        IMAGE_TAG      = "${BUILD_NUMBER}"
        CONTAINER_NAME = "foodexpress-container"
        APP_PORT       = "3000"
        
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials') 
        AWS_CREDS        = credentials('aws-credentials')
    }

    triggers {
        // trigger from GitHub webhooks
        pollSCM('') 
    }

    stages {
        stage("Checkout") {
            steps {
                checkout scm
            }
        }

        stage("Build & Push Image") {
            steps {
                echo "Building Docker image..."
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
                
                echo "Logging into Docker Hub..."
                sh "echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin"
                
                echo "Pushing Image..."
                sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${IMAGE_NAME}:latest"
            }
        }

        stage("Terraform & Deploy") {
            steps {
                dir('terraform') {
                    sh "terraform init"
                    sh "terraform apply -auto-approve"
                    script {
                       
                        env.PUBLIC_IP = sh(script: "terraform output -raw public_ip", returnStdout: true).trim()
                    }
                }
                echo "Deploying to ${env.PUBLIC_IP}..."
                sh "echo 'Deploying to EC2...'" 
            }
        }
    }

    post {
        success {
            echo "Pipeline completed! Access app at http://${env.PUBLIC_IP}:3000"
        }
        failure {
        
            echo "Pipeline failed. Check the console logs above."
        }
        always {
            sh "docker image prune -f || true"
        }
    }
}