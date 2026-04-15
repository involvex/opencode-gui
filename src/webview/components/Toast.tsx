import {createSignal, For, Show} from 'solid-js'
import './Toast.css'

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface Toast {
	id: string
	message: string
	type: ToastType
	duration?: number
}

const [toasts, setToasts] = createSignal<Toast[]>([])

export function showToast(
	message: string,
	type: ToastType = 'info',
	duration: number = 3000,
) {
	const id = crypto.randomUUID()
	const toast: Toast = {id, message, type, duration}
	setToasts(prev => [...prev, toast])

	if (duration > 0) {
		setTimeout(() => {
			removeToast(id)
		}, duration)
	}

	return id
}

export function removeToast(id: string) {
	setToasts(prev => prev.filter(t => t.id !== id))
}

export function ToastContainer() {
	return (
		<div
			class="toast-container"
			role="region"
			aria-label="Notifications"
		>
			<For each={toasts()}>
				{toast => (
					<div
						class={`toast toast--${toast.type}`}
						role="alert"
						aria-live="polite"
					>
						<div class="toast__icon">
							<Show when={toast.type === 'success'}>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="currentColor"
								>
									<path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
								</svg>
							</Show>
							<Show when={toast.type === 'error'}>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="currentColor"
								>
									<path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 8.25a1 1 0 100-2 1 1 0 000 2z" />
								</svg>
							</Show>
							<Show when={toast.type === 'warning'}>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="currentColor"
								>
									<path d="M8.22 1.754a.25.25 0 00-.44 0L.42 13.335c-.11.22.06.477.29.477H15.29c.23 0 .4-.256.29-.477L8.22 1.754zM7.25 6a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0v-3zm.75 8.25a1 1 0 100-2 1 1 0 000 2z" />
								</svg>
							</Show>
							<Show when={toast.type === 'info'}>
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="currentColor"
								>
									<path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 5.75a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 8.25a1 1 0 100-2 1 1 0 000 2z" />
								</svg>
							</Show>
						</div>
						<span class="toast__message">{toast.message}</span>
						<button
							type="button"
							class="toast__dismiss"
							onClick={() => removeToast(toast.id)}
							aria-label="Dismiss notification"
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 14 14"
								fill="currentColor"
							>
								<path d="M10.354 3.354a.5.5 0 00-.708-.708L7 5.293 4.354 2.646a.5.5 0 00-.708.708L5.293 7 2.646 9.646a.5.5 0 00.708.708L7 7.707l2.646 2.647a.5.5 0 00.708-.708L7.707 7l2.647-2.646z" />
							</svg>
						</button>
					</div>
				)}
			</For>
		</div>
	)
}
