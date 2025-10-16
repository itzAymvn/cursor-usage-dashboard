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
import { Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface SettingsModalProps {
	token: string
	onTokenChange: (token: string) => void
}

export function SettingsModal({ token, onTokenChange }: SettingsModalProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [tempToken, setTempToken] = useState(token)
	const { theme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const handleSave = () => {
		onTokenChange(tempToken)
		setIsOpen(false)
	}

	const handleCancel = () => {
		setTempToken(token)
		setIsOpen(false)
	}

	if (!mounted) {
		return null
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Settings className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>Configure your Cursor API token and theme preferences.</DialogDescription>
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
