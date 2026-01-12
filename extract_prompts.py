#!/usr/bin/env python3
"""
Extract all hard-coded prompt strings from TypeScript codebase.
Generates prompt manifest with 16-bit hashed keys.
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Tuple
import hashlib


def extract_prompts_from_file(file_path: Path) -> List[Tuple[str, str]]:
    """
    Extract hard-coded prompt strings from a TypeScript file.
    Returns list of (prompt_name, prompt_content) tuples.
    """
    if not file_path.exists():
        return []

    content = file_path.read_text(encoding="utf-8")
    prompts = []

    # Pattern 1: const XXX_PROMPT = `...`
    pattern1 = re.compile(r"const\s+([A-Z_]+PROMPT)\s*=\s*`([^`]*)`", re.DOTALL)
    for match in pattern1.finditer(content):
        prompt_name = match.group(1)
        prompt_content = match.group(2)
        if len(prompt_content) > 100:  # Only extract substantial prompts
            prompts.append((prompt_name, prompt_content))

    # Pattern 2: export const XXX_PROMPT = `...`
    pattern2 = re.compile(
        r"export\s+const\s+([A-Z_]+PROMPT)\s*=\s*`([^`]*)`", re.DOTALL
    )
    for match in pattern2.finditer(content):
        prompt_name = match.group(1)
        prompt_content = match.group(2)
        if len(prompt_content) > 100:
            prompts.append((prompt_name, prompt_content))

    return prompts


def scan_directory(
    directory: Path, include_patterns: List[str]
) -> Dict[str, List[Tuple[str, str]]]:
    """
    Scan directory for TypeScript files and extract prompts.
    Returns dict mapping file paths to list of prompts.
    """
    results = {}

    for pattern in include_patterns:
        for file_path in directory.rglob(pattern):
            prompts = extract_prompts_from_file(file_path)
            if prompts:
                results[str(file_path)] = prompts

    return results


def generate_16bit_key(name: str) -> str:
    """Generate 16-bit hashed key (4 hex chars)."""
    hash_bytes = hashlib.md5(name.encode("utf-8")).digest()[:2]
    return hash_bytes.hex()


def create_prompt_manifest(scan_results: Dict[str, List[Tuple[str, str]]]) -> Dict:
    """
    Create prompt manifest from scan results.
    Returns manifest dictionary.
    """
    manifest = {
        "version": "1.0",
        "prompts": {},
        "metadata": {"total_prompts": 0, "total_files": len(scan_results)},
    }

    for file_path, prompts in scan_results.items():
        for prompt_name, prompt_content in prompts:
            key = generate_16bit_key(prompt_name)

            manifest["prompts"][key] = {
                "name": prompt_name,
                "source_file": file_path,
                "content": prompt_content,
                "estimated_tokens": len(prompt_content.split()) * 1.3,
            }

            manifest["metadata"]["total_prompts"] += 1

    return manifest


def main():
    """Main extraction function."""
    opencode_x_dir = Path("/home/leviath/opencode-x")

    print("Scanning opencode-x for hard-coded prompts...")

    # Scan for TypeScript files
    scan_results = scan_directory(opencode_x_dir / "src", ["*.ts"])

    print(f"Found prompts in {len(scan_results)} files")

    # Create manifest
    manifest = create_prompt_manifest(scan_results)

    # Save manifest
    output_path = (
        opencode_x_dir / "src" / "compression" / "data" / "prompt_manifest.json"
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"\nPrompt manifest saved to: {output_path}")
    print(f"Total prompts extracted: {manifest['metadata']['total_prompts']}")

    # Print summary
    print("\nPrompts by file:")
    for file_path, prompts in scan_results.items():
        print(f"  {file_path}: {len(prompts)} prompts")


if __name__ == "__main__":
    main()
