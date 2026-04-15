import {createSignal, Show, For, createEffect, createMemo} from 'solid-js'
import './SettingsPanel.css'

// ===========================================
// Types & Interfaces
// ===========================================

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
	theme: 'system' | 'light' | 'dark'
	autoSave: boolean
	notifications: 'all' | 'mentions' | 'none'
	compactMode: boolean
	soundEnabled: boolean
}

export type SettingsSection = 'general' | 'appearance' | 'behavior' | 'privacy'

// ===========================================
// Provider Data
// ===========================================

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
			{id: 'gemini-flash-latest', name: 'Gemini Flash Latest'},
			{id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro'},
			{id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview'},
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
		name: 'OpenCode Zen',
		models: [
			// Claude models
			{id: 'claude-opus-4-6', name: 'Claude Opus 4.6'},
			{id: 'claude-opus-4-5', name: 'Claude Opus 4.5'},
			{id: 'claude-opus-4-1', name: 'Claude Opus 4.1'},
			{id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6'},
			{id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5'},
			{id: 'claude-sonnet-4', name: 'Claude Sonnet 4'},
			{id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku'},
			{id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5'},
			// Gemini models
			{id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro'},
			{id: 'gemini-3-pro', name: 'Gemini 3 Pro'},
			{id: 'gemini-3-flash', name: 'Gemini 3 Flash'},
			// GPT-5 models
			{id: 'gpt-5.4', name: 'GPT-5.4'},
			{id: 'gpt-5.4-pro', name: 'GPT-5.4 Pro'},
			{id: 'gpt-5.4-mini', name: 'GPT-5.4 Mini'},
			{id: 'gpt-5.4-nano', name: 'GPT-5.4 Nano'},
			{id: 'gpt-5.3-codex-spark', name: 'GPT-5.3 Codex Spark'},
			{id: 'gpt-5.3-codex', name: 'GPT-5.3 Codex'},
			{id: 'gpt-5.2', name: 'GPT-5.2'},
			{id: 'gpt-5.2-codex', name: 'GPT-5.2 Codex'},
			{id: 'gpt-5.1', name: 'GPT-5.1'},
			{id: 'gpt-5.1-codex-max', name: 'GPT-5.1 Codex Max'},
			{id: 'gpt-5.1-codex', name: 'GPT-5.1 Codex'},
			{id: 'gpt-5.1-codex-mini', name: 'GPT-5.1 Codex Mini'},
			{id: 'gpt-5', name: 'GPT-5'},
			{id: 'gpt-5-codex', name: 'GPT-5 Codex'},
			{id: 'gpt-5-nano', name: 'GPT-5 Nano'},
			// GLM models
			{id: 'glm-5.1', name: 'GLM 5.1'},
			{id: 'glm-5', name: 'GLM 5'},
			{id: 'glm-4.7', name: 'GLM 4.7'},
			{id: 'glm-4.6', name: 'GLM 4.6'},
			// Minimax models
			{id: 'minimax-m2.5', name: 'Minimax 2.5'},
			{id: 'minimax-m2.5-free', name: 'Minimax 2.5 Free'},
			{id: 'minimax-m2.1', name: 'Minimax 2.1'},
			// Kimi models
			{id: 'kimi-k2.5', name: 'Kimi K2.5'},
			{id: 'kimi-k2', name: 'Kimi K2'},
			{id: 'kimi-k2-thinking', name: 'Kimi K2 Thinking'},
			// Qwen models
			{id: 'qwen3.6-plus', name: 'Qwen 3.6 Plus'},
			{id: 'qwen3.5-plus', name: 'Qwen 3.5 Plus'},
			// Other models
			{id: 'trinity-large-preview-free', name: 'Trinity Large Preview Free'},
			{id: 'big-pickle', name: 'Big Pickle'},
			{id: 'nemotron-3-super-free', name: 'Nemotron 3 Super Free'},
		],
	},
	{
		id: 'kilo',
		name: 'Kilo',
		models: [
			{id: 'kilo-auto', name: 'Kilo Auto (Recommended)'},
			{id: 'kilo-free', name: 'Kilo Free'},
			{id: 'openrouter/elephant-alpha', name: 'Elephant Alpha'},
			{id: 'openrouter/free', name: 'OpenRouter Free'},
		],
	},
]

// ===========================================
// UI Icons (Material Symbols)
// ===========================================

function IconSettings(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
		</svg>
	)
}

function IconAppearance(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
		</svg>
	)
}

function IconBehavior(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M13 9c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-1-9H8v2h4v2h4v-2h-4V6h-2v2z" />
		</svg>
	)
}

function IconPrivacy(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
		</svg>
	)
}

function IconGeneral(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
		</svg>
	)
}

