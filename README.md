<div align="center">

# 📚 Library Mobile
### A Modern Library Management System

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://www.android.com/)

**Offline-first library management app built with Expo & SQLite**

*Manage books, members, loans and staff — all from your Android device*

---

</div>

## ✨ Features

| Feature | Description |
|---|---|
| 📖 **Book Management** | Add, edit, delete books with cover images and quantity tracking |
| 🔍 **Browse & Search** | Search books by title, author or ID with instant results |
| 👥 **Member Management** | Register and manage library members with contact info |
| 📋 **Loan System** | Issue loans, track due dates, process returns with overdue detection |
| 📊 **Loan History** | Full return history with on-time vs late statistics |
| 👮 **Staff Management** | Role-based access control (Admin / Staff) with secure login |
| 🖼️ **Book Covers** | Attach cover photos from camera or gallery with 3:4 portrait crop |
| 📱 **Offline First** | All data stored locally with SQLite — no internet required |
| 🌙 **Edge-to-Edge** | Full Android edge-to-edge display with proper safe area handling |

---

## 📸 Screenshots

<div align="center">

| Login | Books | Browse |
|:---:|:---:|:---:|
| *Skeleton loading + dark UI* | *Cover thumbnails + search* | *Tap card for detail modal* |

| Loans | History Report | Staff |
|:---:|:---:|:---:|
| *Overdue detection* | *On-time vs late stats* | *Role permissions* |

</div>

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/eas/) (for builds)
- Android device or emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/kongrotana/Library-Management-Mobile.git
cd LibraryMobile

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Device

```bash
# Scan QR code with Expo Go app (Android/iOS)
npx expo start

# Or run on Android emulator
npx expo run:android
```

---

## 🏗️ Build

### APK (Direct Install)
```bash
# Preview build — for testing
eas build -p android --profile preview

# Release build — for distribution
eas build -p android --profile release
```

### Play Store Bundle
```bash
eas build -p android --profile production
```

> Builds are handled by [EAS Build](https://docs.expo.dev/build/introduction/) in the cloud — no Android Studio required.

---

## 🛠️ Tech Stack

```
LibraryMobile/
├── src/
│   ├── auth/           # Authentication context
│   ├── db/             # SQLite database layer (db.ts)
│   ├── navigation/     # React Navigation setup
│   │   ├── RootNavigator.tsx
│   │   ├── AppDrawer.tsx
│   │   ├── TabsNavigator.tsx
│   │   └── stacks/     # Stack navigators per feature
│   ├── screens/        # All screen components
│   │   ├── LoginScreen.tsx
│   │   ├── BooksScreen.tsx
│   │   ├── AddBookScreen.tsx
│   │   ├── EditBookScreen.tsx
│   │   ├── BrowseBooksScreen.tsx
│   │   ├── MembersScreen.tsx
│   │   ├── LoansScreen.tsx
│   │   ├── IssueLoanScreen.tsx
│   │   ├── StaffScreen.tsx
│   │   └── AboutScreen.tsx
│   └── ui/             # Shared component library
│       ├── ui.tsx       # Screen, Hero, Card, TextField, FAB...
│       └── theme.ts     # Colors, radius, spacing
└── assets/             # Icons and splash screen
```

### Core Libraries

| Library | Version | Purpose |
|---|---|---|
| `expo` | ~52 | Framework & build tooling |
| `expo-sqlite` | latest | Local SQLite database |
| `expo-image-picker` | latest | Camera & photo library access |
| `expo-linear-gradient` | latest | Gradient backgrounds |
| `@react-navigation/native` | ^6 | Navigation container |
| `@react-navigation/drawer` | ^6 | Side drawer navigation |
| `@react-navigation/bottom-tabs` | ^6 | Tab bar navigation |
| `@react-navigation/native-stack` | ^6 | Stack navigation |
| `react-native-safe-area-context` | latest | Edge-to-edge safe areas |
| `react-native-gesture-handler` | latest | Gesture support |
| `@expo/vector-icons` | latest | Ionicons icon set |

---

## 🗄️ Database Schema

```sql
-- Books
CREATE TABLE books (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  title     TEXT    NOT NULL,
  author    TEXT    NOT NULL,
  qty       INTEGER NOT NULL DEFAULT 1,
  image_uri TEXT
);

-- Members
CREATE TABLE members (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL,
  phone TEXT NOT NULL
);

-- Loans
CREATE TABLE loans (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id     INTEGER NOT NULL REFERENCES books(id),
  member_id   INTEGER NOT NULL REFERENCES members(id),
  loan_date   TEXT NOT NULL,
  due_date    TEXT NOT NULL,
  returned_at TEXT,
  received_by TEXT
);

-- Staff
CREATE TABLE staff (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role     TEXT NOT NULL DEFAULT 'staff'  -- 'admin' | 'staff'
);
```

---

## 🔐 Default Credentials

```
Username : admin
Password : 1234
```

> ⚠️ Change the default password after first login in a production environment.

---

## 📱 Android Configuration

```json
{
  "android": {
    "package": "com.kongrotana.LibraryMobile",
    "edgeToEdgeEnabled": true,
    "predictiveBackGestureEnabled": false
  }
}
```

> `edgeToEdgeEnabled: true` requires `SafeAreaProvider` at the app root and `useSafeAreaInsets()` in all modals and navigators.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📬 Contact

**Kong Rotana**

[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://facebook.com/krotanaofficial)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/kongrotanaofficialchannel)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:kongrotanaofficial@gmail.com)
[![Website](https://img.shields.io/badge/Website-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://kongrotanaofficial.github.io/)

---

## 📄 License

```
MIT License — feel free to use and modify for your own projects.
```

---

<div align="center">

Made with ❤️ by **Kong Rotana**

⭐ Star this repo if you found it helpful!

</div>