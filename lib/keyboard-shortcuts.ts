"use client"

import type { KeyboardShortcuts, KeyboardShortcut } from "@/types"

export class KeyboardShortcutManager {
  private static readonly SHORTCUTS_KEY = "scribble-pad-shortcuts"

  static getDefaultShortcuts(): KeyboardShortcuts {
    return {
      export: {
        id: "export",
        name: "Export Document",
        description: "Export current document as a text file",
        defaultKeys: ["Ctrl+Shift+S", "Ctrl+S"],
        currentKeys: ["Ctrl+Shift+S", "Ctrl+S"],
        action: "export",
      },
      import: {
        id: "import",
        name: "Import Document",
        description: "Import a text file as a new document",
        defaultKeys: ["Ctrl+O"],
        currentKeys: ["Ctrl+O"],
        action: "import",
      },
      toggleTheme: {
        id: "toggleTheme",
        name: "Toggle Theme",
        description: "Switch between light and dark mode",
        defaultKeys: ["Ctrl+Shift+D", "Ctrl+D"],
        currentKeys: ["Ctrl+Shift+D", "Ctrl+D"],
        action: "toggleTheme",
      },
      search: {
        id: "search",
        name: "Search Documents",
        description: "Open search dialog to find documents",
        defaultKeys: ["Ctrl+Shift+F"],
        currentKeys: ["Ctrl+Shift+F"],
        action: "search",
      },
      newDocument: {
        id: "newDocument",
        name: "New Document",
        description: "Create a new document",
        defaultKeys: ["Alt+N"],
        currentKeys: ["Alt+N"],
        action: "newDocument",
      },
      allDocuments: {
        id: "allDocuments",
        name: "All Documents",
        description: "Toggle the documents sidebar",
        defaultKeys: ["Ctrl+,"],
        currentKeys: ["Ctrl+,"],
        action: "allDocuments",
      },
      settings: {
        id: "settings",
        name: "Settings",
        description: "Open the settings menu",
        defaultKeys: ["Ctrl+."],
        currentKeys: ["Ctrl+."],
        action: "settings",
      },
    }
  }

  static getShortcuts(): KeyboardShortcuts {
    try {
      const stored = localStorage.getItem(this.SHORTCUTS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to ensure all shortcuts exist
        const defaults = this.getDefaultShortcuts()
        return {
          ...defaults,
          ...parsed,
        }
      }
    } catch (error) {
      console.error("Failed to load keyboard shortcuts:", error)
    }
    return this.getDefaultShortcuts()
  }

  static saveShortcuts(shortcuts: KeyboardShortcuts): void {
    try {
      localStorage.setItem(this.SHORTCUTS_KEY, JSON.stringify(shortcuts))
    } catch (error) {
      console.error("Failed to save keyboard shortcuts:", error)
    }
  }

  static updateShortcut(shortcutId: keyof KeyboardShortcuts, newKeys: string[]): KeyboardShortcuts {
    const shortcuts = this.getShortcuts()
    if (shortcuts[shortcutId]) {
      shortcuts[shortcutId].currentKeys = newKeys
      this.saveShortcuts(shortcuts)
    }
    return shortcuts
  }

  static resetShortcuts(): KeyboardShortcuts {
    const defaults = this.getDefaultShortcuts()
    this.saveShortcuts(defaults)
    return defaults
  }

  static parseKeyboardEvent(event: KeyboardEvent): string {
    const parts: string[] = []
    
    if (event.ctrlKey || event.metaKey) parts.push(event.metaKey ? "Cmd" : "Ctrl")
    if (event.altKey) parts.push("Alt")
    if (event.shiftKey) parts.push("Shift")
    
    const key = event.key
    if (key.length === 1) {
      parts.push(key.toUpperCase())
    } else {
      // Handle special keys
      switch (key) {
        case " ":
          parts.push("Space")
          break
        case "Enter":
          parts.push("Enter")
          break
        case "Escape":
          parts.push("Esc")
          break
        case "Tab":
          parts.push("Tab")
          break
        case "Backspace":
          parts.push("Backspace")
          break
        case "Delete":
          parts.push("Delete")
          break
        case "ArrowUp":
          parts.push("↑")
          break
        case "ArrowDown":
          parts.push("↓")
          break
        case "ArrowLeft":
          parts.push("←")
          break
        case "ArrowRight":
          parts.push("→")
          break
        default:
          if (key.startsWith("F") && key.length <= 3) {
            parts.push(key)
          } else {
            parts.push(key)
          }
      }
    }
    
    return parts.join("+")
  }

  static matchesShortcut(event: KeyboardEvent, shortcutKeys: string[]): boolean {
    const eventString = this.parseKeyboardEvent(event)
    return shortcutKeys.some(shortcut => {
      // Normalize shortcuts for comparison
      const normalizedShortcut = shortcut.replace(/Cmd/g, "Ctrl")
      const normalizedEvent = eventString.replace(/Cmd/g, "Ctrl")
      return normalizedShortcut === normalizedEvent
    })
  }

  static isEditableElement(element: Element | null): boolean {
    if (!element) return false
    
    try {
      // Check if element has tagName property and it's a string
      if (!element.tagName || typeof element.tagName !== 'string') return false
      
      const tagName = element.tagName.toLowerCase()
      if (tagName === "input" || tagName === "textarea") return true
      if ((element as HTMLElement).contentEditable === "true") return true
      
      return false
    } catch (error) {
      // If any error occurs, assume it's not editable
      console.warn('Error checking if element is editable:', error)
      return false
    }
  }
}
