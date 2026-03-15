const fs = require('fs');
const report = JSON.parse(fs.readFileSync('./eslint_report.json', 'utf8'));

report.forEach(fileResult => {
    if (fileResult.errorCount > 0 || fileResult.warningCount > 0) {
        console.log(`\n--- ${fileResult.filePath} ---`);
        fileResult.messages.forEach(msg => {
            console.log(`Line ${msg.line}: ${msg.message} (${msg.ruleId})`);
        });
    }
});
