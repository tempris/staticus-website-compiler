import json
import os
import re
import sys
from zipfile import ZipFile, ZIP_DEFLATED

SCRIPT_TITLE = "Staticus Website Compiler"
LOG_TAG_PACKAGE = "[📦 Package]"

print(f'{LOG_TAG_PACKAGE} [Init] {SCRIPT_TITLE} Importing...')

# Path to this Python file
LOCATION_SCRIPT = os.path.dirname(os.path.abspath(__file__))

# Add required directories to sys.path
for subdir in ["source/python_packages_custom", "source/python_packages", ""]:
    LOCATION_PACKAGES = os.path.abspath(os.path.join(LOCATION_SCRIPT, subdir))
    if LOCATION_PACKAGES not in sys.path:
        sys.path.insert(0, LOCATION_PACKAGES)

from source.python_packages.supports_color import supportsColor
from source.python_packages.lxml import html
from source.python_packages_custom import cure_log_bridge_js, cure_bridge_js

cure_log_bridge_js.init(os.path.join(LOCATION_SCRIPT, '_log/package.log'))

cure_log_bridge_js.log("debug", LOG_TAG_PACKAGE, "sys.path:", sys.path)

cure_log_bridge_js.log("init", LOG_TAG_PACKAGE, "Import complete.")

def cure_bridge_js_output_handler(output):
    cure_log_bridge_js.log("bridge", f"{output}")

cure_bridge_js.process(
    os.path.join(LOCATION_SCRIPT, "source/node_modules_custom/staticus-intro/index.js"),
    cure_bridge_js_output_handler,
    "getIntroString",
    supportsColor.stdout and supportsColor.stdout.has256
)

cure_log_bridge_js.log("init", LOG_TAG_PACKAGE, "Initializing...")

# Load root config.json
path_file_config_root = os.path.normpath(os.path.join(LOCATION_SCRIPT, "config/settings.json"))
try:
    with open(path_file_config_root, 'r') as file_config:
        config_root = json.load(file_config)
        cure_log_bridge_js.log("detail", LOG_TAG_PACKAGE, "Loaded root config:", {"path_file_config_root": path_file_config_root})
except Exception as e:
    cure_log_bridge_js.log("error", LOG_TAG_PACKAGE, "Failed to load root config:", e)
    sys.exit(1)

# Define paths
path_site = os.path.normpath(config_root.get("dir", ""))
path_in = os.path.normpath(os.path.join(path_site, "out"))
path_out = os.path.normpath(os.path.join(path_site, "package.zip"))

# Load site config.json
path_file_config_site = os.path.normpath(os.path.join(path_site, "config.json"))
try:
    with open(path_file_config_site, 'r') as file_config:
        config_site = json.load(file_config)
        cure_log_bridge_js.log("detail", LOG_TAG_PACKAGE, "Loaded site config:", {"path_file_config_site": path_file_config_site})
except Exception as e:
    cure_log_bridge_js.log("error", LOG_TAG_PACKAGE, "Failed to load site config:", e)
    sys.exit(1)

# Access the ignore_package array from config.json
ignore_package = config_site.get("option", {}).get("path", {}).get("ignore_package", [])
pattern_modify = '.html'

# Check input directory
if not os.listdir(path_in):
    cure_log_bridge_js.log("warn", LOG_TAG_PACKAGE, "Input directory is empty or does not exist:", {"path_in": path_in})
    sys.exit(1)

# Delete existing zip file if it exists
if os.path.exists(path_out):
    cure_log_bridge_js.log("warn", LOG_TAG_PACKAGE, "Removing existing archive:", {"path_out": path_out})
    os.remove(path_out)

cure_log_bridge_js.log("info", LOG_TAG_PACKAGE, "Archiving:", {"path_in": path_in})
cure_log_bridge_js.log("detail", LOG_TAG_PACKAGE, "Ignoring files matching patterns:", {"ignore_package": ignore_package})
cure_log_bridge_js.log("detail", LOG_TAG_PACKAGE, "Modifying files ending with:", {"pattern_modify": pattern_modify})

cure_log_bridge_js.log("init", LOG_TAG_PACKAGE, "Complete.")

