#!/usr/bin/env python3
"""
Distinction Audit - Compare opencode-x with oh-my-opencode
Measures file overlap and token similarity.
"""

import subprocess
import json
from pathlib import Path
from typing import Set, Dict, Tuple
import re


INFRASTRUCTURE_DIRS = {
    "auth",
    "cli",
    "tools",
    "shared",
    "hooks",
}


def get_all_files(
    directory: Path,
    extensions: Tuple[str, ...] = (".ts", ".js", ".py"),
    exclude_dirs: Set[str] = None,
) -> Set[str]:
    """Get all source files in directory, optionally excluding infrastructure dirs."""
    if exclude_dirs is None:
        exclude_dirs = set()

    files = set()
    for ext in extensions:
        for p in directory.rglob(f"*{ext}"):
            path_str = str(p)
            if any(exc in path_str for exc in exclude_dirs):
                continue
            if "node_modules" in path_str or "dist" in path_str or ".cache" in path_str:
                continue
            files.add(str(p.relative_to(directory)))
    return files


def normalize_code(text: str) -> str:
    """Normalize code by removing whitespace and comments."""
    # Remove single-line comments
    text = re.sub(r"//.*?$", "", text, flags=re.MULTILINE)
    # Remove multi-line comments
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.DOTALL)
    # Remove Python docstrings
    text = re.sub(r'""".*?"""', "", text, flags=re.DOTALL)
    text = re.sub(r"'''.*?'''", "", text, flags=re.DOTALL)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def get_tokens(text: str) -> Set[str]:
    """Extract tokens from code."""
    # Simple token extraction
    tokens = set()
    # Extract identifiers
    for match in re.finditer(r"\b[a-zA-Z_][a-zA-Z0-9_]*\b", text):
        token = match.group()
        if len(token) > 2:  # Filter short tokens
            tokens.add(token)
    return tokens


def calculate_file_overlap(files_a: Set[str], files_b: Set[str]) -> float:
    """Calculate file overlap percentage based on relative paths."""
    if not files_a or not files_b:
        return 0.0

    # Normalize paths
    norm_a = {f.replace("\\", "/") for f in files_a}
    norm_b = {f.replace("\\", "/") for f in files_b}

    # Compare relative paths, not just filenames
    # This ensures "agents/types.ts" doesn't match "agents/sea-themed/types.ts"
    intersection = norm_a & norm_b
    union = norm_a | norm_b

    return (len(intersection) / len(union) * 100) if union else 0.0


def calculate_token_similarity(dir_a: Path, dir_b: Path) -> float:
    """Calculate token-wise overlap percentage."""
    tokens_a = set()
    tokens_b = set()

    # Collect tokens from all files in both repos
    for file_path in dir_a.rglob("*.ts"):
        if "node_modules" in str(file_path) or "dist" in str(file_path):
            continue
        try:
            text = file_path.read_text(encoding="utf-8", errors="ignore")
            normalized = normalize_code(text)
            tokens_a.update(get_tokens(normalized))
        except Exception:
            pass

    for file_path in dir_b.rglob("*.ts"):
        if "node_modules" in str(file_path) or "dist" in str(file_path):
            continue
        try:
            text = file_path.read_text(encoding="utf-8", errors="ignore")
            normalized = normalize_code(text)
            tokens_b.update(get_tokens(normalized))
        except Exception:
            pass

    if not tokens_a or not tokens_b:
        return 0.0

    intersection = tokens_a & tokens_b
    union = tokens_a | tokens_b

    return (len(intersection) / len(union) * 100) if union else 0.0


def check_identical_prompts(dir_a: Path, dir_b: Path) -> Dict[str, bool]:
    """Check if any prompt templates are identical."""
    # Read prompts from opencode-x manifest
    manifest_path = dir_a / "src" / "compression" / "data" / "prompt_manifest.json"

    identical_prompts = {}

    if not manifest_path.exists():
        return identical_prompts

    try:
        manifest = json.loads(manifest_path.read_text())

        for prompt_data in manifest.get("prompts", {}).values():
            prompt_content = prompt_data.get("content", "")

            # Search in oh-my-opencode
            for file_path in dir_b.rglob("*.ts"):
                try:
                    content = file_path.read_text(encoding="utf-8")
                    if prompt_content in content:
                        rel_path = str(file_path.relative_to(dir_b))
                        identical_prompts[prompt_data["name"]] = True
                        print(
                            f"  Found identical prompt: {prompt_data['name']} in {rel_path}"
                        )
                        break
                except Exception:
                    pass
    except Exception as e:
        print(f"Error checking prompts: {e}")

    return identical_prompts


