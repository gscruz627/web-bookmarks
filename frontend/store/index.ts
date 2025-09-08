import { proxy } from "valtio";
import type { BookmarkInfoDTO, FolderContentDTO, PrivateBookmarkInfoDTO, TeamInfoDTO, User } from "../enums";


const state = proxy<{
    user: User | null,
    token: string | null,
    expiry: string |null,
    bookmarks: Array<BookmarkInfoDTO | PrivateBookmarkInfoDTO>,
    refreshToken: string | null,
    teams: Array<TeamInfoDTO>,
    folders: Array<FolderContentDTO>,
    theme: "light" | "dark"
}>({
    user: null,
    token: null,
    expiry: null,
    bookmarks: [],
    refreshToken: null,
    teams: [],
    folders: [],
    theme: "light"
});

export default state;