# 🎣 FishLog - Fishing Trip Tracker

A comprehensive React Native app built with Expo to track your fishing adventures, log catches, and analyze your fishing success over time.

![Fishing Log Banner](https://via.placeholder.com/800x200/4A90E2/FFFFFF?text=🎣+FishLog+-+Track+Your+Fishing+Adventures)

## 📱 Features

### ✅ Core Functionality
- **Trip Logging** - Record fishing trips with date, time, location, and weather
- **GPS Integration** - Automatically capture fishing spot coordinates
- **Location Services** - Reverse geocoding for readable location names
- **Trip History** - View, search, and filter all your fishing trips
- **Statistics Dashboard** - Analyze your fishing success with detailed stats
- **Offline Storage** - All data stored locally using SQLite

### 🎯 Key Screens
1. **Dashboard** - Overview with quick stats and recent trips
2. **My Trips** - Complete trip history with search functionality
3. **New Trip** - Easy trip logging form with GPS integration
4. **Trip Details** - View individual trip information and catches
5. **Statistics** - Detailed analytics and insights
6. **Settings** - App preferences and data management

## 🏗️ Technical Architecture

### Tech Stack
- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **Database**: SQLite with expo-sqlite
- **Location**: expo-location for GPS services
- **UI Components**: Custom themed components with dark/light mode
- **State Management**: React hooks (useState, useEffect)
- **Date/Time**: @react-native-community/datetimepicker

### Database Schema
```sql
-- Fishing Trips
CREATE TABLE fishing_trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  location_name TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  weather TEXT,
  temperature REAL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Catches (prepared for future implementation)
CREATE TABLE catches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id INTEGER NOT NULL,
  species TEXT NOT NULL,
  length REAL,
  weight REAL,
  bait TEXT,
  lure TEXT,
  method TEXT,
  time TEXT NOT NULL,
  photo_uri TEXT,
  notes TEXT,
  released INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES fishing_trips (id) ON DELETE CASCADE
);

-- Locations (prepared for future implementation)
CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  description TEXT,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or later)
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yanggavin/fin-sight.git
   cd fin-sight/fishlog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press `i` for iOS simulator, `a` for Android emulator, `w` for web

### Building for Production

**iOS**
```bash
npx expo build:ios
```

**Android**
```bash
npx expo build:android
```

## 📂 Project Structure

```
fishlog/
├── app/                          # App screens (Expo Router)
│   ├── (tabs)/                  # Tab navigation
│   │   ├── index.tsx            # Dashboard screen
│   │   ├── trips.tsx            # Trip history screen
│   │   ├── stats.tsx            # Statistics screen
│   │   ├── explore.tsx          # Settings screen
│   │   └── _layout.tsx          # Tab layout
│   ├── trip/
│   │   └── [id].tsx             # Trip detail screen
│   ├── new-trip.tsx             # New trip form modal
│   ├── modal.tsx                # Generic modal
│   └── _layout.tsx              # Root layout
├── services/                     # Business logic
│   ├── database.ts              # SQLite database service
│   └── location.ts              # GPS location service
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components
│   ├── themed-text.tsx          # Themed text component
│   └── themed-view.tsx          # Themed view component
├── constants/                    # App constants
│   └── theme.ts                 # Color themes and fonts
├── hooks/                        # Custom React hooks
│   └── use-color-scheme.ts      # Theme detection hook
└── assets/                       # Images and static files
```

## 🎨 Features Overview

### Trip Logging
- **Smart Location Detection** - Automatically detects your fishing spot using GPS
- **Manual Location Entry** - Enter custom location names when needed
- **Weather Tracking** - Log weather conditions and temperature
- **Flexible Timing** - Record start time and optional end time
- **Trip Notes** - Add detailed notes about your fishing experience

### Statistics & Analytics
- **Trip Metrics** - Total trips, catches, and averages
- **Species Tracking** - Most caught species with rankings
- **Success Analysis** - Insights into your fishing patterns
- **Progress Tracking** - Visual feedback on your fishing journey

### Data Management
- **Local Storage** - All data stored securely on your device
- **Search & Filter** - Find specific trips quickly
- **Data Export** - (Coming soon) Export your data as CSV
- **Backup Options** - (Coming soon) Cloud backup integration

## 🔮 Upcoming Features

### Phase 2 - Enhanced Catch Tracking
- [ ] Individual catch logging within trips
- [ ] Photo capture for catches and spots
- [ ] Advanced catch details (bait, lure, method)
- [ ] Catch size comparisons and records

### Phase 3 - Social & Sharing
- [ ] Trip sharing with friends
- [ ] Fishing spot recommendations
- [ ] Community features
- [ ] Achievement system

### Phase 4 - Advanced Analytics
- [ ] Weather correlation analysis
- [ ] Best time predictions
- [ ] Location success rates
- [ ] Seasonal patterns

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

### Code Style
This project uses Expo's default ESLint configuration and follows React Native best practices.

## 📱 Screenshots

| Dashboard | Trip History | New Trip | Statistics |
|-----------|--------------|----------|------------|
| ![Dashboard](https://via.placeholder.com/200x400/4A90E2/FFFFFF?text=Dashboard) | ![Trips](https://via.placeholder.com/200x400/4A90E2/FFFFFF?text=My+Trips) | ![New Trip](https://via.placeholder.com/200x400/4A90E2/FFFFFF?text=New+Trip) | ![Stats](https://via.placeholder.com/200x400/4A90E2/FFFFFF?text=Statistics) |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/) - The fastest way to build mobile apps
- Icons provided by [Expo Icons](https://icons.expo.fyi/)
- Location services powered by [expo-location](https://docs.expo.dev/versions/latest/sdk/location/)
- Database management with [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)

## 📞 Support

If you have any questions or run into issues:

1. Check the [Issues](https://github.com/yanggavin/fin-sight/issues) page
2. Create a new issue if needed
3. Contact: gavin.yang@example.com

---

**Happy Fishing! 🎣**

> "The best time to go fishing is when you can." - This app helps you track every moment of it!
