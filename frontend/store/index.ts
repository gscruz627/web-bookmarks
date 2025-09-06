import { proxy } from "valtio";

type User = {
    userId: string,
    username: string
}
const state = proxy<{
    user: User | null,
    token: string | null,
    expiry: string |null,
    bookmarks: Array<any>,
    refreshToken: string | null,
    teams: Array<any>,
    folders: Array<any>
}>({
    user: null,
    token: null,
    expiry: null,
    bookmarks: [],
    refreshToken: null,
    teams: [],
    folders: []
});

export default state;