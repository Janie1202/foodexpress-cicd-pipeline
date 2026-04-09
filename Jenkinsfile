pipeline {
    agent any

    environment {
        DOCKER_USER    = "sreytoch12" 
        APP_NAME       = "foodexpress-api"
        IMAGE_NAME     = "${DOCKER_USER}/foodexpress-api"
        IMAGE_TAG      = "${BUILD_NUMBER}"
        CONTAINER_NAME = "foodexpress-container"
        APP_PORT       = "3000"
        
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials') 
        AWS_CREDS        = credentials('aws-credentials')
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
                // Use 'bat' for Windows
                bat "docker build -t %IMAGE_NAME%:%IMAGE_TAG% ."
                bat "docker tag %IMAGE_NAME%:%IMAGE_TAG% %IMAGE_NAME%:latest"
                
                echo "Logging into Docker Hub..."
            
                bat "echo %DOCKER_HUB_CREDS_PSW% | docker login -u %DOCKER_HUB_CREDS_USR% --password-stdin"
                
                echo "Pushing Image..."
                bat "docker push %IMAGE_NAME%:%IMAGE_TAG%"
                bat "docker push %IMAGE_NAME%:latest"
            }
        }

        stage("Terraform & Deploy") {
            steps {
                dir('terraform') {
                    bat "terraform init"
                    bat "terraform apply -auto-approve"
                    script {
                        // Capture IP on Windows
                        env.PUBLIC_IP = bat(script: "terraform output -raw public_ip", returnStdout: true).trim()
                    }
                }
                echo "Deployment instructions would go here for ${env.PUBLIC_IP}"
            }
        }
    }

    post {
        success {
            echo "Pipeline completed! Access app at http://%PUBLIC_IP%:3000"
        }
        failure {
            echo "Pipeline failed. Check the console logs above."
        }
        always {
            
            bat "docker image prune -f"
        }
    }
}