import atexit
import ctypes
import json
import os
import platform
import signal
import subprocess
import sys

# Define global variables
script_location = os.path.dirname(os.path.abspath(__file__))
logger_bridge_script = os.path.join(script_location, '../node_modules_custom/cure-log-bridge-py/index.js')
file_log = None
log_process = None
log_process_init = False
log_process_none_notify = False

log_tag_bridge_python = '[🌉 Log Bridge Python Setup]'

def printStdoutOutput(stream):
    """
    Reads output from a given stream (stdout) until the LOG_BRIDGE_END marker is encountered.

    Args:
        stream (IO[str]): The stream to read from (e.g., subprocess stdout).

    Returns:
        str: The formatted output without the terminating marker.
    """
    if stream is None:
        return

    output_buffer = []

    while True:
        output = stream.readline()#.rstrip()

        if output.strip() == "LOG_BRIDGE_END":
            break
        elif output:
            output_buffer.append(output)
        else:
            break

    formatted_output = "".join(output_buffer)

    if formatted_output:
        print(formatted_output, end='')

def show_native_error(message):
    system_platform = platform.system().lower()
    if system_platform == 'windows':
        ctypes.windll.user32.MessageBoxW(0, f"{message}\nSee {file_log} for details.", "Staticus GUI Error", 0x10)
    elif system_platform == 'darwin':  # macOS
        os.system(f"osascript -e 'display dialog \"{message}\nSee {file_log} for details.\" with title \"Staticus GUI Error\" buttons \"OK\" default button \"OK\"'")
    elif system_platform == 'linux':
        os.system(f"zenity --error --text=\"{message}\nSee {file_log} for details.\" --title=\"Staticus GUI Error\"")

def log(level, *args):
    """
    Sends log messages to the persistent Node.js logging system.

    Args:
        level (str): Logging level (e.g., 'info', 'warn', 'error', 'success').
        tag (str): Custom tag for log categorization.
        message (str): The log message.
    """
    global log_process_init, log_process_none_notify

    # print("[DEBUG LOG IN PY]", args)

    if log_process is None or log_process.stdin is None or log_process.stdin.closed:
        if log_process_init and not log_process_none_notify:
            print(log_tag_bridge_python, "[Notify] Log process not running or stdin closed.")
            log_process_none_notify = True

        print(log_tag_bridge_python, f"[{level.capitalize()}]", ' '.join(map(str, args)))

        return

    if log_process_none_notify:
        log_process_none_notify = False

    log_entry = json.dumps({"level": level, "args": args})
    log_process.stdin.write(log_entry + "\n")
    log_process.stdin.flush()

    printStdoutOutput(log_process.stdout)
    printStdoutOutput(log_process.stderr)

    # if level.lower() == 'error':
    #     show_native_error(f"Error: {log_process.stdout}")

def cleanup(message: str = ''):
    """
    Ensure the logging process terminates when the script exits.
    """
    global log_process

    if not log_process:
        return

    message_full = "Closing gracefully..."
    if message:
        message_full += '\n' + message

    try:
        if log_process.poll() is not None:  # Check if process is not running
            log('shutdown', '[Shut Down] Logger shut down already.')
        else:  # Process is still running
            log('shutdown', log_tag_bridge_python, message_full)

            if log_process.stdin and not log_process.stdin.closed:
                log_process.stdin.close()

            log('info', "Shutting down logger...")

            log_process.terminate()
            log_process.wait(timeout=5)

            if log_process.stdout and not log_process.stdout.closed:
                log_process.stdout.close()
            if log_process.stderr and not log_process.stderr.closed:
                log_process.stderr.close()

            log('shutdown', 'Logger shut down complete.')
    except OSError as e:
        log('error', f'Cleanup encountered an issue: {e}')
    except Exception as e:
        log('error', f'Unexpected issue during cleanup: {e}')
    finally:
        log_process = None  # Ensure process reference is removed
        log('shutdown', 'Complete.')

def init_signal_handlers():
    """
    Initialize signal handlers for clean termination.
    """

    def signal_handler(sig, frame):
        cleanup(f"Received termination signal {sig}, shutting down gracefully.")
        sys.exit(0)

    # Handle common signals for cross-platform compatibility
    signals = [signal.SIGINT, signal.SIGTERM]

    # Add Unix-specific signals conditionally
    if hasattr(signal, 'SIGHUP'):
        signals.append(signal.SIGHUP)
    if hasattr(signal, 'SIGQUIT'):
        signals.append(signal.SIGQUIT)

    for sig in signals:
        signal.signal(sig, signal_handler)

def init(file_log_path: str):
    global log_process, file_log, log_process_init

    log('init', 'Initializing...')

    if log_process != None:
        log('warn', log_tag_bridge_python, 'Already running.')
        return

    if not file_log_path:
        log('init', 'Please give a valid log file path')
        return

    file_log = file_log_path # os.path.join(script_location, '../_log', f'{file_log_path}.log')

    try:
        log_process = subprocess.Popen(
            ['node', logger_bridge_script, file_log],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8'
        )

        # Register cleanup for normal exit
        atexit.register(cleanup)

        # Set up signal handlers
        init_signal_handlers()

    except Exception as e:
        log('error', 'Failed to start logging process: {e}')
        sys.exit(1)

    log_process_init = True
    log('init', 'Complete.')
