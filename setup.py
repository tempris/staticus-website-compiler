import os
import platform
import re
import shutil
import subprocess
import sys

SCRIPT_TITLE = "Staticus Website Compiler"
LOG_TAG_SETUP = "[🔧 Setup]"

print(f"{LOG_TAG_SETUP} [Init] {SCRIPT_TITLE} Importing...")

# Path to this Python file
LOCATION_SCRIPT = os.path.dirname(os.path.abspath(__file__))

# Add required directories to sys.path
for subdir in ["source/python_packages_custom", "source/python_packages", ""]:
    LOCATION_PACKAGES = os.path.abspath(os.path.join(LOCATION_SCRIPT, subdir))
    if LOCATION_PACKAGES not in sys.path:
        sys.path.insert(0, LOCATION_PACKAGES)

# Now we can import local packages
from source.python_packages.supports_color import supportsColor
from source.python_packages_custom import cure_log_bridge_js, cure_bridge_js

cure_log_bridge_js.init(os.path.join(LOCATION_SCRIPT, "_log/setup.log"))

cure_log_bridge_js.log("debug", LOG_TAG_SETUP, "sys.path:", sys.path)

cure_log_bridge_js.log("init", LOG_TAG_SETUP, "Import complete.")

def cure_bridge_js_output_handler(output):
    cure_log_bridge_js.log("bridge", f"{output}")

cure_bridge_js.process(
    os.path.join(LOCATION_SCRIPT, "source/node_modules_custom/staticus-intro/index.js"),
    cure_bridge_js_output_handler,
    "getIntroString",
    supportsColor.stdout and supportsColor.stdout.has256
)

cure_log_bridge_js.log("init", LOG_TAG_SETUP, "Initializing...")

def get_platform():
    """
    Determines the platform on which the script is running.

    :return: A string indicating the platform ("Windows", "Linux", or "Unknown").
    """
    PLATFORM_CURRENT = platform.system()
    if PLATFORM_CURRENT == "Windows":
        return "Windows"
    elif PLATFORM_CURRENT == "Linux":
        return "Linux"
    elif PLATFORM_CURRENT == "Darwin":
        return "macOS"
    else:
        return "Unknown"

PLATFORM_NAME = get_platform()

cure_log_bridge_js.log("info", LOG_TAG_SETUP, "Detected platform:", {"PLATFORM_NAME": PLATFORM_NAME})

cure_log_bridge_js.log("init", LOG_TAG_SETUP, "Complete.")

# Force script to run with sudo on Linux
if PLATFORM_NAME == "Linux" and os.geteuid() != 0:
    cure_log_bridge_js.log("error", LOG_TAG_SETUP, "This script requires sudo privileges. Restarting with sudo...")
    os.execvp("sudo", ["sudo", "python3"] + sys.argv)

def choice(LOG_TAG_CURRENT, question):
    while True:
        choice = input(question + " (y/n): ").strip().lower()

        if choice == "y":
            return True
        elif choice == "n":
            return False
        else:
            cure_log_bridge_js.log("warn", LOG_TAG_CURRENT, "Invalid user response.")

def end():
    cure_log_bridge_js.log("shutdown", LOG_TAG_SETUP, [ "[[NEWLINES]]", "End of Script.", [
        "[[LIST]]", "Press Enter to exit."
    ]])
    input()
    sys.exit(0)

def run_command(command):
    try:
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    except Exception as e:
        cure_log_bridge_js.log("error", LOG_TAG_SETUP, e)
        return "", str(e), 1

def get_installed_version(LOG_TAG_CURRENT, command, regex):
    """
    Returns the installed version of a software based on the command and regex.

    :param LOG_TAG_CURRENT: Log tag for the process.
    :param command: Command to check the installed version.
    :param regex: Regex pattern to extract the version.
    :return: Installed version as a string or None if not found.
    """
    output, _, _ = run_command(command)
    match = re.search(regex, output)
    if match:
        return match.group(1)

    cure_log_bridge_js.log("warn", LOG_TAG_CURRENT, "No existing version found.")
    return None

def get_latest_version_file(directory, prefix, suffix):
    """
    Finds the latest version file in a directory based on the prefix and suffix.

    :param directory: Directory to search for files.
    :param prefix: The prefix of the files to match.
    :param suffix: The suffix of the files to match.
    :return: Path to the latest version file, or None if no matching file is found.
    """
    version_pattern = re.compile(rf"{re.escape(prefix)}(\d+\.\d+\.\d+){re.escape(suffix)}")
    latest_version = None
    latest_file = None

    for file_name in os.listdir(directory):
        match = version_pattern.match(file_name)
        if match:
            version = match.group(1)
            if latest_version is None or tuple(map(int, version.split("."))) > tuple(map(int, latest_version.split("."))):
                latest_version = version
                latest_file = os.path.join(directory, file_name)

    return latest_file, latest_version

