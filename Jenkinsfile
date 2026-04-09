pipeline {
    agent any

    environment {
       
        DOCKER_HOST    = "tcp://127.0.0.1:2375" 
        
        DOCKER_USER    = "sreytoch12" 
        APP_NAME       = "foodexpress-api"
        IMAGE_NAME     = "${DOCKER_USER}/foodexpress-api"
        IMAGE_TAG      = "${BUILD_NUMBER}"
        
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
                    

                    bat "\"C:\\terraform\\terraform.exe\" init"
                    bat "\"C:\\terraform\\terraform.exe\" apply -auto-approve"
                    
                    script {
                        
                        def ip = bat(script: "\"C:\\terraform\\terraform.exe\" output -raw public_ip", returnStdout: true).trim()
                        env.PUBLIC_IP = ip
                    }
                }
            }
        }
    }

    post {
        success {
            echo "SUCCESS! FoodExpress is LIVE at: http://${env.PUBLIC_IP}:3000"
        }
        failure {
            echo "Pipeline failed. Check the logs above for syntax or connection errors."
        }
        always {
            bat "docker image prune -f"
        }
    }
}