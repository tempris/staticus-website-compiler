import subprocess

def print_output(output):
    print(f"{output}\033[0m", flush=True, end='')

def process(js_file, callback=None, func_name=None, *args):
    """
    Runs a JavaScript function inside the given file using Node.js and processes its output in real-time.

    Args:
        js_file (str): Path to the JavaScript file.
        callback (function): A function to call with each line of output.
        func_name (str, optional): Name of the function to run inside the JS file.
        *args: Arguments to pass to the JS function.

    Returns:
        int: The exit code of the JavaScript process.
    """
    # Convert the path to a format compatible with JS (escaping backslashes)
    js_file = js_file.replace("\\", "\\\\")

    if func_name:
        # Construct the Node.js command to invoke the function asynchronously
        js_args = ', '.join(
            'true' if arg is True else 'false' if arg is False else f'"{arg}"' if isinstance(arg, str) else str(arg)
            for arg in args
        )  # Convert args to a JS-compatible string
        node_command = f"""
            (async () => {{
                const {{ {func_name} }} = require('{js_file}');
                const result = await {func_name}({js_args});
                if (result !== null && result !== undefined) {{
                    console.log(result);
                }}
            }})();
        """
        cmd = ["node", "-e", node_command]
    else:
        cmd = ["node", js_file]

    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding='utf-8',
        bufsize=1  # Unbuffered output for real-time streaming
    )

    # Read and print output line by line in real-time
    with process.stdout:
        for line in iter(process.stdout.readline, ''):
            line = line#.rstrip('\n')
            if callback and line:
                callback(line)

    # Read stderr in case of errors
    with process.stderr:
        for line in iter(process.stderr.readline, ''):
            line = line#.rstrip('\n')
            print(f"JS Error: {line}", end='')

    process.wait()
    return process.returncode  # Get the JS process exit code

if __name__ == "__main__":
    import os

    script_location = os.path.dirname(os.path.abspath(__file__))
    js_file = os.path.join(script_location, "../node_modules_custom/cure-bridge-py/index.js")

    def output_handler(output):
        print_output(f"\033[36mJS Output: {output}\033[0m")

    print("\033[35mRunning script with callback...\033[0m")
    exit_code = process(js_file, callback=output_handler)
    print(f"\033[32mJavaScript process exited with code: {exit_code}\033[0m\n")

    print("\033[35mRunning script with callback and function...\033[0m")
    exit_code = process(js_file, output_handler, "calculateSum", [4, 5, 6], 2)
    print(f"\033[32mJavaScript process exited with code: {exit_code}\033[0m\n")

    print("\033[35mRunning script with callback and function...\033[0m")
    exit_code = process(js_file, output_handler, "getAnsiString", "This text should be blue.", "blue")
    print(f"\033[32mJavaScript process exited with code: {exit_code}\033[0m\n")