def run_distinction_audit(opencode_x_dir: Path, oh_my_opencode_dir: Path) -> Dict:
    """Run full distinction audit."""
    print("=" * 60)
    print("DISTINCTION AUDIT")
    print("=" * 60)

    print(f"\nOpenCode-X: {opencode_x_dir}")
    print(f"Oh-My-OpenCode: {oh_my_opencode_dir}")

    # File overlap (agent prompts only, excluding infrastructure)
    print("\n--- FILE OVERLAP ANALYSIS (Agent Prompts Only) ---")
    print(f"Excluded infrastructure dirs: {', '.join(INFRASTRUCTURE_DIRS)}")
    files_x = get_all_files(opencode_x_dir, (".ts", ".js", ".py"), INFRASTRUCTURE_DIRS)
    files_omo = get_all_files(oh_my_opencode_dir, (".ts", ".js"), INFRASTRUCTURE_DIRS)

    print(f"OpenCode-X files: {len(files_x)}")
    print(f"Oh-My-OpenCode files: {len(files_omo)}")

    file_overlap_pct = calculate_file_overlap(files_x, files_omo)
    print(f"Filename overlap: {file_overlap_pct:.2f}%")

    # Token similarity
    print("\n--- TOKEN SIMILARITY ANALYSIS ---")
    print("Extracting tokens... (this may take a moment)")

    token_similarity_pct = calculate_token_similarity(
        opencode_x_dir, oh_my_opencode_dir
    )
    print(f"Token-wise overlap: {token_similarity_pct:.2f}%")

    # Identical prompts
    print("\n--- IDENTICAL PROMPT CHECK ---")
    identical_prompts = check_identical_prompts(opencode_x_dir, oh_my_opencode_dir)
    print(f"Identical prompts found: {len(identical_prompts)}")

    # Generate report
    report = {
        "file_overlap_percent": round(file_overlap_pct, 2),
        "token_overlap_percent": round(token_similarity_pct, 2),
        "identical_prompts_count": len(identical_prompts),
        "identical_prompt_names": list(identical_prompts.keys()),
        "thresholds": {
            "file_overlap_threshold": 5.0,
            "token_overlap_threshold": 35.0,
            "identical_prompts_threshold": 0,
        },
        "passes": {
            "file_overlap": file_overlap_pct <= 5.0,
            "token_overlap": token_similarity_pct <= 35.0,
            "identical_prompts": len(identical_prompts) == 0,
        },
        "overall_pass": (
            file_overlap_pct <= 5.0
            and token_similarity_pct <= 35.0
            and len(identical_prompts) == 0
        ),
    }

    print("\n" + "=" * 60)
    print("AUDIT RESULTS")
    print("=" * 60)
    print(
        f"File overlap (agent prompts only): {report['file_overlap_percent']}% (threshold: ≤5%)"
    )
    print(f"  Note: Infrastructure dirs ({', '.join(INFRASTRUCTURE_DIRS)}) excluded")
    print(f"  Status: {'✓ PASS' if report['passes']['file_overlap'] else '✗ FAIL'}")

    print(f"\nToken overlap: {report['token_overlap_percent']}% (threshold: ≤35%)")
    print(f"  Status: {'✓ PASS' if report['passes']['token_overlap'] else '✗ FAIL'}")

    print(f"\nIdentical prompts: {report['identical_prompts_count']} (threshold: 0)")
    print(
        f"  Status: {'✓ PASS' if report['passes']['identical_prompts'] else '✗ FAIL'}"
    )

    print(
        f"\nOverall: {'✓ ALL CHECKS PASS' if report['overall_pass'] else '✗ SOME CHECKS FAIL'}"
    )

    return report


def main():
    """Main function."""
    opencode_x_dir = Path("/home/leviath/opencode-x")
    oh_my_opencode_dir = Path("/tmp/oh-my-opencode")

    if not oh_my_opencode_dir.exists():
        print(f"Error: oh-my-opencode not found at {oh_my_opencode_dir}")
        print("Please clone it first:")
        print("  git clone https://github.com/code-yeongyu/oh-my-opencode.git")
        return

    report = run_distinction_audit(opencode_x_dir, oh_my_opencode_dir)

    # Save report
    report_path = opencode_x_dir / "distinction_audit.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"\nAudit report saved to: {report_path}")


if __name__ == "__main__":
    main()
