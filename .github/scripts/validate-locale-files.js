const fs = require('fs');
const path = require('path');

const parentDir = __dirname.includes('scripts') ? path.resolve(__dirname, '../../') : __dirname;
const enJson = JSON.parse(fs.readFileSync(path.join(parentDir, 'en.json'), 'utf-8'));

function validateEnJsonFile(fileName) {
    try {
        const fileContent = fs.readFileSync(path.resolve(parentDir, fileName), 'utf8');
        const json = JSON.parse(fileContent);

        const checkKeys = (obj, parentKey = '') => {
            for (const key of Object.keys(obj)) {
                if (!/^[A-Z0-9_-]+$/.test(key)) {
                    throw new Error(
                        `Key '${parentKey}${key}' in file '${fileName}' is not in uppercase or contains invalid characters.`
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

function validateJsonFile(fileName, skipRecap) {
    try {
        const fileContent = fs.readFileSync(path.resolve(parentDir, fileName), 'utf8');
        const json = JSON.parse(fileContent);

        const placeholderRegex = /{[\w.]+}/g;
        const missingKeys = [];
        const brokenTranslations = [];

        const checkEntries = (obj1, obj2, parentKey = '') => {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);

            for (const key of keys1) {
                if (!keys2.includes(key)) {
                    missingKeys.push(`${parentKey}${key}`);
                }

                if (typeof obj1[key] === 'string' && typeof obj2[key] === 'string') {
                    const translation1 = obj1[key];
                    const translation2 = obj2[key];
            
                    // Extract placeholders from both translations
                    const placeholders1 = translation1.match(placeholderRegex) || [];
                    const placeholders2 = translation2.match(placeholderRegex) || [];
            
                    // Compare placeholders
                    const missingInTranslation2 = placeholders1.filter(ph => !placeholders2.includes(ph));

                    // Check for mismatched placeholder text
                    const mismatchedPlaceholders = placeholders1.filter(ph1 => 
                        placeholders2.some(ph2 => ph1 !== ph2 && ph1.slice(1, -1) === ph2.slice(1, -1))
                    );

                    if (missingInTranslation2.length > 0 || mismatchedPlaceholders.length > 0) {
                        brokenTranslations.push({
                            key: `${parentKey}${key}`,
                            missingInTranslation2,
                            mismatchedPlaceholders,
                            translation1,
                            translation2,
                        });
                    }
                }

                if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
                    checkEntries(obj1[key], obj2[key], `${parentKey}${key}.`);
                }
            }
        };

        checkEntries(enJson, json);

        if (missingKeys.length > 0 || brokenTranslations.length > 0) {
            if (!skipRecap) {
                if (missingKeys.length > 0) {
                    console.error(`\x1b[31mThe following keys are missing in the second file '${fileName}':\x1b[0m`);
                    missingKeys.forEach((key) => {
                        console.error(`- ${key}`);
                    });
                }

                if (brokenTranslations.length > 0) {
                    console.error(`\x1b[31mThe following keys have mismatched placeholders in '${fileName}':\x1b[0m`);
                    brokenTranslations.forEach(({ key, missingInTranslation2, mismatchedPlaceholders, translation1, translation2 }) => {
                        console.error(`- Key: ${key}`);
                        console.error(`  - In '${fileName}': \x1b[33m${translation2}\x1b[0m`);
                        console.error(`  - In 'en.json': \x1b[33m${translation1}\x1b[0m`);
                        if (missingInTranslation2.length > 0) {
                            console.error(`  - Missing in '${fileName}': \x1b[31m${missingInTranslation2.join(', ')}\x1b[0m`);
                        }
                        if (mismatchedPlaceholders.length > 0) {
                            console.error(`  - Mismatched placeholders: \x1b[31m${mismatchedPlaceholders.join(', ')}\x1b[0m`);
                        }
                    });
                }
            }
            throw new Error(`Missing: ${missingKeys.length} keys, Mismatched: ${brokenTranslations.length} placeholders`);
        }

        console.log(`\x1b[32mFile '${fileName}' passed all checks.\x1b[0m`);
        return true;
    } catch (error) {
        const padding = Math.max(0, 10 - fileName.length);
        console.error(`\x1b[31mAn error occurred: File '${fileName}' did not pass the checks:\x1b[0m${' '.repeat(padding)}`, error.message);
        process.exitCode = 1;
        return false;
    }
}

function updateReadMeFile(localesStatuses) {
    let fileContent;

    const filePath = path.resolve(parentDir, './README.md');
    try {
        fileContent = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        console.error('Unable to open README.md:', err.message);
        process.exit(1);
    }

    const regex = /- (✅|❌) \*\*(.*?)\*\* \(Base Locale\)/;
    const enEntry = fileContent.match(regex);

    let updatedLocales = [enEntry ? enEntry[0] : '- ✅ **en.json** (Base Locale)'];

    localesStatuses.forEach((isUpToDate, fileName) => {
        const icon = isUpToDate ? '✅' : '❌';
        const displayName = `**${fileName}**`;
        updatedLocales.push(`- ${icon} ${displayName}`);
    });
    
    const totalLocales = [...localesStatuses.values()].length + 1;
    const upToDateLocales = [...localesStatuses.values()].filter(Boolean).length + 1;
    const summary = `*${upToDateLocales}/${totalLocales} locales up to date*`;
    
    let newFileContent = fileContent.replace(
        /## Locales Status:[\s\S]*?<!-- Recap End -->/g,
        `## Locales Status:\n${summary}\n${updatedLocales.join('\n')}\n<!-- Recap End -->`
    );

    if (newFileContent === fileContent && !fileContent.includes('## Locales Status:')) newFileContent += (
        `\n\n## Locales Status:\n` +
        `${summary}\n${updatedLocales.join('\n')}\n` +
        `<!-- Recap End -->`
    );

    if (newFileContent === fileContent && fileContent.includes('## Locales Status:')) return console.log(
        '\x1b[32mNo Changes brought to \x1b[33mREADME.md\x1b[0m'
    );

    try {
        fs.writeFileSync(filePath, newFileContent);
        console.log('README.md has been successfully updated!');
    } catch (err) {
        console.error('Error writing to README.md:', err);
    }
}

const args = process.argv.slice(2);

const skipVerification = args.includes('--skipdetails');
const updateReadMe = args.includes('--updatereadme');
const files = args.filter(arg => arg.endsWith('.json'));

if (files.length === 0) {
   
    fs.readdir(parentDir, (err, allFiles) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        const jsonFiles = allFiles.filter(file => file.endsWith('.json'));

        const recap = new Map();

        jsonFiles.forEach((file) => {
            switch (file) {
                case 'en.json':
                    validateEnJsonFile(file);
                    break
                default:
                    const status = validateJsonFile(file, skipVerification);
                    recap.set(file, status);
                    break;
            }
        });

        if (updateReadMe) updateReadMeFile(recap);

    });
} else {
    if (updateReadMe) console.warn('cannot use --updatereadme and check individual files');
    files.forEach((file) => {
        console.log(`\x1b[34mChecking ${file}\x1b[0m`);
        switch (file) {
            case 'en.json':
                validateEnJsonFile(path.resolve(parentDir, file));
                break
            default:
                validateJsonFile(file, skipVerification);
                break;
        }
    });
}
