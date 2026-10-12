import {createContext, createMemo, For, JSX, Show, useContext} from 'solid-js'
import type {PluggableList} from 'unified'
import {Markdown, type Components, type MarkdownOptions} from './markdown'
import {parseMarkdownIntoBlocks} from './parse-blocks'
import remend from './remend'

export {Markdown, parseMarkdownIntoBlocks, remend}
export type {Components}

export type StreamdownMode = 'static' | 'streaming'

export interface StreamdownContextType {
	mode: StreamdownMode
	isAnimating: boolean
}

const StreamdownContext = createContext<StreamdownContextType>({
	mode: 'static',
	isAnimating: false,
})

export function useStreamdown() {
	return useContext(StreamdownContext)
}

export interface StreamdownProps {
	children: string
	mode?: StreamdownMode
	components?: Components
	rehypePlugins?: PluggableList
	remarkPlugins?: PluggableList
	class?: string
}

export function Streamdown(props: StreamdownProps): JSX.Element {
	const mode = () => props.mode || 'static'

	// Apply remend to fix incomplete markdown during streaming
	const processedContent = createMemo(() => {
		const content = props.children || ''
		return mode() === 'streaming' ? remend(content) : content
	})

	// Parse into blocks for streaming mode
	const blocks = createMemo(() => {
		return parseMarkdownIntoBlocks(processedContent())
	})

	const markdownOptions = createMemo((): MarkdownOptions => ({
		components: props.components,
		rehypePlugins: props.rehypePlugins,
		remarkPlugins: props.remarkPlugins,
	}))

	const contextValue = createMemo((): StreamdownContextType => ({
		mode: mode(),
		isAnimating: mode() === 'streaming',
	}))

	return (
		<StreamdownContext.Provider value={contextValue()}>
			<div class={props.class}>
				<Show
					when={mode() === 'streaming'}
					fallback={
						<Markdown
							{...markdownOptions()}
							children={processedContent()}
						/>
					}
				>
					<For each={blocks()}>
						{block => (
							<Markdown
								{...markdownOptions()}
								children={block}
							/>
						)}
					</For>
				</Show>
			</div>
		</StreamdownContext.Provider>
	)
}

export default Streamdown
