"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/analytics"
import { CursorUsageEvent, EventKind } from "@/lib/types"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { useMemo, useState, useCallback, memo } from "react"

interface RequestsTableProps {
	requests: CursorUsageEvent[]
	isLoading?: boolean
}

type SortField = keyof CursorUsageEvent | "totalTokens" | "cost"
type StringSortField = "timestamp" | "model" | "kind"
type SortDirection = "asc" | "desc"

export const RequestsTable = memo(function RequestsTable({ requests, isLoading = false }: RequestsTableProps) {
	const [sortField, setSortField] = useState<SortField>("timestamp")
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

	// Memoize sort function to avoid recreating it on every render
	const sortFunction = useCallback(
		(a: CursorUsageEvent, b: CursorUsageEvent) => {
			let aVal: string | number, bVal: string | number

			switch (sortField) {
				case "totalTokens":
					aVal =
						(a.tokenUsage?.inputTokens || 0) +
						(a.tokenUsage?.outputTokens || 0) +
						(a.tokenUsage?.cacheReadTokens || 0)
					bVal =
						(b.tokenUsage?.inputTokens || 0) +
						(b.tokenUsage?.outputTokens || 0) +
						(b.tokenUsage?.cacheReadTokens || 0)
					break
				case "cost":
					aVal = a.tokenUsage?.totalCents ? a.tokenUsage.totalCents / 100 : a.requestsCosts || 0
					bVal = b.tokenUsage?.totalCents ? b.tokenUsage.totalCents / 100 : b.requestsCosts || 0
					break
				default:
					// Default case handles string fields: timestamp, model, kind
					aVal = a[sortField as StringSortField]
					bVal = b[sortField as StringSortField]
			}

			if (typeof aVal === "number" && typeof bVal === "number") {
				return sortDirection === "asc" ? aVal - bVal : bVal - aVal
			}

			const aStr = String(aVal).toLowerCase()
			const bStr = String(bVal).toLowerCase()
			return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
		},
		[sortField, sortDirection]
	)

	// Sort requests - only recreate sorted array when necessary
	const sortedRequests = useMemo(() => {
		return [...requests].sort(sortFunction)
	}, [requests, sortFunction])

	const handleSort = useCallback((field: SortField) => {
		setSortField((currentField) => {
			if (currentField === field) {
				setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"))
				return currentField
			} else {
				setSortDirection("desc")
				return field
			}
		})
	}, [])

	const getSortIcon = useCallback(
		(field: SortField) => {
			if (sortField !== field) {
				return <ArrowUpDown className="h-4 w-4" />
			}
			return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
		},
		[sortField, sortDirection]
	)

	// Memoize date formatter to avoid parsing dates on every render
	const formatTimestamp = useCallback((timestamp: string) => {
		const date = new Date(parseInt(timestamp))
		return date.toLocaleString()
	}, [])

	const getTotalTokens = useCallback((event: CursorUsageEvent) => {
		if (!event.tokenUsage) return 0
		return (
			(event.tokenUsage.inputTokens || 0) +
			(event.tokenUsage.outputTokens || 0) +
			(event.tokenUsage.cacheReadTokens || 0)
		)
	}, [])

	const getCost = useCallback((event: CursorUsageEvent) => {
		if (event.tokenUsage?.totalCents) {
			return event.tokenUsage.totalCents / 100
		}
		return event.requestsCosts || 0
	}, [])

	if (isLoading) {
		return (
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Timestamp</TableHead>
							<TableHead>Model</TableHead>
							<TableHead>Kind</TableHead>
							<TableHead>Tokens</TableHead>
							<TableHead>Cost</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 5 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell>
									<div className="h-4 bg-muted rounded animate-pulse w-32" />
								</TableCell>
								<TableCell>
									<div className="h-4 bg-muted rounded animate-pulse w-24" />
								</TableCell>
								<TableCell>
									<div className="h-4 bg-muted rounded animate-pulse w-16" />
								</TableCell>
								<TableCell>
									<div className="h-4 bg-muted rounded animate-pulse w-12" />
								</TableCell>
								<TableCell>
									<div className="h-4 bg-muted rounded animate-pulse w-16" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		)
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("timestamp")}
								className="h-auto p-0 font-semibold hover:bg-transparent"
							>
								Timestamp
								{getSortIcon("timestamp")}
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("model")}
								className="h-auto p-0 font-semibold hover:bg-transparent"
							>
								Model
								{getSortIcon("model")}
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("kind")}
								className="h-auto p-0 font-semibold hover:bg-transparent"
							>
								Kind
								{getSortIcon("kind")}
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("totalTokens")}
								className="h-auto p-0 font-semibold hover:bg-transparent"
							>
								Tokens
								{getSortIcon("totalTokens")}
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("cost")}
								className="h-auto p-0 font-semibold hover:bg-transparent"
							>
								Cost
								{getSortIcon("cost")}
							</Button>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedRequests.map((request, index) => (
						<TableRow key={`${request.timestamp}-${index}`}>
							<TableCell className="font-mono text-sm">{formatTimestamp(request.timestamp)}</TableCell>
							<TableCell>
								<code className="text-xs bg-muted px-2 py-1 rounded">{request.model}</code>
							</TableCell>
							<TableCell>
								<Badge variant="outline" className="text-xs">
									{EventKind[request.kind as keyof typeof EventKind] || EventKind.DEFAULT_EVENT_KIND}
								</Badge>
							</TableCell>
							<TableCell className="font-mono">
								{request.tokenUsage ? (
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="h-auto p-0 font-mono text-sm hover:bg-transparent hover:underline"
											>
												{getTotalTokens(request).toLocaleString()}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-48">
											<div className="space-y-2">
												<div className="font-medium">Token Breakdown</div>
												<div className="space-y-1 text-sm">
													<div className="flex justify-between">
														<span className="text-muted-foreground">Total:</span>
														<span className="font-mono">
															{getTotalTokens(request).toLocaleString()}
														</span>
													</div>
													{request.tokenUsage.inputTokens > 0 && (
														<div className="flex justify-between">
															<span className="text-muted-foreground">Input:</span>
															<span className="font-mono">
																{request.tokenUsage.inputTokens.toLocaleString()}
															</span>
														</div>
													)}
													{request.tokenUsage.outputTokens > 0 && (
														<div className="flex justify-between">
															<span className="text-muted-foreground">Output:</span>
															<span className="font-mono">
																{request.tokenUsage.outputTokens.toLocaleString()}
															</span>
														</div>
													)}
													{request.tokenUsage.cacheReadTokens > 0 && (
														<div className="flex justify-between">
															<span className="text-muted-foreground">Cache:</span>
															<span className="font-mono">
																{request.tokenUsage.cacheReadTokens.toLocaleString()}
															</span>
														</div>
													)}
												</div>
											</div>
										</PopoverContent>
									</Popover>
								) : (
									<span className="text-muted-foreground">-</span>
								)}
							</TableCell>
							<TableCell className="font-mono">{formatCurrency(getCost(request))}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
})
