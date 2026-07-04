export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
  fontSize: number;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}