def install_media_by_platform(LOG_TAG_CURRENT, media_name, new_version, file_path):
    """
    Installs software based on the operating system.

    :param LOG_TAG_CURRENT: Log tag for logging.
    :param file_path: Path to the installation file.
    """

    cure_log_bridge_js.log("info", LOG_TAG_CURRENT, f"Update to \"[[ANSI_OFF]]{new_version}[[ANSI_ON]]\"?")

    if choice(LOG_TAG_CURRENT, f"Update to \"{new_version}\"?"):
        cure_log_bridge_js.log("info", LOG_TAG_CURRENT, f"User accept installation.")
    else:
        cure_log_bridge_js.log("warn", LOG_TAG_CURRENT, f"User skip installation.")
        return True

    install_commands = {
        "Linux": ["sudo", "installer", file_path],
        "Windows": ["msiexec", "/i", file_path],
    }

    if PLATFORM_NAME in install_commands:
        cure_log_bridge_js.log("info", LOG_TAG_CURRENT, f"Starting installation for {PLATFORM_NAME}...")
        run_command(install_commands[PLATFORM_NAME])
    else:
        cure_log_bridge_js.log("error", LOG_TAG_CURRENT, "No stored installation media for detected operating system:", {"PLATFORM_NAME": PLATFORM_NAME})
        cure_log_bridge_js.log("error", LOG_TAG_CURRENT, "Please manually download and install the following then rerun this script:", {
            media_name: new_version + " (Latest Tested Version)"
        })
        end()

def install_media(LOG_TAG_CURRENT, media_name, file_path, new_version):
    """
    Checks the installed version and installs/updates software if necessary.

    :param LOG_TAG_CURRENT: Log tag for logging.
    :param media_name: Name of the software.
    :param file_path: Path to the installer.
    :param new_version: Latest recommended version.
    :return: True if the installation is up-to-date or cannot be updated, False otherwise.
    """
    cure_log_bridge_js.log("info", LOG_TAG_CURRENT, "Checking installation...")

    install_checks = {
        "Node.js": (["node", "--version"], r"v(\d+\.\d+\.\d+)"),
    }

    if media_name not in install_checks:
        cure_log_bridge_js.log("error", LOG_TAG_CURRENT, f"Unsupported installation media: {media_name}.")
        return True

    command, regex = install_checks[media_name]
    installed_version = get_installed_version(LOG_TAG_CURRENT, command, regex)

    if installed_version:
        cure_log_bridge_js.log("info", LOG_TAG_CURRENT, "Installation status:", {
            "Current": installed_version,
            "Latest Tested Version": new_version
        })

        if tuple(map(int, installed_version.split("."))) >= tuple(map(int, new_version.split("."))):
            cure_log_bridge_js.log("success", LOG_TAG_CURRENT, "The installed version meets min recommendation.")
            return True

        cure_log_bridge_js.log("warn", LOG_TAG_CURRENT, "The installed version does NOT meet min recommendation.")
    else:
        cure_log_bridge_js.log("warn", LOG_TAG_CURRENT, f"No existing version found.")

    return install_media_by_platform(LOG_TAG_CURRENT, media_name, new_version, file_path)

def setup_programs_node_js(LOG_TAG_CURRENT):
    cure_log_bridge_js.log("begin", LOG_TAG_CURRENT, "Running...")

    # Determine the setup directory and file naming conventions based on the platform
    if PLATFORM_NAME == "Linux":
        setup_dir = os.path.join(LOCATION_SCRIPT, "source", "setup", "linux", "install")
        node_suffix = "-linux-x64.tar.xz"
    else:
        # Default to Windows
        setup_dir = os.path.join(LOCATION_SCRIPT, "source", "setup", "windows", "install")
        node_suffix = "-x64.msi"

    node_prefix = "node-v"

    # Find the latest version file only once
    node_file, node_version = get_latest_version_file(setup_dir, node_prefix, node_suffix)

    # Handle unsupported OS cases
    if PLATFORM_NAME not in ["Windows", "Linux"]:
        cure_log_bridge_js.log("error", LOG_TAG_CURRENT, "Installation media not stored for detected operating system:", {"PLATFORM_NAME": PLATFORM_NAME})
        cure_log_bridge_js.log("error", LOG_TAG_CURRENT, "Please download and install the following programs and run this setup again:", {
            "Node.js": node_version + " (Latest Tested Version)"
        })
        end()

    if node_file and node_version:
        install_complete = False
        while not install_complete:
            install_complete = install_media(LOG_TAG_CURRENT, "Node.js", node_file, node_version)
    else:
        cure_log_bridge_js.log("error", LOG_TAG_CURRENT, "Node.js installation file not found or version not extracted.")

    cure_log_bridge_js.log("end", LOG_TAG_CURRENT, "Complete.")

