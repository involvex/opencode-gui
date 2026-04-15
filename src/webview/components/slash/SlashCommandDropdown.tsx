import type {SlashCommandItem} from '../../extensions/SlashCommand'
import {createSignal, For, onMount, Show} from 'solid-js'
import './SlashCommandDropdown.css'

export interface SlashCommandDropdownProps {
	items: SlashCommandItem[]
	selectedIndex: number
	onSelect: (item: SlashCommandItem) => void
	position: {top: number; left: number}
}

export interface SlashCommandDropdownRef {
	onKeyDown: (event: KeyboardEvent) => boolean
	getElement: () => HTMLDivElement
}

export function SlashCommandDropdown(
	props: SlashCommandDropdownProps & {
		ref?: (ref: SlashCommandDropdownRef) => void
	},
) {
	let containerRef!: HTMLDivElement
	const [localSelectedIndex, setLocalSelectedIndex] = createSignal(
		props.selectedIndex,
	)

	onMount(() => {
		if (props.ref) {
			props.ref({
				onKeyDown: handleKeyDown,
				getElement: () => containerRef,
			})
		}
	})

	const handleKeyDown = (event: KeyboardEvent): boolean => {
		const itemCount = props.items.length

		if (itemCount === 0) {
			return false
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault()
			setLocalSelectedIndex(prev => (prev + 1) % itemCount)
			scrollToSelected()
			return true
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault()
			setLocalSelectedIndex(prev => (prev - 1 + itemCount) % itemCount)
			scrollToSelected()
			return true
		}

		if (event.key === 'Enter' || event.key === 'Tab') {
			event.preventDefault()
			const selected = props.items[localSelectedIndex()]
			if (selected) {
				props.onSelect(selected)
			}
			return true
		}

		if (event.key === 'Escape') {
			event.preventDefault()
			return true
		}

		return false
	}

	const scrollToSelected = () => {
		const selected = containerRef?.querySelector(
			`[data-index="${localSelectedIndex()}"]`,
		) as HTMLElement
		if (selected) {
			selected.scrollIntoView({block: 'nearest'})
		}
	}

	return (
		<div
			ref={containerRef}
			class="slash-command-dropdown"
			style={{
				position: 'fixed',
				top: `${props.position.top}px`,
				left: `${props.position.left}px`,
				'pointer-events': 'auto',
			}}
			role="listbox"
			aria-label="Slash commands"
		>
			<Show
				when={props.items.length > 0}
				fallback={
					<div class="slash-command-dropdown__empty">No commands found</div>
				}
			>
				<For each={props.items}>
					{(item, index) => (
						<div
							class={`slash-command-dropdown__item ${
								index() === localSelectedIndex()
									? 'slash-command-dropdown__item--selected'
									: ''
							}`}
							data-index={index()}
							onClick={() => props.onSelect(item)}
							onMouseEnter={() => setLocalSelectedIndex(index())}
							onKeyDown={(e: KeyboardEvent) => {
								if (e.key === 'Enter') {
									props.onSelect(item)
								}
							}}
							role="option"
							aria-selected={index() === localSelectedIndex()}
							tabIndex={0}
						>
							<div class="slash-command-dropdown__item-content">
								<span class="slash-command-dropdown__command">
									/{item.label}
								</span>
								<span class="slash-command-dropdown__description">
									{item.description}
								</span>
							</div>
							<span class="slash-command-dropdown__usage">{item.usage}</span>
						</div>
					)}
				</For>
			</Show>
		</div>
	)
}
