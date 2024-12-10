const fs = require('fs');
const path = require('path');

const enJson = JSON.parse(fs.readFileSync('en.json', 'utf-8'));

function validateEnJsonFile(filePath) {
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

        console.log(`\x1b[32mBase Locale: en.json passed all checks.\x1b[0m`);
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

function validateJsonFile(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(fileContent);

        const missingKeys = [];

        const checkKeys = (obj1, obj2, parentKey = '') => {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);

            for (const key of keys1) {
                if (!keys2.includes(key)) {
                    missingKeys.push(`${parentKey}${key}`);
                }

                if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
                    checkKeys(obj1[key], obj2[key], `${parentKey}${key}.`);
                }
            }
        };

        checkKeys(enJson, json);

        if (missingKeys.length > 0) {
            console.error(`\x1b[31mThe following keys are missing in the second file '${filePath}':\x1b[0m`);
            missingKeys.forEach((key) => {
                console.error(`- ${key}`);
            });
            throw new Error(`Key mismatch detected.`);
        }

        console.log(`\x1b[32mFile '${filePath}' passed all checks.\x1b[0m`);
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

let files = process.argv.slice(2);
const parentDir = __dirname.includes('scripts') ? path.resolve(__dirname, '../../') : __dirname;

if (files.length === 0) {
   
    fs.readdir(parentDir, (err, allFiles) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        const jsonFiles = allFiles.filter(file => file.endsWith('.json'));

        jsonFiles.forEach((file) => {
            console.log(`\x1b[34mChecking ${file}\x1b[0m`);
            switch (file) {
                case 'en.json':
                    validateEnJsonFile(path.resolve(parentDir, file));
                    break
                default:
                    validateJsonFile(path.resolve(parentDir, file));
                    break;
            }
        });
    });
} else {
    files.forEach((file) => {
        if (file.endsWith('.json')) {
            console.log(`\x1b[34mChecking ${file}\x1b[0m`);
            switch (file) {
                case 'en.json':
                    validateEnJsonFile(path.resolve(parentDir, file));
                    break
                default:
                    validateJsonFile(path.resolve(parentDir, file));
                    break;
            }
        }
    });
}