function IconCheck(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
		</svg>
	)
}

function IconSearch(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
		</svg>
	)
}

function IconExpandMore(props: {size?: number; expanded?: boolean}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
			class={`icon-expand ${props.expanded ? 'icon-expand--expanded' : ''}`}
		>
			<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
		</svg>
	)
}

function _IconCollapseMore(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
		</svg>
	)
}

function IconClose(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
		</svg>
	)
}

function IconLightMode(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM5.99 19.42c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
		</svg>
	)
}

function IconDarkMode(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-2.57 1.37-5.79 2.77-7.59 4.14C7.18 18.5 10.51 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z" />
		</svg>
	)
}

function IconAutoMode(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
		</svg>
	)
}

function IconVolumeOff(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 16L9.5 13.5 12 11V16z" />
		</svg>
	)
}

function IconVolumeUp(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
		</svg>
	)
}

function IconNotifications(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
		</svg>
	)
}

function IconNotificationsOff(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c.09.05.17.11.24.16.56-.76 1.48-1.32 2.26-1.56v2.21c-.78.24-1.7.8-2.26 1.56-.08.06-.18.12-.28.17L12 15.17l.78.67V19.5l-2.24-2.25c.08-.15.13-.31.17-.48 1.86 1.08 3.13 2.98 3.53 5.23h-2.24zM18 11c0-1.63-.6-3.12-1.59-4.24l-.72-.6 1.91-2.12c.26.33.48.69.63 1.08.27-.32.48-.68.59-1.07l-1.89-2.12-.69.76C14.82 3.95 13.48 3.5 12 3.5c-3.89 0-7 2.79-7 6v1.13l-2 2v1h16v-1l-2-2V11z" />
		</svg>
	)
}

function IconSave(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
		</svg>
	)
}

function IconModel(props: {size?: number}) {
	return (
		<svg
			width={props.size || 20}
			height={props.size || 20}
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path d="M21 11.5v-1c0-.8-.7-1.5-1.5-1.5h-1v-1.5h-1.5v1.5h-2v-1.5h-1.5v1.5H13v-1.5h-1.5v1.5h-1c-.8 0-1.5.7-1.5 1.5v1c-.8 0-1.5.7-1.5 1.5v1c0 .8.7 1.5 1.5 1.5h1v1.5h1.5v-1.5h2v1.5h1.5v-1.5h1.5v1.5h1.5v-1.5h1c.8 0 1.5-.7 1.5-1.5v-1c.8 0 1.5-.7 1.5-1.5zm-1.5 0h-1.5v1.5h1.5v-1.5zm-9 0h-1.5v1.5h1.5v-1.5zM9 14.5h-.5c-.28 0-.5.22-.5.5v.5c0 .28.22.5.5.5h.5v-.5h.5v-1h-1v.5z" />
		</svg>
	)
}

// ===========================================
// Toggle Switch Component
// ===========================================

interface ToggleSwitchProps {
	checked: boolean
	onChange: (checked: boolean) => void
	label: string
	description?: string
	disabled?: boolean
	id: string
}

function ToggleSwitch(props: ToggleSwitchProps) {
	return (
		<div
			class={`toggle-switch ${props.disabled ? 'toggle-switch--disabled' : ''}`}
		>
			<button
				type="button"
				id={props.id}
				role="switch"
				aria-checked={props.checked}
				aria-disabled={props.disabled}
				aria-label={props.label}
				class={`toggle-switch__track ${props.checked ? 'toggle-switch__track--checked' : ''}`}
				onClick={() => !props.disabled && props.onChange(!props.checked)}
				disabled={props.disabled}
			>
				<span class="toggle-switch__thumb" />
			</button>
			<div class="toggle-switch__labels">
				<label
					class="toggle-switch__label"
					for={props.id}
				>
					{props.label}
				</label>
				<Show when={props.description}>
					<span class="toggle-switch__description">{props.description}</span>
				</Show>
			</div>
		</div>
	)
}

