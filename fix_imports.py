#!/usr/bin/env python3
"""
Fix import statements after file renames.
"""

import re
from pathlib import Path


IMPORT_FIXES = [
    ('from "./types"', 'from "./types-ocx"'),
    ('from "./sisyphus"', 'from "./sisyphus-ocx"'),
    ('from "./librarian"', 'from "./librarian-opencode-x-ocx"'),
    ('from "./explore"', 'from "./explore-opencode-x-ocx"'),
    (
        'from "./frontend-ui-ux-engineer"',
        'from "./frontend-ui-ux-engineer-opencode-x-ocx"',
    ),
    ('from "./document-writer"', 'from "./document-writer-opencode-x-ocx"'),
    ('from "./multimodal-looker"', 'from "./multimodal-looker-opencode-x-ocx"'),
    ('from "./metis"', 'from "./metis-ocx"'),
    ('from "./momus"', 'from "./momus-ocx"'),
    ('from "./orchestrator-sisyphus"', 'from "./orchestrator-sisyphus-ocx"'),
    ('from "./plan-prompt"', 'from "./plan-prompt-ocx"'),
    ('from "./prometheus-prompt"', 'from "./prometheus-prompt-ocx"'),
    ('from "./sisyphus-junior"', 'from "./sisyphus-junior-ocx"'),
    ('from "./sisyphus-prompt-builder"', 'from "./sisyphus-prompt-builder-ocx"'),
    ('from "./sea-themed"', 'from "./sea-themed-ocx"'),
    ('from "../shared/permission-compat"', 'from "../shared/permission-compat-ocx"'),
    ('from "../shared"', 'from "../shared-ocx"'),
    (
        'from "../tools/sisyphus-task/constants"',
        'from "../tools/sisyphus-task/constants-ocx"',
    ),
    (
        'from "../features/opencode-skill-loader/skill-content"',
        'from "../features/opencode-skill-loader/skill-content-ocx"',
    ),
    # Type name changes
    ("AgentConfig", "AgentConfiguration"),
    ("AgentPromptMetadata", "PromptInfo"),
    ("BuiltinAgentName", "CoreAgentType"),
    ("AgentOverrideConfig", "AgentCustomization"),
    ("AgentOverrides", "AgentModifications"),
    ("AgentFactory", "AgentBuilder"),
    ("AgentSource", "AgentOrigin"),
    ("AgentName", "AgentIdentifier"),
    ("OverridableAgentName", "CustomizableAgentType"),
]


def fix_imports(content: str) -> tuple[str, dict]:
    """Apply import path fixes."""
    stats = {"fixes": 0}
    modified = False

    for old, new in IMPORT_FIXES:
        if old in content:
            count = content.count(old)
            if count > 0:
                content = content.replace(old, new)
                stats[old] = count
                modified = True

    return content, stats


def main():
    """Main function."""
    opencode_x_dir = Path("/home/leviath/opencode-x/src")

    print("=" * 60)
    print("IMPORT PATH FIXING")
    print("=" * 60)

    total_fixes = 0

    for ts_file in opencode_x_dir.rglob("*.ts"):
        if "node_modules" in str(ts_file) or "dist" in str(ts_file):
            continue

        content = ts_file.read_text(encoding="utf-8")
        original = content

        new_content, stats = fix_imports(content)

        if new_content != original:
            ts_file.write_text(new_content, encoding="utf-8")
            print(f"✓ {ts_file.relative_to(opencode_x_dir)}")
            total_fixes += sum(stats.values())

    print("\n" + "=" * 60)
    print("IMPORT FIX SUMMARY")
    print("=" * 60)
    print(f"Total import fixes: {total_fixes}")


if __name__ == "__main__":
    main()
