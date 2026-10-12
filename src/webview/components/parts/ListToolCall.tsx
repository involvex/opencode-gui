import {createMemo, type Accessor} from 'solid-js'
import type {MessagePart, Permission, ToolState} from '../../types'
import {
	ErrorFooter,
	getToolInputs,
	toRelativePath,
	usePermission,
} from './ToolCallHelpers'
import {FolderIcon} from './ToolCallIcons'
import {ToolCallTemplate} from './ToolCallTemplate'

interface ListToolCallProps {
	part: MessagePart
	workspaceRoot?: string
	pendingPermissions?: Accessor<Map<string, Permission>>
	onPermissionResponse?: (
		permissionId: string,
		response: 'once' | 'always' | 'reject',
	) => void
}

export function ListToolCall(props: ListToolCallProps) {
	const state = () => props.part.state as ToolState
	const inputs = () => getToolInputs(state(), props.part)

	const relativePath = createMemo(() =>
		toRelativePath(inputs().path as string, props.workspaceRoot),
	)

	const permissionAccessor = () => {
		const perms = props.pendingPermissions
		return perms ? perms() : undefined
	}
	const permission = usePermission(props.part, permissionAccessor)

	const Header = () => (
		<span class="tool-header-text">
			<span
				class="tool-text"
				style={{'font-family': 'monospace'}}
			>
				{relativePath() || 'Listing directory'}
			</span>
		</span>
	)

	const Output = () => <pre class="tool-output">{state().output}</pre>

	return (
		<ToolCallTemplate
			icon={FolderIcon}
			header={Header}
			output={state().output ? Output : undefined}
			footer={
				state().error ? () => <ErrorFooter error={state().error} /> : undefined
			}
			isPending={props.part.state?.status === 'pending'}
			needsPermission={!!permission()}
			permission={permission()}
			onPermissionResponse={response => {
				const perm = permission()
				if (perm?.id && props.onPermissionResponse) {
					props.onPermissionResponse(perm.id, response)
				}
			}}
		/>
	)
}
