"use client"

import { useState, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"

interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  isDarkMode: boolean
  placeholder?: string
}

export function TagInput({ tags, onTagsChange, isDarkMode, placeholder = "Add tags..." }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag])
    }
    setInputValue("")
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}
        />
        <Button
          onClick={() => addTag(inputValue)}
          disabled={!inputValue.trim()}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className={`${
                isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
              } flex items-center gap-1`}
            >
              {tag}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTag(tag)}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
        Press Enter or comma to add tags. Click × to remove.
      </p>
    </div>
  )
}
