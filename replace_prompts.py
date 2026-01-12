#!/usr/bin/env python3
"""
Replace hard-coded prompts with manifest lookup calls.
This eliminates identical prompt templates.
"""

import json
import re
from pathlib import Path


def load_manifest():
    """Load prompt manifest."""
    manifest_path = Path("src/compression/data/prompt_manifest.json")
    with open(manifest_path) as f:
        return json.load(f)


def generate_lookup_code(prompt_name: str, key: str) -> str:
    """Generate manifest lookup call."""
    return f'getManifest().getPromptByHash("{key}")'


def process_file(file_path: Path, manifest: dict) -> bool:
    """Replace hard-coded prompts in a file."""
    content = file_path.read_text(encoding="utf-8")
    original = content

    modified = False

    # Find all prompt constants and replace
    for key, prompt_data in manifest["prompts"].items():
        prompt_name = prompt_data["name"]
        pattern = rf"const\s+{re.escape(prompt_name)}\s*=\s*`[^`]*`"

        if re.search(pattern, content):
            replacement = (
                f'const {prompt_name} = getManifest().getPromptByHash("{key}")'
            )
            content = re.sub(pattern, replacement, content)
            modified = True
            print(f"  Replaced {prompt_name} in {file_path.name}")

    if modified and content != original:
        file_path.write_text(content, encoding="utf-8")
        return True

    return False


def add_import(file_path: Path) -> bool:
    """Add manifest import if needed."""
    content = file_path.read_text(encoding="utf-8")

    if "getManifest" in content and "from" not in content:
        lines = content.split("\n")

        # Find first import line
        import_idx = 0
        for i, line in enumerate(lines):
            if line.strip().startswith("import "):
                import_idx = i
                break

        # Add import
        import_line = "import { getManifest } from '../compression/prompt_manifest.js'"
        lines.insert(import_idx + 1, import_line)

        file_path.write_text("\n".join(lines), encoding="utf-8")
        print(f"  Added import to {file_path.name}")
        return True

    return False


def main():
    """Main function."""
    print("Replacing hard-coded prompts with manifest lookups...")

    manifest = load_manifest()
    modified_count = 0

    for ts_file in Path("src").rglob("*.ts"):
        if "node_modules" in str(ts_file) or "dist" in str(ts_file):
            continue

        if process_file(ts_file, manifest):
            modified_count += 1

    print(f"\nModified {modified_count} files")
    print("\nNote: You'll need to:")
    print("1. Build the Python compression modules")
    print("2. Create TypeScript bindings for them")
    print("3. Update imports to use JS module")


if __name__ == "__main__":
    main()