// ===========================================
// Searchable Dropdown Component
// ===========================================

interface SearchableDropdownProps<T> {
	options: T[]
	value: string
	onChange: (value: string) => void
	labelField: keyof T
	valueField: keyof T
	label: string
	placeholder?: string
	searchPlaceholder?: string
	id: string
}

function _SearchableDropdown<T extends Record<string, unknown>>(
	props: SearchableDropdownProps<T>,
) {
	const [isOpen, setIsOpen] = createSignal(false)
	const [search, setSearch] = createSignal('')

	const filteredOptions = createMemo(() => {
		const searchLower = search().toLowerCase()
		if (!searchLower) return props.options
		return props.options.filter(opt =>
			String(opt[props.labelField]).toLowerCase().includes(searchLower),
		)
	})

	const selectedLabel = createMemo(() => {
		const selected = props.options.find(
			opt => opt[props.valueField] === props.value,
		)
		return selected ? String(selected[props.labelField]) : props.value
	})

	const handleSelect = (value: string) => {
		props.onChange(value)
		setIsOpen(false)
		setSearch('')
	}

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			setIsOpen(false)
			setSearch('')
		}
	}

	return (
		<div
			class="searchable-dropdown"
			onKeyDown={handleKeyDown}
		>
			<label
				class="searchable-dropdown__label"
				id={`${props.id}-label`}
			>
				{props.label}
			</label>
			<div class="searchable-dropdown__container">
				<button
					type="button"
					id={props.id}
					aria-haspopup="listbox"
					aria-expanded={isOpen()}
					aria-labelledby={`${props.id}-label ${props.id}`}
					class={`searchable-dropdown__trigger ${isOpen() ? 'searchable-dropdown__trigger--open' : ''}`}
					onClick={() => setIsOpen(!isOpen())}
				>
					<span class="searchable-dropdown__value">{selectedLabel()}</span>
					<IconExpandMore
						size={18}
						expanded={isOpen()}
					/>
				</button>
				<Show when={isOpen()}>
					<div
						class="searchable-dropdown__menu"
						role="listbox"
					>
						<div class="searchable-dropdown__search">
							<IconSearch size={16} />
							<input
								type="text"
								class="searchable-dropdown__search-input"
								placeholder={props.searchPlaceholder || 'Search...'}
								value={search()}
								onInput={e => setSearch(e.currentTarget.value)}
								onClick={e => e.stopPropagation()}
							/>
							<Show when={search()}>
								<button
									type="button"
									class="searchable-dropdown__clear"
									onClick={e => {
										e.stopPropagation()
										setSearch('')
									}}
									aria-label="Clear search"
								>
									<IconClose size={14} />
								</button>
							</Show>
						</div>
						<ul
							class="searchable-dropdown__options"
							role="option"
						>
							<For each={filteredOptions()}>
								{option => (
									<li
										role="option"
										aria-selected={option[props.valueField] === props.value}
										class={`searchable-dropdown__option ${option[props.valueField] === props.value ? 'searchable-dropdown__option--selected' : ''}`}
										onClick={() =>
											handleSelect(String(option[props.valueField]))
										}
									>
										<span>{String(option[props.labelField])}</span>
										<Show when={option[props.valueField] === props.value}>
											<IconCheck size={16} />
										</Show>
									</li>
								)}
							</For>
							<Show when={filteredOptions().length === 0}>
								<li class="searchable-dropdown__empty">No results found</li>
							</Show>
						</ul>
					</div>
				</Show>
			</div>
		</div>
	)
}

// ===========================================
// Collapsible Section Component
// ===========================================

interface CollapsibleSectionProps {
	title: string
	description?: string
	icon: 'general' | 'appearance' | 'behavior' | 'privacy'
	children: any
	defaultExpanded?: boolean
}

