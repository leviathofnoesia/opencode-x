#!/usr/bin/env python3
"""
Generate SBOM in CycloneDX JSON format for opencode-x.
"""

import json
from pathlib import Path
from datetime import datetime
import hashlib


def get_file_hash(file_path: Path) -> str:
    """Compute SHA-256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def generate_cyclonedx_sbom(opencode_x_dir: Path) -> dict:
    """Generate CycloneDX 1.4 SBOM."""

    # Read package.json
    package_json = json.loads((opencode_x_dir / "package.json").read_text())

    # Get all TypeScript files
    ts_files = list(opencode_x_dir.rglob("*.ts"))
    py_files = list(opencode_x_dir.rglob("*.py"))

    # Collect dependencies
    dependencies = []
    for name, info in package_json.get("dependencies", {}).items():
        dependencies.append({"ref": f"pkg:npm/{name}@{info}", "type": "runtime"})

    for name, info in package_json.get("devDependencies", {}).items():
        dependencies.append({"ref": f"pkg:npm/{name}@{info}", "type": "dev"})

    # Components (Python modules)
    components = []

    # Python source files
    for py_file in py_files:
        if "__pycache__" in str(py_file) or ".pyc" in str(py_file):
            continue

        rel_path = py_file.relative_to(opencode_x_dir)
        file_hash = get_file_hash(py_file)

        components.append(
            {
                "type": "library",
                "name": f"opencode-x/{rel_path}",
                "version": "4.0.0-libre",
                "purl": f"pkg:python/opencode-x/{str(rel_path).replace('/', '%2F')}@4.0.0-libre",
                "licenses": [{"license": {"id": "MIT"}}],
                "hashes": [{"alg": "SHA-256", "content": file_hash}],
                "properties": [{"name": "src:file:language", "value": "python"}],
            }
        )

    # TypeScript source files
    for ts_file in ts_files:
        if "node_modules" in str(ts_file) or "dist" in str(ts_file):
            continue

        rel_path = ts_file.relative_to(opencode_x_dir)
        file_hash = get_file_hash(ts_file)

        components.append(
            {
                "type": "library",
                "name": f"opencode-x/{rel_path}",
                "version": "4.0.0-libre",
                "purl": f"pkg:typescript/opencode-x/{str(rel_path).replace('/', '%2F')}@4.0.0-libre",
                "licenses": [{"license": {"id": "MIT"}}],
                "hashes": [{"alg": "SHA-256", "content": file_hash}],
                "properties": [{"name": "src:file:language", "value": "typescript"}],
            }
        )

    # NPM dependencies as components
    for name, version in package_json.get("dependencies", {}).items():
        components.append(
            {
                "type": "library",
                "name": name,
                "version": version,
                "purl": f"pkg:npm/{name}@{version}",
                "scope": "required",
                "externalReferences": [
                    {"type": "website", "url": f"https://www.npmjs.com/package/{name}"}
                ],
            }
        )

    # Create SBOM
    sbom = {
        "$schema": "http://cyclonedx.org/schema/bom-1.4.schema.json",
        "bomFormat": "CycloneDX",
        "specVersion": "1.4",
        "version": 1,
        "metadata": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "tools": [
                {
                    "vendor": "OpenCode-X",
                    "name": "ocx-sbom-generator",
                    "version": "1.0.0",
                }
            ],
            "component": {
                "type": "application",
                "name": "opencode-x",
                "version": "4.0.0-libre",
                "description": package_json.get(
                    "description", "OpenCode-X - Sea-Themed AI Agent Harness"
                ),
                "purl": "pkg:generic/opencode-x@4.0.0-libre",
                "licenses": [{"license": {"id": "MIT"}}],
                "externalReferences": [
                    {
                        "type": "vcs",
                        "url": package_json.get("repository", {}).get("url", ""),
                    },
                    {"type": "website", "url": package_json.get("homepage", "")},
                ],
            },
            "properties": [
                {"name": "ocx:compression:enabled", "value": "true"},
                {"name": "ocx:compression:ratio", "value": "5x"},
                {"name": "ocx:adaptive_depth:enabled", "value": "true"},
                {"name": "ocx:prompt_journal:enabled", "value": "true"},
            ],
        },
        "components": components,
        "dependencies": [
            {
                "ref": "pkg:generic/opencode-x@4.0.0-libre",
                "dependsOn": [d["ref"] for d in dependencies],
            }
        ],
    }

    return sbom


def main():
    """Main function."""
    opencode_x_dir = Path("/home/leviath/opencode-x")

    print("Generating CycloneDX SBOM...")
    sbom = generate_cyclonedx_sbom(opencode_x_dir)

    output_path = opencode_x_dir / "sbom.cyclonedx.json"
    with open(output_path, "w") as f:
        json.dump(sbom, f, indent=2, ensure_ascii=False)

    print(f"SBOM saved to: {output_path}")
    print(f"Total components: {len(sbom['components'])}")
    print(f"Total dependencies: {len(sbom['dependencies'][0]['dependsOn'])}")


if __name__ == "__main__":
    main()
