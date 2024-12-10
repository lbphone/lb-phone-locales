const fs = require('fs');
const path = require('path');

function validateJsonFile(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(fileContent);

        const checkKeys = (obj, parentKey = '') => {
            for (const key of Object.keys(obj)) {
                if (!/^[A-Z0-9_-]+$/.test(key)) {
                    throw new Error(
                        `Key '${parentKey}${key}' in file '${filePath}' is not in uppercase or contains invalid characters.`
                    );
                }
                if (typeof obj[key] === 'object' && obj[key] !== null && key !== 'APP_NAMES') {
                    checkKeys(obj[key], `${key}.`);
                }
            }
        };
        checkKeys(json);

        console.log(`\x1b[32mFile '${filePath}' passed all checks.\x1b[0m`);
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

let files = process.argv.slice(2);

if (files.length === 0) {
    const parentDir = path.resolve(__dirname, '../../');

   
    fs.readdir(parentDir, (err, allFiles) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        const jsonFiles = allFiles.filter(file => file.endsWith('.json'));

        jsonFiles.forEach((file) => {
            console.log(`\x1b[34mChecking ${file}\x1b[0m`);
            validateJsonFile(path.resolve(parentDir, file));
        });
    });
} else {
    files.forEach((file) => {
        if (file.endsWith('.json')) {
            console.log(`\x1b[34mChecking ${file}\x1b[0m`);
            validateJsonFile(path.resolve(file));
        }
    });
}