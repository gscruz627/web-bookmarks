import type { JwtPayload } from "jwt-decode";

// @ts-ignore
export enum MediaType{
    Video = "Video",
    Document = "Document",
    Image = "Image",
    Post = "Post",
    None = "None"
}

// @ts-ignore
export enum DashboardSelection{
    All = "All Bookmarks",
    Archive = "Archive",
    Shared = "Shared",
    Private = "Private Vault",
    Folder = "Folder",
}

export interface CustomJwtPayload extends JwtPayload{
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
    iss: string;
    aud: string;
}

export interface FolderInfoDTO{
    id: string;
    title: string;
}

export interface BookmarkInfoDTO {
    id?: string;            // Guid → string
    title: string;
    iconURL: string;
    link: string;
    baseSite: string;
    mediaType: string;
    archived?: boolean;     // bool → boolean
    dateAdded?: string;     // DateTime → string (ISO date) or Date if you parse
    folders?: readonly FolderInfoDTO[];
    teamId?: string;
}

export interface PrivateBookmarkInfoDTO {
    id: string;
    ciphertext: string;
    iv: string;
    dateAdded:  string
}

export interface TeamInfoDTO{
    id: string;
    title: string;
}
export interface User{
    userId: string,
    username: string
}

export interface TeamContentDTO{
    id: string;
    title: string;
    ownerID: string;
    owner: User | null;
    members: Array<User>
    bookmarks: Array<BookmarkInfoDTO>
}

export interface FolderContentDTO{
    id: string;
    title: string;
    bookmarks: Array<BookmarkInfoDTO>
}

export interface VaultInfoDTO {
  id: string;  
  kdfSalt: string; 
  kdfIterations: number;
  kdfHash: string;
  wrappedDEK: string;
  wrapIV: string;    
}