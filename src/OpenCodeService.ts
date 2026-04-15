import {createOpencode, type OpencodeClient} from '@opencode-ai/sdk/v2'
import type {Message} from '@opencode-ai/sdk/v2/client'
import {spawnSync} from 'child_process'
import {getLogger} from './extension'
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

const OPENCODE_INSTALL_URL = 'https://opencode.ai/install'

interface OpencodeInstance {
	client: OpencodeClient
	server: {
		url: string
		close(): void
	}
}

export class OpenCodeService {
	private opencode: OpencodeInstance | null = null
	private currentSessionId: string | null = null
	private currentSessionTitle: string = 'New Session'
	private isInitializing = false
	private workspaceDir?: string

	async initialize(workspaceRoot?: string): Promise<void> {
		if (this.opencode || this.isInitializing) {
			return
		}

		this.isInitializing = true

		const prevCwd = process.cwd()
		const shouldChdir =
			Boolean(workspaceRoot) && fs.existsSync(workspaceRoot as string)

		if (shouldChdir) {
			this.workspaceDir = workspaceRoot as string
		}

		try {
			const logger = getLogger()
			const configPath = workspaceRoot
				? path.join(workspaceRoot, 'opencode.json')
				: null
			const hasWorkspaceConfig = configPath && fs.existsSync(configPath)

			if (hasWorkspaceConfig) {
				logger.info(`Found workspace config at: ${configPath}`)
			} else {
				logger.info(
					'No workspace config found, OpenCode will use default/global config',
				)
			}

			this.ensureOpencodeCliAvailable()

			if (shouldChdir) {
				process.chdir(workspaceRoot as string)
			}

			logger.info('Starting OpenCode server...')

			// Read configuration from VS Code settings and opencode.json
			const config = vscode.workspace.getConfiguration('opencode')
			const serverUrl = config.get<string>('serverUrl', '')
			const openaiApiKey = config.get<string>('openaiApiKey', '')
			const anthropicApiKey = config.get<string>('anthropicApiKey', '')
			const openrouterApiKey = config.get<string>('openrouterApiKey', '')
			const cloudflareApiKey = config.get<string>('cloudflareApiKey', '')
			const googleApiKey = config.get<string>('googleApiKey', '')
			const kiloGatewayApiKey = config.get<string>('kiloGatewayApiKey', '')
			const huggingfaceApiKey = config.get<string>('huggingfaceApiKey', '')
			const ezifApiKey = config.get<string>('ezifApiKey', '')
			const opencodeGoApiKey = config.get<string>('opencodeGoApiKey', '')
			const opencodeZenApiKey = config.get<string>('opencodeZenApiKey', '')

			// Read server config from workspace opencode.json
			// Default to port 0 (OS auto-assigns a free port) to avoid conflicts
			let serverPort = 0
			try {
				const opencodeConfigPath = workspaceRoot
					? path.join(workspaceRoot, 'opencode.json')
					: null
				if (opencodeConfigPath && fs.existsSync(opencodeConfigPath)) {
					const opencodeConfig = JSON.parse(
						fs.readFileSync(opencodeConfigPath, 'utf-8'),
					)
					if (opencodeConfig.server?.port) {
						serverPort = opencodeConfig.server.port
					}
				}
			} catch (e) {
				logger.warn('Could not read opencode.json server port', e)
			}

			// Also check VS Code settings for explicit port override
			const settingsPort = config.get<number>('serverPort', 0)
			if (settingsPort > 0) {
				serverPort = settingsPort
			}

			logger.info(`Using server port: ${serverPort || 'auto'}`)

			// Build options for createOpencode
			const createOptions: Parameters<typeof createOpencode>[0] = {
				timeout: 30000, // 30 seconds timeout for server startup
			}

			// If server URL is provided, use it directly instead of spawning
			if (serverUrl) {
				createOptions.url = serverUrl
			} else {
				createOptions.hostname = '127.0.0.1'
				createOptions.port = serverPort
			}

			// Pass API keys if provided in settings
			if (openaiApiKey) {
				process.env.OPENAI_API_KEY = openaiApiKey
			}
			if (anthropicApiKey) {
				process.env.ANTHROPIC_API_KEY = anthropicApiKey
			}
			if (openrouterApiKey) {
				process.env.OPENROUTER_API_KEY = openrouterApiKey
			}
			if (cloudflareApiKey) {
				process.env.CLOUDFLARE_API_KEY = cloudflareApiKey
			}
			if (googleApiKey) {
				process.env.GOOGLE_API_KEY = googleApiKey
			}
			if (kiloGatewayApiKey) {
				process.env.KILO_GATEWAY_API_KEY = kiloGatewayApiKey
			}
			if (huggingfaceApiKey) {
				process.env.HUGGINGFACE_API_KEY = huggingfaceApiKey
			}
			if (ezifApiKey) {
				process.env.EZIF_API_KEY = ezifApiKey
			}
			if (opencodeGoApiKey) {
				process.env.OPENCODE_GO_API_KEY = opencodeGoApiKey
			}
			if (opencodeZenApiKey) {
				process.env.OPENCODE_ZEN_API_KEY = opencodeZenApiKey
			}

			this.opencode = await createOpencode(createOptions)

			logger.info(`OpenCode server started at ${this.opencode.server.url}`)
		} catch (error) {
			getLogger().error('Failed to initialize OpenCode', error)
			await this.showStartupError(error)
			throw error
		} finally {
			if (shouldChdir) {
				try {
					process.chdir(prevCwd)
				} catch (e) {
					getLogger().warn('Failed to restore working directory', e)
				}
			}
			this.isInitializing = false
		}
	}