function _CollapsibleSection(props: CollapsibleSectionProps) {
	const [isExpanded, setIsExpanded] = createSignal(
		props.defaultExpanded ?? true,
	)

	const iconComponent = () => {
		switch (props.icon) {
			case 'general':
				return <IconGeneral size={20} />
			case 'appearance':
				return <IconAppearance size={20} />
			case 'behavior':
				return <IconBehavior size={20} />
			case 'privacy':
				return <IconPrivacy size={20} />
		}
	}

	return (
		<div
			class={`collapsible-section ${isExpanded() ? 'collapsible-section--expanded' : ''}`}
		>
			<button
				type="button"
				class="collapsible-section__header"
				aria-expanded={isExpanded()}
				onClick={() => setIsExpanded(!isExpanded())}
			>
				<div class="collapsible-section__header-content">
					<span class="collapsible-section__icon">{iconComponent()}</span>
					<div class="collapsible-section__header-text">
						<span class="collapsible-section__title">{props.title}</span>
						<Show when={props.description}>
							<span class="collapsible-section__description">
								{props.description}
							</span>
						</Show>
					</div>
				</div>
				<IconExpandMore
					size={20}
					expanded={isExpanded()}
				/>
			</button>
			<Show when={isExpanded()}>
				<div class="collapsible-section__content">{props.children}</div>
			</Show>
		</div>
	)
}

// ===========================================
// Section Navigation Item
// ===========================================

interface SectionNavItemProps {
	section: SettingsSection
	title: string
	description: string
	icon: 'general' | 'appearance' | 'behavior' | 'privacy'
	isActive: boolean
	onClick: () => void
	count?: number
}

function SectionNavItem(props: SectionNavItemProps) {
	const iconComponent = () => {
		switch (props.icon) {
			case 'general':
				return <IconGeneral size={20} />
			case 'appearance':
				return <IconAppearance size={20} />
			case 'behavior':
				return <IconBehavior size={20} />
			case 'privacy':
				return <IconPrivacy size={20} />
		}
	}

	return (
		<button
			type="button"
			class={`section-nav-item ${props.isActive ? 'section-nav-item--active' : ''}`}
			aria-current={props.isActive ? 'true' : 'false'}
			onClick={props.onClick}
		>
			<span class="section-nav-item__icon">{iconComponent()}</span>
			<div class="section-nav-item__content">
				<span class="section-nav-item__title">{props.title}</span>
				<span class="section-nav-item__description">{props.description}</span>
			</div>
			<Show when={props.count !== undefined && props.count > 0}>
				<span class="section-nav-item__badge">{props.count}</span>
			</Show>
		</button>
	)
}

// ===========================================
// Main Settings Panel
// ===========================================

interface SettingsPanelProps {
	isOpen: boolean
	onClose: () => void
	currentProvider: string
	currentModel: string
	theme: 'system' | 'light' | 'dark'
	autoSave: boolean
	notifications: 'all' | 'mentions' | 'none'
	compactMode: boolean
	soundEnabled: boolean
	onSave: (settings: SettingsData) => void
}

