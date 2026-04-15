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
			<NewSessionButton onClick={props.onNewSession} />
		</div>
	)
}