cure_log_bridge_js.log("begin", LOG_TAG_PACKAGE, "File process running...")

# Function to exclude files and directories based on ignore_package patterns
def should_exclude(file_path, ignore_patterns):
    relative_file_path = os.path.relpath(file_path, path_in)
    for pattern in ignore_patterns:
        if pattern in relative_file_path:
            cure_log_bridge_js.log("debug", LOG_TAG_PACKAGE, "Excluding file:", {"file_path": file_path, "ignore pattern matched": pattern})
            return True
    return False

def modify_html_content(file_path):
    cure_log_bridge_js.log("detail", LOG_TAG_PACKAGE, "Searching HTML file for potential modifications:", {"file_path": file_path})
    try:
        # Check if the file exists before parsing
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        with open(file_path, 'r', encoding='utf-8') as html_file:
            content = html_file.read()

        # Retrieve classes to ignore from config
        ignore_package_classes = config_site.get("option", {}).get("package", {}).get("html", {}).get("ignore_class", [])

        change_summary = []

        # Regex pattern to match elements with specific classes (non-greedy to avoid capturing too much)
        for cls in ignore_package_classes:
            pattern = rf'<[^>]*class="[^"]*{re.escape(cls)}[^"]*"[^>]*>.*?</[^>]+>'
            matches = re.findall(pattern, content, re.DOTALL)

            for match in matches:
                change_summary.append({
                    "match_preview": match[:100] + "..." if len(match) > 100 else match
                })
                content = content.replace(match, '')  # Remove the matched element

        # Logging changes
        if not change_summary:
            cure_log_bridge_js.log("detail", LOG_TAG_PACKAGE, "No modification needed.")
        else:
            file_path_relative = os.path.relpath(file_path, path_in)
            cure_log_bridge_js.log("detail", LOG_TAG_PACKAGE, "Modified HTML:", {
                "file_path_relative": file_path_relative,
                "Output content bytes": len(content),
                "change_summary": change_summary
            })

        return content

    except Exception as e:
        cure_log_bridge_js.log("error", LOG_TAG_PACKAGE, "Failed to modify HTML file:", {
            "file_path": file_path,
            "error": str(e)
        })
        return None

# Create a new zip file manually using zipfile module
with ZipFile(path_out, 'w', ZIP_DEFLATED) as zip_archive:
    # Get all files in the input directory
    for root, _, files in os.walk(path_in):
        for file in files:
            file_path = os.path.normpath(os.path.join(root, file))
            file_path_relative = os.path.relpath(file_path, path_in)

            # Skip ignored files
            if should_exclude(file_path, ignore_package):
                continue

            # Process HTML files (modify content before adding)
            if file.endswith('.html'):
                cure_log_bridge_js.log("info", LOG_TAG_PACKAGE, "Processing HTML file:", {"file_path": file_path})
                modified_html_content = modify_html_content(file_path)

                if modified_html_content:
                    zip_archive.writestr(file_path_relative, modified_html_content)
                    cure_log_bridge_js.log("detail", LOG_TAG_PACKAGE, "Added modified HTML to ZIP:", {"file_path_relative": file_path_relative})
                else:
                    cure_log_bridge_js.log("warn", LOG_TAG_PACKAGE, "Skipped invalid HTML file:", {"file_path_relative": file_path_relative})

            # Add all other file types **without modification**
            else:
                cure_log_bridge_js.log("info", LOG_TAG_PACKAGE, "Adding non-HTML file to ZIP:", {"file_path": file_path})
                zip_archive.write(file_path, file_path_relative)
                cure_log_bridge_js.log("detail", LOG_TAG_PACKAGE, "Added non-HTML file to ZIP:", {"file_path_relative": file_path_relative})

cure_log_bridge_js.log("success", LOG_TAG_PACKAGE, "Archive created successfully:", {"path_out": path_out})

cure_log_bridge_js.log("end", LOG_TAG_PACKAGE, "File process complete.")

cure_log_bridge_js.log("shutdown", LOG_TAG_PACKAGE, "Complete.")

input("Press Enter to close...")
sys.exit(0)
