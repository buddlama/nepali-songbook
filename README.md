# 🎸 Digital Songbook App

A cross-platform (iOS & Android) offline-first utility for musicians to store, organize, and view personal song lyrics and chords. Designed as a distraction-free, private digital notebook — a modern alternative to paper binders.

---

## 📝 Project Overview — Phase 1 MVP

The Digital Songbook focuses on local reliability, privacy, and simplicity. All core features operate offline using a local SQLite database.

---

## ✨ Core Features (Phase 1)

### 1. Song Library Management

- **Add & Edit**  
  Create, edit, and delete songs with required fields:
  - _Title_
  - _Body (Lyrics + Chords)_  
    Optional fields: _Artist, Key_

- **Search & Filter**  
  Filter by **Title or Artist** in real-time.

- **Favorites**  
  Mark songs as favorites for quick access via a dedicated tab.

---

### 2. Song Viewer & Utility Tools

- **Chord Parsing & Display**  
  The app detects chord patterns (e.g., `[C]`, `(Am)`) and visually formats them above lyric lines.

- **Transposition Tool**  
  Adjust all chords up (+) or down (–) by semitones — view-only and non-destructive.

- **Auto-Scroll Mode**  
  Slow, adjustable auto-scroll ideal for rehearsal or live performance.

---

### 3. Import & Export

- **Private Export**  
  Serialize song data to a `.songbook` file and share via native share sheet  
  (AirDrop, Email, WhatsApp, etc.)

- **File Import Integration**  
  The app registers to open `.songbook` files from external sources — tap to import directly into the local library.

---

### 4. (Optional) Pro Feature — Personal Cloud Sync

- **Private Cloud Backup** using Firebase Auth + Firestore
  - User-authenticated sync
  - Multi-device backup
  - Data isolated per user ID
  - **No public sharing or browsing of others’ libraries**

---

## 🗺️ Roadmap — Later Phases

Planned expansions after the Phase 1 MVP:

- **Web App**
  - Browser-based access to the songbook
  - Sync-friendly experience for desktop users

- **Tab Reader**
  - Dedicated guitar tablature viewing and editing
  - Better support for riffs, solos, and instrument-specific notation

- **Tuner**
  - Built-in guitar tuner for practice and rehearsal
  - Simple, fast access from inside the app

- **Guitar Music Theory Section**
  - Chord diagrams, scales, intervals, and progression basics
  - Educational reference for players learning songs

- **Additional Music Tools**
  - Other practice utilities as the app evolves
  - Kept separate from the core offline songbook flow

---

## 🔒 Architectural & Security Principles

| Principle                  | Description                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------- |
| **Utility, Not Publisher** | The app does not provide any copyrighted song data — all content is user-entered.  |
| **Local-First**            | SQLite powers all primary features; cloud sync is optional.                        |
| **Security & Privacy**     | Firestore rules enforce `request.auth.uid == userId` access — no internal sharing. |
| **No External Data**       | The app ships empty and never scrapes or fetches third-party sources.              |

---

## 🛠️ Technology Stack

| Component  | Technology                  | Purpose                          |
| ---------- | --------------------------- | -------------------------------- |
| Framework  | React Native (Expo)         | Cross-platform app development   |
| Language   | TypeScript                  | Maintainability & type safety    |
| Navigation | React Navigation            | Screen routing (tabs/navigation) |
| Local Data | expo-sqlite                 | Offline song storage             |
| Cloud Sync | Firebase (Auth + Firestore) | Optional private backup          |
| Sharing    | react-native-share          | Native share sheet invocation    |

---

## 🛑 Out of Scope — Phase 1

These are intentionally excluded from MVP:

❌ Public song database  
❌ User following or in-app sharing  
❌ Web search / scraping features  
❌ Setlist management  
❌ Support for PDF, MusicXML, images, etc.

---

## ⚙️ Installation & Development Setup

```bash
# Clone repository
git clone [repository-url]
cd digital-songbook-app

# Install dependencies
yarn install
# or
npm install

# Start Expo Development Server
npx expo start
```
