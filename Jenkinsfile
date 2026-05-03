pipeline {
    agent any

    environment {
        DOCKER_USER      = "sreytoch12"
        APP_NAME         = "foodexpress-api"
        IMAGE_NAME       = "${DOCKER_USER}/foodexpress-api"
        IMAGE_TAG        = "${BUILD_NUMBER}"

        DOCKER_HUB_CREDS = credentials('docker-hub-creds')
        AWS_ACCESS_KEY_ID     = credentials('aws-creds-key')
        AWS_SECRET_ACCESS_KEY = credentials('aws-creds-secret')
        SONAR_TOKEN      = credentials('sonar-token')
    }

    stages {

        stage("Checkout") {
            steps {
                checkout scm
            }
        }

        stage("SonarQube Analysis") {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube-Server') {
                        sh "${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=foodexpress \
                            -Dsonar.sources=. \
                            -Dsonar.exclusions=node_modules/**,Terraform/**"
                    }
                }
            }
        }

        stage("Quality Gate") {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage("Trivy Scan Code") {
            steps {
                echo "Scanning source code for vulnerabilities..."
                sh """
                    docker run --rm \
                        -v \${WORKSPACE}:/workspace \
                        aquasec/trivy:canary fs \
                        --format table \
                        --exit-code 1 \
                        --severity HIGH,CRITICAL \
                        /workspace
                """
            }
        }

        stage("Build Docker Image") {
            steps {
                echo "Building Docker image..."
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
            }
        }

        stage("Trivy Scan Image") {
            steps {
                echo "Scanning Docker image for vulnerabilities..."
                sh """
                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:canary image \
                        --format table \
                        --exit-code 1 \
                        --severity HIGH,CRITICAL \
                        ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage("Push to Docker Hub") {
            steps {
                echo "Logging into Docker Hub..."
                sh "echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin"
                echo "Pushing image..."
                sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${IMAGE_NAME}:latest"
            }
        }

        stage("Terraform - Provision EC2") {
            steps {
                dir('Terraform') {
                    script {
                        sh "terraform init"
                        sh "terraform apply -auto-approve"

                        def ip = sh(
                            script: "terraform output -raw public_ip",
                            returnStdout: true
                        ).trim()
                        env.PUBLIC_IP = ip
                        echo "EC2 Public IP: ${env.PUBLIC_IP}"
                    }
                }
            }
        }

        stage("Remote Deploy") {
            steps {
                echo "Waiting for EC2 to initialize..."
                sh "sleep 60"

                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${env.PUBLIC_IP} '
                            sudo docker pull ${IMAGE_NAME}:latest
                            sudo docker stop ${APP_NAME} || true
                            sudo docker rm ${APP_NAME} || true
                            sudo docker run -d \
                                --name ${APP_NAME} \
                                -p 3000:3000 \
                                ${IMAGE_NAME}:latest
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo "==============================================="
            echo "SUCCESS! FoodExpress is LIVE at:"
            echo "http://${env.PUBLIC_IP}:3000"
            echo "==============================================="
        }
        failure {
            echo "Pipeline FAILED."
            echo "Check SonarQube Quality Gate or Trivy scan logs above."
        }
        always {
            sh "docker image prune -f"
        }
    }
}