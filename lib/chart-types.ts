// Shared types for chart components

export interface TooltipPayload {
	payload: Record<string, unknown>
	value?: number | string
	dataKey?: string
	name?: string
}

export interface ChartTooltipProps {
	active?: boolean
	payload?: TooltipPayload[]
	label?: string
}