	private ensureOpencodeCliAvailable(): void {
		const lookupCommand = process.platform === 'win32' ? 'where' : 'which'
		const lookupResult = spawnSync(lookupCommand, ['opencode'], {
			encoding: 'utf8',
		})

		if (lookupResult.status === 0 && lookupResult.stdout.trim().length > 0) {
			const binaryPath = lookupResult.stdout
				.split(/\r?\n/)
				.map(line => line.trim())
				.find(line => line.length > 0)

			getLogger().info('OpenCode CLI found on PATH', {
				command: `${lookupCommand} opencode`,
				binaryPath,
			})
			return
		}

		getLogger().error('OpenCode CLI preflight check failed', {
			command: `${lookupCommand} opencode`,
			status: lookupResult.status,
			error: lookupResult.error?.message,
			stderr: lookupResult.stderr?.trim(),
		})

		const verifyCommand =
			process.platform === 'win32' ? 'where opencode' : 'which opencode'

		throw new Error(
			`OpenCode CLI was not found on PATH. Verify with "${verifyCommand}", then restart VS Code.`,
		)
	}

	private async showStartupError(error: unknown): Promise<void> {
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown startup error'
		const isMissingCli = errorMessage.includes(
			'OpenCode CLI was not found on PATH',
		)

		if (isMissingCli) {
			const selection = await vscode.window.showErrorMessage(
				'OpenCode CLI was not found in the VS Code environment. Install it from opencode.ai/install, verify it works in your terminal, then fully restart VS Code.',
				'Install OpenCode',
			)

			if (selection === 'Install OpenCode') {
				await vscode.env.openExternal(vscode.Uri.parse(OPENCODE_INSTALL_URL))
			}
			return
		}

		await vscode.window.showErrorMessage(
			`Failed to start OpenCode: ${errorMessage}`,
		)
	}

	getCurrentSessionId(): string | null {
		return this.currentSessionId
	}

	getCurrentSessionTitle(): string {
		return this.currentSessionTitle
	}

	async getMessages(sessionId: string): Promise<Message[]> {
		if (!this.opencode) {
			throw new Error('OpenCode not initialized')
		}

		const result = await this.opencode.client.session.messages({
			sessionID: sessionId,
		})

		if (result.error) {
			throw new Error(`Failed to get messages: ${JSON.stringify(result.error)}`)
		}

		// Transform SDK response to our Message type
		// SDK returns { info: Message; parts: Part[] }[] but we just need Message
		const messages = result.data || []
		return messages.map(m => m.info)
	}

	dispose(): void {
		if (this.opencode) {
			this.opencode.server.close()
			this.opencode = null
			this.currentSessionId = null
		}
	}

	async restart(): Promise<void> {
		this.dispose()
		await this.initialize(this.workspaceDir)
	}

	isReady(): boolean {
		return this.opencode !== null && !this.isInitializing
	}

	getWorkspaceRoot(): string | undefined {
		return this.workspaceDir
	}

	getServerUrl(): string | undefined {
		return this.opencode?.server.url
	}
}
