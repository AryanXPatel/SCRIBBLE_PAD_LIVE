"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RotateCcw, Edit3, Check, X, Keyboard } from "lucide-react"
import { KeyboardShortcutManager } from "@/lib/keyboard-shortcuts"
import type { KeyboardShortcuts } from "@/types"

interface KeyboardShortcutsDialogProps {
  isOpen: boolean
  onClose: () => void
  onShortcutsChange: (shortcuts: KeyboardShortcuts) => void
  isDarkMode: boolean
}

export function KeyboardShortcutsDialog({ 
  isOpen, 
  onClose, 
  onShortcutsChange, 
  isDarkMode 
}: KeyboardShortcutsDialogProps) {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcuts>(KeyboardShortcutManager.getDefaultShortcuts())
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null)
  const [recordingKeys, setRecordingKeys] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const currentShortcuts = KeyboardShortcutManager.getShortcuts()
      setShortcuts(currentShortcuts)
    }
  }, [isOpen])

  const startRecording = (shortcutId: string) => {
    setEditingShortcut(shortcutId)
    setRecordingKeys([])
    setIsRecording(true)
  }

  const stopRecording = () => {
    setIsRecording(false)
    setEditingShortcut(null)
    setRecordingKeys([])
  }

  const saveRecording = () => {
    if (editingShortcut && recordingKeys.length > 0) {
      const updatedShortcuts = KeyboardShortcutManager.updateShortcut(
        editingShortcut as keyof KeyboardShortcuts,
        recordingKeys
      )
      setShortcuts(updatedShortcuts)
      onShortcutsChange(updatedShortcuts)
    }
    stopRecording()
  }

  const resetShortcuts = () => {
    const defaultShortcuts = KeyboardShortcutManager.resetShortcuts()
    setShortcuts(defaultShortcuts)
    onShortcutsChange(defaultShortcuts)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isRecording) return

    event.preventDefault()
    event.stopPropagation()

    const keyString = KeyboardShortcutManager.parseKeyboardEvent(event)
    
    // Don't allow certain keys that would break the interface
    if (["Escape", "F5", "F12"].includes(event.key)) {
      if (event.key === "Escape") {
        stopRecording()
      }
      return
    }

    setRecordingKeys([keyString])
  }

  useEffect(() => {
    if (isRecording) {
      document.addEventListener("keydown", handleKeyDown)
      return () => {
        document.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [isRecording])

  const renderShortcutKeys = (keys: string[]) => {
    return (
      <div className="flex flex-wrap gap-1">
        {keys.map((key, index) => (
          <Badge
            key={index}
            variant="outline"
            className={`text-xs font-mono ${
              isDarkMode ? "border-gray-600 text-gray-300" : "border-gray-300 text-gray-600"
            }`}
          >
            {key}
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`max-w-2xl max-h-[80vh] ${
          isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Customize keyboard shortcuts for quick access to features. Click "Edit" to record new key combinations.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {Object.entries(shortcuts).map(([key, shortcut]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {shortcut.name}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {shortcut.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingShortcut === key ? (
                      <div className="flex items-center gap-2">
                        {isRecording ? (
                          <>
                            <div className={`px-3 py-1 text-xs rounded border ${
                              isDarkMode ? "border-gray-600 bg-gray-700 text-yellow-400" : "border-yellow-300 bg-yellow-50 text-yellow-600"
                            }`}>
                              {recordingKeys.length > 0 ? recordingKeys[0] : "Press keys..."}
                            </div>
                            <Button size="sm" variant="ghost" onClick={saveRecording} disabled={recordingKeys.length === 0}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={stopRecording}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => startRecording(key)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {renderShortcutKeys(shortcut.currentKeys)}
                        <Button size="sm" variant="ghost" onClick={() => startRecording(key)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <Separator className={isDarkMode ? "bg-gray-700" : "bg-gray-200"} />
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={resetShortcuts}
            className={isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : ""}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          
          <Button onClick={onClose} variant={isDarkMode ? "secondary" : "default"}>
            Done
          </Button>
        </div>

        {isRecording && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            isDarkMode ? "bg-yellow-900/20 border border-yellow-700 text-yellow-300" : "bg-yellow-50 border border-yellow-200 text-yellow-800"
          }`}>
            <p className="font-medium">Recording shortcut...</p>
            <p>Press your desired key combination. Press Escape to cancel.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
