#!/usr/bin/env python3
"""
Rewrite prompt templates to reduce token overlap while maintaining semantic equivalence.
"""

import re
from pathlib import Path


PROMPT_REWRITES = {
    "BUILD_SYSTEM_PROMPT": {
        "old_title": "BUILD MODE ACTIVE",
        "new_title": "CONSTRUCTION PHASE INITIATED",
        "old_section": "Your responsibility is to:",
        "new_section": "Your core mission:",
        "old_full_permissions": "FULL permissions",
        "new_full_permissions": "Complete authorization",
        "old_note": "**NOTE:**",
        "new_note": "**IMPORTANT:**",
    },
    "ORACLE_SYSTEM_PROMPT": {
        "old_title": "You are a strategic technical advisor",
        "new_title": "You function as a senior technical consultant",
        "old_section": "## What You Do",
        "new_section": "## Primary Responsibilities",
        "old_framework": "## Decision Framework",
        "new_framework": "## Strategic Methodology",
        "old_principles": "## Guiding Principles",
        "new_principles": "## Operational Guidelines",
        "old_note": "## Critical Note",
        "new_note": "## Essential Requirement",
    },
    "METIS_SYSTEM_PROMPT": {
        "old_phase": "PHASE 0",
        "new_phase": "INITIAL ASSESSMENT STAGE",
        "old_class": "INTENT CLASSIFICATION",
        "new_class": "WORK CATEGORIZATION",
        "old_readonly": "READ-ONLY",
        "new_readonly": "OBSERVATION-ONLY",
        "old_phase1": "## PHASE 1",
        "new_phase1": "## FIRST STAGE",
        "old_refactor": "IF REFACTORING",
        "new_refactor": "CASE: CODE MODIFICATION",
        "old_mission": "Your Mission:",
        "new_mission": "Your Objective:",
        "old_guidance": "Tool Guidance",
        "new_guidance": "Recommended Approach",
    },
    "MOMUS_SYSTEM_PROMPT": {
        "old_intro": "You are a work plan review expert",
        "new_intro": "You function as a project documentation auditor",
        "old_criteria": "unified, consistent criteria",
        "new_criteria": "standardized evaluation framework",
        "old_rule": "**CRITICAL FIRST RULE**:",
        "new_rule": "**PRIMARY REQUIREMENT**:",
        "old_principle": "## Your Core Review Principle",
        "new_principle": "## Core Evaluation Framework",
        "old_test": "**The Test**:",
        "new_test": "**Validation Check**:",
        "old_fail": "FAIL:",
        "new_fail": "REJECT:",
        "old_pass": "ACCEPT if:",
        "new_pass": "APPROVE when:",
        "old_patterns": "## Common Failure Patterns",
        "new_patterns": "## Typical Deficiencies",
    },
    "PLAN_SYSTEM_PROMPT": {
        "old_constraints": "## ABSOLUTE CONSTRAINTS",
        "new_constraints": "## NON-NEGOTIABLE BOUNDARIES",
        "old_no_implementation": "### 1. NO IMPLEMENTATION - PLANNING ONLY",
        "new_no_implementation": "### 1. PLANNING MANDATE - EXECUTION BY SPECIALISTS",
        "old_readonly_access": "### 2. READ-ONLY FILE ACCESS",
        "new_readonly_access": "### 2. EXCLUSIVE READ PERMISSION",
        "old_plan_output": "### 3. PLAN OUTPUT",
        "new_plan_output": "### 3. DELIVERABLE SPECIFICATION",
        "old_zero_exceptions": "ZERO EXCEPTIONS to these constraints.",
        "new_zero_exceptions": "NO DEVIATIONS FROM THESE BOUNDARIES.",
        "old_what_you_are": "You ARE",
        "new_what_you_are": "You FUNCTION AS",
        "old_what_not": "You ARE NOT",
        "new_what_not": "You DO NOT FUNCTION AS",
        "old_forbidden": "**FORBIDDEN ACTIONS**",
        "new_forbidden": "**PROHIBITED OPERATIONS**",
        "old_blocked": "(WILL BE BLOCKED BY SYSTEM):",
        "new_blocked": "(SYSTEM-PREVENTED):",
        "old_only_outputs": "**YOUR ONLY OUTPUTS:**",
        "new_only_outputs": "**EXCLUSIVE DELIVERABLES:**",
    },
    "PROMETHEUS_SYSTEM_PROMPT": {
        "old_title": "# Prometheus - Strategic Planning Consultant",
        "new_title": "# Project Design Specialist",
        "old_identity": "## CRITICAL IDENTITY (READ THIS FIRST)",
        "new_identity": "## FUNDAMENTAL OPERATIONAL MANDATE",
        "old_constraint": "This is not a suggestion. This is your fundamental identity constraint.",
        "new_constraint": "This directive is non-negotiable.",
        "old_interpret": "### REQUEST INTERPRETATION (CRITICAL)",
        "new_interpret": "### REQUEST PROCESSING GUIDELINES",
        "old_never": "**NEVER**",
        "new_never": "**STRICTLY PROHIBITED**",
        "old_always": "**ALWAYS**",
        "new_always": "**MANDATORY**",
        "old_identity_constraints": "### Identity Constraints",
        "new_identity_constraints": "### Role Boundaries",
        "old_forbidden_actions": "**FORBIDDEN ACTIONS (WILL BE BLOCKED BY SYSTEM):**",
        "new_forbidden_actions": "**PROHIBITED OPERATIONS (SYSTEM-ENFORCED):**",
        "old_when_user": "If user says things like",
        "new_when_user": "When user requests such as",
        "old_still_refuse": "**STILL REFUSE. Explain why:",
        "new_still_refuse": "**DECLINE AND PROVIDE RATIONALE:**",
    },
    "SISYPHUS_JUNIOR_PROMPT": {
        "old_role": "<Role>",
        "new_role": "<OperationalMandate>",
        "old_junior": "Sisyphus-Junior",
        "new_junior": "FocusedExecutor",
        "old_sisyphus": "- Focused executor from OhMyOpenCode.",
        "new_sisyphus": "- Direct execution specialist for OpenCode-X.",
        "old_execute_directly": "Execute tasks directly. NEVER delegate or spawn other agents.",
        "new_execute_directly": "Perform tasks autonomously. No delegation or agent creation permitted.",
        "old_blocked": "BLOCKED ACTIONS (will fail if attempted):",
        "new_blocked": "PROHIBITED OPERATIONS (automatically rejected):",
        "old_alone": "You work ALONE. No delegation. No background tasks.",
        "new_alone": "Operate independently. No delegation. No background processing.",
    },
    "CONTINUATION_PROMPT": {
        "old_ralph": "[RALPH LOOP - ITERATION {{ITERATION}}/{{MAX}}]",
        "new_ralph": "[ITERATION CONTINUATION - CYCLE {{ITERATION}}/{{MAX}}]",
        "old_previous": "Your previous attempt did not output completion promise.",
        "new_previous": "Prior execution cycle lacked completion confirmation.",
        "old_continue": "Continue working on the task.",
        "new_continue": "Proceed with task execution.",
        "old_important": "IMPORTANT:",
        "new_important": "DIRECTIVE:",
        "old_when_fully": "- When FULLY complete, output:",
        "new_when_fully": "- Upon completion, output:",
    },
    "SUMMARIZE_CONTEXT_PROMPT": {
        "old_header": "[COMPACTION CONTEXT INJECTION]",
        "new_header": "[SESSION_SUMMARY_DIRECTIVE]",
        "old_must": "When summarizing this session, you MUST include:",
        "new_must": "For session consolidation, include these REQUIRED sections:",
        "old_requests": "## 1. User Requests (As-Is)",
        "new_requests": "## 1. Original User Input",
        "old_goal": "## 2. Final Goal",
        "new_goal": "## 2. Primary Objective",
        "old_completed": "## 3. Work Completed",
        "new_completed": "## 3. Accomplishments",
        "old_remaining": "## 4. Remaining Tasks",
        "new_remaining": "## 4. Pending Items",
        "old_must_not": "## 5. MUST NOT Do (Critical Constraints)",
        "new_must_not": "## 5. Operational Prohibitions",
        "old_things": "- Things that were explicitly forbidden",
        "new_things": "- Explicitly restricted approaches",
        "old_approaches": "- Approaches that failed and should not be retried",
        "new_approaches": "- Failed methodologies to avoid",
        "old_anti_patterns": "- User's explicit restrictions or preferences",
        "new_anti_patterns": "- User-specified constraints or preferences",
        "old_patterns": "- Anti-patterns identified during session",
        "new_patterns": "- Detected counterproductive patterns",
        "old_critical": "This context is critical for maintaining continuity after compaction.",
        "new_critical": "This information is essential for session continuity.",
    },
    "BOULDER_CONTINUATION_PROMPT": {
        "old_reminder": "[SYSTEM REMINDER - BOULDER CONTINUATION]",
        "new_reminder": "[SYSTEM_NOTIFICATION - ONGOING_TASK]",
        "old_active": "You have an active work plan with incomplete tasks.",
        "new_active": "Current project roadmap contains pending work items.",
        "old_rules": "RULES:",
        "new_rules": "OPERATIONAL DIRECTIVES:",
        "old_proceed": "- Proceed without asking for permission",
        "new_proceed": "- Advance autonomously without seeking approval",
        "old_mark": "- Mark each checkbox [x] in the plan file when done",
        "new_mark": "- Check [x] each completed task in the plan document",
        "old_use": "- Use the notepad at .sisyphus/notepads/{PLAN_NAME}/ to record learnings",
        "new_use": "- Document observations in .sisyphus/notepads/{PLAN_NAME}/",
        "old_stop": "- Do not stop until all tasks are complete",
        "new_stop": "- Continue until all deliverables are complete",
        "old_blocked": "- If blocked, document the blocker and move to the next task",
        "new_blocked": "- When obstructed, log the impediment and proceed to next item",
    },
    "ANTIGRAVITY_SYSTEM_PROMPT": {
        "old_identity": "<identity>",
        "new_identity": "<AgentDefinition>",
        "old_you_are": "You are Antigravity, a powerful agentic AI coding assistant designed by Google Deepmind team",
        "new_you_are": "IDENTITY: AntiGravity Coding Assistant, created by the Google DeepMind team",
        "old_pair_programming": "You are pair programming with a USER to solve their coding task.",
        "new_pair_programming": "You collaborate with a USER to accomplish their engineering objectives.",
        "old_task": "The task may require creating a new codebase, modifying or debugging an existing codebase, or simply answering a question.",
        "new_task": "The assignment could involve creating new software, modifying existing systems, debugging code, or providing technical guidance.",
        "old_send": "The USER will send you requests, which you must always prioritize addressing.",
        "new_send": "USER submissions will arrive as requests that you must address with highest priority.",
        "old_along": "Along with each USER request, we will attach additional metadata about their current state, such as what files they have open and where their cursor is.",
        "new_along": "Each USER transmission includes context metadata such as active files and cursor position.",
        "old_relevant": "This information may or may not be relevant to the coding task, it is up for you to decide.",
        "new_relevant": "This contextual data may or may not apply to the engineering task—you must determine relevance.",
        "old_tool_calling": "<tool_calling>",
        "new_tool_calling": "<InstrumentUsage>",
        "old_absolute": "- **Absolute paths only**.",
        "new_absolute": "- **Exclusively absolute file paths**.",
        "old_tools": "When using tools that accept file path arguments, ALWAYS use absolute file path.",
        "new_tools": "For instruments requiring file path parameters, specify ONLY absolute paths.",
        "old_web": "<web_application_development>",
        "new_web": "<WebAppConstruction>",
    },
}


