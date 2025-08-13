export interface Document {
  id: string
  title: string
  content: string
  folderId: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Folder {
  id: string
  name: string
  parentId: string | null
  createdAt: string
}

export interface KeyboardShortcut {
  id: string
  name: string
  description: string
  defaultKeys: string[]
  currentKeys: string[]
  action: string
}

export interface KeyboardShortcuts {
  export: KeyboardShortcut
  import: KeyboardShortcut
  toggleTheme: KeyboardShortcut
  search: KeyboardShortcut
  newDocument: KeyboardShortcut
}