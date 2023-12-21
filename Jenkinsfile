#!/usr/bin/env groovy

/* Jenkinsfile 0.0.2
 * =================
 * This Jenkinsfile is customized for the building of Node Module Applications,
 * that are pushed to artifactory
 *
 * The following optional build parameters are supported:
 *
 * - recipients : additional people who should be emailed in case of a failed/unstable build
 *
 * Change Log:
 * - 0.0.1
 *   - Initial commit
 * - 0.0.2
 *   - Added a seperate stage for test
 *   - Changed the order of stages
 *   - Moved prune command inside package stage
 */
import hudson.model.*
import hudson.EnvVars
import hudson.model.Fingerprint.RangeSet;

// Checking lock build
//maxArtifacts

// Name of the Zip file that contains everything to be dockerized
def skipTestStage = true

// Purge Jenkins Jobs parameter
def purgeJenkinsJobs = true

// Enable/Disable pollSCM
def poll = false

// Purge TC Libraries from local maven repo
// NOTE:  This assumes that the JAR file extends the Travelclick super pom 1.5.x or higher
def purgeTCJarsFromLocalMavenRepo = false
// Determine if we should deploy to our internal Maven repo
def deployToMavenRepo = false
// Additional people who should be e-mailed in case of a failed/unstable build.
// These are in additional to any recipients supplied via the build parameter 'recipients'
def additionalRecipients = ''
// The artifacts to archive (comma separated if more than one)
def artifactsToArchive = "*.tar.gz"
// Define the tools to be used
//def nodejsHome = "tool nodejs-6.11.3"  //! FIX:  it's not resolving the tool using fixed path for now
def nodejsHome = '/opt/jenkins/jenkins_home/tools/jenkins.plugins.nodejs.tools.NodeJSInstallation/nodejs-16.10.0'

// Define the function that is going to store the function dependencies
def functions


//--------------------------------------------------------------------------
//
// DO NOT MODIFY CODE BELOW THIS POINT
//
//--------------------------------------------------------------------------

node {
    currentBuild.result = "SUCCESS"
    env.PATH = "${nodejsHome}/bin:${env.PATH}"
    functions = load "${env.HOME}/jenkins-tools/groovy/pipelinefunctions.groovy"

    //Add timestamps to console output
    timestamps {

        try{
          /**
           * Checkout the Code from SCM
           */

            stage("checkout"){
                checkout scm
            } //End of Stage

            //Load additional environment variables and run stages within this context
            withEnv(
              // Pulls the Pipeline environment from pipeline depedency
                functions.loadNodePipelineBuildEnv()
            ){

            	/**
                 * Install dependencies
                 */
            	stage("install"){
                    // pollscm if polling is enabled
                    if(poll) {
                        properties([pipelineTriggers([pollSCM('* * * * *')])])
                    }

                    // Build and artifact purge options. Keeps builds that are marked as keep forever.
                    properties([[$class: 'BuildDiscarderProperty', strategy:
                    [$class: 'LogRotator', artifactNumToKeepStr: '10', numToKeepStr: '20']]]);

                    // Commands to execute Build
                    // Print out relevant build information
                    sh 'node --version'
                    // Install dependencies
                    sh 'npm install'
                    sh 'npm update'
                    //update the version attribute in package.json using either
                    //semantic version (x.x.x-build) or update the patch part
                    //of the version property with the build (x.x.build)
                    //lastly, since its a module, allow it to be published
                    functions.setSemanticVersionInPackageJSONVersion(false)
                    //functions.setBuildAsPatchVersionInPackageJSON(false)                    
                } //End of Stage


                /**
                 * Compile the Code
                 */
                stage("build"){
                    // Build
                    sh 'npm run build'
                }


                /**
                 * Run All Unit Tests
                 */
                if (!skipTestStage){
                	stage("test"){
                        sh 'npm test'
                    }
                }


                /**
                 * package the files, Moved prune command inside package
                 */
                stage("package"){
                    sh 'npm prune --production'
                    dir('dist'){
                        sh "version-file.py -repotype git"
                        sh "rm -f ../${MODULE_NAME}-*.tar.gz"
                        sh "tar -cvzf ../${MODULE_NAME}-${env.BUILD_NUMBER}.tar.gz *"
                    }
                } //End of Stage


                /**
                 * Archive the files (e.g. push to artifactory)
                 */
                stage("archive"){
                  //make sure the .npmrc file is set
                  functions.setNPMRC()
                  //publish the module
                   functions.publishNPMModule()
                  //archive in jenkins
                  archiveArtifacts artifacts: artifactsToArchive, fingerprint: true
                } //End of Stage

            }//of withEnv
        }catch(exc){
            currentBuild.result = "FAILURE"
            throw exc
        }finally{
            //Build the recipient list and and notify of the UNSTABLE/FAILURE status
            def to = emailextrecipients([
                            [$class: 'CulpritsRecipientProvider'],
                            [$class: 'DevelopersRecipientProvider'],
                            [$class: 'RequesterRecipientProvider'],
                            [$class: 'FirstFailingBuildSuspectsRecipientProvider'],
                            [$class: 'FailingTestSuspectsRecipientProvider']
                        ])
            if(currentBuild.result == 'FAILURE' || currentBuild.result == 'UNSTABLE'){
                functions.notify(currentBuild.result, to)
            }else if (!hudson.model.Result.SUCCESS.equals(currentBuild.rawBuild.getPreviousBuild()?.getResult())) {
                functions.notify('Back to Normal', to)
            }

        } //end of try/catch/finally
    }
} // End of node
