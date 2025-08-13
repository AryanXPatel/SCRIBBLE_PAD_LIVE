"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import * as LZString from "lz-string"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, Download, Upload, Share2, Sun, Moon, Trash2, HelpCircle, FolderOpen, Search, Keyboard } from "lucide-react"
import { ShareDialog } from "@/components/share-dialog"
import { WelcomeDialog } from "@/components/welcome-dialog"
import { DocumentSidebar } from "@/components/document-sidebar"
import { SearchDialog } from "@/components/search-dialog"
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog"
import { DocumentManager } from "@/lib/document-manager"
import { KeyboardShortcutManager } from "@/lib/keyboard-shortcuts"
import type { Document, Folder, KeyboardShortcuts } from "@/types"

export default function ScribblePad() {
  const [isMounted, setIsMounted] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [heading, setHeading] = useState("")
  const [content, setContent] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [shareUrl, setShareUrl] = useState("")
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [isHeadingFocused, setIsHeadingFocused] = useState(false)
  const [isContentFocused, setIsContentFocused] = useState(false)

  // Document management state
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [keyboardShortcuts, setKeyboardShortcuts] = useState<KeyboardShortcuts>(
    KeyboardShortcutManager.getDefaultShortcuts()
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const headingRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load saved data and theme on mount
  useEffect(() => {
    if (!isMounted) return

    const savedTheme = localStorage.getItem("scribble-pad-theme")

    if (savedTheme === "light") {
      setIsDarkMode(false)
      document.documentElement.classList.remove("dark")
    } else {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }

    // Load documents and folders
    loadDocuments()
    loadFolders()
    
    // Load keyboard shortcuts
    const savedShortcuts = KeyboardShortcutManager.getShortcuts()
    setKeyboardShortcuts(savedShortcuts)

    // Check for shared note in URL hash
    const handleHashChange = () => {
      if (window.location.hash.startsWith("#note=")) {
        try {
          const compressed = window.location.hash.substring(6)
          const decompressed = LZString.decompressFromEncodedURIComponent(compressed)
          if (decompressed) {
            const sharedData = JSON.parse(decompressed)
            const newDoc = DocumentManager.createDocument({
              title: `Shared Note - ${sharedData.heading || "Untitled"}`,
              content: sharedData.content || "",
              folderId: null,
              tags: ["shared"],
            })
            setDocuments((prev) => [newDoc, ...prev])
            setCurrentDocument(newDoc)
            setHeading(newDoc.title)
            setContent(newDoc.content)
            history.pushState("", document.title, window.location.pathname + window.location.search);
          }
        } catch (error) {
          console.error("Failed to load shared content:", error)
        }
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)

    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [isMounted])

  // Define functions before useEffect that uses them
  const exportText = useCallback(() => {
    try {
      const textContent = `#${heading}\n${content}`
      const blob = new Blob([textContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      
      // Create a safe filename from the heading
      const sanitizedHeading = heading?.trim() || "untitled"
      const safeFilename = sanitizedHeading
        .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 100) // Limit length
        
      a.download = `${safeFilename}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log(`Exported file: ${safeFilename}.txt`) // Debug log
    } catch (error) {
      console.error("Failed to export file:", error)
      // Could add a toast notification here in the future
    }
  }, [heading, content])

  const createNewDocument = useCallback(() => {
    const newDoc = DocumentManager.createDocument({
      title: "Untitled",
      content: "",
      folderId: currentFolder,
      tags: [],
    })
    setDocuments((prev) => [newDoc, ...prev])
    setCurrentDocument(newDoc)
    setHeading(newDoc.title)
    setContent(newDoc.content)
  }, [currentFolder])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in editable elements
      if (KeyboardShortcutManager.isEditableElement(e.target as Element)) {
        return
      }

      // Check each shortcut
      if (KeyboardShortcutManager.matchesShortcut(e, keyboardShortcuts.export.currentKeys)) {
        e.preventDefault()
        exportText()
      } else if (KeyboardShortcutManager.matchesShortcut(e, keyboardShortcuts.import.currentKeys)) {
        e.preventDefault()
        fileInputRef.current?.click()
      } else if (KeyboardShortcutManager.matchesShortcut(e, keyboardShortcuts.toggleTheme.currentKeys)) {
        e.preventDefault()
        toggleDarkMode()
      } else if (KeyboardShortcutManager.matchesShortcut(e, keyboardShortcuts.search.currentKeys)) {
        e.preventDefault()
        setShowSearch(true)
      } else if (KeyboardShortcutManager.matchesShortcut(e, keyboardShortcuts.newDocument.currentKeys)) {
        e.preventDefault()
        createNewDocument()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [keyboardShortcuts])

  const loadDocuments = () => {
    try {
      const docs = DocumentManager.getAllDocuments()
      const validDocs = Array.isArray(docs) ? docs.filter((doc) => doc && doc.id) : []
      setDocuments(validDocs)

      if (validDocs.length > 0 && !currentDocument) {
        const lastDoc = validDocs[0]
        if (lastDoc) {
          setCurrentDocument(lastDoc)
          setHeading(lastDoc.title || "")
          setContent(lastDoc.content || "")
        }
      }
    } catch (error) {
      console.error("Failed to load documents:", error)
      setDocuments([])
    }
  }

  const loadFolders = () => {
    try {
      const folderData = DocumentManager.getAllFolders()
      const validFolders = Array.isArray(folderData) ? folderData.filter((folder) => folder && folder.id) : []
      setFolders(validFolders)
    } catch (error) {
      console.error("Failed to load folders:", error)
      setFolders([])
    }
  }

  // Update counts when content changes
  useEffect(() => {
    if (!isMounted) return
    const words = content.trim() ? content.trim().split(/\s+/).length : 0
    const chars = content.length
    setWordCount(words)
    setCharCount(chars)
  }, [content, isMounted])

  // Auto-save current document with debouncing
  useEffect(() => {
    if (!isMounted) return
    if (!currentDocument) return
    
    const shouldSave = heading !== currentDocument.title || content !== currentDocument.content
    if (!shouldSave) return

    const timeoutId = setTimeout(() => {
      try {
        const updatedDoc = DocumentManager.updateDocument(currentDocument.id, {
          title: heading || "Untitled",
          content: content,
        })
        setCurrentDocument(updatedDoc)
        setDocuments((prev) => prev.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc)))
      } catch (error) {
        console.error("Failed to auto-save document:", error)
      }
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [heading, content, currentDocument, isMounted])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)

    if (newMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("scribble-pad-theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("scribble-pad-theme", "light")
    }
  }

  const importText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.txt')) {
      console.error("Only .txt files are supported")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n")
        let newHeading = file.name.replace(".txt", "")
        let newContent = text

        if (lines[0].startsWith("#")) {
          newHeading = lines[0].substring(1).trim()
          newContent = lines.slice(1).join("\n").trim()
        }

        const newDoc = DocumentManager.createDocument({
          title: newHeading || "Imported Document",
          content: newContent,
          folderId: currentFolder,
          tags: ["imported"],
        })

        setDocuments((prev) => [newDoc, ...prev])
        setCurrentDocument(newDoc)
        setHeading(newDoc.title)
        setContent(newDoc.content)
      } catch (error) {
        console.error("Failed to import file:", error)
      }
    }
    
    reader.onerror = () => {
      console.error("Failed to read file")
    }
    
    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const generateShareUrl = () => {
    const dataToCompress = JSON.stringify({ heading, content })
    const compressed = LZString.compressToEncodedURIComponent(dataToCompress)
    const url = `${window.location.origin}${window.location.pathname}#note=${compressed}`
    setShareUrl(url)
    setShowShareDialog(true)
  }

  const clearText = () => {
    setHeading("")
    setContent("")
    if (headingRef.current) headingRef.current.focus()
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const selectDocument = (doc: Document) => {
    setCurrentDocument(doc)
    setHeading(doc.title)
    setContent(doc.content)
  }

  const deleteDocument = (docId: string) => {
    DocumentManager.deleteDocument(docId)
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId))

    if (currentDocument?.id === docId) {
      const remaining = documents.filter((doc) => doc.id !== docId)
      if (remaining.length > 0) {
        selectDocument(remaining[0])
      } else {
        createNewDocument()
      }
    }
  }

  const createFolder = (name: string, parentId?: string) => {
    const newFolder = DocumentManager.createFolder(name, parentId)
    setFolders((prev) => [...prev, newFolder])
    return newFolder
  }

  const deleteFolder = (folderId: string) => {
    DocumentManager.deleteFolder(folderId)
    setFolders((prev) => prev.filter((f) => f.id !== folderId))

    // Move documents from deleted folder to root
    const docsInFolder = documents.filter((doc) => doc.folderId === folderId)
    docsInFolder.forEach((doc) => {
      DocumentManager.updateDocument(doc.id, { folderId: null })
    })
    loadDocuments()
  }

  const moveDocumentToFolder = (docId: string, folderId: string | null) => {
    DocumentManager.updateDocument(docId, { folderId })
    loadDocuments()
  }

  const updateDocumentTags = (docId: string, tags: string[]) => {
    DocumentManager.updateDocument(docId, { tags })
    loadDocuments()
  }

  const handleShortcutsChange = (newShortcuts: KeyboardShortcuts) => {
    setKeyboardShortcuts(newShortcuts)
  }

  if (!isMounted) {
    return null; // Or a loading spinner
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDarkMode ? "bg-[#2a2d3a] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="relative min-h-screen flex">
        {/* Document Sidebar */}
        {showSidebar && (
          <DocumentSidebar
            documents={documents}
            folders={folders}
            currentDocument={currentDocument}
            currentFolder={currentFolder}
            onSelectDocument={selectDocument}
            onCreateDocument={createNewDocument}
            onDeleteDocument={deleteDocument}
            onCreateFolder={createFolder}
            onDeleteFolder={deleteFolder}
            onMoveDocument={moveDocumentToFolder}
            onUpdateTags={updateDocumentTags}
            onFolderChange={setCurrentFolder}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="flex justify-between items-center p-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-700/50 text-gray-300 hover:text-white"
                    : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                }`}
              >
                <FolderOpen className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-700/50 text-gray-300 hover:text-white"
                    : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                }`}
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-700/50 text-gray-300 hover:text-white"
                      : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`w-56 ${
                  isDarkMode ? "bg-[#3a3d4a] border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"
                }`}
              >
                <DropdownMenuItem
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100"}`}
                >
                  <Download className="w-4 h-4 mr-3" />
                  Import File
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={exportText}
                  className={`cursor-pointer ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100"}`}
                >
                  <Upload className="w-4 h-4 mr-3" />
                  Export File
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={generateShareUrl}
                  className={`cursor-pointer ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100"}`}
                >
                  <Share2 className="w-4 h-4 mr-3" />
                  Generate Link
                </DropdownMenuItem>

                <DropdownMenuSeparator className={isDarkMode ? "bg-gray-600" : "bg-gray-200"} />

                <DropdownMenuItem
                  onClick={toggleDarkMode}
                  className={`cursor-pointer ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100"}`}
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-4 h-4 mr-3" />
                      Switch to Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-3" />
                      Switch to Dark Mode
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator className={isDarkMode ? "bg-gray-600" : "bg-gray-200"} />

                <DropdownMenuItem
                  onClick={clearText}
                  className={`cursor-pointer ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100"}`}
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Clear Text
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setShowKeyboardShortcuts(true)}
                  className={`cursor-pointer ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100"}`}
                >
                  <Keyboard className="w-4 h-4 mr-3" />
                  Keyboard Shortcuts
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setShowWelcomeDialog(true)}
                  className={`cursor-pointer ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100"}`}
                >
                  <HelpCircle className="w-4 h-4 mr-3" />
                  Welcome Guide
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col items-center justify-start px-8">
            {/* Heading */}
            <div className="w-full max-w-4xl mb-16">
              <input
                ref={headingRef}
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                onFocus={() => setIsHeadingFocused(true)}
                onBlur={() => setIsHeadingFocused(false)}
                placeholder="HEADING HERE..."
                className={`w-full text-center text-2xl md:text-3xl lg:text-4xl font-bold bg-transparent border-none outline-none transition-all duration-200 ${
                  isDarkMode ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
                } ${isHeadingFocused ? "transform scale-105" : ""}`}
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  letterSpacing: "0.02em",
                }}
              />
            </div>

            {/* Content Area */}
            <div className="w-full max-w-4xl flex-1">
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsContentFocused(true)}
                onBlur={() => setIsContentFocused(false)}
                placeholder="Start writing..."
                className={`w-full h-full min-h-[400px] bg-transparent border-none outline-none resize-none text-lg leading-relaxed transition-all duration-200 custom-scrollbar ${
                  isDarkMode ? "text-gray-300 placeholder-gray-600" : "text-gray-700 placeholder-gray-500"
                }`}
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  lineHeight: "1.7",
                }}
              />
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex justify-between items-center px-8 py-6">
            <div className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Scribble Pad v2.0
            </div>

            <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {wordCount} words | {charCount} characters
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input ref={fileInputRef} type="file" accept=".txt" onChange={importText} className="hidden" />

        {/* Dialogs */}
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          shareUrl={shareUrl}
          onCopy={copyToClipboard}
          isDarkMode={isDarkMode}
        />

        <WelcomeDialog isOpen={showWelcomeDialog} onClose={() => setShowWelcomeDialog(false)} isDarkMode={isDarkMode} />

        <SearchDialog
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          documents={documents}
          folders={folders}
          onSelectDocument={selectDocument}
          isDarkMode={isDarkMode}
        />

        <KeyboardShortcutsDialog
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
          onShortcutsChange={handleShortcutsChange}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  )
}
