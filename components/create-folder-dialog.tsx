"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateFolderDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateFolder: (name: string) => void
  parentFolder: string | null
  isDarkMode: boolean
}

export function CreateFolderDialog({
  isOpen,
  onClose,
  onCreateFolder,
  parentFolder,
  isDarkMode,
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (folderName.trim()) {
      onCreateFolder(folderName.trim())
      setFolderName("")
    }
  }

  const handleClose = () => {
    setFolderName("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`sm:max-w-md ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
      >
        <DialogHeader>
          <DialogTitle className={isDarkMode ? "text-white" : "text-gray-900"}>Create New Folder</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name" className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
              Folder Name
            </Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className={
                isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }
              autoFocus
            />
          </div>

          {parentFolder && (
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              This folder will be created inside "{parentFolder}"
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className={isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : ""}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!folderName.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Folder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
