import {SlashCommandDropdown} from '../components/slash/SlashCommandDropdown'
import type {SlashCommandItem} from '../extensions/SlashCommand'
import type {SuggestionOptions} from '@tiptap/suggestion'

function createSuggestionItems(): SlashCommandItem[] {
	return [
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
}

export interface SlashCommandSuggestionProps {
	command: SlashCommandItem
	selectedRange: any
}

export function createSlashCommandSuggestion() {
	const suggestionOptions: Omit<
		SuggestionOptions<SlashCommandItem, SlashCommandSuggestionProps>,
		'editor'
	> = {
		char: '/',
		allowSpaces: true,
		items: async ({query}) => {
			const allItems = createSuggestionItems()
			const lowerQuery = query.toLowerCase()
			return allItems.filter(
				item =>
					item.label.toLowerCase().includes(lowerQuery) ||
					item.description.toLowerCase().includes(lowerQuery),
			)
		},
		command: ({editor, range, props}) => {
			const {command} = props
			const mentionText = `/${command.label}`
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.insertContent(`${mentionText} `)
				.run()
		},
		render: () => {
			let component: ReturnType<typeof SlashCommandDropdown> | null = null
			let root: HTMLElement | null = null

			return {
				onStart: (suggestionProps: any) => {
					root = document.createElement('div')
					root.className = 'slash-command-dropdown'
					document.body.appendChild(root)

					component = SlashCommandDropdown(suggestionProps)
					if (root && component.element) {
						root.appendChild(component.element)
					}

					component.updatePosition(suggestionProps)
				},
				onUpdate: (suggestionProps: any) => {
					component?.updateProps(suggestionProps)
					component?.updatePosition(suggestionProps)
				},
				onExit: (_suggestionProps: any) => {
					component?.destroy()
					if (root) {
						root.remove()
						root = null
					}
				},
				onKeyDown: (suggestionProps: any) => {
					return component?.handleKeyDown(suggestionProps)
				},
			}
		},
	}

	return suggestionOptions
}
