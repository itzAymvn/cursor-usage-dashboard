"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Key, ArrowRight } from "lucide-react"

interface OnboardingModalProps {
	isOpen: boolean
	onTokenSubmit: (token: string) => void
	onOpenSettings: () => void
}

export function OnboardingModal({ isOpen, onTokenSubmit, onOpenSettings }: OnboardingModalProps) {
	const [token, setToken] = useState("")

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (token.trim()) {
			onTokenSubmit(token.trim())
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={() => {}}>
			<DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
				<DialogHeader className="text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
						<Key className="h-6 w-6 text-primary-foreground" />
					</div>
					<DialogTitle className="text-2xl">Welcome to Cursor Analytics</DialogTitle>
					<DialogDescription className="text-base">
						Track your AI model usage, costs, and insights across Cursor
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					<div className="rounded-lg border bg-muted/50 p-4">
						<h3 className="font-semibold mb-2">Get Your API Token</h3>
						<ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
							<li>
								Visit{" "}
								<a
									href="https://cursor.com"
									target="_blank"
									rel="noopener noreferrer"
									className="underline hover:no-underline text-primary"
								>
									cursor.com
								</a>{" "}
								and sign in
							</li>
							<li>Open Developer Tools (F12)</li>
							<li>Go to Application → Storage → Cookies → cursor.com</li>
							<li>
								Find the <code className="bg-muted px-1 rounded text-xs">WorkosCursorSessionToken</code>{" "}
								cookie
							</li>
							<li>Copy its value below</li>
						</ol>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="onboarding-token">Cursor Session Token</Label>
							<Input
								id="onboarding-token"
								type="password"
								placeholder="Paste your WorkosCursorSessionToken here..."
								value={token}
								onChange={(e) => setToken(e.target.value)}
								className="font-mono text-sm"
								autoFocus
							/>
						</div>

						<div className="flex gap-3">
							<Button type="submit" className="flex-1" disabled={!token.trim()}>
								Continue
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={onOpenSettings}
								className="flex items-center gap-2"
							>
								<Settings className="h-4 w-4" />
								Settings
							</Button>
						</div>
					</form>

					<div className="text-xs text-muted-foreground text-center">
						Your token is stored locally and never sent to external servers. You can change it anytime in
						settings.
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
