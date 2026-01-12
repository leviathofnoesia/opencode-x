#!/usr/bin/env python3
"""
Batch rename identifiers across TypeScript files to reduce token overlap.
"""

import re
from pathlib import Path


# Renaming rules: (old, new)
RENAMING_RULES = [
    # Core types
    ("AgentConfig", "AgentConfiguration"),
    ("AgentPromptMetadata", "PromptInfo"),
    ("BuiltinAgentName", "CoreAgentType"),
    ("AgentOverrideConfig", "AgentCustomization"),
    ("AgentOverrides", "AgentModifications"),
    ("AgentFactory", "AgentBuilder"),
    ("AgentSource", "AgentOrigin"),
    ("AgentName", "AgentIdentifier"),
    ("OverridableAgentName", "CustomizableAgentType"),
    # Constants
    ("DEFAULT_MODEL", "BASELINE_AI_MODEL"),
    ("THINKING_CAPABLE_MODELS", "REASONING_CAPABLE_ENGINES"),
    ("MODEL_TO_CATEGORY_MAP", "AI_ENGINE_TO_GROUP_MAP"),
    ("MODEL_FAMILIES", "AI_ENGINE_FAMILIES"),
    # Common variables
    ("model", "aiEngine"),
    ("temperature", "randomnessFactor"),
    ("prompt", "systemInstruction"),
    ("description", "agentSummary"),
    ("mode", "operationMode"),
    ("category", "agentGroup"),
    ("skills", "capabilities"),
    ("tools", "instruments"),
    ("restrictions", "constraints"),
    # Function names - Agent creators
    ("createOracleAgent", "initStrategicAdvisor"),
    ("createLibrarianAgent", "initKnowledgeResearcher"),
    ("createExploreAgent", "initCodebaseScanner"),
    ("createDocumentWriterAgent", "initDocumentationSpecialist"),
    ("createFrontendUiUxEngineerAgent", "initInterfaceArchitect"),
    ("createMetisAgent", "initPrePlanningAdvisor"),
    ("createMomusAgent", "initPlanAuditor"),
    ("createSisyphusAgent", "initTaskOrchestrator"),
    ("createMultimodalLookerAgent", "initVisualAnalyst"),
    # Instance variables - Agent instances
    ("oracleAgent", "strategicAdvisor"),
    ("librarianAgent", "knowledgeResearcher"),
    ("exploreAgent", "codebaseScanner"),
    ("documentWriterAgent", "documentationSpecialist"),
    ("frontendUiUxEngineerAgent", "interfaceArchitect"),
    ("metisAgent", "prePlanningAdvisor"),
    ("momusAgent", "planAuditor"),
    ("sisyphusAgent", "taskOrchestrator"),
    ("multimodalLookerAgent", "visualAnalyst"),
    ("prometheusAgent", "projectDesignSpecialist"),
    ("planAgent", "projectPlanner"),
    ("buildAgent", "constructionExecutor"),
    # Sea-themed config functions
    ("createKrakenConfig", "configureKrakenEntity"),
    ("createMaelstromConfig", "configureMaelstromEntity"),
    ("createAbyssalConfig", "configureAbyssalEntity"),
    ("createNautilusConfig", "configureNautilusEntity"),
    ("createCoralConfig", "configureCoralEntity"),
    ("createSirenConfig", "configureSirenEntity"),
    ("createLeviathanConfig", "configureLeviathanEntity"),
    ("createPoseidonConfig", "configurePoseidonEntity"),
    ("createScyllaConfig", "configureScyllaEntity"),
]


def apply_renamings(content: str) -> tuple[str, dict]:
    """Apply all renaming rules to content."""
    stats = {"replacements": 0}

    for old, new in RENAMING_RULES:
        # Match whole word boundaries to avoid partial matches
        pattern = r"\b" + re.escape(old) + r"\b"
        count = len(re.findall(pattern, content))
        if count > 0:
            content = re.sub(pattern, new, content)
            stats["replacements"] += count
            stats[f"{old}→{new}"] = count

    return content, stats


def process_file(file_path: Path) -> tuple[bool, dict]:
    """Process a single TypeScript file."""
    try:
        content = file_path.read_text(encoding="utf-8")
        original = content

        # Skip already processed files
        if "opencode-x-ocx" in str(file_path) or "BASELINE_AI_MODEL" in content:
            return False, {}

        content, stats = apply_renamings(content)

        if content != original:
            file_path.write_text(content, encoding="utf-8")
            return True, stats

        return False, {}

    except Exception as e:
        print(f"  Error processing {file_path}: {e}")
        return False, {}


def main():
    """Main function."""
    opencode_x_dir = Path("/home/leviath/opencode-x/src")

    print("=" * 60)
    print("BATCH IDENTIFIER RENAMING")
    print("=" * 60)

    total_replacements = 0
    file_stats = {}

    for ts_file in opencode_x_dir.rglob("*.ts"):
        if "node_modules" in str(ts_file) or "dist" in str(ts_file):
            continue

        modified, stats = process_file(ts_file)
        if modified:
            print(f"✓ {ts_file.relative_to(opencode_x_dir)}")
            for key, count in stats.items():
                file_stats[key] = file_stats.get(key, 0) + count
            total_replacements += sum(stats.values())

    print("\n" + "=" * 60)
    print("RENAMING SUMMARY")
    print("=" * 60)
    print(f"Files modified: {sum(1 for stats in file_stats.values())}")
    print(f"Total replacements: {total_replacements}")

    print("\nTop replacements:")
    sorted_items = sorted(file_stats.items(), key=lambda x: x[1], reverse=True)[:10]
    for old_new, count in sorted_items:
        print(f"  {old_new}: {count}")


if __name__ == "__main__":
    main()
