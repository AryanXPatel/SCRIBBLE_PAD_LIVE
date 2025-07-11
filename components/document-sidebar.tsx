"use client"

import { ContextMenuTrigger } from "@/components/ui/context-menu"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu"
import {
  FolderIcon,
  FolderOpenIcon,
  Trash2,
  TagIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  Home,
  PenTool,
} from "lucide-react"
import { TagInput } from "@/components/tag-input"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import type { Document, Folder } from "@/types"

interface DocumentSidebarProps {
  documents: Document[]
  folders: Folder[]
  currentDocument: Document | null
  currentFolder: string | null
  onSelectDocument: (doc: Document) => void
  onCreateDocument: () => void
  onDeleteDocument: (id: string) => void
  onCreateFolder: (name: string, parentId?: string) => Folder
  onDeleteFolder: (id: string) => void
  onMoveDocument: (docId: string, folderId: string | null) => void
  onUpdateTags: (docId: string, tags: string[]) => void
  onFolderChange: (folderId: string | null) => void
  isDarkMode: boolean
}

export function DocumentSidebar({
  documents,
  folders,
  currentDocument,
  currentFolder,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
  onCreateFolder,
  onDeleteFolder,
  onMoveDocument,
  onUpdateTags,
  onFolderChange,
  isDarkMode,
}: DocumentSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [editingTags, setEditingTags] = useState<string | null>(null)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [createFolderParent, setCreateFolderParent] = useState<string | null>(null)

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const getDocumentsInFolder = (folderId: string | null) => {
    if (!Array.isArray(documents)) return []
    return documents.filter((doc) => doc && doc.folderId === folderId)
  }

  const getSubfolders = (parentId: string | null) => {
    if (!Array.isArray(folders)) return []
    return folders.filter((folder) => folder && folder.parentId === parentId)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown"
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) return "Today"
      if (diffDays === 2) return "Yesterday"
      if (diffDays <= 7) return `${diffDays - 1}d ago`

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      })
    } catch {
      return "Unknown"
    }
  }

  const renderFolder = (folder: Folder, level = 0) => {
    if (!folder || !folder.id) return null

    const isExpanded = expandedFolders.has(folder.id)
    const subfolders = getSubfolders(folder.id)
    const docsInFolder = getDocumentsInFolder(folder.id)
    const hasChildren = subfolders.length > 0 || docsInFolder.length > 0
    const isSelected = currentFolder === folder.id

    return (
      <div key={folder.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={`group flex items-center gap-2 px-2.5 py-1.5 mx-1.5 rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected
                  ? isDarkMode
                    ? "bg-blue-900/30 border border-blue-700/50"
                    : "bg-blue-50 border border-blue-200"
                  : isDarkMode
                    ? "hover:bg-gray-700/30"
                    : "hover:bg-gray-100/70"
              }`}
              style={{ marginLeft: `${level * 10}px` }}
              onClick={() => {
                onFolderChange(folder.id)
                if (hasChildren) toggleFolder(folder.id)
              }}
            >
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-4 w-4 opacity-60 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFolder(folder.id)
                  }}
                >
                  {isExpanded ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />}
                </Button>
              )}
              {!hasChildren && <div className="w-4" />}

              {isExpanded ? (
                <FolderOpenIcon className={`h-4 w-4 ${isSelected ? "text-blue-600" : "text-amber-500"}`} />
              ) : (
                <FolderIcon className={`h-4 w-4 ${isSelected ? "text-blue-600" : "text-amber-500"}`} />
              )}

              <span className={`text-sm font-medium flex-1 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                {folder.name || "Unnamed Folder"}
              </span>

              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isDarkMode ? "bg-gray-700/50 text-gray-400" : "bg-gray-200/70 text-gray-500"
                }`}
              >
                {docsInFolder.length}
              </span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
            <ContextMenuItem
              onClick={() => {
                setCreateFolderParent(folder.id)
                setShowCreateFolder(true)
              }}
              className={isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              New Subfolder
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => onDeleteFolder(folder.id)}
              className={`${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} text-red-600 dark:text-red-400`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Folder
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {isExpanded && (
          <div className="mt-1">
            {subfolders.map((subfolder) => renderFolder(subfolder, level + 1))}
            {docsInFolder.map((doc) => renderDocument(doc, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const renderDocument = (document: Document, level = 0) => {
    if (!document || !document.id) return null

    const documentTags = Array.isArray(document.tags) ? document.tags : []
    const isSelected = currentDocument?.id === document.id

    return (
      <ContextMenu key={document.id}>
        <ContextMenuTrigger>
          <div
            onClick={() => onSelectDocument(document)}
            className={`group mx-1.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
              isSelected
                ? isDarkMode
                  ? "bg-blue-900/40 border border-blue-700/60"
                  : "bg-blue-50 border border-blue-200"
                : isDarkMode
                  ? "hover:bg-gray-700/20"
                  : "hover:bg-gray-50"
            }`}
            style={{ marginLeft: `${level * 10}px` }}
          >
            <div className="flex items-start gap-3">
              <PenTool
                className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                  isSelected ? "text-blue-600" : isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />

              <div className="flex-1 min-w-0">
                <h3 className={`font-medium truncate text-sm ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                  {document.title || "Untitled"}
                </h3>

                <p
                  className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {(document.content || "").substring(0, 80) || "No content"}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <div className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {formatDate(document.updatedAt)}
                  </div>

                  {documentTags.length > 0 && (
                    <div className="flex gap-1">
                      {documentTags.slice(0, 2).map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${
                            isDarkMode ? "bg-gray-700/60 text-gray-300" : "bg-gray-200/80 text-gray-600"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                      {documentTags.length > 2 && (
                        <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                          +{documentTags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
          <ContextMenuItem
            onClick={() => setEditingTags(document.id)}
            className={isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}
          >
            <TagIcon className="h-4 w-4 mr-2" />
            Edit Tags
          </ContextMenuItem>
          <ContextMenuSeparator />
          {Array.isArray(folders) &&
            folders.map((folder) => (
              <ContextMenuItem
                key={folder.id}
                onClick={() => onMoveDocument(document.id, folder.id)}
                className={isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}
              >
                <FolderIcon className="h-4 w-4 mr-2" />
                Move to {folder.name}
              </ContextMenuItem>
            ))}
          {document.folderId && (
            <ContextMenuItem
              onClick={() => onMoveDocument(document.id, null)}
              className={isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}
            >
              <Home className="h-4 w-4 mr-2" />
              Move to Root
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => onDeleteDocument(document.id)}
            className={`${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} text-red-600 dark:text-red-400`}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  const rootFolders = getSubfolders(null)
  const rootDocuments = getDocumentsInFolder(currentFolder)
  const allDocuments = getDocumentsInFolder(null)

  return (
    <div
      className={`w-64 border-r ${
        isDarkMode
          ? "border-gray-700/50 bg-gradient-to-b from-gray-800/50 to-gray-800"
          : "border-gray-200/70 bg-gradient-to-b from-gray-50/80 to-white"
      } flex flex-col`}
    >
      {/* Header */}
      <div className={`p-3 border-b ${isDarkMode ? "border-gray-700/50" : "border-gray-200/70"}`}>
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <Button
            onClick={onCreateDocument}
            className={`h-8 text-xs font-medium transition-all duration-200 flex items-center justify-center ${
              isDarkMode
                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-md"
            }`}
          >
            <PenTool className="h-3.5 w-3.5 mr-1" />
            New Doc
          </Button>

          <Button
            onClick={() => {
              setCreateFolderParent(null)
              setShowCreateFolder(true)
            }}
            variant="outline"
            className={`h-8 text-xs font-medium transition-all duration-200 flex items-center justify-center ${
              isDarkMode
                ? "border-gray-600/70 hover:bg-gray-700/50 hover:border-gray-500 text-gray-300"
                : "border-gray-300/70 hover:bg-gray-100/70 hover:border-gray-400 text-gray-700"
            }`}
          >
            <FolderIcon className="h-3.5 w-3.5 mr-1" />
            New Folder
          </Button>
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => onFolderChange(null)}
            className={`w-full justify-start h-7 px-2.5 text-xs transition-all duration-200 ${
              currentFolder === null
                ? isDarkMode
                  ? "bg-blue-900/30 text-blue-400 hover:bg-blue-900/40"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                : isDarkMode
                  ? "text-gray-300 hover:bg-gray-700/30"
                  : "text-gray-700 hover:bg-gray-100/70"
            }`}
          >
            <Home className="h-3.5 w-3.5 mr-2" />
            All Documents
            <span
              className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${
                isDarkMode ? "bg-gray-700/50 text-gray-400" : "bg-gray-200/70 text-gray-500"
              }`}
            >
              {allDocuments.length}
            </span>
          </Button>
        </div>

        {/* Current Folder Indicator */}
        {currentFolder && Array.isArray(folders) && (
          <div className={`mt-2.5 p-2 rounded-lg ${isDarkMode ? "bg-gray-700/30" : "bg-gray-100/50"}`}>
            <div className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Current Folder
            </div>
            <div className={`text-xs font-medium mt-1 truncate ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
              {folders.find((f) => f && f.id === currentFolder)?.name || "Unknown"}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Root Folders */}
          {rootFolders.length > 0 && (
            <div className="mb-4">
              <div
                className={`px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Folders
              </div>
              {rootFolders.map((folder) => renderFolder(folder))}
            </div>
          )}

          {/* Documents */}
          <div>
            {rootDocuments.length > 0 && (
              <div
                className={`px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {currentFolder ? "Documents" : "Recent Documents"}
              </div>
            )}

            {rootDocuments.length === 0 && currentFolder === null && allDocuments.length === 0 ? (
              <div className={`text-center py-12 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                <PenTool className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium mb-1">No documents yet</p>
                <p className="text-xs opacity-75">Create your first document to get started</p>
              </div>
            ) : (
              <>
                {currentFolder === null && allDocuments.map((doc) => renderDocument(doc))}
                {currentFolder !== null && rootDocuments.map((doc) => renderDocument(doc))}
              </>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Tag Editing Dialog */}
      {editingTags && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-xl max-w-md w-full mx-4 shadow-2xl ${
              isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
            }`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Edit Tags</h3>
            <TagInput
              tags={Array.isArray(documents) ? documents.find((d) => d && d.id === editingTags)?.tags || [] : []}
              onTagsChange={(tags) => {
                if (editingTags) {
                  onUpdateTags(editingTags, tags)
                  setEditingTags(null)
                }
              }}
              isDarkMode={isDarkMode}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingTags(null)}
                className={isDarkMode ? "border-gray-600 hover:bg-gray-700" : ""}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        isOpen={showCreateFolder}
        onClose={() => {
          setShowCreateFolder(false)
          setCreateFolderParent(null)
        }}
        onCreateFolder={(name) => {
          onCreateFolder(name, createFolderParent || undefined)
          setShowCreateFolder(false)
          setCreateFolderParent(null)
        }}
        parentFolder={
          createFolderParent && Array.isArray(folders)
            ? folders.find((f) => f && f.id === createFolderParent)?.name || null
            : null
        }
        isDarkMode={isDarkMode}
      />
    </div>
  )
}
