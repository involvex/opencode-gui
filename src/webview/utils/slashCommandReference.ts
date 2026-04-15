export interface SlashCommandReference {
	command: string
	args?: string
}

export function encodeSlashCommandReference(
	ref: SlashCommandReference,
): string {
	const parts: string[] = [ref.command]
	if (ref.args) {
		parts.push(ref.args)
	}
	return parts.join(' ')
}

export function parseSlashCommandReference(
	ref: string,
): SlashCommandReference | null {
	if (!ref.startsWith('/')) {
		return null
	}
	const trimmed = ref.slice(1).trim()
	const spaceIndex = trimmed.indexOf(' ')
	if (spaceIndex === -1) {
		return {command: trimmed}
	}
	return {
		command: trimmed.slice(0, spaceIndex),
		args: trimmed.slice(spaceIndex + 1),
	}
}

export function formatSlashCommandLabel(ref: SlashCommandReference): string {
	let label = ref.command
	if (ref.args) {
		label += ` ${ref.args}`
	}
	return label
}
