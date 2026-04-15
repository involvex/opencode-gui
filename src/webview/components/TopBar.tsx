import {NewSessionButton} from './NewSessionButton'
import {SessionSwitcher} from './SessionSwitcher'
import type {SessionStatus} from '../state/types'
import type {Session} from '../types'

interface TopBarProps {
	sessions: Session[]
	currentSessionId: string | null
	currentSessionTitle: string
	sessionStatus: (sessionId: string) => SessionStatus | null
	onSessionSelect: (sessionId: string) => void
	onNewSession: () => void
	onRefreshSessions: () => Promise<void>
	onOpenSettings: () => void
}

export function TopBar(props: TopBarProps) {
	return (
		<div class="top-bar">
			<SessionSwitcher
				sessions={props.sessions}
				currentSessionId={props.currentSessionId}
				currentSessionTitle={props.currentSessionTitle}
				sessionStatus={props.sessionStatus}
				onSessionSelect={props.onSessionSelect}
				onRefreshSessions={props.onRefreshSessions}
			/>
			<button
				type="button"
				class="settings-button"
				onClick={props.onOpenSettings}
				aria-label="Open settings"
				title="Settings"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="currentColor"
					aria-hidden="true"
				>
					<path d="M8 4.754a3.246 3.246 0 100 6.492 3.246 3.246 0 000-6.492zM5.495 6.927a.25.25 0 10-.439.439l1.523 3.694h-4.26a.25.25 0 100 .5h4.26l-1.523 3.694a.25.25 0 00.439.439l2.506-4.327a.25.25 0 000-.342L5.495 6.927zM9.448 5.373a3.246 3.246 0 116.492 0 3.246 3.246 0 01-6.492 0zM7.768 9.495a.25.25 0 00.439-.439l-1.523-3.694h4.26a.25.25 0 000-.5H6.684l1.523-3.694a.25.25 0 00-.439-.439l-2.506 4.327a.25.25 0 000 .342l2.506 4.327zM8.7 10.137a.25.25 0 01-.439 0L6.728 6.443l-4.26.001a.25.25 0 010-.5l4.26-.001-1.523-3.694a.25.25 0 01.439-.439l2.506 4.327a.25.25 0 000 .342L5.207 9.94a.25.25 0 010 .5l4.26.001 1.523 3.693a.25.25 0 01-.439.439l-2.506-4.327z" />
				</svg>
			</button>
			<NewSessionButton onClick={props.onNewSession} />
		</div>
	)
}
