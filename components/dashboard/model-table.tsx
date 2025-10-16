"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ModelMetrics } from "@/lib/types"
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/analytics"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModelTableProps {
	models: ModelMetrics[]
	isLoading?: boolean
}

type SortField = keyof ModelMetrics
type SortDirection = "asc" | "desc"

export function ModelTable({ models, isLoading = false }: ModelTableProps) {
	const [sortField, setSortField] = useState<SortField>("tokens")
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

	// Sort models directly
	const sortedModels = useMemo(() => {
		return [...models].sort((a, b) => {
			const aVal = a[sortField]
			const bVal = b[sortField]

			if (typeof aVal === "number" && typeof bVal === "number") {
				return sortDirection === "asc" ? aVal - bVal : bVal - aVal
			}

			const aStr = String(aVal).toLowerCase()
			const bStr = String(bVal).toLowerCase()
			return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
		})
	}, [models, sortField, sortDirection])

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc")
		} else {
			setSortField(field)
			setSortDirection("desc")
		}
	}

	const getSortIcon = (field: SortField) => {
		if (sortField !== field) {
			return <ArrowUpDown className="h-4 w-4" />
		}
		return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
	}

	const getBadgeVariant = (badge: string) => {
		switch (badge) {
			case "MIXED":
				return "secondary"
			case "MAX":
				return "default"
			case "HIGH":
				return "destructive"
			case "FREE":
				return "secondary"
			default:
				return "outline"
		}
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="h-8 bg-muted rounded animate-pulse" />
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="h-12 bg-muted rounded animate-pulse" />
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-12">#</TableHead>
						<TableHead className="min-w-[200px]">Model</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("calls")}
								className="h-auto p-0 font-medium hover:bg-transparent"
							>
								Calls
								{getSortIcon("calls")}
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("tokens")}
								className="h-auto p-0 font-medium hover:bg-transparent"
							>
								M Tokens
								{getSortIcon("tokens")}
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("realApiCost")}
								className="h-auto p-0 font-medium hover:bg-transparent"
							>
								Real API Cost
								{getSortIcon("realApiCost")}
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("cursorCharges")}
								className="h-auto p-0 font-medium hover:bg-transparent"
							>
								Cursor Charges
								{getSortIcon("cursorCharges")}
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("yourCost")}
								className="h-auto p-0 font-medium hover:bg-transparent"
							>
								Your Cost
								{getSortIcon("yourCost")}
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort("savings")}
								className="h-auto p-0 font-medium hover:bg-transparent"
							>
								Savings
								{getSortIcon("savings")}
							</Button>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
          {sortedModels.map((model, index) => {
            const hasNoUsage = model.tokens === 0 && model.realApiCost === 0 && model.cursorCharges === 0
            return (
              <TableRow key={model.model} className={hasNoUsage ? "opacity-50" : ""}>
                <TableCell>{index + 1}</TableCell>
							<TableCell>
								<div className="flex items-center gap-2">
									<span className="font-medium">{model.model}</span>
									<div className="flex gap-1">
										{model.badges.map((badge) => (
											<Badge key={badge} variant={getBadgeVariant(badge)} className="text-xs">
												{badge}
											</Badge>
										))}
									</div>
								</div>
							</TableCell>
							<TableCell>
								<div className="text-sm">
									<div>{(model.calls || 0).toLocaleString()}</div>
									<div className="text-muted-foreground text-xs">
										{model.paidCalls || 0} paid, {model.freeCalls || 0} free
									</div>
								</div>
							</TableCell>
							<TableCell>
								<div className="text-sm">
									<div>{formatNumber((model.tokens || 0) / 1000000, 1)}M</div>
									<div className="text-muted-foreground text-xs">
										{(model.tokens || 0).toLocaleString()} total
									</div>
								</div>
							</TableCell>
							<TableCell>{formatCurrency(model.realApiCost || 0)}</TableCell>
							<TableCell>{formatCurrency(model.cursorCharges || 0)}</TableCell>
							<TableCell>{formatCurrency(model.yourCost || 0)}</TableCell>
							<TableCell>
								<div
									className={cn(
										"text-sm font-medium",
										(model.savings || 0) > 0 ? "text-green-600" : "text-red-600"
									)}
								>
									<div>{formatCurrency(model.savings || 0)}</div>
									<div className="text-xs">
										{(model.savingsPercentage || 0) > 0 ? "+" : ""}
										{formatPercentage(model.savingsPercentage || 0)}
									</div>
								</div>
							</TableCell>
            </TableRow>
          )})}
        </TableBody>
			</Table>
		</div>
	)
}
