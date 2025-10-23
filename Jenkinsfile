pipeline {
    agent any // Run on any available Jenkins agent/node

    // Environment variables needed for the pipeline
    environment {
        // Use credentials stored securely in Jenkins for AWS access
        // These IDs will need to be configured in Jenkins Credentials manager
        AWS_CREDS = credentials('aws-credentials-for-ecr')
        AWS_REGION = 'us-east-1' // e.g., 'us-east-1', 'ap-south-1'
        ECR_REGISTRY = '619071310531.dkr.ecr.us-east-1.amazonaws.com' // e.g., '123456789012.dkr.ecr.us-east-1.amazonaws.com'
        BACKEND_IMAGE_NAME = 'codesync-backend'
        FRONTEND_IMAGE_NAME = 'codesync-frontend'
        // Use Jenkins build number or Git commit hash for tagging
        IMAGE_TAG = "${env.BUILD_NUMBER}-${GIT_COMMIT.take(7)}"
        // Backend URL needed for frontend build (use localhost for now, replace in CD)
        // Or determine dynamically if needed
        VITE_BACKEND_URL_BUILD_ARG = 'http://localhost:3000' // Placeholder for CI build
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                // Jenkins automatically checks out the code associated with the build
                checkout scm
            }
        }

        stage('Run Tests (Placeholder)') {
            steps {
                echo 'Skipping tests for now...'
                // Add test commands here later if you have them
                // Example for backend:
                 dir('server') {
                     sh 'npm install'
                     sh 'npm test'
                 }
                // Example for frontend:
                 dir('client') {
                    sh 'npm install'
                    sh 'npm test'
                 }
            }
        }

        stage('Build Backend Image') {
            steps {
                echo "Building backend image: ${ECR_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}"
                // Navigate to the server directory and build
                dir('server') {
                    script {
                        // Use docker.build command provided by Docker Pipeline plugin
                         def backendImage = docker.build("${ECR_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}", ".")
                    }
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                echo "Building frontend image: ${ECR_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}"
                // Navigate to the client directory and build, passing the build arg
                dir('client') {
                    script {
                        // Pass VITE_BACKEND_URL as a build-arg
                        // NOTE: For CI builds, this URL might just be a placeholder if the actual
                        // connection happens at runtime or is configured differently in K8s.
                        // If your frontend needs the *real* backend URL during BUILD time,
                        // you might need a more dynamic way to set VITE_BACKEND_URL_BUILD_ARG.
                         def frontendImage = docker.build("${ECR_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}", "--build-arg VITE_BACKEND_URL=${VITE_BACKEND_URL_BUILD_ARG} .")
                    }
                }
            }
        }

        stage('Push Images to ECR (Placeholder)') {
            // This stage requires AWS credentials configured in Jenkins
            // and the ECR repositories to exist.
            steps {
                echo "Logging into AWS ECR..."
                script {
                    // Use the AWS credentials stored in Jenkins
                    // The withAWS block handles temporary credentials/login
                    // Requires the 'Pipeline: AWS Steps' plugin in Jenkins
                    withAWS(credentials: 'aws-credentials-for-ecr', region: env.AWS_REGION) {
                        // Get ECR login command and execute it
                        def login = sh(script: "aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.ECR_REGISTRY}", returnStdout: true).trim()
                        echo "ECR Login command executed." // Log success, avoid logging the password itself

                        echo "Pushing Backend Image..."
                         docker.image("${ECR_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}").push()

                        echo "Pushing Frontend Image..."
                         docker.image("${ECR_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}").push()
                    }
                }
            }
        }

        // --- Add CD Stage Here Later ---
        // stage('Deploy to EKS') { ... }

    } // End stages

    post {
        always {
            echo 'Pipeline finished.'
            // Clean up workspace, etc.
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
            // Send notifications, etc.
        }
        failure {
            echo 'Pipeline failed!'
            // Send error notifications, etc.
        }
    } // End post
} // End pipeline
