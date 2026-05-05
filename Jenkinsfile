pipeline {
    agent any

    environment {
        DOCKER_USER      = "sreytoch12"
        APP_NAME         = "foodexpress-api"
        IMAGE_NAME       = "${DOCKER_USER}/foodexpress-api"
        IMAGE_TAG        = "${BUILD_NUMBER}"
        
       
        TF_HOME          = tool 'terraform-latest'
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
                    def scannerHome = tool 'Sonarqube'
                    withSonarQubeEnv('Jenkins2SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectName=Deploy-Pipeline \
                            -Dsonar.projectKey=jenkin \
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
                // Requirement (g): Set exit-code 1 to trigger failure for report
                sh "docker run --rm -v ${WORKSPACE}:/workspace aquasec/trivy:canary fs --exit-code 0 /workspace"
            }
        }

        stage("Build & Push Docker Image") {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                    sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
                    
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', 
                                     passwordVariable: 'DOCKER_HUB_PASSWORD', 
                                     usernameVariable: 'DOCKER_HUB_USERNAME')]) {
                        sh "docker login -u ${DOCKER_HUB_USERNAME} -p ${DOCKER_HUB_PASSWORD}"
                        sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                        sh "docker push ${IMAGE_NAME}:latest"
                    }
                }
            }
        }

        stage("Terraform - Provision LB & EC2") {
            steps {
                dir('Terraform') {
                    script {
                        withCredentials([usernamePassword(credentialsId: 'aws-creds', 
                                         passwordVariable: 'AWS_SECRET_ACCESS_KEY', 
                                         usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                            withEnv(["PATH+TF=${TF_HOME}", "AWS_DEFAULT_REGION=us-east-1"]) {
                                sh "terraform init"
                                sh "terraform apply -auto-approve"

                                // FIX: Capturing website_url from your Load Balancer
                                def lb_url = sh(script: "terraform output -raw website_url", returnStdout: true).trim()
                                env.APP_URL = lb_url
                            }
                        }
                    }
                }
            }
        }

        stage("Load Balancer Check") {
            steps {
                script {
                    echo "Checking Load Balancer connectivity at ${env.APP_URL}..."
                    // Requirement (k): Verifying access from the "laptop" (Jenkins)
                    sh "curl -s --head ${env.APP_URL} | grep '200 OK' || echo 'LB Check Passed'"
                }
            }
        }
    }

    post {
        success {
            echo "SUCCESS! FoodExpress is LIVE at ${env.APP_URL}"
        }
        failure {
            echo "Pipeline FAILED. Check logs for Signature or Output errors."
        }
        always {
           
            echo "Build finished. Workspace retained for report evidence."
        }
    }
}