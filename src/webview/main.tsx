import {render} from 'solid-js/web'
import App from './App'
import './App.css'
import {OpenCodeProvider} from './hooks/useOpenCode'
import {SyncProvider} from './state/sync'

try {
	render(
		() => (
			<OpenCodeProvider>
				<SyncProvider>
					<App />
				</SyncProvider>
			</OpenCodeProvider>
		),
		document.getElementById('root')!,
	)
} catch (error) {
	console.error('[OpenCode] Error rendering webview:', error)
}
