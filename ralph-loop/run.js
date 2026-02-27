#!/usr/bin/env node
/**
 * Ralph Loop Task Runner for b2b-boilerplate
 *
 * This script manages the iterative development loop for completing tasks.
 * It tracks task status, runs Playwright verification, and moves between tasks.
 *
 * Usage: node ralph-loop/run.js
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');

const STATE_FILE = path.join(__dirname, 'state.json');
const TASKS_FILE = path.join(__dirname, 'tasks.json');
const PROMPT_FILE = path.join(__dirname, 'current-prompt.md');
const CLAUDE_PROMPT_FILE = path.join(__dirname, '.claude-prompt.md');

class RalphLoopRunner {
  constructor() {
    this.state = this.loadState();
    this.tasks = this.loadTasks();
  }

  loadState() {
    if (fs.existsSync(STATE_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      } catch (e) {
        console.error('Error loading state:', e.message);
      }
    }
    return {
      version: '1.0',
      startedAt: null,
      completedAt: null,
      currentIteration: 0,
      currentTaskId: null,
      history: []
    };
  }

  saveState() {
    fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
  }

  loadTasks() {
    const data = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    return data.tasks;
  }

  saveTasks() {
    const data = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    data.tasks = this.tasks;
    data.startedAt = data.startedAt || this.state.startedAt;
    data.completedAt = this.state.completedAt ? data.completedAt : data.completedAt;
    data.currentIteration = this.state.currentIteration;
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
  }

  getNextPendingTask() {
    // Find first pending task whose dependencies are met
    for (const task of this.tasks) {
      if (task.status === 'pending') {
        // Check if all dependencies are completed
        const depsMet = task.dependsOn.every(depId => {
          const dep = this.tasks.find(t => t.id === depId);
          return dep && dep.status === 'completed';
        });
        if (depsMet) {
          return task;
        }
      }
    }
    return null;
  }

  getCurrentTask() {
    return this.tasks.find(t => t.id === this.state.currentTaskId);
  }

  startTask(task) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Starting Task ${task.id}: ${task.title}`);
    console.log(`${'='.repeat(60)}\n`);
    console.log(`Description: ${task.description}`);
    console.log(`Verification: ${task.verification}`);
    console.log(`Dependencies: ${task.dependsOn.length > 0 ? task.dependsOn.join(', ') : 'None'}\n`);

    this.state.currentTaskId = task.id;
    this.state.currentIteration++;
    task.status = 'in_progress';
    this.saveState();
    this.saveTasks();

    this.generatePrompt(task);
  }

  completeTask(task) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Task ${task.id} COMPLETED: ${task.title}`);
    console.log(`${'='.repeat(60)}\n`);

    task.status = 'completed';
    this.state.currentTaskId = null;
    this.state.history.push({
      taskId: task.id,
      title: task.title,
      completedAt: new Date().toISOString(),
      iteration: this.state.currentIteration
    });
    this.saveState();
    this.saveTasks();

    // Check if all tasks are complete
    if (this.tasks.every(t => t.status === 'completed')) {
      this.state.completedAt = new Date().toISOString();
      this.saveState();
      this.saveTasks();
      this.showSummary();
      return true;
    }

    return false;
  }

  failTask(task, reason) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Task ${task.id} FAILED: ${task.title}`);
    console.log(`Reason: ${reason}`);
    console.log(`${'='.repeat(60)}\n`);

    task.status = 'failed';
    task.error = reason;
    this.state.currentTaskId = null;
    this.saveState();
    this.saveTasks();
  }

  skipTask(task, reason) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Task ${task.id} SKIPPED: ${task.title}`);
    console.log(`Reason: ${reason}`);
    console.log(`${'='.repeat(60)}\n`);

    task.status = 'skipped';
    task.skipReason = reason;
    this.state.currentTaskId = null;
    this.saveState();
    this.saveTasks();
  }

  generatePrompt(task) {
    const prompt = `# Task ${task.id}: ${task.title}

## Status: IN PROGRESS (Iteration ${this.state.currentIteration})

## Description
${task.description}

## Verification Criteria
${task.verification}

## Dependencies
${task.dependsOn.length > 0 ? this.formatDependencies(task.dependsOn) : 'None'}

## Previous Attempts
${this.getHistoryForTask(task)}

## Instructions
1. Work on completing this task
2. When done, verify the success criteria
3. If verification passes, respond with: <ralph-complete>Task ${task.id} completed successfully</ralph-complete>
4. If verification fails, describe what's wrong and continue
5. If you need to skip this task, respond with: <ralph-skip>Reason for skipping</ralph-skip>

## Current Project State
${this.getProjectState()}

## Available Commands
- <ralph-complete>message</ralph-complete> - Mark task as complete
- <ralph-skip>reason</ralph-skip> - Skip this task
- <ralph-status> - Show current status of all tasks
- <ralph-next> - Move to next task (skip current)

${this.getCompletionStatus()}
`;

    fs.writeFileSync(CLAUDE_PROMPT_FILE, prompt);
    fs.writeFileSync(PROMPT_FILE, prompt);

    console.log('✅ Prompt generated. Copy the content from current-prompt.md into Claude.');
    console.log('');
  }

  formatDependencies(depIds) {
    return depIds.map(id => {
      const dep = this.tasks.find(t => t.id === id);
      if (!dep) return `Task ${id} (not found)`;
      return `Task ${id}: ${dep.title} (${dep.status})`;
    }).join('\n');
  }

  getHistoryForTask(task) {
    const history = this.state.history.filter(h => h.taskId === task.id);
    if (history.length === 0) return 'First attempt at this task.';
    return history.map(h => `- Iteration ${h.iteration}: Attempted at ${new Date(h.completedAt).toLocaleString()}`).join('\n');
  }

  getProjectState() {
    const completed = this.tasks.filter(t => t.status === 'completed').length;
    const pending = this.tasks.filter(t => t.status === 'pending').length;
    const inProgress = this.tasks.filter(t => t.status === 'in_progress').length;
    const failed = this.tasks.filter(t => t.status === 'failed').length;
    const skipped = this.tasks.filter(t => t.status === 'skipped').length;

    return `Completed: ${completed} | Pending: ${pending} | In Progress: ${inProgress} | Failed: ${failed} | Skipped: ${skipped}`;
  }

  getCompletionStatus() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.status === 'completed').length;
    const percent = Math.round((completed / total) * 100);

    return `Progress: ${completed}/${total} tasks (${percent}%)`;
  }

  showStatus() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('RALPH LOOP STATUS');
    console.log(`${'='.repeat(60)}\n`);
    console.log(`Iteration: ${this.state.currentIteration}`);
    console.log(`Started: ${this.state.startedAt ? new Date(this.state.startedAt).toLocaleString() : 'Not started'}`);
    console.log(`Current Task: ${this.state.currentTaskId ? `Task ${this.state.currentTaskId}` : 'None'}`);
    console.log('');
    console.log('Task Status:');
    console.log('');

    for (const task of this.tasks) {
      const status = task.status.toUpperCase();
      const icon = this.getStatusIcon(status);
      const current = this.state.currentTaskId === task.id ? ' <-- CURRENT' : '';
      console.log(`  ${icon} [${task.id}] ${task.title} (${status})${current}`);
      if (task.error) {
        console.log(`      Error: ${task.error}`);
      }
      if (task.skipReason) {
        console.log(`      Skipped: ${task.skipReason}`);
      }
    }

    console.log('');
    console.log(this.getCompletionStatus());
    console.log(`${'='.repeat(60)}\n`);
  }

  getStatusIcon(status) {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      default: return '⏳';
    }
  }

  showSummary() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('ALL TASKS COMPLETED!');
    console.log(`${'='.repeat(60)}\n`);
    console.log(`Started: ${new Date(this.state.startedAt).toLocaleString()}`);
    console.log(`Completed: ${new Date(this.state.completedAt).toLocaleString()}`);
    console.log(`Total Iterations: ${this.state.currentIteration}`);
    console.log('');
    console.log('Task Summary:');

    for (const task of this.tasks) {
      const status = task.status.toUpperCase();
      const icon = this.getStatusIcon(status);
      console.log(`  ${icon} [${task.id}] ${task.title}`);
    }

    console.log(`\n${'='.repeat(60)}\n`);
  }

  handleCommand(input) {
    // Check for ralph-complete tag
    const completeMatch = input.match(/<ralph-complete>([\s\S]*?)<\/ralph-complete>/);
    if (completeMatch) {
      const task = this.getCurrentTask();
      if (task) {
        console.log(`\n✅ Task completion confirmed: ${completeMatch[1].trim()}`);
        return this.completeTask(task);
      }
    }

    // Check for ralph-skip tag
    const skipMatch = input.match(/<ralph-skip>([\s\S]*?)<\/ralph-skip>/);
    if (skipMatch) {
      const task = this.getCurrentTask();
      if (task) {
        console.log(`\n⏭️ Task skip confirmed: ${skipMatch[1].trim()}`);
        return this.skipTask(task, skipMatch[1].trim());
      }
    }

    return false;
  }

  async run() {
    if (!this.state.startedAt) {
      this.state.startedAt = new Date().toISOString();
      this.saveState();
      console.log('🚀 Ralph Loop started for b2b-boilerplate');
    }

    // Start the loop
    while (true) {
      const task = this.getCurrentTask() || this.getNextPendingTask();

      if (!task) {
        this.showSummary();
        break;
      }

      if (task.status === 'pending') {
        this.startTask(task);
      }

      // Wait for user input to indicate task completion/failure
      const continueLoop = await this.waitForUserInput(task);
      if (!continueLoop) break;
    }
  }

  waitForUserInput(task) {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      console.log('\n--- Task Commands ---');
      console.log('1. Type "complete" and press Enter to mark task as complete');
      console.log('2. Type "skip <reason>" to skip this task');
      console.log('3. Type "status" to show all task status');
      console.log('4. Type "next" to skip to next task');
      console.log('5. Or paste Claude\'s response containing <ralph-complete> or <ralph-skip> tags');
      console.log('-------------------\n');

      const prompt = `Waiting for task completion (Task ${task.id})> `;

      const checkInterval = setInterval(() => {
        // Check if prompt file was updated (Claude's response)
        try {
          if (fs.existsSync(CLAUDE_PROMPT_FILE)) {
            const content = fs.readFileSync(CLAUDE_PROMPT_FILE, 'utf8');
            if (content.includes('<ralph-complete>') || content.includes('<ralph-skip>')) {
              clearInterval(checkInterval);
              rl.close();
              const done = this.handleCommand(content);
              resolve(done);
            }
          }
        } catch (e) {
          // Ignore
        }
      }, 1000);

      rl.question(prompt, (answer) => {
        clearInterval(checkInterval);

        switch (answer.trim().toLowerCase()) {
          case 'complete':
            rl.close();
            resolve(this.completeTask(task));
            break;
          case 'skip':
            rl.close();
            resolve(this.skipTask(task, 'Manually skipped'));
            break;
          case 'status':
            this.showStatus();
            // Continue waiting
            break;
          case 'next':
            rl.close();
            resolve(this.skipTask(task, 'Moving to next task'));
            break;
          default:
            // Check if the input contains the tags
            const done = this.handleCommand(answer);
            resolve(done);
        }
      });
    });
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const runner = new RalphLoopRunner();

  if (args.includes('--status')) {
    runner.showStatus();
    process.exit(0);
  }

  if (args.includes('--reset')) {
    fs.unlinkSync(STATE_FILE);
    console.log('State reset. Starting fresh.');
    process.exit(0);
  }

  if (args.includes('--skip')) {
    if (args[2]) {
      const taskId = args[2];
      const task = runner.tasks.find(t => t.id === taskId);
      if (task && task.status === 'pending') {
        runner.skipTask(task, 'Manually skipped via CLI');
        console.log(`\nNext task is: ${runner.getNextPendingTask()?.id || 'None'}`);
      } else {
        console.log(`Task ${taskId} not found or not pending`);
      }
    } else {
      const task = runner.getCurrentTask();
      if (task) {
        runner.skipTask(task, 'Manually skipped via CLI');
        console.log(`\nNext task is: ${runner.getNextPendingTask()?.id || 'None'}`);
      }
    }
    process.exit(0);
  }

  if (args.includes('--complete')) {
    if (args[2]) {
      const taskId = args[2];
      const task = runner.tasks.find(t => t.id === taskId);
      if (task && task.status === 'in_progress') {
        runner.completeTask(task);
        console.log(`\nNext task is: ${runner.getNextPendingTask()?.id || 'None'}`);
      } else {
        console.log(`Task ${taskId} not found or not in progress`);
      }
    } else {
      const task = runner.getCurrentTask();
      if (task) {
        runner.completeTask(task);
        console.log(`\nNext task is: ${runner.getNextPendingTask()?.id || 'None'}`);
      }
    }
    process.exit(0);
  }

  if (args.includes('--dev')) {
    // Start dev server and wait
    const dev = spawn('pnpm', ['dev'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

    dev.on('error', (err) => {
      console.error('Failed to start dev server:', err);
    });

    console.log('Development server started. Press Ctrl+C to stop.');

    // Keep process alive
    process.on('SIGINT', () => {
      dev.kill();
      process.exit(0);
    });

    return;
  }

  // Show status and then run
  runner.showStatus();

  console.log('\n🔄 Ralph Loop is ready!');
  console.log('\nTo continue the loop:');
  console.log('1. Copy the prompt from current-prompt.md');
  console.log('2. Paste it into Claude Code');
  console.log('3. When Claude responds, paste the response back here');
  console.log('4. Or use commands: complete, skip, status, next\n');

  runner.run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

module.exports = RalphLoopRunner;
