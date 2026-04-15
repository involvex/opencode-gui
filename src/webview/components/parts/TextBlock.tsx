import {messageMarkdownComponents} from '../markdownComponents'
import {Streamdown} from '../../lib/streamdown'
import type {MessagePart} from '../../types'
import {Show} from 'solid-js'

interface TextBlockProps {
	part: MessagePart
	isStreaming?: boolean
}

export function TextBlock(props: TextBlockProps) {
	return (
		<Show when={props.part.text}>
			<Streamdown
				mode={props.isStreaming ? 'streaming' : 'static'}
				components={messageMarkdownComponents}
				class="message-text"
			>
				{props.part.text!}
			</Streamdown>
		</Show>
	)
}
