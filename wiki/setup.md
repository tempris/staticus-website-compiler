# Staticus Website Compiler - Setup Guide

## 📑 Table of Contents

- [Staticus Website Compiler - Setup Guide](#staticus-website-compiler---setup-guide)
  - [📑 Table of Contents](#-table-of-contents)
  - [📖 Overview](#-overview)
  - [🔍 Requirements](#-requirements)
  - [🛠️ Installation](#️-installation)
    - [🪟 Windows Installation](#-windows-installation)
    - [🐧 Linux Installation](#-linux-installation)
  - [📦 Installing Node Modules](#-installing-node-modules)
    - [🔹 What Are Node Modules?](#-what-are-node-modules)
    - [🔹 Where and How to Install Them](#-where-and-how-to-install-them)
  - [🌟 New Project](#-new-project)
    - [📂 Example Foundations](#-example-foundations)
    - [🚀 Using the Examples for a New Project](#-using-the-examples-for-a-new-project)
  - [🚀 Running the Compiler](#-running-the-compiler)
  - [❌ Troubleshooting](#-troubleshooting)
  - [📝 Additional Notes](#-additional-notes)
  - [🎉 Next Steps](#-next-steps)

---

## 📖 Overview

This comprehensive guide outlines every step necessary to set up and install the **Staticus Website Compiler** on Windows and Linux systems. It assumes no prior knowledge and explains where and how to run each command, including all relevant details.

---

## 🔍 Requirements

Before starting, ensure you have the following installed manually:

- 🐍 **Python 3.13.1**
  - Includes **tk** (Linux users must install `python3-tk` separately—see Linux instructions).
- 🧩 **Node.js v22.14.0**
  - Comes with **npm** (Node Package Manager).
- 🎨 **GraphicsMagick**
  - **Windows users:** A portable copy is included by default; manual installation only if the included copy fails.

All installations and verifications are explained in detail below.

---

## 🛠️ Installation

### 🪟 Windows Installation

1. **Install Python 3.13.1**
   - Go to the [official Python website](https://www.python.org/downloads/) and download the installer for Python 3.13.1.
   - During installation, **ensure that the "Add Python to PATH" option is checked**.
   - Verify Python installation by opening Command Prompt (`cmd`) and running:
     ```sh
     python --version
     ```

2. **Install Node.js v22.14.0**
   - Download the Windows installer from the [official Node.js website](https://nodejs.org/en/download).
   - Follow the default prompts during installation.
   - Verify installation:
     ```sh
     node -v  # Should print "v22.14.0"
     npm -v   # Should print "10.9.2"
     ```

3. **Check GraphicsMagick**
   - A portable version is included in the project directory.
   - If it fails to run, download and install manually from the [GraphicsMagick website](http://www.graphicsmagick.org/).

4. **Navigate to the Project Folder**
   - Open Command Prompt and run:
     ```sh
     cd path\\to\\staticus-website-compiler
     ```
   - Replace `path\\to\\staticus-website-compiler` with the actual path where the repository is cloned.

---

### 🐧 Linux Installation

1. **Install Python 3.13.1**
   - Download Python 3.13.1 from the [official Python website](https://www.python.org/downloads/).
   - Install `python3-tk`:
     ```sh
     sudo apt install python3-tk
     ```
   - Verify installation:
     ```sh
     python3 --version
     ```

2. **Install Node.js v22.14.0**
   - Ensure `curl` is installed:
     ```sh
     sudo apt install curl
     ```
   - Install Node.js via NVM:
     ```sh
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
     source "$HOME/.nvm/nvm.sh"
     nvm install 22
     ```
   - Verify:
     ```sh
     node -v  # Should print "v22.14.0"
     npm -v   # Should print "10.9.2"
     ```

3. **Install GraphicsMagick**
   ```sh
   sudo apt install graphicsmagick
   ```

4. **Navigate to the Project Folder**
   - Open a terminal and run:
     ```sh
     cd /path/to/staticus-website-compiler
     ```
   - Replace `/path/to/staticus-website-compiler` with the actual path where the repository is cloned.

---

## 📦 Installing Node Modules

### 🔹 What Are Node Modules?

Node modules are packages that add essential functionality to the project. Without them, the compiler will not run.

### 🔹 Where and How to Install Them

1. Ensure you are inside the **project folder**:
   - **Windows:**
     ```sh
     cd path\\to\\staticus-website-compiler
     ```
   - **Linux:**
     ```sh
     cd /path/to/staticus-website-compiler
     ```

2. Run the following command to install all required modules:
   ```sh
   npm install
   ```

> **Explanation:** `npm install` reads the `package.json` file in the project folder and installs all listed dependencies. This must be run **inside the project folder**, otherwise the necessary packages will not be installed correctly.

---

## 🌟 New Project

To start a new project with the **Staticus Website Compiler**, you have two example foundations to choose from. These examples are designed to serve as foundational learning tools, helping you learn how to structure and write a project that works seamlessly with the compiler. By studying and modifying them, you will gain insights into how the **Staticus Website Compiler** operates and how to structure your own custom projects.

### 📂 Example Foundations

1. **Full Example**  
   - Located in the `example/full` directory.  
   - This example provides a complete project setup, including advanced configurations, extended features, and additional components.  
   - Ideal for users who want to explore the full capabilities of the compiler or need a comprehensive starting point.

2. **Minimal Example (Min Example)**  
   - Located in the `example/min` directory.  
   - A streamlined version containing only the essential files and configurations required to run a basic project.  
   - Best for beginners who want to understand the core structure without extra complexity.

### 🚀 Using the Examples for a New Project

To use these examples in a new project:

1. **Copy the Contents**  
   - Choose either the `example/full` or `example/min` directory based on your preference.  
   - Copy the contents to a new location of your choice where you want to set up your project.

2. **Point Staticus to Your New Project Path**  
   - **Easiest Method (Using the GUI):**  
     - Open the Staticus GUI.  
     - Select your newly created project folder from the project path history (if listed) or browse to the new location manually.  
   
   - **Manual Method (Using `config/settings.json`):**  
     - Open the `config/settings.json` file in a text editor.  
     - Update the `dir` property to point to your new project path. For example:  
       ```json
       {
           "dir": "./path/to/your/new/project",
           "dir_recent": [
               "./path/to/your/new/project",
               "./example/full",
               "./example/min"
           ],
           "dir_recent_max": 10
       }
       ```
     - **Note:** If the `config/settings.json` file does not exist, Staticus will automatically copy the default settings from `config/default/settings.json` the next time the GUI is launched or when a task is run manually from a terminal opened in the Staticus program's root directory.

---

## 🚀 Running the Compiler

There are 2 ways to use Staticus Website Compiler, GUI and Terminal (Command Line).

1. **GUI**: For information on how to run the compiler using the graphic user interface, read the **[Staticus GUI Page](./gui.md)**.
2. **Terminal**: For information on how to run the compiler using the terminal, read the **[Staticus Terminal Page](./terminal.md)**.

---

## ❌ Troubleshooting

- **Python Issues:** Ensure Python is added to `PATH`. Use `python3` if `python` isn't recognized.

- **Node.js Version Mismatch:** Reinstall using NVM (Linux) or re-download the installer (Windows).

- **GraphicsMagick Issues:** For Windows, try a manual install if the portable version fails. For Linux, ensure the correct package is installed for your distribution.

- **Node Module Errors:** Ensure `npm install` was run in the correct Staticus project folder.

---

## 📝 Additional Notes

- All installation logs are stored in `_log/setup.log`.
- Review the log for details if issues occur.

---

## 🎉 Next Steps

With the setup complete, you are now ready to start using the **Staticus Website Compiler**!

Happy compiling and enjoy building amazing projects! 🚀✨

