#!/usr/bin/env tsx

import { Command } from 'commander';
import { spawn, type ChildProcess } from 'child_process';
import { chromium } from '@playwright/test';
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import readline from 'readline';

interface DebugSession {
  vscodeProcess: ChildProcess;
  cdpUrl: string;
  userDataDir: string;
}

const program = new Command();

program
  .name('debug-extension')
  .description('Launch VSCode with OpenCode extension for debugging')
  .option('-w, --workspace <path>', 'Workspace directory to open', process.cwd())
  .option('-p, --port <number>', 'CDP debugging port', '9222')
  .option('--clean', 'Clean user data directory before launch', false)
  .option('--attach', 'Attach to webview with Playwright inspector', false)
  .option('--logs', 'Stream extension logs to console', false)
  .parse();

const options = program.opts();

async function waitForPort(port: number, timeout: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(`http://localhost:${port}/json/version`);
      if (response.ok) return;
    } catch (e) {
      // Not ready
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Port ${port} not ready within ${timeout}ms`);
}

async function launchVSCode(): Promise<DebugSession> {
  const extensionPath = path.resolve(process.cwd());
  const workspaceRoot = path.resolve(options.workspace);
  const debugPort = parseInt(options.port);
  const userDataDir = path.join(process.cwd(), '.vscode-test-debug');

  console.log('🚀 Launching VSCode with OpenCode extension...\n');
  console.log(`   Extension path: ${extensionPath}`);
  console.log(`   Workspace: ${workspaceRoot}`);
  console.log(`   CDP port: ${debugPort}`);
  console.log(`   User data: ${userDataDir}\n`);

  // Clean user data if requested
  if (options.clean) {
    console.log('🧹 Cleaning user data directory...');
    try {
      await fs.rm(userDataDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore
    }
  }

  // Download VSCode
  console.log('⬇️  Downloading VSCode...');
  const vscodeExecutablePath = await downloadAndUnzipVSCode();
  const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

  const launchArgs = [
    ...args,
    `--extensionDevelopmentPath=${extensionPath}`,
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-extensions',
    '--disable-workspace-trust',
    '--no-sandbox',
    '--skip-welcome',
    '--skip-release-notes',
    workspaceRoot,
  ];

  console.log('🎬 Starting VSCode...\n');

  const vscodeProcess = spawn(cli, launchArgs, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      VSCODE_LOG_LEVEL: 'info',
    },
  });

  vscodeProcess.stdout?.on('data', (data) => {
    const text = data.toString().trim();
    if (text) console.log(`[VSCode] ${text}`);
  });

  vscodeProcess.stderr?.on('data', (data) => {
    const text = data.toString().trim();
    if (text) console.error(`[VSCode Error] ${text}`);
  });

  vscodeProcess.on('exit', (code) => {
    console.log(`\n❌ VSCode exited with code ${code}`);
    process.exit(code || 0);
  });

  // Wait for CDP
  console.log('⏳ Waiting for CDP to be ready...');
  await waitForPort(debugPort, 60000);

  const cdpUrl = `http://localhost:${debugPort}`;
  console.log(`✅ VSCode launched successfully!\n`);

  return {
    vscodeProcess,
    cdpUrl,
    userDataDir,
  };
}

async function streamExtensionLogs(userDataDir: string) {
  const logPath = path.join(userDataDir, 'logs', 'window1', 'exthost', 'output_logging_opencode');
  
  console.log('📋 Streaming extension logs...\n');
  console.log('─'.repeat(80));

  let lastSize = 0;

  const checkLogs = async () => {
    try {
      const stats = await fs.stat(logPath);
      if (stats.size > lastSize) {
        const content = await fs.readFile(logPath, 'utf-8');
        const newContent = content.slice(lastSize);
        process.stdout.write(newContent);
        lastSize = stats.size;
      }
    } catch (e) {
      // Log file doesn't exist yet
    }
  };

  // Check every 500ms
  const interval = setInterval(checkLogs, 500);
  
  return () => clearInterval(interval);
}

async function attachToWebview(cdpUrl: string) {
  console.log('🔌 Attaching to webview with Playwright...\n');

  const browser = await chromium.connectOverCDP(cdpUrl);
  
  // Find webview
  let webviewPage = null;
  let attempts = 0;

  while (!webviewPage && attempts < 20) {
    const contexts = browser.contexts();
    for (const context of contexts) {
      const pages = context.pages();
      for (const page of pages) {
        const url = page.url();
        if (url.includes('vscode-webview') && url.includes('opencode')) {
          webviewPage = page;
          console.log(`✅ Found webview: ${url}\n`);
          break;
        }
      }
      if (webviewPage) break;
    }

    if (!webviewPage) {
      attempts++;
      console.log(`⏳ Waiting for webview (${attempts}/20)...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (!webviewPage) {
    console.error('❌ Could not find OpenCode webview');
    return null;
  }

  // Enable console logging
  const cdpSession = await webviewPage.context().newCDPSession(webviewPage);
  await cdpSession.send('Runtime.enable');
  await cdpSession.send('Log.enable');
  
  console.log('📱 Webview console logs:\n');
  console.log('─'.repeat(80));

  cdpSession.on('Runtime.consoleAPICalled', (event) => {
    const args = event.args.map(arg => arg.value ?? arg.description).join(' ');
    console.log(`[${event.type}] ${args}`);
  });

  cdpSession.on('Log.entryAdded', (event) => {
    console.log(`[${event.entry.level}] ${event.entry.text}`);
  });

  // Open Playwright inspector
  console.log('\n🎭 Opening Playwright inspector...');
  console.log('   Use the inspector to interact with the webview\n');
  
  await webviewPage.pause();

  return browser;
}

async function printInstructions(cdpUrl: string) {
  console.log('╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║                   OpenCode Extension Debug Session                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');
  
  console.log('📡 Chrome DevTools Protocol:');
  console.log(`   URL: ${cdpUrl}`);
  console.log(`   Open chrome://inspect in Chrome and click "inspect"\n`);
  
  console.log('🔍 Debugging Tips:');
  console.log('   - Extension logs are in VSCode Output panel (OpenCode)');
  console.log('   - Use chrome://inspect to debug the webview');
  console.log('   - Press Ctrl+C to stop the debug session\n');
  
  console.log('💡 Useful Commands:');
  console.log('   - Open Command Palette: Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows)');
  console.log('   - Open OpenCode: Search "OpenCode" in Command Palette');
  console.log('   - Reload Window: Search "Developer: Reload Window"\n');
  
  console.log('─'.repeat(80));
  console.log('');
}

async function main() {
  const session = await launchVSCode();

  // Stream logs if requested
  let stopLogs: (() => void) | null = null;
  if (options.logs) {
    stopLogs = await streamExtensionLogs(session.userDataDir);
  }

  // Attach to webview if requested
  let browser = null;
  if (options.attach) {
    browser = await attachToWebview(session.cdpUrl);
  } else {
    await printInstructions(session.cdpUrl);
  }

  // Setup graceful shutdown
  const cleanup = async () => {
    console.log('\n\n🛑 Shutting down...');
    
    if (stopLogs) stopLogs();
    if (browser) await browser.close().catch(() => {});
    
    session.vscodeProcess.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!session.vscodeProcess.killed) {
      session.vscodeProcess.kill('SIGKILL');
    }
    
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Keep process alive
  await new Promise(() => {});
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
