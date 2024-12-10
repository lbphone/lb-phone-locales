# Contributing Guide

Thank you for contributing to this repository!
This repository holds the locale files for lb-phone script. To maintain consistency and quality, please adhere to the following guidelines.

---

## General Guidelines

1. **Follow the `en.json` Structure**  
    All locale files must follow the structure defined in the [`en.json`](https://github.com/lbphone/lb-phone-locales/blob/main/en.json) file. This ensures uniformity across translations.

    - Keys and their hierarchy should match exactly.

2. **Indentation**  
    Use **4 spaces** for indentation in all JSON files.

3. **One File per Commit**  
    Each commit should only include changes to a single locale file. This makes it easier to review and track changes.

    - If you are updating multiple locale files, separate the changes into distinct commits.

---

## How to Contribute

### 1. Fork and Clone the Repository
    - Fork the repository to your GitHub account.
    - Clone the forked repository to your local machine:
      ```bash
      git clone https://github.com/your-username/lb-phone-locales.git
      ```

### 2. Create a New Branch (optional - best practice)
    - Create a branch for your contribution:
        ```bash
        git checkout -b update-locale-[locale-code]
        ```
        Replace `[locale-code]` with the locale you are working on (e.g., `fr` for French).

### 3. Make Your Changes
    - Update the locale file following the structure of `en.json`.
    - Validate the JSON file to ensure there are no syntax errors.

### 4. Commit Your Changes
    - Commit the changes with a descriptive message:
        ```bash
        git add path/to/locale.json
        git commit -m "Update locale for [locale-code]"
        ```

### 5. Push and Create a Pull Request
    - Push your branch to your forked repository:
        ```bash
        git push origin update-locale-[locale-code]
        ```
    - Open a pull request (PR) to the main repository.

---

## Pull Request Requirements

1. **Describe Your Changes**  
    Clearly describe the updates made in your PR. For example:
    ```
    Updated `fr.json` to include translations for new keys added in `en.json`.
    ```

2. **Pass All Checks**  
    Ensure your contribution:
    - Adheres to the `en.json` structure.
    - Uses 4-space indentation.
    - Includes only one file change per commit.

---

## Questions or Issues?
If you have any questions or run into any issues, feel free to open a GitHub issue or reach out to us on our discord guild: https://discord.gg/lbphone.

We appreciate your contributions! 😊