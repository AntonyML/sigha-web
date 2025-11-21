def runJMeterTests() {
    echo 'Running JMeter performance tests on React Frontend (Port 3010)'
    bat '''
        if exist "%WORKSPACE%\\jenkins\\tony\\scripts\\run-jmeter.bat" (
            cmd /c "%WORKSPACE%\\jenkins\\tony\\scripts\\run-jmeter.bat" "3010"
        ) else (
            echo JMeter script not found, skipping performance tests...
        )
    '''
}

def getJMeterResults() {
    def resultsFile = "${WORKSPACE}\\jenkins\\tony\\jmeter-results\\results.jtl"
    if (fileExists(resultsFile)) {
        return readFile(file: resultsFile)
    } else {
        return "[JMeter] No results file found at ${resultsFile} - Performance tests may not have been executed"
    }
}

return this
