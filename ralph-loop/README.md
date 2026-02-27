# Ralph Loop for b2b-boilerplate

A task-driven development loop with Playwright verification for the Rebound & Relay higher education consultant marketplace.

## Overview

Ralph Loop manages iterative development through a defined task list. It tracks task status, handles dependencies, and provides verification criteria for each task.

## Features

- **Task Tracking**: JSON-based task definitions with status tracking
- **Dependencies**: Tasks can depend on other tasks being completed first
- **Verification**: Each task has clear verification criteria
- **State Management**: Persistent state survives Claude restarts
- **Progress Reporting**: Real-time status and completion percentage

## Quick Start

```bash
cd ralph-loop

# View current status
node run.js --status

# Start the loop
node run.js
```

## Task Structure

Tasks are defined in `tasks.json`:

```json
{
  "id": "1",
  "title": "Task name",
  "status": "pending",  // pending, in_progress, completed, failed, skipped
  "description": "What to do",
  "verification": "How to verify it works",
  "dependsOn": []  // IDs of tasks that must complete first
}
```

## Commands

| Command | Description |
|---------|-------------|
| `node run.js` | Start the loop |
| `node run.js --status` | Show current task status |
| `node run.js --reset` | Reset all state |
| `node run.js --skip [taskId]` | Skip a task |
| `node run.js --complete [taskId]` | Mark task complete |
| `node run.js --dev` | Start dev server |

## Task Control Tags

When working with Claude, use these tags:

- `<ralph-complete>message</ralph-complete>` - Mark current task as complete
- `<ralph-skip>reason</ralph-skip>` - Skip current task
- `<ralph-status>` - Show status (in Claude response)
- `<ralph-next>` - Move to next task

## Workflow

1. Run `node run.js` to see current status
2. The script generates `current-prompt.md` with the current task
3. Copy the prompt into Claude Code
4. Claude works on the task
5. When done, Claude responds with `<ralph-complete>...</ralph-complete>`
6. Paste Claude's response back to the script
7. Task is marked complete and script moves to next task

## Files

- `tasks.json` - Task definitions
- `state.json` - Current state (auto-generated)
- `run.js` - Main loop script
- `current-prompt.md` - Current task prompt (auto-generated)
- `.claude-prompt.md` - Claude prompt reference (auto-generated)

## Adding New Tasks

Edit `tasks.json` and add a new task object:

```json
{
  "id": "16",
  "title": "New task name",
  "status": "pending",
  "description": "Detailed description of what to do",
  "verification": "How to confirm it works",
  "dependsOn": ["1", "2"]
}
```

## Playwright Verification

Tasks can include Playwright tests. Example:

```javascript
// In task description
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/sign-in');
  // ... verification code
  await browser.close();
})();
```

## State File Format

```json
{
  "version": "1.0",
  "startedAt": "2025-01-15T10:00:00.000Z",
  "completedAt": null,
  "currentIteration": 5,
  "currentTaskId": "3",
  "history": [
    {
      "taskId": "1",
      "title": "First task",
      "completedAt": "2025-01-15T10:15:00.000Z",
      "iteration": 1
    }
  ]
}
```

## Tips

1. **Start Small**: Begin with 3-5 tasks to test the system
2. **Clear Verification**: Make verification criteria specific and testable
3. **Dependencies**: Use dependencies to ensure tasks run in order
4. **Check Status**: Run `--status` frequently to track progress
5. **Don't Fear Failure**: Failed tasks can be retried by resetting status to pending

## Example Session

```bash
$ node run.js
============================================================
RALPH LOOP STATUS
============================================================
Iteration: 0
Started: Not started
Current Task: None

Task Status:

  ⏳ [1] Run database migration in Supabase (pending)
  ⏳ [2] Create storage buckets (pending)
  ⏳ [3] Start development server (pending)

Progress: 0/15 tasks (0%)

$ node run.js
============================================================
Starting Task 1: Run database migration in Supabase
============================================================

✅ Prompt generated. Copy the content from current-prompt.md into Claude.

[User copies prompt to Claude, Claude works on task]

Waiting for task completion (Task 1)> complete

============================================================
Task 1 COMPLETED: Run database migration in Supabase
============================================================
```

## Troubleshooting

**Prompt file not found**: Run `node run.js` first to generate the prompt.

**Task stuck on pending**: Check dependencies - a task may be waiting for another task to complete.

**State file corrupted**: Run `node run.js --reset` to start fresh.

**Dev server won't start**: Make sure you're in the b2b-boilerplate directory and dependencies are installed.
