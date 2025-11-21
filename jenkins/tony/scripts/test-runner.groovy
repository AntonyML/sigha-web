def installDependencies() {
    bat 'npm install'
}

def runJestTests() {
    bat 'cmd /c jenkins\\tony\\scripts\\run-tests.bat'
}

def runUnitTests() {
    echo 'Running Jest unit tests for React components'
    bat 'npm run test -- --coverage --passWithNoTests'
}

def runSeleniumTests() {
    echo 'Running Selenium component tests'
    bat '''
        if exist %WORKSPACE%\\tests\\e2e\\selenium (
            cd %WORKSPACE%
            npm run test:e2e
        ) else (
            echo Selenium tests not found, skipping...
        )
    '''
}

def getTestOutput(logFile, maxLines = 500) {
    if (fileExists(logFile)) {
        return readFile(logFile).take(maxLines * 80)
    }
    return "No log file found: ${logFile}"
}

def publishTestResults() {
    junit testResults: '**/test-results/**/*.xml', allowEmptyResults: true
}

return this
