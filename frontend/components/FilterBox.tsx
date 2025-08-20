import { useState, useRef, useEffect } from "react";

type Props = {
    filter: string,
    setFilter: (filter: string) => void,
}

export default function FilterBox({filter, setFilter}: Props) {
    const [showFilter, setShowFilter] = useState<boolean>(false);

    const filterBoxRef = useRef<HTMLDivElement | null>(null);
    const filterButtonRef = useRef<HTMLAnchorElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                filterBoxRef.current &&
                !filterBoxRef.current.contains(event.target as Node) &&
                filterButtonRef.current &&
                !filterButtonRef.current.contains(event.target as Node)
            ) {
                setShowFilter(false);
            }
        }

        if (showFilter) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showFilter]);

    return (
        <>
        <div id="filter-box">
            <h3>All Bookmarks</h3>
            <a ref={filterButtonRef}
                href="#"
                role="button"
                onClick={(e) => {
                    e.preventDefault();
                    setShowFilter(prev => !prev);
                }}
            >
                <i className="fa-regular fa-calendar-days"></i> &nbsp; {filter}
            </a>
                        
        </div>
        <div ref={filterBoxRef} id="filter-container" style={{display: showFilter ? "block" : "none"}}>
            <ul>
                <li onClick={() => { setFilter("Newest to Oldest (Added)"); setShowFilter(false); }}>
                    <i className="fa-regular fa-calendar-days"></i> Newest to Oldest (Added)
                </li>

                <li onClick={() => { setFilter("Oldest to Newest (Added)"); setShowFilter(false); }}>
                    <i className="fa-regular fa-calendar-days"></i> Oldest to Newest (Added)
                </li>

                <li onClick={() => { setFilter("By Base Website (A-Z)"); setShowFilter(false); }}>
                    <i className="fa-regular fa-window-maximize"></i> By Base Website (A-Z)
                </li>

                <li onClick={() => { setFilter("Alphabetically (A-Z)"); setShowFilter(false); }}>
                    <i className="fa-solid fa-arrow-down-a-z"></i> Alphabetically (A-Z)
                </li>

                <li onClick={() => { setFilter("Reversed Alphabetically (Z-A)"); setShowFilter(false); }}>
                    <i className="fa-solid fa-arrow-up-a-z"></i> Reversed Alphabetically (Z-A)
                </li>
            </ul>
        </div>
        </>
    )
}