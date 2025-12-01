# Practice Exam Studio

Practice Exam Studio is a powerful, local-first web application designed to help you master any subject. Create question banks, generate questions from text or images using AI, and simulate real exam environments with detailed tracking and history.

## Features

*   **AI-Powered Parsing:** Paste text or upload images/PDFs to automatically generate formatted questions using Google Gemini.
*   **Flexible Question Types:** Supports Single Choice, Multiple Choice, Dropdowns (Hot Area), and Drag & Drop.
*   **Exam Simulation:** Take exams with randomized options, flags, and immediate or delayed feedback.
*   **History & Analytics:** Track your scores and review past performance.
*   **Local Storage:** All data is saved locally in your browser—no external database required.

---

## Prerequisites

Before running this application, you must have **Node.js** installed.

1.  **Get Node.js:** Go to [nodejs.org](https://nodejs.org/) and download the "LTS" (Long Term Support) version for your operating system.
2.  **Get an API Key (Optional):** Required only if you want to generate questions using AI. See the section below.

---

## 🔑 Getting Your Gemini API Key (For AI Features)

To use the AI features (like generating questions from images or text), this application requires a **Gemini API Key**. You can obtain this key for free via the **Google AI Studio** dashboard.

**Note:** If you only plan to manually create questions or import existing JSON files, you can skip this step.

1.  **Get the Key:** Visit the [Google AI Studio API Key Manager](https://aistudio.google.com/app/apikey).
2.  **Sign in** with your Google account.
3.  Click **"Create API key"**.
4.  Select **"Create API key in new project"** (or use an existing project).
5.  **Copy the key** string (it starts with `AIza...`).

---

## Installation Guide

### 🪟 Windows

1.  **Download the Code:**
    *   If you downloaded a ZIP: Right-click the zip file and select "Extract All".
    *   If using Git: Open **Git Bash** (recommended) or Command Prompt and run:
        ```bash
        git clone https://github.com/jdm6457/PracticeExamStudio.git
        ```
2.  **Open the Terminal:**
    *   Open the folder where you extracted/cloned the files.
    *   Click the address bar at the top of the folder window, type `cmd`, and press Enter.
3.  **Install Dependencies:**
    *   Type the following command and press Enter:
        ```bash
        npm install
        ```

### 🍎 macOS / 🐧 Linux

1.  **Download the Code:**
    *   Download and unzip the file, or use `git clone https://github.com/jdm6457/PracticeExamStudio.git`.
2.  **Open Terminal:**
    *   Open your Terminal app.
    *   Navigate to the project folder: `cd path/to/PracticeExamStudio`
3.  **Install Dependencies:**
    *   Run the command:
        ```bash
        npm install
        ```

---

## Configuration

To enable the AI features, you must save your API Key in a configuration file.

1.  In the project root folder (where `package.json` is), create a new file named `.env`.
2.  Open this file with a text editor (Notepad, TextEdit, VS Code).
3.  Paste your API key in this format:
    ```env
    API_KEY=AIzaSyYourActualApiKeyGoesHere
    ```
4.  Save the file.

---

## Running the Application

Once installed, you can start the app.

1.  In your terminal/command prompt, run:
    ```bash
    npm start
    ```
2.  The terminal will show a local address (usually `http://localhost:3000`).
3.  Open your web browser and visit that address.

**Note on Data:** Your Question Banks and History are saved automatically to your browser's internal database (IndexedDB). You can close the server or restart your computer, and your data will persist.

## Troubleshooting

*   **"npm is not recognized"** (Windows) or **"zsh: command not found: npm"** (macOS): This means Node.js isn't installed. Download and install it from [nodejs.org](https://nodejs.org/), then restart your terminal.
*   **AI features aren't working:** Double-check your `.env` file. Ensure there are no spaces around the `=` sign and that the file is named exactly `.env` (not `.env.txt`).
*   **Port already in use:** If the terminal says the port is busy, press `Y` (Yes) to run on a different port.
*   **Blank Screen on Windows:** Ensure you ran `npm install` successfully. Check the browser console (F12) for errors.
*   **Firewall Popup:** On Windows, allow Node.js to communicate on Private networks if prompted.

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.