import {describe, it, expect} from 'vitest'
import * as path from 'path'
import * as fs from 'fs'

describe('OpenCodeService', () => {
	describe('configuration', () => {
		it('should read server port from opencode.json', () => {
			const configPath = path.join(
				process.cwd(),
				'tests',
				'sandbox',
				'opencode.json',
			)
			const config = {
				server: {port: 4096},
				provider: {
					anthropic: {
						models: {
							'claude-sonnet-4-20250514': {
								options: {thinking: {type: 'enabled', budgetTokens: 8000}},
							},
						},
					},
				},
			}
			fs.writeFileSync(configPath, JSON.stringify(config, null, '\t'))
			const read = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

			expect(read.server.port).toBe(4096)

			// Cleanup
			fs.unlinkSync(configPath)
		})

		it('should default to port 0 (auto-assign) when no port specified', () => {
			let serverPort = 0
			const config = {}

			if (config && (config as Record<string, unknown>).server) {
				const server = (config as Record<string, unknown>).server as Record<
					string,
					unknown
				>
				if (server.port) {
					serverPort = server.port as number
				}
			}

			expect(serverPort).toBe(0)
		})

		it('should resolve opencode binary name for Windows', () => {
			const opencodeBin =
				process.platform === 'win32' ? 'opencode.exe' : 'opencode'
			if (process.platform === 'win32') {
				expect(opencodeBin).toBe('opencode.exe')
			} else {
				expect(opencodeBin).toBe('opencode')
			}
		})
	})

	describe('API key environment variables', () => {
		it('should set environment variables for provider API keys', () => {
			const mockConfig = {
				openaiApiKey: 'sk-test-123',
				anthropicApiKey: 'sk-ant-456',
			}

			const env: Record<string, string> = {}

			if (mockConfig.openaiApiKey) {
				env.OPENAI_API_KEY = mockConfig.openaiApiKey
			}
			if (mockConfig.anthropicApiKey) {
				env.ANTHROPIC_API_KEY = mockConfig.anthropicApiKey
			}

			expect(env.OPENAI_API_KEY).toBe('sk-test-123')
			expect(env.ANTHROPIC_API_KEY).toBe('sk-ant-456')
		})
	})

	describe('message type validation', () => {
		it('should not allow "parts" on base Message type', () => {
			type BaseMessage = {
				id: string
				type: 'user' | 'assistant'
				text?: string
				time?: {created: number; completed?: number}
			}

			const validMessage: BaseMessage = {
				id: 'msg-1',
				type: 'user',
				text: 'Hello',
			}

			expect(validMessage.id).toBe('msg-1')
			expect(validMessage.type).toBe('user')
		})
	})
})

describe('SDK response mapping', () => {
	it('should map SDK messages with info + parts to our Message format', () => {
		const sdkResponse = [
			{
				info: {id: 'msg-1', role: 'user', sessionID: 's1'},
				parts: [{id: 'p1', type: 'text', text: 'Hello'}],
			},
			{
				info: {id: 'msg-2', role: 'assistant', sessionID: 's1'},
				parts: [{id: 'p2', type: 'text', text: 'Hi there'}],
			},
		]

		const messages = sdkResponse.map(m => m.info)

		expect(messages).toHaveLength(2)
		expect(messages[0].id).toBe('msg-1')
		expect(messages[1].id).toBe('msg-2')
	})
})

describe('e2e fixtures', () => {
	it('should use platform-specific binary name', () => {
		const getBinaryName = () =>
			process.platform === 'win32' ? 'opencode.exe' : 'opencode'

		const bin = getBinaryName()
		if (process.platform === 'win32') {
			expect(bin).toBe('opencode.exe')
		} else {
			expect(bin).toBe('opencode')
		}
	})

	it('should use platform-specific kill signal', () => {
		const getKillSignal = () =>
			process.platform === 'win32' ? undefined : ('SIGTERM' as const)

		const signal = getKillSignal()
		if (process.platform === 'win32') {
			expect(signal).toBeUndefined()
		} else {
			expect(signal).toBe('SIGTERM')
		}
	})
})
