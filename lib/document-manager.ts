"use client"

import type { Document, Folder } from "@/types"

export class DocumentManager {
  private static readonly DOCUMENTS_KEY = "scribble-pad-documents"
  private static readonly FOLDERS_KEY = "scribble-pad-folders"

  // Document Management
  static getAllDocuments(): Document[] {
    try {
      const stored = localStorage.getItem(this.DOCUMENTS_KEY)
      const parsed = stored ? JSON.parse(stored) : []

      // Ensure all documents have required properties and valid tags array
      return Array.isArray(parsed)
        ? parsed
            .filter((doc) => doc && doc.id)
            .map((doc) => ({
              ...doc,
              tags: Array.isArray(doc.tags) ? doc.tags : [],
              title: doc.title || "",
              content: doc.content || "",
              createdAt: doc.createdAt || new Date().toISOString(),
              updatedAt: doc.updatedAt || new Date().toISOString(),
            }))
        : []
    } catch (error) {
      console.error("Failed to load documents:", error)
      return []
    }
  }

  static createDocument(data: {
    title: string
    content: string
    folderId: string | null
    tags: string[]
  }): Document {
    const document: Document = {
      id: crypto.randomUUID(),
      title: data.title || "",
      content: data.content || "",
      folderId: data.folderId,
      tags: Array.isArray(data.tags) ? data.tags : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const documents = this.getAllDocuments()
    documents.unshift(document)
    this.saveDocuments(documents)

    return document
  }

  static updateDocument(id: string, updates: Partial<Document>): Document {
    const documents = this.getAllDocuments()
    const index = documents.findIndex((doc) => doc.id === id)

    if (index === -1) {
      throw new Error("Document not found")
    }

    const updatedDocument = {
      ...documents[index],
      ...updates,
      tags: Array.isArray(updates.tags) ? updates.tags : documents[index].tags,
      updatedAt: new Date().toISOString(),
    }

    documents[index] = updatedDocument
    this.saveDocuments(documents)

    return updatedDocument
  }

  static deleteDocument(id: string): void {
    const documents = this.getAllDocuments()
    const filtered = documents.filter((doc) => doc.id !== id)
    this.saveDocuments(filtered)
  }

  private static saveDocuments(documents: Document[]): void {
    localStorage.setItem(this.DOCUMENTS_KEY, JSON.stringify(documents))
  }

  // Folder Management
  static getAllFolders(): Folder[] {
    try {
      const stored = localStorage.getItem(this.FOLDERS_KEY)
      const parsed = stored ? JSON.parse(stored) : []

      // Ensure all folders have required properties
      return Array.isArray(parsed)
        ? parsed
            .filter((folder) => folder && folder.id)
            .map((folder) => ({
              ...folder,
              name: folder.name || "Unnamed Folder",
              createdAt: folder.createdAt || new Date().toISOString(),
            }))
        : []
    } catch (error) {
      console.error("Failed to load folders:", error)
      return []
    }
  }

  static createFolder(name: string, parentId?: string): Folder {
    const folder: Folder = {
      id: crypto.randomUUID(),
      name: name || "Unnamed Folder",
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
    }

    const folders = this.getAllFolders()
    folders.push(folder)
    this.saveFolders(folders)

    return folder
  }

  static deleteFolder(id: string): void {
    const folders = this.getAllFolders()

    // Recursively delete subfolders
    const foldersToDelete = this.getFolderAndSubfolders(id, folders)
    const filtered = folders.filter((folder) => !foldersToDelete.includes(folder.id))

    this.saveFolders(filtered)

    // Move documents from deleted folders to root
    const documents = this.getAllDocuments()
    const updatedDocuments = documents.map((doc) => {
      if (foldersToDelete.includes(doc.folderId || "")) {
        return { ...doc, folderId: null, updatedAt: new Date().toISOString() }
      }
      return doc
    })
    this.saveDocuments(updatedDocuments)
  }

  private static getFolderAndSubfolders(folderId: string, folders: Folder[]): string[] {
    const result = [folderId]
    const subfolders = folders.filter((f) => f.parentId === folderId)

    subfolders.forEach((subfolder) => {
      result.push(...this.getFolderAndSubfolders(subfolder.id, folders))
    })

    return result
  }

  private static saveFolders(folders: Folder[]): void {
    localStorage.setItem(this.FOLDERS_KEY, JSON.stringify(folders))
  }

  // Search functionality
  static searchDocuments(
    documents: Document[],
    query: string,
    filters?: {
      tags?: string[]
      folders?: string[]
      dateRange?: "all" | "today" | "week" | "month"
    },
  ): Document[] {
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

    // Apply filters if provided
    if (filters) {
      // Tag filter
      if (filters.tags && filters.tags.length > 0) {
        results = results.filter((doc) => {
          if (!doc || !Array.isArray(doc.tags)) return false
          return filters.tags!.some((tag) => doc.tags.includes(tag))
        })
      }

      // Folder filter
      if (filters.folders && filters.folders.length > 0) {
        results = results.filter((doc) => {
          if (!doc) return false
          return filters.folders!.includes(doc.folderId || "root")
        })
      }

      // Date filter
      if (filters.dateRange && filters.dateRange !== "all") {
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
  }
}
