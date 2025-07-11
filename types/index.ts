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
