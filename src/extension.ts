import {OpenCodeViewProvider} from './OpenCodeViewProvider'
import type {HostMessage} from './shared/messages'
import {OpenCodeService} from './OpenCodeService'
import * as vscode from 'vscode'

let logger: vscode.LogOutputChannel

export function getLogger(): vscode.LogOutputChannel {
	return logger
}

export async function activate(context: vscode.ExtensionContext) {
	// Create log channel - VSCode manages file location and timestamps automatically
	logger = vscode.window.createOutputChannel('OpenCode', {log: true})
	context.subscriptions.push(logger)

	logger.info('OpenCode extension activated', {
		timestamp: new Date().toISOString(),
		workspaceFolder: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
		extensionPath: context.extensionPath,
	})

	// Create OpenCode service
	const openCodeService = new OpenCodeService()

	// Initialize OpenCode with workspace root
	const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath

	try {
		await openCodeService.initialize(workspaceRoot)
		logger.info('OpenCode service initialized successfully')
	} catch (error) {
		logger.error('Failed to initialize OpenCode service', error)
	}

	const provider = new OpenCodeViewProvider(
		context.extensionUri,
		openCodeService,
		context.globalState,
	)

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			OpenCodeViewProvider.viewType,
			provider,
		),
	)

	const addSelectionDisposable = vscode.commands.registerCommand(
		'opencode.addSelectionToPrompt',
		async () => {
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				vscode.window.showInformationMessage(
					'OpenCode: No active editor selection.',
				)
				return
			}

			const document = editor.document
			const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri)
			const filePath = workspaceFolder
				? vscode.workspace.asRelativePath(document.uri)
				: document.uri.fsPath
			const fileUrl = document.uri.toString()

			const selection = editor.selection
			const message: HostMessage = {
				type: 'editor-selection',
				filePath,
				fileUrl,
				selection: selection.isEmpty
					? undefined
					: {
							startLine: selection.start.line + 1,
							endLine: selection.end.line + 1,
						},
			}

			await vscode.commands.executeCommand('workbench.view.extension.opencode')
			provider.sendHostMessage(message)
		},
	)
	const restartServerDisposable = vscode.commands.registerCommand(
		'opencode.restartserver',
		async () => {
			logger.info('Restarting OpenCode server...')
			await openCodeService.restart()
		},
	)
	context.subscriptions.push(restartServerDisposable)
	logger.info('OpenCode server restart command registered')

	// Model Configuration command
	const modelConfigDisposable = vscode.commands.registerCommand(
		'opencode.modelConfig',
		async () => {
			logger.info('Opening Model Configuration...')
			const model = vscode.workspace
				.getConfiguration('opencode')
				.get<string>('modelConfig.model', '')
			const apiEndpoint = vscode.workspace
				.getConfiguration('opencode')
				.get<string>('modelConfig.apiEndpoint', '')
			const temperature = vscode.workspace
				.getConfiguration('opencode')
				.get<number>('modelConfig.temperature', 0.7)
			const maxTokens = vscode.workspace
				.getConfiguration('opencode')
				.get<number>('modelConfig.maxTokens', 8192)

			const selected = await vscode.window.showQuickPick(
				[
					{
						label: 'Model Selection',
						description: `Current: ${model || 'Not set'}`,
					},
					{label: 'API Endpoint', description: apiEndpoint || 'Not set'},
					{
						label: 'Temperature',
						description: `Current: ${temperature} (range: 0.0-2.0)`,
					},
					{
						label: 'Max Tokens',
						description: `Current: ${maxTokens}`,
					},
				],
				{placeHolder: 'Select configuration option'},
			)

			if (!selected) return

			switch (selected.label) {
				case 'Model Selection':
					await vscode.commands.executeCommand('opencode.config.setModel')
					break
				case 'API Endpoint':
					await vscode.commands.executeCommand('opencode.config.setApiEndpoint')
					break
				case 'Temperature':
					await vscode.commands.executeCommand('opencode.config.setTemperature')
					break
				case 'Max Tokens':
					await vscode.commands.executeCommand('opencode.config.setMaxTokens')
					break
			}
		},
	)
	context.subscriptions.push(modelConfigDisposable)
	logger.info('OpenCode model config command registered')

	// Model Setter Commands
	const setModelDisposable = vscode.commands.registerCommand(
		'opencode.config.setModel',
		async () => {
			const currentModel = vscode.workspace
				.getConfiguration('opencode')
				.get<string>('modelConfig.model', '')
			const input = await vscode.window.showInputBox({
				prompt:
					'Enter the model name (e.g., anthropic/claude-3-5-sonnet-20241022)',
				value: currentModel,
				validateInput: value => {
					if (!value.trim()) {
						return 'Model name cannot be empty'
					}
					return null
				},
			})
			if (input !== undefined) {
				await vscode.workspace
					.getConfiguration('opencode')
					.update(
						'modelConfig.model',
						input.trim(),
						vscode.ConfigurationTarget.Global,
					)
				vscode.window.showInformationMessage(`Model set to: ${input.trim()}`)
			}
		},
	)
	context.subscriptions.push(setModelDisposable)

	const setApiEndpointDisposable = vscode.commands.registerCommand(
		'opencode.config.setApiEndpoint',
		async () => {
			const currentEndpoint = vscode.workspace
				.getConfiguration('opencode')
				.get<string>('modelConfig.apiEndpoint', '')
			const input = await vscode.window.showInputBox({
				prompt: 'Enter the custom API endpoint URL',
				value: currentEndpoint,
				validateInput: value => {
					if (
						value.trim() &&
						!value.startsWith('http://') &&
						!value.startsWith('https://')
					) {
						return 'URL must start with http:// or https://'
					}
					return null
				},
			})
			if (input !== undefined) {
				await vscode.workspace
					.getConfiguration('opencode')
					.update(
						'modelConfig.apiEndpoint',
						input.trim(),
						vscode.ConfigurationTarget.Global,
					)
				vscode.window.showInformationMessage(
					`API Endpoint set to: ${input.trim() || 'Default'}`,
				)
			}
		},
	)
	context.subscriptions.push(setApiEndpointDisposable)

	const setTemperatureDisposable = vscode.commands.registerCommand(
		'opencode.config.setTemperature',
		async () => {
			const currentTemp = vscode.workspace
				.getConfiguration('opencode')
				.get<number>('modelConfig.temperature', 0.7)
			const input = await vscode.window.showInputBox({
				prompt: 'Enter temperature (0.0-2.0)',
				value: String(currentTemp),
				validateInput: value => {
					const num = parseFloat(value)
					if (isNaN(num) || num < 0 || num > 2) {
						return 'Temperature must be between 0.0 and 2.0'
					}
					return null
				},
			})
			if (input !== undefined) {
				const temp = parseFloat(input)
				await vscode.workspace
					.getConfiguration('opencode')
					.update(
						'modelConfig.temperature',
						temp,
						vscode.ConfigurationTarget.Global,
					)
				vscode.window.showInformationMessage(`Temperature set to: ${temp}`)
			}
		},
	)
	context.subscriptions.push(setTemperatureDisposable)

	const setMaxTokensDisposable = vscode.commands.registerCommand(
		'opencode.config.setMaxTokens',
		async () => {
			const currentMax = vscode.workspace
				.getConfiguration('opencode')
				.get<number>('modelConfig.maxTokens', 8192)
			const input = await vscode.window.showInputBox({
				prompt: 'Enter maximum tokens',
				value: String(currentMax),
				validateInput: value => {
					const num = parseInt(value, 10)
					if (isNaN(num) || num < 1 || num > 100000) {
						return 'Max tokens must be between 1 and 100000'
					}
					return null
				},
			})
			if (input !== undefined) {
				const max = parseInt(input, 10)
				await vscode.workspace
					.getConfiguration('opencode')
					.update(
						'modelConfig.maxTokens',
						max,
						vscode.ConfigurationTarget.Global,
					)
				vscode.window.showInformationMessage(`Max Tokens set to: ${max}`)
			}
		},
	)
	context.subscriptions.push(setMaxTokensDisposable)

	context.subscriptions.push(addSelectionDisposable)

	// Cleanup on deactivation
	context.subscriptions.push(openCodeService)

	logger.info('OpenCode webview provider registered')
}

export function deactivate() {
	logger?.info('OpenCode extension deactivated')
}
