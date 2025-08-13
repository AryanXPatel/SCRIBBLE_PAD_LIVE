"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, FileText, Folder, Tag, Calendar, X } from "lucide-react"
import type { Document, Folder as FolderType } from "@/types"

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
  documents: Document[]
  folders: FolderType[]
  onSelectDocument: (document: Document) => void
  isDarkMode: boolean
}

interface SearchFilters {
  tags: string[]
  folders: string[]
  dateRange: "all" | "today" | "week" | "month"
}

export function SearchDialog({ isOpen, onClose, documents, folders, onSelectDocument, isDarkMode }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({
    tags: [],
    folders: [],
    dateRange: "all",
  })

  // Get all unique tags from documents
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    if (Array.isArray(documents)) {
      documents.forEach((doc) => {
        if (doc && doc.tags && Array.isArray(doc.tags)) {
          doc.tags.forEach((tag) => {
            if (tag && typeof tag === "string") {
              tagSet.add(tag)
            }
          })
        }
      })
    }
    return Array.from(tagSet).sort()
  }, [documents])

  // Filter documents based on search query and filters
  const filteredDocuments = useMemo(() => {
    // Ensure documents is always an array
    let results = Array.isArray(documents) ? documents : []

    // Text search
    if (query && query.trim()) {
      const searchTerms = query
        .toLowerCase()
        .split(" ")
        .filter((term) => term.length > 0)
      results = results.filter((doc) => {
        if (!doc) return false
        const searchableText = `${doc.title || ""} ${doc.content || ""}`.toLowerCase()
        return searchTerms.every((term) => searchableText.includes(term))
      })
    }

    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter((doc) => {
        if (!doc || !doc.tags || !Array.isArray(doc.tags)) return false
        return filters.tags.some((tag) => doc.tags.includes(tag))
      })
    }

    // Folder filter
    if (filters.folders && filters.folders.length > 0) {
      results = results.filter((doc) => {
        if (!doc) return false
        return filters.folders.includes(doc.folderId || "root")
      })
    }

    // Date filter
    if (filters.dateRange !== "all") {
      const now = new Date()
      const cutoffDate = new Date()

      switch (filters.dateRange) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case "week":
          cutoffDate.setDate(now.getDate() - 7)
          break
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1)
          break
      }

      results = results.filter((doc) => {
        if (!doc || !doc.updatedAt) return false
        return new Date(doc.updatedAt) >= cutoffDate
      })
    }

    // Sort by relevance (title matches first, then by update date)
    return results.sort((a, b) => {
      if (!a || !b) return 0
      if (query && query.trim()) {
        const aTitle = (a.title || "").toLowerCase().includes(query.toLowerCase())
        const bTitle = (b.title || "").toLowerCase().includes(query.toLowerCase())
        if (aTitle && !bTitle) return -1
        if (!aTitle && bTitle) return 1
      }
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      return bTime - aTime
    })
  }, [documents, query, filters])

  const handleSelectDocument = (document: Document) => {
    onSelectDocument(document)
    onClose()
  }

  const toggleTagFilter = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const toggleFolderFilter = (folderId: string) => {
    setFilters((prev) => ({
      ...prev,
      folders: prev.folders.includes(folderId)
        ? prev.folders.filter((f) => f !== folderId)
        : [...prev.folders, folderId],
    }))
  }

  const clearFilters = () => {
    setFilters({
      tags: [],
      folders: [],
      dateRange: "all",
    })
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const searchTerms = query
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 0)
    let highlightedText = text

    searchTerms.forEach((term) => {
      const regex = new RegExp(`(${term})`, "gi")
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
    })

    return highlightedText
  }

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return "Root"
    return folders.find((f) => f.id === folderId)?.name || "Unknown"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    })
  }

  // Reset search when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("")
      clearFilters()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-4xl max-h-[80vh] ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
      >
        <DialogHeader>
          <DialogTitle className={isDarkMode ? "text-white" : "text-gray-900"}>Search Documents</DialogTitle>
          <DialogDescription className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Search through your documents by title, content, tags, folders, or date range.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            />
            <Input
              placeholder="Search by title or content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`pl-10 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              autoFocus
            />
          </div>

          {/* Filters */}
          <div className="space-y-3">
            {/* Tag Filters */}
            {allTags.length > 0 && (
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Filter by Tags:
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={filters.tags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        filters.tags.includes(tag)
                          ? "bg-blue-600 text-white"
                          : isDarkMode
                            ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => toggleTagFilter(tag)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Folder Filters */}
            {folders.length > 0 && (
              <div>
                <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Filter by Folders:
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge
                    variant={filters.folders.includes("root") ? "default" : "outline"}
                    className={`cursor-pointer ${
                      filters.folders.includes("root")
                        ? "bg-blue-600 text-white"
                        : isDarkMode
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => toggleFolderFilter("root")}
                  >
                    <Folder className="h-3 w-3 mr-1" />
                    Root
                  </Badge>
                  {folders.map((folder) => (
                    <Badge
                      key={folder.id}
                      variant={filters.folders.includes(folder.id) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        filters.folders.includes(folder.id)
                          ? "bg-blue-600 text-white"
                          : isDarkMode
                            ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => toggleFolderFilter(folder.id)}
                    >
                      <Folder className="h-3 w-3 mr-1" />
                      {folder.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Date Filter */}
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Filter by Date:
              </label>
              <div className="flex gap-2 mt-2">
                {[
                  { value: "all", label: "All Time" },
                  { value: "today", label: "Today" },
                  { value: "week", label: "This Week" },
                  { value: "month", label: "This Month" },
                ].map((option) => (
                  <Badge
                    key={option.value}
                    variant={filters.dateRange === option.value ? "default" : "outline"}
                    className={`cursor-pointer ${
                      filters.dateRange === option.value
                        ? "bg-blue-600 text-white"
                        : isDarkMode
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setFilters((prev) => ({ ...prev, dateRange: option.value as any }))}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.tags.length > 0 || filters.folders.length > 0 || filters.dateRange !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className={isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : ""}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Results */}
          <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""} found
          </div>

          <ScrollArea className="max-h-96">
            {filteredDocuments.length === 0 ? (
              <div className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No documents found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map((document) => {
                  if (!document) return null

                  return (
                    <div
                      key={document.id}
                      onClick={() => handleSelectDocument(document)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className={`h-4 w-4 mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            dangerouslySetInnerHTML={{
                              __html: highlightText(document.title || "Untitled", query),
                            }}
                          />
                          <p
                            className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                            dangerouslySetInnerHTML={{
                              __html: highlightText((document.content || "").substring(0, 150), query),
                            }}
                          />
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {document.updatedAt ? formatDate(document.updatedAt) : "Unknown"}
                              </span>
                              <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                <Folder className="h-3 w-3 inline mr-1" />
                                {getFolderName(document.folderId)}
                              </span>
                            </div>
                            {document.tags && Array.isArray(document.tags) && document.tags.length > 0 && (
                              <div className="flex gap-1">
                                {document.tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className={`text-xs ${
                                      isDarkMode ? "border-gray-600 text-gray-400" : "border-gray-300 text-gray-600"
                                    }`}
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {document.tags.length > 3 && (
                                  <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                    +{document.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
