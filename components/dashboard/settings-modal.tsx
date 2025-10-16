"use client"

import { useState, useEffect } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface SettingsModalProps {
	token: string
	plan: string
	billingStartDate: string
	onTokenChange: (token: string) => void
	onPlanChange: (plan: string) => void
	onBillingStartDateChange: (date: string) => void
}

export function SettingsModal({
	token,
	plan,
	billingStartDate,
	onTokenChange,
	onPlanChange,
	onBillingStartDateChange,
}: SettingsModalProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [tempToken, setTempToken] = useState(token)
	const [tempPlan, setTempPlan] = useState(plan)
	const [tempBillingStartDate, setTempBillingStartDate] = useState(billingStartDate)
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	// Sync temp state with props when they change
	useEffect(() => {
		setTempToken(token)
		setTempPlan(plan)
		setTempBillingStartDate(billingStartDate)
	}, [token, plan, billingStartDate])

	// Reset temp state when modal opens
	const handleOpenChange = (open: boolean) => {
		setIsOpen(open)
		if (open) {
			// Reset temp values to current props when opening
			setTempToken(token)
			setTempPlan(plan)
			setTempBillingStartDate(billingStartDate)
		}
	}

	const handleSave = () => {
		onTokenChange(tempToken)
		onPlanChange(tempPlan)
		onBillingStartDateChange(tempBillingStartDate)
		setIsOpen(false)
	}

	const handleCancel = () => {
		setTempToken(token)
		setTempPlan(plan)
		setTempBillingStartDate(billingStartDate)
		setIsOpen(false)
	}

	if (!mounted) {
		return null
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Settings className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Configure your Cursor API token, theme preferences, and subscription plan. Billing cycle day is
						automatically detected from your usage data.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-6 py-4">
					{/* Theme Toggle */}
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label className="text-base font-medium">Theme</Label>
							<div className="text-sm text-muted-foreground">Toggle between light and dark mode</div>
						</div>
						<div className="flex items-center space-x-2">
							<Sun className="h-4 w-4" />
							<Switch
								checked={theme === "dark"}
								onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
							/>
							<Moon className="h-4 w-4" />
						</div>
					</div>

					{/* Plan Selection */}
					<div className="grid gap-2">
						<Label htmlFor="plan" className="text-base font-medium">
							Cursor Plan
						</Label>
						<div className="text-sm text-muted-foreground mb-2">
							Select your Cursor subscription plan to track usage limits.
						</div>
						<Select value={tempPlan} onValueChange={setTempPlan}>
							<SelectTrigger>
								<SelectValue placeholder="Select your plan" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="pro">$20 Pro (gives $20 worth)</SelectItem>
								<SelectItem value="pro-plus">$60 Pro+ (gives $70 worth)</SelectItem>
								<SelectItem value="ultra">$200 Ultra (gives $400 worth)</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* API Token */}
					<div className="grid gap-2">
						<Label htmlFor="token" className="text-base font-medium">
							Cursor API Token
						</Label>
						<div className="text-sm text-muted-foreground mb-2">
							Your Cursor session token for accessing usage data.{" "}
							<a
								href="/ENV_CONFIG.md"
								target="_blank"
								rel="noopener noreferrer"
								className="underline hover:no-underline"
							>
								How to get your token →
							</a>
						</div>
						<Input
							id="token"
							type="password"
							placeholder="Enter your Cursor API token..."
							value={tempToken}
							onChange={(e) => setTempToken(e.target.value)}
							className="font-mono text-sm"
						/>
					</div>
				</div>
				<div className="flex justify-end space-x-2">
					<Button variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button onClick={handleSave}>Save Changes</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
