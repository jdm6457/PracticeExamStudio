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

## 🔑 Getting Your Google Gemini API Key (For AI Features)

This application uses the **Google Gemini API** to intelligently parse your study materials. **If you only plan to import existing JSON question banks, you can skip this step.**

1.  **Go to Google AI Studio:** [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2.  **Sign in** with your Google account.
3.  Click **"Create API key"**.
4.  Select **"Create API key in new project"** (or use an existing one if you have it).
5.  **Copy the key** (it starts with `AIza...`).

*Note: The API is free to use within rate limits, which are generous enough for personal use.*

---

## Installation Guide

### 🪟 Windows

1.  **Download the Code:**
    *   If you downloaded a ZIP: Right-click the zip file and select "Extract All".
    *   If using Git: Open Command Prompt and run `git clone [your-repo-url]`.
2.  **Open the Terminal:**
    *   Open the folder where you extracted the files.
    *   Click the address bar at the top of the folder window, type `cmd`, and press Enter. This opens a black Command Prompt window inside that folder.
3.  **Install Dependencies:**
    *   Type the following command and press Enter:
        ```bash
        npm install
        ```
    *   *Note: This may take a minute or two.*

### 🍎 macOS / 🐧 Linux

1.  **Download the Code:**
    *   Download and unzip the file, or use `git clone`.
2.  **Open Terminal:**
    *   Open your Terminal app.
    *   Navigate to the project folder: `cd path/to/folder`
3.  **Install Dependencies:**
    *   Run the command:
        ```bash
        npm install
        ```

---

## Configuration (Optional)

To enable AI parsing features (generating questions from text/images), configure your API Key.

1.  In the project root folder (where `package.json` is), create a new file named `.env`.
2.  Open this file with a text editor (Notepad, TextEdit, VS Code).
3.  Paste your API key in this format:
    ```env
    API_KEY=AIzaSyYourActualApiKeyGoesHere
    ```
4.  Save the file.

*If you do not create this file, the app will still run, but you will receive errors if you try to use the "Parse Text" or "Upload File" features in the "Add Questions" menu.*

---

## Running the Application

Once installed, you can start the app.

1.  In your terminal/command prompt, run:
    ```bash
    npm start
    ```
    *(Note: If `npm start` fails on Windows, try `npm run dev`)*
2.  The terminal will show a local address (usually `http://localhost:3000` or `http://localhost:1234`).
3.  Open your web browser and visit that address to use the app.

## Troubleshooting

*   **"npm is not recognized":** This means Node.js wasn't installed correctly. Try reinstalling Node.js and restarting your computer.
*   **AI features aren't working:** Double-check your `.env` file. Ensure there are no spaces around the `=` sign and that the file is named exactly `.env` (not `.env.txt`).
*   **Port already in use:** If the terminal says the port is busy, it will usually ask to run on a different port. Press `Y` (Yes) to proceed.
*   **Blank Screen on Windows:** Ensure you are running `npm run dev` if `npm start` does not work, and check your browser console (F12) for errors.