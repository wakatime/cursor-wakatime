const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const plugin = path.resolve(__dirname, '..', 'bin', 'cursor-wakatime.js');

function platformName() {
  return process.platform === 'win32' ? 'windows' : process.platform;
}

function architecture() {
  if (process.arch === 'ia32' || process.arch.includes('32')) return '386';
  if (process.arch === 'x64') return 'amd64';
  return process.arch;
}

function setup() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'cursor-wakatime-'));
  const wakaDir = path.join(home, '.wakatime');
  const argsFile = path.join(home, 'args.json');
  fs.mkdirSync(wakaDir, { recursive: true });

  const extension = process.platform === 'win32' ? '.exe' : '';
  const cli = path.join(wakaDir, `wakatime-cli-${platformName()}-${architecture()}${extension}`);
  fs.writeFileSync(
    cli,
    `#!${process.execPath}\nconst fs = require('fs');\nif (process.argv.includes('--version')) { console.log('<local-build>'); } else { fs.writeFileSync(process.env.TEST_ARGS_FILE, JSON.stringify(process.argv.slice(2))); }\n`,
  );
  fs.chmodSync(cli, 0o755);
  return { home, argsFile };
}

function runHook(context, input) {
  const inputFile = path.join(context.home, 'input.json');
  fs.writeFileSync(inputFile, JSON.stringify(input));
  childProcess.execFileSync(process.execPath, [plugin, inputFile], {
    env: { ...process.env, WAKATIME_HOME: context.home, TEST_ARGS_FILE: context.argsFile },
  });
}

test('syncs AI heartbeats after a prompt', () => {
  const context = setup();
  runHook(context, {
    hook_event_name: 'beforeSubmitPrompt',
    cursor_version: '3.9.0',
    workspace_roots: ['/work/project'],
    prompt: 'Fix the tests',
  });

  assert.deepEqual(JSON.parse(fs.readFileSync(context.argsFile, 'utf8')), [
    '--sync-ai-heartbeats',
    '--plugin',
    'cursor/3.9.0 cursor-wakatime/1.0.0',
    '--project-folder',
    '/work/project',
  ]);
});

test('syncs AI heartbeats after an Agent file edit', () => {
  const context = setup();
  runHook(context, {
    hook_event_name: 'afterFileEdit',
    cursor_version: '3.9.0',
    workspace_roots: ['/work/project'],
    file_path: '/work/project/main.go',
    edits: [],
  });

  assert.ok(fs.existsSync(context.argsFile));
});

test('session start only checks the CLI', () => {
  const context = setup();
  runHook(context, {
    hook_event_name: 'sessionStart',
    cursor_version: '3.9.0',
    workspace_roots: ['/work/project'],
    session_id: 'session-1',
  });

  assert.equal(fs.existsSync(context.argsFile), false);
});
