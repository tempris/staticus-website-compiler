# Staticus Website Compiler - GUI

## Overview

This document outlines the details of the GUI application designed to manage and execute Gulp tasks within the Staticus Website Compiler. The GUI provides a user-friendly interface to select project directories and run predefined tasks efficiently.

---

## Prerequisites

Ensure that the **[Staticus Setup Page](./setup.md)** has been followed before running the GUI application.

---

## Manual Terminal Task Execution

Review the **[Staticus Task Page](./task.md)** to find out about manual terminal task execution.

---

## Running the GUI Application

1. **Navigate to the Staticus root directory.**
2. **Execute the script:**
    ```bash
    python gui.py
    ```
3. The application window will launch with the title **"Staticus Website Compiler"**.

---

## User Interface Components

### Project Directory Selection

- **Dropdown Menu:** Lists recently used directories.
- **Browse Button (🔍):** Opens a file dialog to select a directory.
- **Open Button (📂):** Opens the selected directory in the file explorer.
- **Terminal Button (>_):** Opens a terminal window at the selected directory.

| User Action                      | GUI Response                                |
| -------------------------------- | ------------------------------------------- |
| Select a directory from dropdown | Updates configuration and validates content |
| Click "Browse" button            | Opens a dialog to pick a directory          |
| Click "Open" button              | Opens selected directory in file explorer   |
| Click "Terminal" button          | Opens a terminal at the selected location   |

---

### Task Execution

- **Task Buttons:** Each button represents a Gulp task.
- **Hover Tooltips:** Show task descriptions and commands.

| User Action         | GUI Response                    |
| ------------------- | ------------------------------- |
| Click a task button | Runs the selected Gulp task     |
| Hover over a button | Displays the command to execute |

---

### Execution Status

Displays real-time updates such as:

- "Task 'build' selected."
- "Invalid directory selected."
- Error messages if an issue occurs.

---

## Configuration Handling

- The GUI reads from `settings.json` to manage directories and settings.
- **Recent Directories:** Automatically filters out invalid directories.
- **Customization Options:**
  - `dir_recent_max`: Limits the number of recent directories remembered (default: 10).

---

## Error Handling

- If an error occurs (e.g., missing `config.json`), an error message is displayed.
- Errors and warnings are logged for troubleshooting.

**Common Errors:**

1. **"Config file not found"** → Ensure `config.json` exists in the selected directory.
2. **"Error running Gulp task"** → Verify Node.js and Gulp installations.
3. **"Invalid directory selected"** → Ensure the directory contains required files.

---

## Example Workflow

1. Launch the GUI using `python gui.py`.
2. Select or browse a valid project directory.
3. Choose a task from the UI (e.g., `build`).
4. Monitor execution status in the GUI.
5. Open logs if debugging is needed.

---

## Conclusion
The GUI simplifies the process of managing and executing Gulp tasks, offering logging, error handling, and directory management features. If any issues arise, refer to the logs for troubleshooting.
