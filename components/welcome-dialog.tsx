"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface WelcomeDialogProps {
  isOpen: boolean
  onClose: () => void
  isDarkMode: boolean
}

export function WelcomeDialog({ isOpen, onClose, isDarkMode }: WelcomeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-lg ${
          isDarkMode ? "bg-[#3a3d4a] border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <DialogHeader>
          <DialogTitle className={`text-xl ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Welcome to Scribble Pad v2.0
          </DialogTitle>
          <DialogDescription className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
            A distraction-free writing experience designed for your thoughts and ideas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Key Features</h3>
            <ul className={`space-y-1 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              <li>
                • <strong>Privacy First:</strong> All data stored locally on your device
              </li>
              <li>
                • <strong>Auto-Save:</strong> Your work is automatically saved as you type
              </li>
              <li>
                • <strong>Import/Export:</strong> Work with standard .txt files
              </li>
              <li>
                • <strong>Share Safely:</strong> Generate secure links with content encoded in URL
              </li>
              <li>
                • <strong>Dark/Light Mode:</strong> Choose your preferred writing environment
              </li>
            </ul>
          </div>

          <Separator className={isDarkMode ? "bg-gray-600" : "bg-gray-200"} />

          <div>
            <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Getting Started</h3>
            <ul className={`space-y-1 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              <li>1. Click on the heading area to add your title</li>
              <li>2. Start writing in the main content area</li>
              <li>3. Use the settings menu (⚙️) to access all features</li>
              <li>4. Your work is automatically saved locally</li>
            </ul>
          </div>

          <Separator className={isDarkMode ? "bg-gray-600" : "bg-gray-200"} />

          <div>
            <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Keyboard Shortcuts</h3>
            <ul className={`space-y-1 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              <li><kbd className="px-1 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">Ctrl+Shift+S</kbd> or <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">Ctrl+S</kbd> Export document</li>
              <li><kbd className="px-1 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">Ctrl+O</kbd> Import document</li>
              <li><kbd className="px-1 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">Ctrl+Shift+D</kbd> or <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">Ctrl+D</kbd> Toggle theme</li>
              <li><kbd className="px-1 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">Ctrl+Shift+F</kbd> Search documents</li>
              <li><kbd className="px-1 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">Alt+N</kbd> New document</li>
            </ul>
            <p className={`text-xs mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              ⚙️ You can customize these shortcuts in Settings → Keyboard Shortcuts
            </p>
          </div>

          <Separator className={isDarkMode ? "bg-gray-600" : "bg-gray-200"} />

          <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            <p>
              <strong>Privacy Note:</strong> Scribble Pad operates entirely in your browser. No data is sent to external
              servers unless you explicitly choose to share via generated links.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose} variant={isDarkMode ? "secondary" : "default"}>
              Get Started
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
