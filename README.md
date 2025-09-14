## Web Bookmarks
This project uses C#, ASP.NET Core, Entity Framework + React, Typescript to create a web application which lets users create and
modify Bookmarks.
- Users can Categorize into Video, Document, Article, or Post
- Users can create Folders to group bookmarks
- Users can create Teams and others can join
- UI includes Dark Theme and is fully responsive.

## Stack
- Languages: C#, Typescript
- Framework: ASP.NET Core, React
- Deployument: Docker with Render.com and Netlify
- Database: Postgres DB
- State Management: Local Storage with Valtio for mutable state and Snapshot

## Application Flow
- Users register and logic and receive access tokens
- Access tokens (Json web tokens) are refreshed with a Refresh Token
- Users can create bookmarks, filter, group in Teams, Folders, and type

## Images
- Bookmarks Dashboard
<img width="600" height="400" alt="bookmarks" src="https://github.com/user-attachments/assets/1520e694-b25d-4171-bfd0-3998cf0be1a3" />

- Adding a Bookmark
<img width="500" height="600" alt="adding" src="https://github.com/user-attachments/assets/b278c182-81b4-4125-a2c7-20530aaca26e" />

- Bookmarks Folder Dashboard
<img width="600" height="400" alt="folders" src="https://github.com/user-attachments/assets/acb18a6a-5968-47cb-b296-d3ac5e547b7b" />

## Future Improvements
1. We can improve the UI and UX
2. Animations can be included
