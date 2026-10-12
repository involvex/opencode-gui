import {Match, Switch, type Accessor} from 'solid-js'
import type {MessagePart, Permission} from '../../types'
import {BashToolCall} from './BashToolCall'
import {EditToolCall} from './EditToolCall'
import {GenericToolCall} from './GenericToolCall'
import {GlobToolCall} from './GlobToolCall'
import {GrepToolCall} from './GrepToolCall'
import {ListToolCall} from './ListToolCall'
import {ReadToolCall} from './ReadToolCall'
import {TaskToolCall} from './TaskToolCall'
import {TodoToolCall} from './TodoToolCall'
import {WebfetchToolCall} from './WebfetchToolCall'

interface ToolCallProps {
	part: MessagePart
	workspaceRoot?: string
	pendingPermissions?: Accessor<Map<string, Permission>>
	onPermissionResponse?: (
		permissionId: string,
		response: 'once' | 'always' | 'reject',
	) => void
}

export function ToolCall(props: ToolCallProps) {
	const tool = () => props.part.tool as string

	return (
		<Switch>
			<Match when={tool() === 'read'}>
				<ReadToolCall {...props} />
			</Match>
			<Match when={tool() === 'edit' || tool() === 'write'}>
				<EditToolCall {...props} />
			</Match>
			<Match when={tool() === 'grep'}>
				<GrepToolCall {...props} />
			</Match>
			<Match when={tool() === 'glob'}>
				<GlobToolCall {...props} />
			</Match>
			<Match when={tool() === 'bash'}>
				<BashToolCall {...props} />
			</Match>
			<Match when={tool() === 'list'}>
				<ListToolCall {...props} />
			</Match>
			<Match when={tool() === 'webfetch'}>
				<WebfetchToolCall {...props} />
			</Match>
			<Match when={tool() === 'todowrite' || tool() === 'todoread'}>
				<TodoToolCall {...props} />
			</Match>
			<Match when={tool() === 'task'}>
				<TaskToolCall {...props} />
			</Match>
			<Match when={true}>
				<GenericToolCall {...props} />
			</Match>
		</Switch>
	)
}
