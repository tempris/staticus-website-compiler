import json
import os
import platform
import re
import subprocess
import sys
import tkinter.filedialog as filedialog

SCRIPT_TITLE = "Staticus Website Compiler"
LOG_TAG_GUI = '[💻 GUI]'

print(f'{LOG_TAG_GUI} [Init] {SCRIPT_TITLE} Importing...')

# Path to this Python file
LOCATION_SCRIPT = os.path.dirname(os.path.abspath(__file__))

# Add required directories to sys.path
for subdir in ["source/python_packages_custom", "source/python_packages", ""]:
    LOCATION_PACKAGES = os.path.abspath(os.path.join(LOCATION_SCRIPT, subdir))
    if LOCATION_PACKAGES not in sys.path:
        sys.path.insert(0, LOCATION_PACKAGES)

from source.python_packages import customtkinter
from source.python_packages.supports_color import supportsColor
from source.python_packages.CTkToolTip import *
from source.python_packages_custom import cure_log_bridge_js, cure_bridge_js

cure_log_bridge_js.init(os.path.join(LOCATION_SCRIPT, '_log/gui.log'))

cure_log_bridge_js.log("debug", LOG_TAG_GUI, "sys.path:", sys.path)

cure_log_bridge_js.log("init", LOG_TAG_GUI, "Import complete.")

NODE_CUSTOM_STATICUS_INTRO = os.path.join(LOCATION_SCRIPT, "source/node_modules_custom/staticus-intro/index.js")

def cure_bridge_js_output_handler(output):
    cure_log_bridge_js.log("bridge", f"{output}")

TERMINAL_COLOR_256 = supportsColor.stdout and supportsColor.stdout.has256

cure_bridge_js.process(
    NODE_CUSTOM_STATICUS_INTRO, 
    cure_bridge_js_output_handler, 
    "getIntroString", 
    TERMINAL_COLOR_256
)

cure_log_bridge_js.log("init", LOG_TAG_GUI, "Initializing...")

# Toggle to control terminal opening and hiding main window
EXPERIMENT_HIDE_TERMINAL_MAIN = False  # Experimental: Set to True to hide main script window
EXPERIMENT_HIDE_TERMINAL_TASK = False  # Experimental: Set to True to hide terminal for Gulp tasks

cure_bridge_js.process(
    os.path.join(LOCATION_SCRIPT, 'source/node_modules_custom/staticus-defaults/index.js'), 
    cure_bridge_js_output_handler, 
    "configEnsure"
)

# input("Press Enter to exit...\n")
# sys.exit(0)

