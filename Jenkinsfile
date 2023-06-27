pipeline {
  environment {
    GIT_URL = "git@150.129.147.154:web/node/morluxury-backend.git"
    PROJECT_NAME = "morluxury-api"
    PROJECT_PATH = "/home/developer/node-projects"
    SERVER_SSH_CRED = "contabo-development-key"
    ANSIBLE_EXEC_PATH_NAME = "ansible"
    GIT_SSH_PRIVATE_KEY_PATH = "/home/developer/.ssh/development_git"
    SONAR_HOST = "http://172.16.10.158:9005"
    SONARQUBE_KEY = "Jenkins-SonarQube-Key"
    MS_TEAMS_WEBHOOK_URL = "webhook_url_web_channel"
    GIT_COMMIT_MSG = sh (script: """git log -1 --pretty=%B ${GIT_COMMIT}""", returnStdout:true).trim()
  }
  agent any
  options {
        ansiColor('xterm')
        buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '30', numToKeepStr: '15')
        disableConcurrentBuilds()
  }
  stages {
    stage('CodeQuality Check via SonarQube') {
          steps {
            catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE'){ 
              withSonarQubeEnv(credentialsId: "${SONARQUBE_KEY}", installationName: 'Codiant SonarQube') {
              script {
              def gradleHome = tool 'GradleOnline';
              def scannerHome = tool 'SonarOnline';
              withSonarQubeEnv("Codiant SonarQube") {
              sh "${tool("SonarOnline")}/bin/sonar-scanner -X \
              -Dsonar.projectKey=${env.PROJECT_NAME}:${env.BRANCH_NAME} \
              -Dsonar.host.url=${env.SONAR_HOST}"
                }
              }
            }
          }
          }
    }
    stage('Deploy') {
      steps {
        script{
          try {
            echo "=========> Do you want to update or add environment variables in .env file...? "
            timeout(time:30, unit:'SECONDS') {
              env.ENV_FILE = input message: "update or add environment variables",
              parameters: [choice(name: 'Do you want to update or add env variables?', choices: 'yes\nno', description: 'Choose "yes" to update or add file')] 
            }
            if("${env.ENV_FILE}" == 'yes'){
              echo "=========> Please enter environment variables. "
              timeout(time:30, unit:'SECONDS') {
              env.userInputTxt = input(
              id: 'inputTextbox',
              message: 'Please enter environment variables..',
              parameters: [
                [$class: 'TextParameterDefinition', description: 'Environment Variables',name: 'input']
              ])
              }
            }
        }catch(err){
          env.ENV_FILE = 'no'
          env.userInputTxt = 'null'
        }}
        ansiblePlaybook(
          credentialsId: "${env.SERVER_SSH_CRED}", 
          installation: "${env.ANSIBLE_EXEC_PATH_NAME}",
          playbook: 'ansible/app_deploy.yml',
          inventory: 'ansible/hosts',
          colorized: true,
          extraVars: [
            git_repo: "${env.GIT_URL}",
            project_path: "${env.PROJECT_PATH}",
            project_name: "${env.PROJECT_NAME}-${env.BRANCH_NAME}",
            git_branch: "${env.BRANCH_NAME}",
            key_file: "${env.GIT_SSH_PRIVATE_KEY_PATH}",
            envfile_content: "${env.userInputTxt}",
            envfile_option: "${env.ENV_FILE}"
         ]
        )
      }
    }    
  }

  post {
      always {
          withCredentials(bindings: [string(credentialsId: "${MS_TEAMS_WEBHOOK_URL}", variable: 'TEAMS_WEBHOOK_URL_CPANEL')]) {
              office365ConnectorSend webhookUrl: "${TEAMS_WEBHOOK_URL_CPANEL}",
              color: "${currentBuild.currentResult} == 'SUCCESS' ? '00ff00' : 'ff0000'",
              factDefinitions:[        
                [ name: "Commit Message", template: "${env.GIT_COMMIT_MSG}"]
              ]
              }
        }
  }
}
