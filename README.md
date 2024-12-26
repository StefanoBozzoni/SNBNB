## What is this?

This application is a Chrome extension designed to streamline branch naming for developers working with ServiceNow. It captures the serial number and description of a currently opened task (e.g., a bug or story) in a ServiceNow web page, generates a branch name from this information, and copies it to the clipboard.

You can also use this extension alongside the **Branch Creator** repository to automatically create a branch in a specified folder.

---

## How to Install

1. **Clone the Repository**:
   Clone this repository into a local folder:
   ```bash
   git clone <repository-url>

2. **Load the Extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/` by typing it directly into the browser's address bar.
   - Enable **Developer mode** (toggle the switch in the top-right corner).
   - Click on **Load unpacked** (or "Carica estensione non pacchettizzata" if your Chrome is in Italian).
   - Select the root folder of the cloned repository.

3. **Verify Installation**:
   - If the installation is successful, you will see the extension icon in the Chrome toolbar, located to the right of the URL bar.

---

## How to Use

1. Open a **ServiceNow** web page for a bug or story.
2. Keep the ServiceNow task page open.
3. Click the extension icon in the Chrome toolbar.
4. The extension will:
   - Generate a branch name based on the task's serial number and description.
   - Display the calculated branch name in the last input field of the extension's popup page.
   - Copy the branch name to the system clipboard.

5. Optionally, you can use the **Python Branch Name Creator** application to:
   - Automatically create the new branch in a specified folder.
   