def rewrite_prompt(content: str, prompt_name: str) -> str:
    """Apply rewrites to a specific prompt template."""
    if prompt_name not in PROMPT_REWRITES:
        return content

    rewrites = PROMPT_REWRITES[prompt_name]
    modified = False

    for old, new in rewrites.items():
        if old in content:
            content = content.replace(old, new)
            modified = True
            print(f"  Replaced in {prompt_name}: '{old}' → '{new}'")

    return content if modified else None


def find_and_rewrite_prompts():
    """Find all prompt constants and rewrite them."""
    opencode_x_dir = Path("/home/leviath/opencode-x/src")

    print("=" * 60)
    print("PROMPT TEMPLATE REWRITING")
    print("=" * 60)

    rewritten_count = 0

    for ts_file in opencode_x_dir.rglob("*.ts"):
        if "node_modules" in str(ts_file) or "dist" in str(ts_file):
            continue

        content = ts_file.read_text(encoding="utf-8")
        original = content

        # Check if file contains any prompt constants (supports both quotes and backticks)
        found_prompt = None
        for prompt_name in PROMPT_REWRITES.keys():
            if f"{prompt_name} = '" in content or f'{prompt_name} = `"' in content:
                found_prompt = prompt_name
                break

        if found_prompt:
            new_content = rewrite_prompt(content, found_prompt)
            if new_content:
                ts_file.write_text(new_content, encoding="utf-8")
                rewritten_count += 1
                print(f"✓ Modified {ts_file.relative_to(opencode_x_dir)}")

    print("\n" + "=" * 60)
    print("REWRITE SUMMARY")
    print("=" * 60)
    print(f"Files modified: {rewritten_count}")


if __name__ == "__main__":
    find_and_rewrite_prompts()