def load_json_config(file_path):
    """
    Load a JSON configuration file.

    Args:
        file_path (str): Path to the JSON file.

    Returns:
        dict: Parsed JSON data or an empty dictionary if an error occurs.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        cure_log_bridge_js.log('error', LOG_TAG_GUI, f"[Configuration] Config file not found at: \"[[ANSI_OFF]]{file_path}[[ANSI_ON]]\"")
    except json.JSONDecodeError as e:
        cure_log_bridge_js.log('error', LOG_TAG_GUI, "[Configuration] Error decoding JSON file:", e)
    return {}  # Return an empty dictionary as a fallback

# Load the config.json
path_config_settings = os.path.join(LOCATION_SCRIPT, 'config/settings.json')
config_settings = load_json_config(path_config_settings)

def validate_directory(directory):
    """
    Validate that the directory contains a `config.json` file and an `in` subdirectory.
    """
    config_file = os.path.join(directory, 'config.json')
    subdir = os.path.join(directory, 'in')
    return os.path.isfile(config_file) and os.path.isdir(subdir)

# Validate recent project directories on startup
valid_recent_dirs = [d for d in config_settings.get('dir_recent', []) if validate_directory(d)]
if valid_recent_dirs != config_settings.get('dir_recent', []):
    cure_log_bridge_js.log('warn', LOG_TAG_GUI, "Invalid directories found in recent project list. Removing them.")
    config_settings['dir_recent'] = valid_recent_dirs

    # Save the cleaned recent project directories to config.json
    try:
        with open(path_config_settings, 'w', encoding='utf-8') as f:
            json.dump(config_settings, f, indent=4)
        cure_log_bridge_js.log('debug', LOG_TAG_GUI, "Updated config.json with valid recent project directories.")
    except Exception as e:
        cure_log_bridge_js.log('error', LOG_TAG_GUI, "Error saving updated config.json during startup:", e)

def update_recents_dropdown(recent_dirs):
    """
    Update the CTkOptionMenu with recent project directories.
    Fallback to 'dir' value if recent_dirs is empty.
    """
    try:
        if not recent_dirs:
            fallback_dir = config_settings.get('dir', '')
            cure_log_bridge_js.log('warn', LOG_TAG_GUI, f"Recent project directories list is empty, falling back to: \"[[ANSI_OFF]]{fallback_dir}[[ANSI_ON]]\".")
            recent_dirs = [fallback_dir] if fallback_dir else ["No directories available"]

        recent_dir_menu.configure(values=recent_dirs)  # Update the dropdown options
        recent_dir_menu.set(recent_dirs[0])  # Select the first entry as default
    except Exception as e:
        cure_log_bridge_js.log('error', LOG_TAG_GUI, "[Configuration] Error updating recent project directories menu:", e)

last_valid_dir = config_settings.get('dir', '')  # Store the last valid directory

def update_config_dir(new_dir):
    """
    Update the 'dir' in config.json and validate the directory.
    Remove invalid directories permanently and ensure the fallback is the last valid directory.
    """
    global last_valid_dir

    # Load the current recent project directories
    dir_recent = config_settings.get('dir_recent', [])

    # Check if the directory is local to the script
    if os.path.isabs(new_dir):
        relative_to_script = os.path.relpath(new_dir, LOCATION_SCRIPT)
        if not relative_to_script.startswith('..'):
            new_dir = relative_to_script  # Use the relative path if within script's location

    if not validate_directory(new_dir):
        cure_log_bridge_js.log('warn', LOG_TAG_GUI, "Selected directory is invalid, removing it from recent project directories:", {"invalid": new_dir})

        # Remove the invalid directory from the recent project list
        if new_dir in dir_recent:
            dir_recent.remove(new_dir)
            config_settings['dir_recent'] = dir_recent  # Update the config_settings dictionary

            # Save changes to config.json
            try:
                with open(path_config_settings, 'w', encoding='utf-8') as f:
                    json.dump(config_settings, f, indent=4)
                cure_log_bridge_js.log('debug', LOG_TAG_GUI, "Removed invalid directory from recent project directories:", {"removed": new_dir})
            except Exception as e:
                cure_log_bridge_js.log('error', LOG_TAG_GUI, "Error saving updated config.json:", e)

        # Revert to the last valid directory
        cure_log_bridge_js.log('debug', LOG_TAG_GUI, "Reverting to last valid directory:", {"last_valid_dir": last_valid_dir})
        update_recents_dropdown(dir_recent)  # Update the dropdown
        result_text.configure(
            text=f"Invalid directory selected: \"{new_dir}\". Reverted to last valid directory: \"{last_valid_dir}\"",
            text_color="red"
        )
        return

    cure_log_bridge_js.log('info', LOG_TAG_GUI, "Valid project directory selected:", {"new_dir": new_dir})

    try:
        # Update the 'dir' in the config file
        config_settings['dir'] = new_dir
        last_valid_dir = new_dir  # Set the new directory as the last valid directory

        # Manage the recent project directories
        if new_dir in dir_recent:
            dir_recent.remove(new_dir)  # Avoid duplication
        dir_recent.insert(0, new_dir)  # Add to the top
        dir_recent = dir_recent[:config_settings.get('dir_recent_max', 10)]  # Keep only the most recent project directories
        config_settings['dir_recent'] = dir_recent

        # Save the updated configuration
        with open(path_config_settings, 'w', encoding='utf-8') as f:
            json.dump(config_settings, f, indent=4)

        cure_log_bridge_js.log('debug', LOG_TAG_GUI, "Directory and recent project directories updated:", {"new_dir": new_dir, "dir_recent": dir_recent})
        update_recents_dropdown(dir_recent)  # Update the dropdown
        result_text.configure(text=f"Directory updated to: \"{new_dir}\"", text_color="green")
    except Exception as e:
        cure_log_bridge_js.log('error', LOG_TAG_GUI, "[Configuration] Error updating config.json:", e)
        result_text.configure(text=f"Failed to update directory to: \"{new_dir}\"", text_color="red")

# Determine the current operating system
current_platform = platform.system().lower()
cure_log_bridge_js.log('info', LOG_TAG_GUI, f"Detected platform: \"[[ANSI_OFF]]{current_platform}[[ANSI_ON]]\"")

is_supported = False
padding = 4

if current_platform == 'windows' or current_platform == 'linux':
    is_supported = True
    cure_log_bridge_js.log('success', LOG_TAG_GUI, f"Platform supported: \"[[ANSI_OFF]]{current_platform}[[ANSI_ON]]\"")
else:
    cure_log_bridge_js.log('error', LOG_TAG_GUI, f"Platform not supported: \"[[ANSI_OFF]]{current_platform}[[ANSI_ON]]\"")

cure_log_bridge_js.log("init", LOG_TAG_GUI, "Complete.")

def run_gulp_command(task):
    try:
        cure_log_bridge_js.log('info', LOG_TAG_GUI, f"Running Gulp task: \"[[ANSI_OFF]]{task}[[ANSI_ON]]\"")
        # Define the working directory as the script location
        working_directory = LOCATION_SCRIPT

        if current_platform == 'windows':
            if EXPERIMENT_HIDE_TERMINAL_TASK:
                subprocess.Popen(
                    f'npx gulp {task}',
                    shell=True,
                    cwd=working_directory,
                    creationflags=subprocess.CREATE_NO_WINDOW | subprocess.DETACHED_PROCESS
                )
            else:
                subprocess.Popen(
                    f'start cmd /k "cd /d {working_directory} && npx gulp {task}"',
                    shell=True,
                    creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP
                )
        elif current_platform == 'linux':
            if EXPERIMENT_HIDE_TERMINAL_TASK:
                subprocess.Popen(
                    ['bash', '-c', f"cd '{working_directory}' && npx gulp {task}"],
                    start_new_session=True
                )
            else:
                subprocess.Popen(
                    ['gnome-terminal', '--', 'bash', '-c', f"cd '{working_directory}' && npx gulp {task}; exec bash"],
                    start_new_session=True
                )

        # Log and update UI when the task is launched
        cure_log_bridge_js.log('info', LOG_TAG_GUI, f"Task selected: \"[[ANSI_OFF]]{task}[[ANSI_ON]]\"")
        result_text.configure(text=f"Task '{task}' selected.", text_color="green")
    except Exception as e:
        cure_log_bridge_js.log('error', LOG_TAG_GUI, f"[Gulp Task] Error running \"[[ANSI_OFF]]{task}[[ANSI_ON]]\":", e)
        result_text.configure(text=f"Error: {str(e)}", text_color="red")

# Function to parse gulpfile.js and extract tasks and categories
def parse_gulpfile(gulpfile_path):
    cure_log_bridge_js.log('info', LOG_TAG_GUI, "Loading tasks...")
    cure_log_bridge_js.log('debug', LOG_TAG_GUI, f"Parsing gulpfile at: \"[[ANSI_OFF]]{gulpfile_path}[[ANSI_ON]]\"")

    tasks_by_category = {}
    variable_map = {}  # Store TASK_BUILD_* variables
    current_category = None
    category_found = False

    # Regex for categories, tasks, and variable assignments
    category_pattern = re.compile(r'//\s*#+\s*Task\s*-\s*(?P<category>[\w\s]+)(?:\s*-\s*(?P<category_comment>.*))?')
    task_pattern = re.compile(r'createTask\(\s*(?P<task>[A-Z0-9_]+|\'.*?\')\s*,\s*[^;]+;\s*(?://\s*(?P<task_comment>.*))?')
    variable_pattern = re.compile(r'const\s+(?P<var_name>[A-Z0-9_]+)\s*=\s*[\'"](?P<var_value>\w+)[\'"];')

    try:
        with open(gulpfile_path, 'r', encoding='utf-8') as file:
            for line in file:
                # Capture variable definitions
                variable_match = variable_pattern.search(line)
                if variable_match:
                    var_name = variable_match.group('var_name')
                    var_value = variable_match.group('var_value')
                    variable_map[var_name] = var_value  # Store the mapping
                    continue

                # Capture task categories
                category_match = category_pattern.search(line)
                if category_match:
                    current_category = category_match.group('category').strip()
                    category_comment = category_match.group('category_comment') or ""
                    tasks_by_category[current_category] = []
                    cure_log_bridge_js.log('debug', LOG_TAG_GUI, "Found Category:", {"current_category": current_category})
                    category_found = True
                    continue

                # Capture tasks
                if category_found:
                    task_match = task_pattern.search(line)
                    if task_match:
                        task_name = task_match.group('task').strip("'")  # Strip quotes if it's a string
                        task_comment = task_match.group('task_comment') or category_comment or ""

                        # If task_name is a variable, resolve it
                        resolved_task_name = variable_map.get(task_name, task_name)

                        tasks_by_category[current_category].append((resolved_task_name, task_comment))
                        cure_log_bridge_js.log('debug', LOG_TAG_GUI, "Found Task:", {"resolved_task_name": resolved_task_name, "task_comment": task_comment})

    except FileNotFoundError:
        cure_log_bridge_js.log('error', LOG_TAG_GUI, f"[File Not Found] Gulpfile not found: \"[[ANSI_OFF]]{gulpfile_path}[[ANSI_ON]]\"")
        return {}

    cure_log_bridge_js.log('success', LOG_TAG_GUI, "Loaded tasks.")
    return tasks_by_category

COLOR_SYSTEM = customtkinter.get_appearance_mode()
def color_light_dark(color_light, color_dark):
    if (COLOR_SYSTEM == "Light"):
        return color_light
    return color_dark

# Define colors for each category
CATEGORY_COLORS = {
    "General": "#418144",  # Green
    "Build":   "#286ba1",    # Blue
    "Rebuild": "#662e71",   # Red
    "Reset":   "#9e3c35",  # Purple
    "Test":    "#a7701f"     # Orange
}
    # "Assist": "#28a1a1",

def color_hover_shade(hex_color, factor=0.5):
    """Returns a darker shade of the input hex color by the specified factor."""
    # Remove the '#' if it's present
    hex_color = hex_color.lstrip('#')

    # Convert hex to RGB
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)

    if (COLOR_SYSTEM == "Light"):
        factor *= 0.375

    # Reduce brightness by the factor
    r = int(r * (1 - factor))
    g = int(g * (1 - factor))
    b = int(b * (1 - factor))

    # Ensure the values are within the valid range [0, 255]
    r = max(0, min(255, r))
    g = max(0, min(255, g))
    b = max(0, min(255, b))

    # Convert RGB back to hex
    darker_hex = f'#{r:02x}{g:02x}{b:02x}'
    return darker_hex

font_size__title = 18
font_size__subtitle = 14

config_padding = {
    "padx": padding,
    "pady": padding
}
config_tooltip = {
    "delay": 0,
    "x_offset": 0,
    "y_offset": 32,
    **config_padding
}

class MyScrollableButtonFrame(customtkinter.CTkScrollableFrame):
    def __init__(self, master, title, values, **kwargs):
        super().__init__(master, label_text=title, **kwargs)
        cure_log_bridge_js.log('debug', LOG_TAG_GUI, f"Initializing scrollable button frame for category: \"[[ANSI_OFF]]{title}[[ANSI_ON]]\"")

        self.values = values

        button_color = CATEGORY_COLORS.get(title, "#1976D2")  # Default to blue
        hover_color = color_hover_shade(button_color)  # Darker shade for hover

        for i, (task_name, comment) in enumerate(self.values):
            button = customtkinter.CTkButton(
                self,
                text=task_name.replace("_", " ").title(),
                command=lambda value=task_name: run_gulp_command(value),
                fg_color=button_color,
                hover_color=hover_color,
                width=0
            )
            button.grid(
                row=i,
                column=0,
                sticky="ew",
                **config_padding
            )
            tooltip_message = comment if comment else task_name
            CTkToolTip(
                button,
                message=f"Command: `npx gulp {task_name}`\n{tooltip_message}",
                **config_tooltip
            )

        # Ensure the column containing buttons can stretch
        self.grid_columnconfigure(
            0,
            weight=1
        )

def open_directory_explorer():
    """
    Open file explorer to select a directory and update the config.
    Only allow valid directories to be selected.
    """
    cure_log_bridge_js.log('info', LOG_TAG_GUI, "Opening directory selector.")

    selected_dir = filedialog.askdirectory(initialdir=recent_dir_menu.get(), title="Select Directory")
    if selected_dir:  # If a directory is selected
        update_config_dir(selected_dir)

def open_selected_directory():
    """
    Opens the currently selected directory in the file explorer, relative to the script root if not an absolute path.
    """
    selected_dir = recent_dir_menu.get()  # Get the selected directory from the dropdown

    cure_log_bridge_js.log('info', LOG_TAG_GUI, "Opening file explorer:", {"selected_dir": selected_dir})

    # Resolve to an absolute path relative to the script root
    if not os.path.isabs(selected_dir):
        selected_dir = os.path.join(LOCATION_SCRIPT, selected_dir)

    if os.path.isdir(selected_dir):
        if current_platform == 'windows':
            os.startfile(selected_dir)
        elif current_platform == 'darwin':  # macOS
            subprocess.run(['open', selected_dir])
        elif current_platform == 'linux':
            subprocess.run(['xdg-open', selected_dir])
    else:
        cure_log_bridge_js.log('warn', LOG_TAG_GUI, f"Invalid directory selected (is invalid or does not exist): \"[[ANSI_OFF]]{selected_dir}[[ANSI_ON]]\"")

def get_help_message_multicolor(intro_echo_lines, clear_command):
    intro_colors = [""]

    # Define additional help message lines without extra quotes
    help_message_lines = [
        f'Welcome to the Staticus Website Compiler terminal!',
        f'',
        f'Useful Commands:',
        f'- Execute Task:   `npx gulp task_name`',
        f'- Clear Terminal: `{clear_command}`',
        f'- Exit Terminal:  `exit`'
    ]

    # Determine the number of lines in the help_message_lines
    num_help_lines = len(help_message_lines)

    color_output = []  # Temporary list to collect the full output

    def output_handler_color(output):
        nonlocal color_output
        # print("output:", output)

        # Collect the output line by line
        color_output.append(output.strip())

    # Call process and wait for the callback to assemble the color array
    cure_bridge_js.process(
        NODE_CUSTOM_STATICUS_INTRO, 
        output_handler_color, 
        "getColors", 
        TERMINAL_COLOR_256, 
        num_help_lines
    )

    # Parse the collected output as JSON after all lines are received
    try:
        # Combine all lines into a single string
        full_output = "".join(color_output).strip()
        # print("full_output (raw):", full_output)  # Debugging

        # Ensure valid JSON
        if full_output.startswith('[') and full_output.endswith(']'):
            # Remove outer brackets and split into individual elements
            formatted_output = full_output.strip().replace("'", '"').replace("\\", "\\\\")
            # print("formatted_output (valid JSON):", formatted_output)

            # Parse the formatted JSON string
            parsed_data = json.loads(formatted_output)
            # print("parsed_data:", parsed_data)

            if isinstance(parsed_data, list) and parsed_data:
                # Unescape ANSI codes and populate intro_colors
                intro_colors = [bytes(color, "utf-8").decode("unicode_escape") for color in parsed_data]
                # print("intro_colors:", intro_colors)
        # else:
        #     print("full_output does not start and end with brackets, invalid JSON format.")

    except json.JSONDecodeError as e:
        # print("Error parsing full JSON:", e)  # Debugging
        intro_colors = [""]  # Fallback to an empty string

    # Ensure intro_colors matches the length of help_message_lines
    intro_colors = (intro_colors * num_help_lines)[:num_help_lines]

    # print("intro_colors (final):", intro_colors)

    # Add the ANSI color to the beginning of each help message line
    colored_help_message_lines = [
        f'echo {intro_colors[i]}{line}\x1B[0m' + (' &&' if i < len(help_message_lines) - 1 else '')
        for i, line in enumerate(help_message_lines)
    ]

    # Join help message lines with a new line for terminal output
    final_help_message = " ".join(colored_help_message_lines)

    # Output final_help_message if needed
    # print(final_help_message)

    # Combine the intro lines and help message lines
    help_message = " ".join(intro_echo_lines + [final_help_message])

    return help_message


def get_help_message_color(intro_echo_lines, clear_command):
    intro_color = ""

    def output_handler_color(output):
        nonlocal intro_color

        try:
            # Replace single quotes with double quotes and escape backslashes for JSON compliance
            formatted_output = output.strip().replace("'", '"').replace("\\", "\\\\")
            # Parse JSON and extract the first element
            parsed_data = json.loads(formatted_output)
            if isinstance(parsed_data, list) and parsed_data:
                # Unescape the string to convert it into proper ANSI codes
                intro_color = bytes(parsed_data[0], "utf-8").decode("unicode_escape")

        except json.JSONDecodeError as e:
            intro_color = ""  # Fallback to empty string

    cure_bridge_js.process(
        NODE_CUSTOM_STATICUS_INTRO, 
        output_handler_color, 
        "getColors", 
        TERMINAL_COLOR_256, 
        1
    )

    # Define additional help message lines without extra quotes
    help_message_lines = [
        f'echo {intro_color}Welcome to the Staticus Website Compiler terminal!\x1B[0m && echo. &&',
        f'echo {intro_color}Useful Commands:\x1B[0m &&',
        f'echo {intro_color}- Execute Task:   `npx gulp task_name`\x1B[0m &&',
        f'echo {intro_color}- Clear Terminal: `{clear_command}`\x1B[0m &&',
        f'echo {intro_color}- Exit Terminal:  `exit`\x1B[0m'
    ]

    # Combine the intro lines and help message lines
    help_message = " ".join(intro_echo_lines + help_message_lines)

    return help_message

def open_terminal_at_directory(path_to_open):
    """
    Opens a terminal at the currently selected directory.
    """
    cure_log_bridge_js.log('info', LOG_TAG_GUI, "Opening terminal:", {"path_to_open": path_to_open})

    # Resolve to an absolute path relative to the script root
    if not os.path.isabs(path_to_open):
        path_to_open = os.path.join(LOCATION_SCRIPT, path_to_open)

    # # Determine the correct clear command based on the platform
    # if current_platform == 'windows':
    #     clear_command = "echo cls"
    # elif current_platform in ['linux', 'darwin']:  # macOS and Linux
    #     clear_command = "echo clear"
    # else:
    #     clear_command = ""  # Default to empty if the platform is unknown

    # intro_lines = []

    # def output_handler(output):
    #     intro_lines.append(output)

    # cure_bridge_js.process(
    #     NODE_CUSTOM_STATICUS_INTRO, 
    #     output_handler, 
    #     "getIntroString", 
    #     TERMINAL_COLOR_256, 
    #     True
    # )

    # # Convert intro_lines list to a single string after processing
    # intro_echo_lines = []
    # for line in intro_lines:
    #     if line.strip():
    #         processed_line = line.replace("\n", "")
    #         intro_echo_lines.append(f'echo {processed_line} &&')
    #     else:
    #         intro_echo_lines.append('echo. &&')

    # help_message = get_help_message_color(intro_echo_lines, clear_command)

    if os.path.isdir(path_to_open):
        if current_platform == 'windows':
            # Determine the correct clear command based on the platform
            if current_platform == 'windows':
                clear_command = "echo cls"
            elif current_platform in ['linux', 'darwin']:  # macOS and Linux
                clear_command = "echo clear"
            else:
                clear_command = ""  # Default to empty if the platform is unknown

            intro_lines = []

            def output_handler(output):
                intro_lines.append(output)

            cure_bridge_js.process(
                NODE_CUSTOM_STATICUS_INTRO, 
                output_handler, 
                "getIntroString", 
                TERMINAL_COLOR_256, 
                True
            )

            # Convert intro_lines list to a single string after processing
            intro_echo_lines = []
            for line in intro_lines:
                if line.strip():
                    processed_line = line.replace("\n", "")
                    intro_echo_lines.append(f'echo {processed_line} &&')
                else:
                    intro_echo_lines.append('echo. &&')

            help_message = get_help_message_color(intro_echo_lines, clear_command)

            subprocess.Popen(f'start cmd /K "cd /d {path_to_open} && {help_message}"', shell=True)
        elif current_platform == 'darwin':  # macOS
            # subprocess.Popen(['open', '-a', 'Terminal', path_to_open, '-e', f'echo "{help_message}" && bash'])
            subprocess.Popen(['open', '-a', 'Terminal', path_to_open, '-e', f'bash'])
        elif current_platform == 'linux':
            # subprocess.Popen(['gnome-terminal', '--', 'bash', '-c', f'cd "{path_to_open}" && echo "{help_message}" && exec bash'])
            subprocess.Popen(['gnome-terminal', '--', 'bash', '-c', f'cd "{path_to_open}" && exec bash'])
    else:
        cure_log_bridge_js.log('warn', LOG_TAG_GUI, "Invalid directory selected (is invalid or does not exist):", {"path_to_open": path_to_open})

# # Define a function to handle terminal opening based on selection
# def open_selected_terminal(option):
#     if option == "Project Terminal":
#         open_terminal_at_directory(recent_dir_menu.get())  # Open project terminal
#     elif option == "Program Terminal":
#         open_terminal_at_directory(LOCATION_SCRIPT)  # Open program terminal

class App(customtkinter.CTk):
    def __init__(self):
        super().__init__()
        cure_log_bridge_js.log('init', LOG_TAG_GUI, [
            "[[NEWLINES]]",
            "Building initializing...", [
                "[[LIST]]",
                "This can take some time..."
            ]
        ])

        icon_path = os.path.join(LOCATION_SCRIPT, "source/resource/icon.ico") if current_platform == 'windows' else os.path.join(LOCATION_SCRIPT, "source/icon_128px.png")
        if os.path.exists(icon_path):
            if current_platform == 'windows':
                self.iconbitmap(icon_path)
            else:
                # icon_image = customtkinter.CTkImage(file=icon_path)
                # self.iconphoto(False, icon_image)
                cure_log_bridge_js.log('warn', LOG_TAG_GUI, "Custom window icons are not supported on this platform.")
        else:
            cure_log_bridge_js.log('warn', LOG_TAG_GUI, "Icon file not found:", {"icon_path": icon_path})

        # Hide the main window if specified
        if EXPERIMENT_HIDE_TERMINAL_MAIN:
            self.withdraw()  # Hides the main window
            cure_log_bridge_js.log('debug', LOG_TAG_GUI, "Main script window hidden.")

        self.title(SCRIPT_TITLE)
        self.geometry("600x400")

        main_row = 0

        cure_log_bridge_js.log('info', LOG_TAG_GUI, "UI Building...")
        if is_supported:

            # Configuration UI ===========================
            # Top Frame for Directory Configuration
            self.top_frame = customtkinter.CTkFrame(
                self, 
                fg_color=color_light_dark("#cccccc", "#333333")
            )
            self.top_frame.grid(
                row=main_row,
                column=0,
                sticky="ew",
                **config_padding
            )

            config_row = 0
            config_column = 0

            # self.label_config = customtkinter.CTkLabel(
            #     self.top_frame,
            #     text="Project",
            #     font=customtkinter.CTkFont(
            #         size=font_size__title,
            #         weight="bold"
            #     )
            # )
            # config_row_label = config_row
            # config_row += 1

            self.label_dir = customtkinter.CTkLabel(
                self.top_frame,
                text="Project",
                font=customtkinter.CTkFont(size=font_size__subtitle, weight="bold")
            )
            self.label_dir.grid(
                row=config_row,
                column=config_column,
                **config_padding
            )
            config_column += 1

            self.recent_dir_menu = customtkinter.CTkOptionMenu(
                self.top_frame,
                values=[],  # Initialize with an empty list
                command=update_config_dir
            )
            self.recent_dir_menu.grid(
                row=config_row,
                column=config_column,
                sticky="ew",
                **config_padding
            )
            self.top_frame.grid_columnconfigure(
                config_column,
                weight=1
            )  # Make the entry field stretch
            CTkToolTip(
                self.recent_dir_menu,
                message=f"Select a recent project directory.",
                **config_tooltip
            )
            config_column += 1

            # Add "Browse" button for file explorer
            self.button_browse_dir = customtkinter.CTkButton(
                self.top_frame,
                text="🔍",
                command=open_directory_explorer,
                fg_color=color_light_dark("#3B8ED0", "#286ba1"),
                hover_color=color_hover_shade(color_light_dark("#3B8ED0", "#286ba1")),
                width=0  # Allow dynamic width based on text
            )
            self.button_browse_dir.grid(
                row=config_row,
                column=config_column,
                **config_padding
            )
            CTkToolTip(
                self.button_browse_dir,
                message=f"Browse for new project directory.",
                **config_tooltip
            )
            config_column += 1

            # Add "Open Directory" button
            self.button_open_dir = customtkinter.CTkButton(
                self.top_frame,
                text="📂",
                command=open_selected_directory,
                fg_color=color_light_dark("#3B8ED0", "#286ba1"),
                hover_color=color_hover_shade(color_light_dark("#3B8ED0", "#286ba1")),
                width=0  # Allow dynamic width based on text
            )
            self.button_open_dir.grid(
                row=config_row,
                column=config_column,
                **config_padding
            )
            CTkToolTip(
                self.button_open_dir,
                message=f"Open the currently selected directory in your file browser.",
                **config_tooltip
            )
            config_column += 1

            self.button_open_terminal = customtkinter.CTkButton(
                self.top_frame,
                text=">_",
                # command=lambda: open_terminal_at_directory(self.recent_dir_menu.get()),
                command=lambda: open_terminal_at_directory(LOCATION_SCRIPT),
                fg_color=color_light_dark("#afafaf", "#505050"),
                hover_color=color_hover_shade(color_light_dark("#afafaf", "#505050")),
                text_color=color_light_dark("#000000", "#ffffff"),
                width=0  # Allow dynamic width based on text
            )
            self.button_open_terminal.grid(
                row=config_row,
                column=config_column,
                **config_padding
            )
            CTkToolTip(
                self.button_open_terminal,
                message=f"Open terminal for manual task entry.\n(Manual command entry offers maximum control.)",
                **config_tooltip
            )
            config_column += 1

            # # Add "Open Terminal" dropdown menu
            # self.terminal_menu = customtkinter.CTkOptionMenu(
            #     self.top_frame,
            #     values=[">_", "Project Terminal", "Program Terminal"],
            #     command=open_selected_terminal
            # )
            # self.terminal_menu.grid(
            #     row=config_row,
            #     column=config_column,
            #     **config_padding
            # )
            # CTkToolTip(
            #     self.terminal_menu,
            #     message="Open a terminal at the selected directory or the program directory.",
            #     **config_tooltip
            # )
            # config_column += 1

            # self.label_config.grid(
            #     row=config_row_label,
            #     column=0,
            #     sticky="ew",
            #     columnspan=config_column,
            #     **config_padding
            # )

            main_row += 1

            # Task UI ===========================
            # self.frame_task = customtkinter.CTkFrame(self)
            self.frame_task = customtkinter.CTkScrollableFrame(
                self,
                orientation="horizontal",
                fg_color=color_light_dark("#cccccc", "#333333")
            )
            self.frame_task.grid(
                row=main_row,
                column=0,
                sticky="nsew",
                **config_padding
            )
            self.grid_rowconfigure(
                main_row,
                weight=1
            )  # Stretch the row containing the task ui

            gulpfile_path = os.path.join(LOCATION_SCRIPT, "gulpfile.js")
            tasks_by_category = parse_gulpfile(gulpfile_path)

            task_row = 0

            # self.label_tasks = customtkinter.CTkLabel(
            #     self.frame_task,
            #     text="Task",
            #     font=customtkinter.CTkFont(
            #         size=font_size__title,
            #         weight="bold"
            #     )
            # )
            # self.label_tasks.grid(
            #     row=task_row,
            #     column=0,
            #     sticky="ew",
            #     **config_padding
            # )
            # task_row += 1

            # self.label_subtext = customtkinter.CTkLabel(self.frame_task, text="Manual command entry provides most control.")
            # self.label_subtext.grid(
            #     row=task_row,
            #     column=0,
            #     sticky="ew",
            #     **config_padding
            # )
            # task_row += 1

            # Create a horizontally scrollable frame
            # self.scrollable_frame_horizontal = customtkinter.CTkScrollableFrame(
            #     self.frame_task,
            #     orientation="horizontal"
            # )
            # self.scrollable_frame_horizontal.grid(
            #     row=task_row,
            #     column=0,
            #     sticky="nsew",
            #     **config_padding
            # )
            self.frame_task.grid_rowconfigure(
                task_row,
                weight=1
            )  # fill height
            self.frame_task.grid_columnconfigure(
                0,
                weight=1
            )  # fill width
            task_row += 1

            id_t = 0

            for category, tasks in tasks_by_category.items():
                cure_log_bridge_js.log('debug', LOG_TAG_GUI, f"Adding tasks for category: \"[[ANSI_OFF]]{category}[[ANSI_ON]]\"")
                self.scrollable_button_frame = MyScrollableButtonFrame(
                    self.frame_task,
                    title=category,
                    # width=0,
                    values=tasks
                )
                self.scrollable_button_frame.grid(
                    row=0,
                    column=id_t,
                    sticky="nsew",
                    **config_padding
                )

                # self.scrollable_frame_horizontal.grid_columnconfigure(
                #     id_t,
                #     weight=1#,
                #     # minsize=100
                # )  # fill width
                id_t += 1

            # self.scrollable_frame_horizontal.grid_rowconfigure(
            #     0,
            #     weight=1
            # )  # fill height

            main_row += 1

        main_row += 1

        # Result UI ===========================

        # self.result_label = customtkinter.CTkLabel(self, text="Execution Status", font=customtkinter.CTkFont(size=font_size__title, weight="bold"))
        # self.result_label.grid(row=main_row, column=0, sticky="ew", **config_padding)
        # main_row += 1

        self.result_text = customtkinter.CTkLabel(self, text="Select a task")
        self.result_text.grid(row=main_row, column=0, sticky="ew", **config_padding)

        self.grid_columnconfigure(0, weight=1)

        # #equal height rows for not supported dialogue
        # if not is_supported:
        #     for row in range(main_row + 1):
        #         self.grid_rowconfigure(row, weight=1)

        # # Make the main window rows stretchable
        # self.grid_rowconfigure(main_row, weight=1)  # Row for the scrollable frame
        # self.grid_rowconfigure(main_row + 1, weight=0)  # Row for the status message (fixed height)

        cure_log_bridge_js.log('success', LOG_TAG_GUI, "UI Built.")
        cure_log_bridge_js.log('init', LOG_TAG_GUI, "Building complete.")

try:
    app = App()
    result_text = app.result_text
    recent_dir_menu = app.recent_dir_menu

    # Populate recent project dropdown after initializing UI
    update_recents_dropdown(config_settings.get('dir_recent', []))  # Fallback will be handled if empty

    if is_supported:
        result_text.configure(text=f"Supported operating system: {current_platform}. Select a task.", text_color="green")
    else:
        result_text.configure(text=f"Unsupported operating system: {current_platform}", text_color="red")

    cure_log_bridge_js.log('begin', LOG_TAG_GUI, "Running...")
    app.mainloop()
except Exception as e:
    cure_log_bridge_js.log('error', LOG_TAG_GUI, "Error initializing app:", e)
