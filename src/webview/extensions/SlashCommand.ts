import {createSlashCommandSuggestion} from '../utils/slashCommandSuggestion'
import type {SuggestionProps} from '@tiptap/suggestion'
import {Mention} from '@tiptap/extension-mention'

export interface SlashCommandItem {
	id: string
	label: string
	description: string
	usage: string
}

export const SLASH_COMMANDS: SlashCommandItem[] = [
	{
		id: 'ask',
		label: 'ask',
		description: 'Ask a general question',
		usage: '/ask <question>',
	},
	{
		id: 'config',
		label: 'config',
		description: 'Open configuration settings',
		usage: '/config [key] [value]',
	},
	{
		id: 'model',
		label: 'model',
		description: 'Change the AI model',
		usage: '/model <model-name>',
	},
	{
		id: 'theme',
		label: 'theme',
		description: 'Change the color theme',
		usage: '/theme <light|dark|system>',
	},
	{
		id: 'clear',
		label: 'clear',
		description: 'Clear the conversation',
		usage: '/clear',
	},
	{
		id: 'help',
		label: 'help',
		description: 'Show help and available commands',
		usage: '/help [command]',
	},
]

export const SlashCommandExtension = Mention.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			id: {
				default: null,
				parseHTML: element => element.getAttribute('data-id'),
				renderHTML: attributes => {
					if (!attributes.id) return {}
					return {'data-id': attributes.id}
				},
			},
		}
	},

	addProseMirrorPlugins() {
		return []
	},
})

export function createSlashCommandExtension() {
	return SlashCommandExtension.configure({
		suggestion: (() => {
			const baseSuggestion = createSlashCommandSuggestion()

			const baseRender = baseSuggestion.render

			return {
				...baseSuggestion,
				render: () => {
					const renderer = baseRender!()
					const originalOnStart = renderer.onStart
					const originalOnExit = renderer.onExit
					const originalOnUpdate = renderer.onUpdate

					return {
						...renderer,
						onStart: (suggestionProps: SuggestionProps) => {
							originalOnStart?.(suggestionProps)
						},
						onExit: (suggestionProps: SuggestionProps) => {
							originalOnExit?.(suggestionProps)
						},
						onUpdate: (suggestionProps: SuggestionProps) => {
							originalOnUpdate?.(suggestionProps)
						},
					}
				},
			}
		})(),
	})
}
