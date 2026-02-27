# Ralph Loop Quick Start Guide

## What is Ralph Loop?

Ralph Loop is a task-driven development assistant that helps you complete the b2b-boilerplate project systematically. It:
- Tracks 15 tasks needed to set up and verify the marketplace
- Provides clear verification criteria for each task
- Handles task dependencies (things must be done in order)
- Tracks progress across Claude sessions

## First Time Setup

1. **Install dependencies** (if not already done):
   ```bash
   cd b2b-boilerplate
   pnpm install
   pnpm install playwright  # in ralph-loop directory
   ```

2. **Navigate to ralph-loop directory**:
   ```bash
   cd ralph-loop
   pnpm install
   ```

3. **Start the loop**:
   ```bash
   node run.js
   ```

## Your First Session

### Step 1: Check Status
```bash
node run.js --status
```

You should see 15 pending tasks.

### Step 2: Start the Loop
```bash
node run.js
```

The system will:
1. Show you Task 1 (Run database migration in Supabase)
2. Generate `current-prompt.md` with detailed instructions
3. Tell you to copy the prompt into Claude

### Step 3: Work with Claude
Copy the content from `current-prompt.md` and paste it into this chat. Claude will read the task and start working.

### Step 4: Complete the Task
After Claude completes the work:
- Verify the task actually works (test it manually)
- If successful, tell Claude: `<ralph-complete>Task completed successfully</ralph-complete>`
- Claude will respond with the completion tag
- Paste Claude's response back to the terminal

### Step 5: Move to Next Task
The script will:
- Mark Task 1 as complete
- Generate a new prompt for Task 2
- Continue the loop

## Commands You Can Use

In the terminal (while loop is running):

- `complete` - Mark current task as complete
- `skip` - Skip current task (moves to next)
- `status` - Show all task status
- `next` - Skip to next task

In your chat with Claude:

- `<ralph-complete>Your message here</ralph-complete>` - Mark task done
- `<ralph-skip>Reason for skipping</ralph-skip>` - Skip task
- `<ralph-status>` - Request status update

## Task List

The 15 tasks cover:

1. Run database migration in Supabase
2. Create storage buckets in Supabase
3. Start development server
4. Test sign-in functionality
5. Test consultant profile form
6. Test profile picture upload
7. Test consultant search (Relay)
8. Test contact consultant form
9. Test engagement creation
10. Test invoice generation
11. Test messaging system
12. Test admin consultant approval
13. Test case studies feature
14. Test testimonial submission
15. Test public profile view

## Tips for Success

1. **Work in Order**: Tasks have dependencies. The system will only show tasks whose dependencies are met.

2. **Verify Manually**: Don't just trust that it works. Actually test each feature.

3. **Take Screenshots**: The verifier can take screenshots - useful for debugging.

4. **Use the Examples**: Look at `examples.js` for verification patterns you can copy.

5. **Be Patient**: Some tasks (like Supabase setup) require manual work outside the app.

6. **Check Status**: Run `node run.js --status` anytime to see progress.

## Resetting

If you need to start over:
```bash
node run.js --reset
node run.js
```

This clears all progress and starts fresh.

## Example Task Completion

Here's how a typical task completion looks:

```
[Claude is working on Task 1]

Claude: I've run the SQL migration in Supabase. All 20 tables were created successfully. The tables include: user, organization, consultant, etc.

<ralph-complete>Task 1 completed successfully. Database migration with 20 tables applied.</ralph-complete>

[Paste back to terminal]

============================================================
Task 1 COMPLETED: Run database migration in Supabase
============================================================

Next task is: Task 2

[Generates new prompt for Task 2]
```

## Troubleshooting

**Loop won't start**: Make sure you're in the ralph-loop directory.

**Prompt file missing**: Run `node run.js` first to generate it.

**Dev server not running**: Use `node run.js --dev` in a separate terminal.

**Task won't mark complete**: Make sure you include the `<ralph-complete>` tags exactly.

**Dependencies blocked**: Complete prerequisite tasks first.

## Next Steps

Once you complete all 15 tasks, you'll have a fully functional marketplace with:
- Database set up and populated
- User authentication working
- Consultant profiles complete
- Search and discovery functional
- Messaging and engagement flow working
- Invoices generating correctly

Then you can populate it with mock data and show it to stakeholders!