def setup_programs():
    LOG_TAG_SETUP_PROGRAMS = LOG_TAG_SETUP + " [📦 Programs]"
    cure_log_bridge_js.log("begin", LOG_TAG_SETUP_PROGRAMS, "Running...")
    setup_programs_node_js(LOG_TAG_SETUP_PROGRAMS + " [🧩 Node.js]")
    cure_log_bridge_js.log("end", LOG_TAG_SETUP_PROGRAMS, "Complete.")

def install_node_modules():
    LOG_TAG_SETUP_NODE_MODULES = LOG_TAG_SETUP + " [🧩 Node Modules]"

    cure_log_bridge_js.log("begin", LOG_TAG_SETUP_NODE_MODULES, "Running...")

    PATH_DIR_NODE_MODULES_TARGET = os.path.abspath(os.path.join(LOCATION_SCRIPT, "node_modules"))

    PLATFORM_NODE_MODULES = {
        "Windows": os.path.join(LOCATION_SCRIPT, "source/setup/windows/node_modules"),
        "Linux": os.path.join(LOCATION_SCRIPT, "source/setup/linux/node_modules")
    }

    PATH_DIR_NODE_MODULES_SOURCE = ""

    if PLATFORM_NAME in PLATFORM_NODE_MODULES:
        PATH_DIR_NODE_MODULES_SOURCE = os.path.abspath(PLATFORM_NODE_MODULES[PLATFORM_NAME])

    if os.path.isdir(PATH_DIR_NODE_MODULES_SOURCE):
        try:
            cure_log_bridge_js.log("info", LOG_TAG_SETUP_NODE_MODULES, "Preparing to delete:", {
                "Destination": PATH_DIR_NODE_MODULES_TARGET
            })

            if os.path.exists(PATH_DIR_NODE_MODULES_TARGET) and os.path.isdir(PATH_DIR_NODE_MODULES_TARGET):
                shutil.rmtree(PATH_DIR_NODE_MODULES_TARGET)

                cure_log_bridge_js.log("success", LOG_TAG_SETUP_NODE_MODULES, "Deleted folder:", {
                    "Destination": PATH_DIR_NODE_MODULES_TARGET
                })

            cure_log_bridge_js.log("info", LOG_TAG_SETUP_NODE_MODULES, "Copying:", {
                "Source": PATH_DIR_NODE_MODULES_SOURCE,
                "Destination": PATH_DIR_NODE_MODULES_TARGET
            })

            shutil.copytree(PATH_DIR_NODE_MODULES_TARGET, PATH_DIR_NODE_MODULES_SOURCE)

            cure_log_bridge_js.log("success", LOG_TAG_SETUP_NODE_MODULES, "Updated folder:", {
                "Destination": PATH_DIR_NODE_MODULES_TARGET
            })
        except Exception as e:
            cure_log_bridge_js.log("error", LOG_TAG_SETUP_NODE_MODULES, "Failed updating folder:", e)

    else:
        cure_log_bridge_js.log("warn", LOG_TAG_SETUP_NODE_MODULES, "Node Modules not stored for detected operating system:", {
            "PLATFORM_NAME": PLATFORM_NAME
        })
        cure_log_bridge_js.log("info", LOG_TAG_SETUP_NODE_MODULES, "Installing Node Modules from cdn for platform...")

        try:
            process = subprocess.Popen(
                (["sudo", "npm", "install"] if PLATFORM_NAME == "Linux" else ["npm", "install"]),
                cwd=LOCATION_SCRIPT,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,  # Line-buffered output
                universal_newlines=True
            )

            # Real-time output
            for line in process.stdout:
                cure_log_bridge_js.log("detail", LOG_TAG_SETUP_NODE_MODULES, line.strip())

            for line in process.stderr:
                cure_log_bridge_js.log("error", LOG_TAG_SETUP_NODE_MODULES, line.strip())

            process.wait()  # Ensure process completes before proceeding

            if process.returncode != 0:
                cure_log_bridge_js.log("error", LOG_TAG_SETUP_NODE_MODULES, "npm install encountered errors.")
            else:
                cure_log_bridge_js.log("error", LOG_TAG_SETUP_NODE_MODULES, "npm install encountered errors.")

        except Exception as e:
            cure_log_bridge_js.log("error", LOG_TAG_SETUP_NODE_MODULES, f"npm install failed: {str(e)}")

    cure_log_bridge_js.log("end", LOG_TAG_SETUP_NODE_MODULES, "Complete.")

def main():
    cure_log_bridge_js.log("begin", LOG_TAG_SETUP, "Running...")

    setup_programs()
    install_node_modules()
    # install_python()

    cure_log_bridge_js.log("end", LOG_TAG_SETUP, "Complete.")

    end()

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        cure_log_bridge_js.log("error", LOG_TAG_SETUP, e)
