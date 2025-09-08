// useSortedBookmarks.ts
import { useEffect, useState } from "react";
import { MediaType, type BookmarkInfoDTO} from "../enums";

export default function useSortedBookmarks(
  bookmarks: Array<BookmarkInfoDTO>,
  filter: string,
  search: string,
  mediaFilter: MediaType
) {
  const [sortedBookmarks, setSortedBookmarks] = useState<Array<BookmarkInfoDTO>>([]);

  useEffect(() => {
    let sorted = [...bookmarks];

    switch (filter) {
      case "Newest to Oldest (Added)":
        sorted.sort(
          (a, b) =>
            new Date(b.dateAdded!).getTime() - new Date(a.dateAdded!).getTime()
        );
        break;

      case "Oldest to Newest (Added)":
        sorted.sort(
          (a, b) =>
            new Date(a.dateAdded!).getTime() - new Date(b.dateAdded!).getTime()
        );
        break;

      case "Alphabetically (A-Z)":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;

      case "Reversed Alphabetically (Z-A)":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;

      case "By Base Website (A-Z)":
        sorted.sort((a, b) => a.baseSite.localeCompare(b.baseSite));
        break;
    }
    if (search) {
      sorted = sorted.filter(
        b =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.baseSite.toLowerCase().includes(search.toLowerCase())
      );
    }
    if(mediaFilter !== MediaType.None){
        setSortedBookmarks(sorted.filter(b => b.mediaType === mediaFilter))
        return;
    }
    setSortedBookmarks(sorted);
  }, [bookmarks, filter, search, mediaFilter]);

  return sortedBookmarks;
}