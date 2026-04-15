import {createSignal, Show, For, createEffect} from 'solid-js'
import './SettingsPanel.css'

export interface ModelOption {
	id: string
	name: string
}

export interface ProviderOption {
	id: string
	name: string
	models: ModelOption[]
}

export interface SettingsData {
	provider: string
	model: string
	apiEndpoint: string
}

export const PROVIDERS: ProviderOption[] = [
	{
		id: 'openai',
		name: 'OpenAI',
		models: [
			{id: 'gpt-4o', name: 'GPT-4o'},
			{id: 'gpt-4o-mini', name: 'GPT-4o Mini'},
			{id: 'gpt-4-turbo', name: 'GPT-4 Turbo'},
			{id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo'},
		],
	},
	{
		id: 'anthropic',
		name: 'Anthropic',
		models: [
			{id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet'},
			{id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku'},
			{id: 'claude-3-opus-20240229', name: 'Claude 3 Opus'},
			{id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet'},
		],
	},
	{
		id: 'google',
		name: 'Google',
		models: [
			{id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini 2.5 Pro'},
			{id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash'},
			{id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash'},
			{id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro'},
			{id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash'},
		],
	},
	{
		id: 'openrouter',
		name: 'OpenRouter',
		models: [
			{id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet'},
			{id: 'openai/gpt-4o', name: 'GPT-4o'},
			{id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5'},
			{id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B'},
		],
	},
	{
		id: 'cloudflare',
		name: 'Cloudflare Workers AI',
		models: [
			{id: '@cf/meta/llama-3-70b-instruct', name: 'Llama 3 70B'},
			{id: '@cf/meta/llama-3-8b-instruct', name: 'Llama 3 8B'},
			{id: '@cf/thebloke/mistral-7b-instruct', name: 'Mistral 7B'},
		],
	},
	{
		id: 'opencode',
		name: 'OpenCode',
		models: [{id: 'default', name: 'Default Model'}],
	},
	{
		id: 'kilo',
		name: 'Kilo',
		models: [
			{id: 'kilo-auto', name: 'Kilo Auto (Recommended)'},
			{id: 'kilo-free', name: 'Kilo Free'},
		],
	},
]

interface SettingsPanelProps {
	isOpen: boolean
	onClose: () => void
	currentProvider: string
	currentModel: string
	onSave: (settings: SettingsData) => void
}

export function SettingsPanel(props: SettingsPanelProps) {
	const [selectedProvider, setSelectedProvider] = createSignal(
		props.currentProvider,
	)
	const [selectedModel, setSelectedModel] = createSignal(props.currentModel)
	const [customEndpoint, setCustomEndpoint] = createSignal('')

	createEffect(() => {
		setSelectedProvider(props.currentProvider)
		setSelectedModel(props.currentModel)
	})

	const currentProviderModels = () => {
		const provider = PROVIDERS.find(p => p.id === selectedProvider())
		return provider?.models || []
	}

	const handleProviderChange = (providerId: string) => {
		setSelectedProvider(providerId)
		const provider = PROVIDERS.find(p => p.id === providerId)
		if (provider && provider.models.length > 0) {
			setSelectedModel(provider.models[0].id)
		}
	}

	const handleModelChange = (modelId: string) => {
		setSelectedModel(modelId)
	}

	const handleSave = () => {
		props.onSave({
			provider: selectedProvider(),
			model: selectedModel(),
			apiEndpoint: customEndpoint(),
		})
		props.onClose()
	}

	const handleCancel = () => {
		setSelectedProvider(props.currentProvider)
		setSelectedModel(props.currentModel)
		props.onClose()
	}

	const handleOverlayKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			handleCancel()
		}
	}

	return (
		<Show when={props.isOpen}>
			<>
				<button
					type="button"
					class="settings-overlay"
					onClick={handleCancel}
					aria-label="Close settings"
				/>
				<div
					class="settings-panel"
					onClick={e => e.stopPropagation()}
					onKeyDown={handleOverlayKeyDown}
					role="dialog"
					aria-modal="true"
					aria-labelledby="settings-title"
				>
					<div class="settings-header">
						<h2
							id="settings-title"
							class="settings-title"
						>
							Settings
						</h2>
						<button
							type="button"
							class="settings-close"
							onClick={handleCancel}
							aria-label="Close settings"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="currentColor"
								aria-hidden="true"
							>
								<path d="M12.354 3.354a.5.5 0 00-.708-.708L8 5.293 4.354 2.646a.5.5 0 10-.708.708L7.293 6l-3.647 3.646a.5.5 0 00.708.708L8 6.707l3.646 3.647a.5.5 0 00.708-.708L8.707 6l3.647-3.646z" />
							</svg>
						</button>
					</div>

					<div class="settings-content">
						<div class="settings-section">
							<label
								class="settings-label"
								for="provider-select"
							>
								Provider
							</label>
							<select
								id="provider-select"
								class="settings-select"
								value={selectedProvider()}
								onChange={e => handleProviderChange(e.currentTarget.value)}
							>
								<For each={PROVIDERS}>
									{provider => (
										<option value={provider.id}>{provider.name}</option>
									)}
								</For>
							</select>
						</div>

						<div class="settings-section">
							<label
								class="settings-label"
								for="model-select"
							>
								Model
							</label>
							<select
								id="model-select"
								class="settings-select"
								value={selectedModel()}
								onChange={e => handleModelChange(e.currentTarget.value)}
							>
								<For each={currentProviderModels()}>
									{model => <option value={model.id}>{model.name}</option>}
								</For>
							</select>
						</div>

						<div class="settings-section">
							<label
								class="settings-label"
								for="endpoint-input"
							>
								API Endpoint (optional)
							</label>
							<input
								id="endpoint-input"
								type="text"
								class="settings-input"
								placeholder="https://api.example.com/v1"
								value={customEndpoint()}
								onInput={e => setCustomEndpoint(e.currentTarget.value)}
							/>
							<span class="settings-hint">
								Leave empty to use default endpoint
							</span>
						</div>

						<div class="settings-current">
							<span class="settings-current-label">Current:</span>
							<span class="settings-current-value">
								{PROVIDERS.find(p => p.id === props.currentProvider)?.name ||
									'Not set'}{' '}
								/
								{PROVIDERS.find(
									p => p.id === props.currentProvider,
								)?.models.find(m => m.id === props.currentModel)?.name ||
									props.currentModel ||
									'Not set'}
							</span>
						</div>
					</div>

					<div class="settings-footer">
						<button
							type="button"
							class="settings-button settings-button--secondary"
							onClick={handleCancel}
						>
							Cancel
						</button>
						<button
							type="button"
							class="settings-button settings-button--primary"
							onClick={handleSave}
						>
							Save
						</button>
					</div>
				</div>
			</>
		</Show>
	)
}