export function SettingsPanel(props: SettingsPanelProps) {
	const [activeSection, setActiveSection] =
		createSignal<SettingsSection>('general')
	const [providerSearch, setProviderSearch] = createSignal('')
	const [modelSearch, setModelSearch] = createSignal('')

	// Local state
	const [selectedProvider, setSelectedProvider] = createSignal(
		props.currentProvider,
	)
	const [selectedModel, setSelectedModel] = createSignal(props.currentModel)
	const [customEndpoint, setCustomEndpoint] = createSignal('')
	const [localTheme, setLocalTheme] = createSignal<'system' | 'light' | 'dark'>(
		props.theme,
	)
	const [localAutoSave, setLocalAutoSave] = createSignal(props.autoSave)
	const [localNotifications, setLocalNotifications] = createSignal(
		props.notifications,
	)
	const [localCompactMode, setLocalCompactMode] = createSignal(
		props.compactMode,
	)
	const [localSoundEnabled, setLocalSoundEnabled] = createSignal(
		props.soundEnabled,
	)

	// Reset on open
	createEffect(() => {
		if (props.isOpen) {
			setSelectedProvider(props.currentProvider)
			setSelectedModel(props.currentModel)
			setLocalTheme(props.theme)
			setLocalAutoSave(props.autoSave)
			setLocalNotifications(props.notifications)
			setLocalCompactMode(props.compactMode)
			setLocalSoundEnabled(props.soundEnabled)
		}
	})

	// Filtered providers for search
	const filteredProviders = createMemo(() => {
		const search = providerSearch().toLowerCase()
		if (!search) return PROVIDERS
		return PROVIDERS.filter(p => p.name.toLowerCase().includes(search))
	})

	// Models for selected provider
	const currentProviderModels = createMemo(() => {
		const provider = PROVIDERS.find(p => p.id === selectedProvider())
		return provider?.models || []
	})

	// Filtered models for search
	const filteredModels = createMemo(() => {
		const search = modelSearch().toLowerCase()
		const models = currentProviderModels()
		if (!search) return models
		return models.filter(m => m.name.toLowerCase().includes(search))
	})

	// Dropdown visibility state
	const [providerDropdownOpen, setProviderDropdownOpen] = createSignal(false)
	const [modelDropdownOpen, setModelDropdownOpen] = createSignal(false)

	// Current model name
	const currentModelName = createMemo(() => {
		const models = currentProviderModels()
		const model = models.find(m => m.id === selectedModel())
		return model?.name || selectedModel()
	})

	// Current provider name
	const currentProviderName = createMemo(() => {
		const provider = PROVIDERS.find(p => p.id === selectedProvider())
		return provider?.name || selectedProvider()
	})

	// Section titles and descriptions
	const sections: {
		id: SettingsSection
		title: string
		description: string
		icon: 'general' | 'appearance' | 'behavior' | 'privacy'
	}[] = [
		{
			id: 'general',
			title: 'General',
			description: 'AI provider & model',
			icon: 'general',
		},
		{
			id: 'appearance',
			title: 'Appearance',
			description: 'Theme & display',
			icon: 'appearance',
		},
		{
			id: 'behavior',
			title: 'Behavior',
			description: 'Auto-save & sounds',
			icon: 'behavior',
		},
		{
			id: 'privacy',
			title: 'Privacy',
			description: 'Notifications',
			icon: 'privacy',
		},
	]

	const handleSave = () => {
		props.onSave({
			provider: selectedProvider(),
			model: selectedModel(),
			apiEndpoint: customEndpoint(),
			theme: localTheme(),
			autoSave: localAutoSave(),
			notifications: localNotifications(),
			compactMode: localCompactMode(),
			soundEnabled: localSoundEnabled(),
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

	const handleModelChange = (modelId: string) => {
		setSelectedModel(modelId)
	}

	const handleProviderChange = (providerId: string) => {
		setSelectedProvider(providerId)
		// Auto-select first model
		const provider = PROVIDERS.find(p => p.id === providerId)
		if (provider && provider.models.length > 0) {
			setSelectedModel(provider.models[0].id)
		}
	}

	const themeOptions = [
		{
			id: 'system',
			name: 'System',
			icon: <IconAutoMode size={18} />,
			description: 'Follow OS setting',
		},
		{
			id: 'light',
			name: 'Light',
			icon: <IconLightMode size={18} />,
			description: 'Always light',
		},
		{
			id: 'dark',
			name: 'Dark',
			icon: <IconDarkMode size={18} />,
			description: 'Always dark',
		},
	]

	const notificationOptions = [
		{
			id: 'all',
			name: 'All notifications',
			icon: <IconNotifications size={18} />,
		},
		{
			id: 'mentions',
			name: 'Mentions only',
			icon: <IconNotificationsOff size={18} />,
		},
		{id: 'none', name: 'None', icon: <IconVolumeOff size={18} />},
	]

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
							<IconSettings size={22} />
							Settings
						</h2>
						<button
							type="button"
							class="settings-close"
							onClick={handleCancel}
							aria-label="Close settings"
						>
							<IconClose size={18} />
						</button>
					</div>

					<div class="settings-body">
						{/* Sidebar Navigation */}
						<nav
							class="settings-sidebar"
							aria-label="Settings sections"
						>
							<For each={sections}>
								{section => (
									<SectionNavItem
										section={section.id}
										title={section.title}
										description={section.description}
										icon={section.icon}
										isActive={activeSection() === section.id}
										onClick={() => setActiveSection(section.id)}
									/>
								)}
							</For>
						</nav>

						{/* Content Area */}
						<div
							class="settings-content"
							role="tabpanel"
						>
							<Show when={activeSection() === 'general'}>
								<div class="settings-section">
									<div class="settings-section__header">
										<h3 class="settings-section__title">
											<IconGeneral size={20} />
											General Settings
										</h3>
										<p class="settings-section__description">
											Configure your AI provider and model preferences.
										</p>
									</div>

									{/* Provider Selection */}
									<div class="settings-card">
										<div class="settings-card__header">
											<IconModel size={18} />
											<div>
												<label class="settings-card__label">AI Provider</label>
												<p class="settings-card__description">
													Select the AI provider to use
												</p>
											</div>
										</div>
										<div class="settings-card__content">
											<div class="searchable-dropdown">
												<div class="searchable-dropdown__container">
													<button
														type="button"
														id="provider-select"
														aria-haspopup="listbox"
														aria-expanded={providerDropdownOpen()}
														class={`searchable-dropdown__trigger ${providerDropdownOpen() ? 'searchable-dropdown__trigger--open' : ''}`}
														onClick={() =>
															setProviderDropdownOpen(!providerDropdownOpen())
														}
													>
														<span class="searchable-dropdown__value">
															{currentProviderName()}
														</span>
														<IconExpandMore size={18} />
													</button>
												</div>
											</div>

											{/* Provider Dropdown */}
											<Show when={providerDropdownOpen()}>
												<div class="provider-dropdown">
													<div class="provider-dropdown__search">
														<IconSearch size={16} />
														<input
															type="text"
															class="provider-dropdown__search-input"
															placeholder="Search providers..."
															value={providerSearch()}
															onInput={e =>
																setProviderSearch(e.currentTarget.value)
															}
														/>
													</div>
													<ul class="provider-dropdown__options">
														<For each={filteredProviders()}>
															{provider => (
																<li
																	class={`provider-dropdown__option ${provider.id === selectedProvider() ? 'provider-dropdown__option--selected' : ''}`}
																	onClick={() => {
																		handleProviderChange(provider.id)
																		setProviderDropdownOpen(false)
																	}}
																>
																	<span>{provider.name}</span>
																	{provider.id === selectedProvider() && (
																		<IconCheck size={16} />
																	)}
																</li>
															)}
														</For>
													</ul>
												</div>
											</Show>
										</div>
									</div>

									{/* Model Selection */}
									<div class="settings-card">
										<div class="settings-card__header">
											<IconModel size={18} />
											<div>
												<label class="settings-card__label">Model</label>
												<p class="settings-card__description">
													Select the model to use
												</p>
											</div>
										</div>
										<div class="settings-card__content">
											<div class="model-dropdown">
												<button
													type="button"
													id="model-select"
													class={`model-dropdown__trigger ${modelDropdownOpen() ? 'model-dropdown__trigger--open' : ''}`}
													aria-expanded={modelDropdownOpen()}
													aria-haspopup="listbox"
													onClick={() =>
														setModelDropdownOpen(!modelDropdownOpen())
													}
												>
													<span class="model-dropdown__value">
														{currentModelName()}
													</span>
													<IconExpandMore size={18} />
												</button>
											</div>

											<Show when={modelDropdownOpen()}>
												<div class="model-dropdown__menu">
													<div class="model-dropdown__search">
														<IconSearch size={16} />
														<input
															type="text"
															class="model-dropdown__search-input"
															placeholder="Search models..."
															value={modelSearch()}
															onInput={e =>
																setModelSearch(e.currentTarget.value)
															}
														/>
													</div>
													<ul class="model-dropdown__options">
														<For each={filteredModels()}>
															{model => (
																<li
																	class={`model-dropdown__option ${model.id === selectedModel() ? 'model-dropdown__option--selected' : ''}`}
																	onClick={() => {
																		handleModelChange(model.id)
																		setModelDropdownOpen(false)
																	}}
																>
																	<span>{model.name}</span>
																	{model.id === selectedModel() && (
																		<IconCheck size={16} />
																	)}
																</li>
															)}
														</For>
													</ul>
												</div>
											</Show>
										</div>
									</div>

									{/* API Endpoint */}
									<div class="settings-card">
										<div class="settings-card__header">
											<IconPrivacy size={18} />
											<div>
												<label class="settings-card__label">
													API Endpoint (Optional)
												</label>
												<p class="settings-card__description">
													Custom endpoint URL
												</p>
											</div>
										</div>
										<div class="settings-card__content">
											<input
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
									</div>

									{/* Current Selection Display */}
									<div class="settings-current">
										<span class="settings-current__label">Current:</span>
										<span class="settings-current__value">
											{currentProviderName()} / {currentModelName()}
										</span>
									</div>
								</div>
							</Show>

							<Show when={activeSection() === 'appearance'}>
								<div class="settings-section">
									<div class="settings-section__header">
										<h3 class="settings-section__title">
											<IconAppearance size={20} />
											Appearance Settings
										</h3>
										<p class="settings-section__description">
											Customize the look and feel of the interface.
										</p>
									</div>

									{/* Theme Selection */}
									<div class="settings-card">
										<div class="settings-card__header">
											<IconAppearance size={18} />
											<div>
												<label class="settings-card__label">Theme</label>
												<p class="settings-card__description">
													Choose your preferred color theme
												</p>
											</div>
										</div>
										<div class="settings-card__content">
											<div class="theme-options">
												<For each={themeOptions}>
													{option => (
														<button
															type="button"
															class={`theme-option ${localTheme() === option.id ? 'theme-option--selected' : ''}`}
															onClick={() =>
																setLocalTheme(
																	option.id as 'system' | 'light' | 'dark',
																)
															}
														>
															{option.icon}
															<span class="theme-option__name">
																{option.name}
															</span>
															<span class="theme-option__description">
																{option.description}
															</span>
														</button>
													)}
												</For>
											</div>
										</div>
									</div>

									{/* Compact Mode */}
									<ToggleSwitch
										checked={localCompactMode()}
										onChange={setLocalCompactMode}
										label="Compact Mode"
										description="Use smaller UI elements and spacing"
										id="compact-mode"
									/>
								</div>
							</Show>

							<Show when={activeSection() === 'behavior'}>
								<div class="settings-section">
									<div class="settings-section__header">
										<h3 class="settings-section__title">
											<IconBehavior size={20} />
											Behavior Settings
										</h3>
										<p class="settings-section__description">
											Configure automatic behaviors and feedback.
										</p>
									</div>

									{/* Auto-save */}
									<div class="settings-card settings-card--highlight">
										<div class="settings-card__icon">
											<IconSave size={24} />
										</div>
										<div class="settings-card__body">
											<ToggleSwitch
												checked={localAutoSave()}
												onChange={setLocalAutoSave}
												label="Auto-save Chats"
												description="Automatically save chat sessions"
												id="auto-save"
											/>
										</div>
									</div>

									{/* Sound Effects */}
									<div class="settings-card settings-card--highlight">
										<div class="settings-card__icon">
											<IconVolumeUp size={24} />
										</div>
										<div class="settings-card__body">
											<ToggleSwitch
												checked={localSoundEnabled()}
												onChange={setLocalSoundEnabled}
												label="Sound Effects"
												description="Play sounds for notifications and events"
												id="sound-enabled"
											/>
										</div>
									</div>
								</div>
							</Show>

							<Show when={activeSection() === 'privacy'}>
								<div class="settings-section">
									<div class="settings-section__header">
										<h3 class="settings-section__title">
											<IconPrivacy size={20} />
											Privacy Settings
										</h3>
										<p class="settings-section__description">
											Control notification preferences and privacy.
										</p>
									</div>

									{/* Notifications */}
									<div class="settings-card">
										<div class="settings-card__header">
											<IconNotifications size={18} />
											<div>
												<label class="settings-card__label">
													Notifications
												</label>
												<p class="settings-card__description">
													Manage notification preferences
												</p>
											</div>
										</div>
										<div class="settings-card__content">
											<div class="notification-options">
												<For each={notificationOptions}>
													{option => (
														<button
															type="button"
															class={`notification-option ${localNotifications() === option.id ? 'notification-option--selected' : ''}`}
															onClick={() =>
																setLocalNotifications(
																	option.id as 'all' | 'mentions' | 'none',
																)
															}
														>
															{option.icon}
															<span class="notification-option__name">
																{option.name}
															</span>
														</button>
													)}
												</For>
											</div>
										</div>
									</div>
								</div>
							</Show>
						</div>
					</div>

					{/* Footer */}
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
							Save Changes
						</button>
					</div>
				</div>
			</>
		</Show>
	)
}
