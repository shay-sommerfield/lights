#!/usr/bin/env sh

# Accoring to chat GPT
# Setting -euo pipefail in a shell script improves its reliability and helps catch potential errors early. Here's what each option does:
# -e (Exit on Error):

# The script will immediately exit if any command returns a non-zero exit status (i.e., an error).
# Without -e, the script would continue executing subsequent commands even if one fails, which could lead to unexpected behavior or corrupted data.
# -u (Treat Unset Variables as an Error):

# The script will exit if it tries to use an undefined or unset variable.
# This helps catch typographical errors and logical mistakes where a variable might be used before it is set.
# -o pipefail (Pipeline Error Propagation):

# Ensures that the entire pipeline fails if any command in the pipeline fails, not just the last one.
# For example, in cmd1 | cmd2 | cmd3, if cmd1 fails, the pipeline will fail, even if cmd2 and cmd3 succeed. This prevents ignoring errors in earlier parts of a pipeline.

set -euo pipefail

# uvicorn starts our 'app.py' server on port 8000
# of 127.0.0.1
uvicorn app:app --port 8000