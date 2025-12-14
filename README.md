# Petra Tatto - Tattoo Shop Management App

A comprehensive tattoo shop management application built with React Native, featuring appointment scheduling, payment tracking, client management, email notifications, and admin analytics. The app uses local AsyncStorage for reliable offline-first data persistence with a premium dark gold and black design.

## Features

### For Artists (Workers)
- 📅 **Appointment Management**: Schedule, view, and manage customer appointments
- 💰 **Payment Tracking**: Record payments, tips, and track earnings
- 📊 **Personal Dashboard**: View daily/weekly/monthly statistics
- 👤 **Profile Management**: Update personal information and portfolio
- 📧 **Email Notifications**: Automatic appointment confirmations and reminders

### For Admin (Shop Owner)
- 📈 **Analytics Dashboard**: Comprehensive insights with real-time metrics
- 👥 **Staff Management**: Add, remove, and manage artists with CRUD operations
- 👤 **Client Management**: Full client database with contact info and notes
- 💼 **Financial Overview**: Track total revenue, commissions (20%), and artist earnings
- 📊 **Reports**: Detailed financial and performance reports
- 🎯 **Business Intelligence**: Payment method analysis, trends, and forecasting

### Technical Features
- 🌙 **Premium Dark Theme**: Dark gold (#d4af37) and black design - perfect for tattoo shops
- 🔐 **Mock Authentication**: Role-based access control (admin/artist)
- 📧 **Email Notifications**: Send appointment confirmations and payment receipts
- 💾 **Local Storage**: AsyncStorage-based database (offline-first)
- 🎨 **Responsive Design**: Optimized for iPad landscape orientation
- 🚀 **Production Ready**: Optimized for iOS deployment

## Installation

### Prerequisites
- Node.js (14.x or higher)
- npm or yarn
- iOS Simulator or physical iOS device (iPad recommended)
- React Native development environment

### Setup

1. Navigate to the project directory:
```bash
cd PetraTatto
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS pods (if on macOS):
```bash
cd ios
pod install
cd ..
```

4. Start Metro bundler:
```bash
npm start
```

5. Run on iOS:
```bash
npm run ios
```

### Quick Start with Scripts

**Windows:**
```bash
start-frontend.bat    # Start Metro bundler
```

**macOS/Linux:**
```bash
./start-frontend.sh   # Start Metro bundler
```

## Configuration

### Authentication
The app uses mock authentication with these default credentials:

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Full access to all features including analytics and management

**Artist Account:**
- Username: `demo_worker`
- Password: `worker123`
- Access to appointments, payments, and profile

### SMS Notifications (Email)
The app sends appointment confirmations and payment receipts via email:

**Email Features:**
- Automatic appointment confirmation when scheduling
- Appointment reminders 24 hours before
- Payment confirmation when recording payments
- Payment reminders for remaining balance
- Email validation for all client communications

**Configuration:**
All emails are stored locally and can be viewed through the notification service. For production email sending, integrate with a backend email service like:
- SendGrid
- AWS SES
- Mailgun
- Firebase Cloud Functions

**To implement backend email:**
1. Create a backend API endpoint for sending emails
2. Update `emailService.js` to call your backend API
3. The `emailService.sendEmail()` methods will then send real emails

### Styling & Theme
Customize appearance in `src/styles/theme.js`:
- Colors (primary, secondary, background, etc.)
- Typography (sizes, weights)
- Spacing (margins, padding)
- Border radius, shadows, and other design tokens

## Database Schema (AsyncStorage)

The app uses AsyncStorage for local data persistence with the following collections:

### Workers Collection
```javascript
{
  id: Number (auto-increment),
  username: String (unique),
  email: String (unique),
  full_name: String,
  role: String ("admin" | "artist"),
  specialties: String (e.g., "Black & Gray, Realism"),
  paper: String (license/ID number),
  created_at: String (ISO date)
}
```

**Initial Data:**
- Admin user (username: admin)
- Carlos Rodriguez (Black & Gray, Realism)
- Maria Garcia (Color Tattoos, Watercolor)

### Clients Collection
```javascript
{
  id: Number (auto-increment),
  full_name: String,
  email: String,
  phone: String (e.g., "+34 612345678"),
  paper: String (ID number),
  notes: String (client preferences, history),
  created_at: String (ISO date)
}
```

**Initial Data:**
- Juan Perez (interested in black & gray sleeve)
- Sofia Martinez (interested in colorful designs)

### Appointments Collection
```javascript
{
  id: Number (auto-increment),
  client_id: Number (foreign key to clients),
  worker_id: Number (foreign key to workers),
  customer_name: String,
  customer_phone: String,
  artist_name: String,
  tattoo_type: String (e.g., "Black & Gray Sleeve"),
  description: String,
  price: Number,
  deposit: Number,
  remaining_amount: Number (calculated: price - deposit),
  appointment_date: String (YYYY-MM-DD),
  appointment_time: String (HH:MM),
  duration: Number (minutes, default: 120),
  status: String ("scheduled" | "completed" | "cancelled"),
  created_at: String (ISO date),
  completed_at: String (ISO date, null until completed)
}
```

### Payments Collection
```javascript
{
  id: Number (auto-increment),
  client_id: Number (foreign key to clients),
  worker_id: Number (foreign key to workers),
  appointment_id: Number (foreign key to appointments),
  customer_name: String,
  artist_name: String,
  tattoo_type: String,
  amount: Number (payment amount),
  tip_amount: Number (optional tip),
  payment_method: String ("cash" | "card" | "transfer"),
  payment_date: String (YYYY-MM-DD),
  notes: String,
  created_at: String (ISO date)
}
```

**Note:** When a payment is recorded, the associated appointment's status is automatically updated to "completed".

## Architecture & Services

### Local Database Service (`localTattooService.js`)

The core data management service using AsyncStorage:

**Key Methods:**

**Workers:**
- `getWorkers()` - Fetch all artists
- `addWorker(data)` - Add new artist
- `updateWorker(id, data)` - Update artist info
- `deleteWorker(id)` - Remove artist

**Clients:**
- `getClients()` - Fetch all clients
- `addClient(data)` - Add new client
- `updateClient(id, data)` - Update client info
- `deleteClient(id)` - Remove client

**Appointments:**
- `getAppointments()` - Fetch all appointments
- `getTodayAppointments()` - Fetch today's appointments only
- `addAppointment(data)` - Create new appointment
- `updateAppointment(id, data)` - Update appointment details
- `updateAppointmentStatus(id, status)` - Change appointment status
- `deleteAppointment(id)` - Remove appointment

**Payments:**
- `getPayments()` - Fetch all payments
- `addPayment(data)` - Record new payment (auto-completes appointment)
- `deletePayment(id)` - Remove payment

**Analytics:**
- `getAnalytics()` - Get comprehensive business metrics:
  - Today's revenue
  - Monthly revenue
  - Today's appointments count
  - Monthly appointments count
  - Total clients
  - Total workers

**Initialization:**
- `initialize()` - Seeds initial data on first launch
- `seedInitialData()` - Creates default workers and clients

### Twilio SMS Service (`twilioService.js`)

SMS notification service for appointment confirmations:

**Features:**
- Direct Twilio API integration (no backend needed)
- Automatic phone number validation
- US number support (+1 country code)
- International number detection
- SMS delivery verification
- Usage tracking and history

**Key Methods:**
- `sendAppointmentConfirmation(name, phone, date, time, type)` - Send confirmation SMS
- `sendAppointmentReminder(name, phone, date, time, type)` - Send reminder SMS
- `sendPaymentConfirmation(name, phone, amount, tattooType)` - Send payment receipt
- `getSMSHistory()` - Retrieve sent SMS history
- `getSMSUsageStats()` - Get daily/monthly usage statistics

**Configuration:**
- Uses `twilioConfig.local.js` if available (for production)
- Falls back to template config for development/testing
- Supports simulation mode with dummy credentials

### Authentication Context (`authContext.js`)

Mock authentication system with role-based access:

**Features:**
- Local authentication (no backend required)
- Persistent sessions via AsyncStorage
- Role-based access control (admin/artist)
- Auto-restore session on app launch

**Available Methods:**
- `login(username, password)` - Authenticate user
- `logout()` - Clear session
- `updateUser(data)` - Update user profile

**State Properties:**
- `isLoading` - Authentication check in progress
- `isAuthenticated` - User logged in status
- `user` - Current user object (with role, name, email)
- `token` - Mock auth token
- `error` - Last authentication error

### API Service (`apiService.js`)

Legacy service for potential backend integration:

**Features:**
- Mock API responses for testing
- Fallback authentication
- Placeholder endpoints for future backend
- Axios-based HTTP client

## Screens & Features

### Login Screen (`LoginScreen.js`)
**Purpose:** User authentication and role selection

**Features:**
- Username/password input with show/hide password toggle
- Quick login buttons (Admin/Artist demo credentials)
- PetraLogo component display
- Session persistence via AuthContext
- Responsive layout for iPad landscape

**Logic Flow:**
1. User enters credentials or uses quick login
2. Validates input (username and password required)
3. Calls `login()` from AuthContext
4. On success: Navigates to role-appropriate dashboard
5. On failure: Shows error alert

### Admin Dashboard (`AdminDashboard.js`)
**Purpose:** Overview of shop performance and quick actions

**Features:**
- **Real-time Analytics Cards:**
  - Monthly revenue (total payments)
  - Today's revenue
  - Today's appointments count
  - Total clients count
- **Quick Actions:**
  - New Appointment button → opens NewAppointmentModal
  - Record Payment button → opens NewPaymentModal
  - View All Appointments → navigates to AppointmentsScreen
  - View Analytics → navigates to AnalyticsScreen
  - Manage People → navigates to WorkerManagement
- **Today's Appointments Preview:**
  - Shows first 3 appointments for today
  - Displays customer name, time, artist, and status
  - "View All" button if more than 3 appointments
- Pull-to-refresh to update data

**Logic Flow:**
1. Initialize dbService on mount
2. Load analytics data via `getAnalytics()`
3. Load today's appointments via `getTodayAppointments()`
4. Display stats in colored cards with icons
5. Handle modal open/close and refresh data on save

### Appointments Screen (`AppointmentsScreen.js`)
**Purpose:** View, filter, and manage all appointments

**Features:**
- **Appointment List:**
  - Displays all appointments with full details
  - Color-coded status badges (scheduled/completed/cancelled)
  - Customer name, phone, artist, date, time
  - Tattoo type, price, deposit, remaining amount
  - Description and duration
- **Filters:**
  - Filter by artist (dropdown)
  - Filter by date (date picker)
  - Clear filters button
- **Actions:**
  - Add new appointment button (floating)
  - Delete appointment (with confirmation)
  - Status indicators with icons
- Pull-to-refresh functionality
- Empty state with icon when no appointments

**Logic Flow:**
1. Load all appointments from dbService
2. Apply artist filter if selected
3. Apply date filter if selected
4. Display filtered results
5. Handle delete with confirmation alert
6. Refresh list after adding/editing

### Payments Screen (`PaymentsScreen.js`)
**Purpose:** View, filter, and record payments

**Features:**
- **Payment List:**
  - Customer name and artist
  - Tattoo type and payment date
  - Amount, tip, total (with color-coded display)
  - Payment method badge (Cash/Card/Transfer)
  - Commission info: shop 20%, artist 80%
  - Notes display
- **Filters:**
  - Filter by artist
  - Filter by date
  - Clear filters button
- **Actions:**
  - Add new payment button
  - Payment records payments and auto-completes appointments
- Pull-to-refresh
- Empty state when no payments

**Logic Flow:**
1. Load all payments from dbService
2. Calculate totals (amount + tip)
3. Apply filters (artist/date)
4. Display with commission breakdown
5. When payment recorded:
   - Save payment to database
   - Update appointment status to "completed"
   - Refresh dashboard analytics

### Analytics Screen (`AnalyticsScreen.js`)
**Purpose:** Comprehensive business metrics and insights

**Features:**
- **Revenue Section:**
  - Today's revenue (formatted currency)
  - Monthly revenue (formatted currency)
- **Appointments Section:**
  - Today's appointments count
  - Monthly appointments count
- **Business Section:**
  - Total clients registered
  - Total artists/workers
- Color-coded stat boxes with emojis
- Pull-to-refresh for real-time updates
- Responsive grid layout

**Logic Flow:**
1. Call `dbService.getAnalytics()` to get all metrics
2. Format currency values safely (handles null/undefined)
3. Display in organized sections
4. Refresh trigger prop updates data automatically

### Worker Management Screen (`WorkerManagement.js`)
**Purpose:** Manage tattoo artists and shop staff

**Features:**
- **Artists List:**
  - Full name (heading)
  - Username and email
  - Specialties (e.g., "Black & Gray, Realism")
  - Paper/license number
  - Role badge (ADMIN/ARTIST) with color coding
- **Actions:**
  - Add New Artist button (opens modal)
  - Each artist card shows all details
- Pull-to-refresh
- Empty state with icon when no artists
- WorkerManagementModal integration for CRUD

**Logic Flow:**
1. Load all workers from dbService
2. Display in card layout with icons
3. Show role badges (red for admin, orange for artist)
4. Open modal to add/edit workers
5. Refresh list after CRUD operations

## Modals & Components

### NewAppointmentModal
**Purpose:** Create new appointments with SMS confirmation

**Features:**
- **Client Selection:**
  - Picker for existing clients
  - Auto-fills name and phone
- **Artist Selection:**
  - Picker for available artists
  - Shows specialties
- **Appointment Details:**
  - Tattoo type (text input)
  - Description (multiline)
  - Date picker (defaults to today)
  - Time picker (defaults to 14:00)
  - Duration (minutes, default 120)
- **Pricing:**
  - Price input
  - Deposit input
  - Auto-calculates remaining amount
- **SMS Confirmation:**
  - Validates phone number (+1 for US)
  - Sends SMS confirmation via Twilio
  - International numbers: prompts to continue without SMS
  - Option to skip SMS if delivery fails

**Validation:**
- Requires: client, artist, tattoo type, date, time, price
- Phone number format validation
- Remaining amount calculation (price - deposit)

**Logic Flow:**
1. User selects/enters appointment details
2. On save:
   - Validate all required fields
   - Check phone number format
   - If US number: send SMS confirmation
   - If international: show warning, allow skip
   - If SMS fails: show error, don't create appointment
   - If SMS succeeds or skipped: save to database
3. Update appointment list on parent screen

### NewPaymentModal
**Purpose:** Record payments for completed work

**Features:**
- **Quick Selection:**
  - Select from existing appointments
  - Auto-fills customer, artist, tattoo type, price
- **Client & Artist Selection:**
  - Dropdown pickers
  - Required fields
- **Payment Details:**
  - Tattoo type
  - Amount (can differ from appointment price)
  - Tip amount (optional)
  - Payment method buttons (Cash/Card/Transfer)
  - Payment date (defaults to today)
  - Notes (multiline)

**Validation:**
- Requires: appointment (or manual client/artist), tattoo type, amount
- All fields validated before save

**Logic Flow:**
1. User selects appointment OR manually enters details
2. Fill in payment amount and tip
3. Select payment method
4. On save:
   - Validate required fields
   - Save payment to database
   - Auto-update appointment status to "completed"
   - Show success message
5. Refresh payments list and dashboard

### WorkerManagementModal
**Purpose:** Add, edit, and delete artists

**Features:**
- **Artists List View:**
  - Shows all artists with details
  - Edit button (pencil icon)
  - Delete button (trash icon) with confirmation
- **Add/Edit Form:**
  - Full name (required)
  - Username (required for new, readonly for edit)
  - Email (required)
  - Specialties (optional)
  - Paper/license (optional)

**Validation:**
- Full name and email required
- Username required for new artists
- Email format validation

**Logic Flow:**
1. Display list of all artists
2. Add button opens blank form
3. Edit button opens form with artist data
4. Delete shows confirmation alert
5. Save validates and updates database
6. Triggers parent screen refresh

### ClientManagementModal
**Purpose:** Manage client database

**Features:**
- **Client List:**
  - Full name, email, phone
  - Paper/ID number
  - Notes preview
- **Add/Edit Form:**
  - Full name (required)
  - Email (required)
  - Phone (required)
  - Paper/ID
  - Notes (multiline)

**CRUD Operations:**
- Add new client
- Edit existing client
- Delete client (with confirmation)
- Search/filter clients

### CustomAlert
**Purpose:** Custom alert dialog (replaces React Native Alert)

**Features:**
- Title and message display
- Custom button configurations
- Multiple button support
- onPress handlers for each button
- Modal overlay with backdrop
- Styled to match app theme

**Usage:**
```javascript
showCustomAlert('Title', 'Message', [
  { text: 'Cancel', onPress: () => hideAlert() },
  { text: 'OK', onPress: () => handleAction() }
]);
```

### AppHeader
**Purpose:** Consistent header across all screens

**Features:**
- Title display (large, bold)
- Optional subtitle (secondary text)
- Automatic responsive sizing
- Dark theme styling

### LoadingSpinner
**Purpose:** Loading state indicator

**Features:**
- Primary color spinner
- Centered layout
- Used during data fetch operations

### PetraLogo
**Purpose:** Brand logo display

**Features:**
- SVG-based logo
- Responsive sizing
- Used on login screen

## Business Logic

### Commission Structure
- **Shop Commission**: 20% of each payment (excluding tips)
- **Artist Earnings**: 80% of payment + 100% of tips
- **Tips**: Belong entirely to the artist
- Displayed on PaymentsScreen for transparency

### Appointment Flow
1. Admin/Artist creates appointment
2. System validates no conflicts
3. SMS confirmation sent to client (if US number)
4. Appointment saved with "scheduled" status
5. On payment record:
   - Payment saved with artist and amount
   - Appointment status auto-updates to "completed"
   - Analytics automatically refreshed

### Payment Flow
1. Select existing appointment (prefills details)
2. Enter payment amount and optional tip
3. Choose payment method (cash/card/transfer)
4. System calculates:
   - Total = amount + tip
   - Shop commission = amount × 0.20
   - Artist earnings = (amount × 0.80) + tip
5. Save payment and mark appointment completed

### SMS Notification Logic
1. **Phone Number Validation:**
   - Check if starts with +1 (US number)
   - International numbers: show warning prompt
2. **SMS Delivery:**
   - Send via Twilio API
   - Verify delivery success
   - On failure: show error, don't create appointment
   - On success: create appointment, show confirmation
3. **Fallback:**
   - User can skip SMS for international clients
   - Prompts to use WhatsApp/call for confirmation

## Design System

### Color Palette (`theme.js`)
**Dark Gold and Black Tattoo Shop Theme:**
```javascript
// Dark theme base (pure black)
background: '#0a0a0a'    // Main background
surface: '#1a1a1a'       // Cards and modals
card: '#1a1a1a'          // Secondary surfaces

// Primary colors (gold/dark yellow for accents)
primary: '#d4af37'       // Rich gold/dark yellow
primaryLight: '#e5c158'  // Lighter gold
primaryDark: '#b8941d'   // Darker gold

// Secondary colors (dark gold accent)
secondary: '#c9a961'     // Muted gold
secondaryLight: '#e0c074'
secondaryDark: '#9d7e3c'

// Text colors
text: '#f5f5f5'          // Off-white
textSecondary: '#cccccc' // Light gray
textMuted: '#888888'     // Medium gray

// Status colors
success: '#2d5016'       // Dark green (status badge)
warning: '#8b7500'       // Dark yellow (status badge)
error: '#8b0000'         // Dark red (status badge)
info: '#003d5c'          // Dark blue

// UI colors
border: '#333333'        // Dark gray borders
divider: '#2a2a2a'       // Dark dividers
shadow: '#000000'        // Black shadow

// Gradient colors
gradientStart: '#d4af37'
gradientEnd: '#9d7e3c'

// Chart colors (dark yellow themed)
chartColors: ['#d4af37', '#c9a961', '#b8941d', '#9d7e3c', '#8b7500', '#6b5a0f']
```

**Design Philosophy:**
- **Premium Gold Accent (#d4af37)**: Represents quality, luxury, and the artistic nature of tattoos
- **Pure Black Background (#0a0a0a)**: Professional, elegant, minimalist - perfect for tattoo industry
- **Dark Surfaces (#1a1a1a)**: High contrast with gold for excellent readability and modern aesthetics
- **Dark Status Colors**: All status indicators use dark variants to maintain consistency

### Typography System
```javascript
// Heading sizes
title:     32px, weight: 700  // Main titles
subtitle:  28px, weight: 700  // Section subtitles
heading:   24px, weight: 600  // Card headings
subheading: 20px, weight: 600 // Subsections

// Body text
body:          16px, weight: 400 // Main content
bodySecondary: 16px, weight: 400 // Secondary content
caption:       14px, weight: 400 // Small text, labels
button:        16px, weight: 600 // Button text
```

### Spacing System
```javascript
xs:  4px   // Minimal spacing
sm:  8px   // Small spacing
md:  16px  // Medium spacing (default)
lg:  24px  // Large spacing
xl:  32px  // Extra large spacing
xxl: 48px  // Section spacing
```

### Border Radius
```javascript
sm:    4px   // Subtle rounding
md:    8px   // Default rounding
lg:    12px  // Card rounding
xl:    16px  // Large cards
round: 50px  // Fully rounded (pills, avatars)
```

### Shadows (iOS-optimized)
```javascript
small:  shadowOffset {0, 2}, opacity 0.25, radius 3.84, elevation 5
medium: shadowOffset {0, 4}, opacity 0.30, radius 4.65, elevation 8
large:  shadowOffset {0, 8}, opacity 0.44, radius 10.32, elevation 16
```

### Global Styles (`globalStyles.js`)

**Container Styles:**
- `container` - Main screen container (flex: 1, dark background)
- `scrollContainer` - Scrollable content area
- `center` - Center content (justify + align center)
- `card` - Content card with shadow and padding

**Button Styles:**
- `button` - Primary button (orange, rounded)
- `secondaryButton` - Outlined button (transparent with border)
- `iconButton` - Icon-only button
- `buttonText` - Button label text

**Input Styles:**
- `input` - Text input field (dark surface, bordered)
- `inputLabel` - Input label text
- `inputError` - Error state border (red)
- `errorText` - Error message text

**Status Badges:**
- `statusBadge` - Base badge style
- `statusScheduled` - Yellow badge (warning color)
- `statusCompleted` - Green badge (success color)
- `statusCancelled` - Red badge (error color)

**Empty States:**
- `emptyState` - Container for empty states
- `emptyStateTitle` - Large empty state heading
- `emptyStateText` - Secondary empty state text

**Utility Styles:**
- `row` / `rowBetween` / `rowCenter` - Flexbox row layouts
- `mt*` / `mb*` / `ml*` / `mr*` - Margin utilities (xs to xxl)
- `pt*` / `pb*` - Padding utilities

### Responsive Design

**Utilities (`responsive.js`):**
- `wp(percentage)` - Width percentage of screen
- `hp(percentage)` - Height percentage of screen
- `normalize(size)` - Scale size for device
- `isTablet()` - Check if device is tablet

**Design Principles:**
- Optimized for iPad landscape (1024×768)
- Responsive font sizing via normalize()
- Content width: 70% on tablets, 100% on phones
- Touch targets minimum 44×44 points
- Sufficient spacing for finger navigation

## Navigation Structure

### Stack Navigation (`AppNavigator.js`)

**Authentication Flow:**
- Login Screen (no authentication required)

**Main App Flow (after login):**

**Admin Role:**
- Bottom Tab Navigator with 5 tabs:
  1. **Dashboard** (home icon) → AdminDashboard
  2. **Appointments** (calendar icon) → AppointmentsScreen
  3. **Payments** (card icon) → PaymentsScreen
  4. **Analytics** (stats icon) → AnalyticsScreen
  5. **People** (people icon) → WorkerManagement

**Artist Role:**
- Bottom Tab Navigator with 4 tabs:
  1. **Dashboard** (home icon) → WorkerDashboard
  2. **Appointments** (calendar icon) → AppointmentsScreen (worker view)
  3. **Payments** (card icon) → PaymentsScreen (worker view)
  4. **Profile** (person icon) → ProfileScreen

**Navigation Theme:**
- Dark background (#1a1a1a)
- Primary color for active tab (#ff6b35)
- Custom fonts configuration (prevents bold errors)
- Header shown: false (custom AppHeader component)

## Project Structure

```
PetraTatto/
├── src/
│   ├── components/           # Reusable components
│   │   ├── AppHeader.js      # Screen header
│   │   ├── LoadingSpinner.js # Loading indicator
│   │   ├── PetraLogo.js      # Brand logo
│   │   ├── CustomAlert.js    # Custom alert dialog
│   │   ├── NewAppointmentModal.js    # Create appointments
│   │   ├── NewPaymentModal.js        # Record payments
│   │   ├── WorkerManagementModal.js  # Manage artists
│   │   ├── ClientManagementModal.js  # Manage clients
│   │   └── SMSTestComponent.js       # SMS testing tool
│   │
│   ├── screens/              # Application screens
│   │   ├── LoginScreen.js    # Authentication
│   │   ├── admin/            # Admin-only screens
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AppointmentsScreen.js
│   │   │   ├── PaymentsScreen.js
│   │   │   ├── AnalyticsScreen.js
│   │   │   └── WorkerManagement.js
│   │   └── worker/           # Artist screens
│   │       ├── WorkerDashboard.js
│   │       ├── AppointmentsScreen.js
│   │       ├── PaymentsScreen.js
│   │       └── ProfileScreen.js
│   │
│   ├── services/             # Business logic services
│   │   ├── localTattooService.js  # AsyncStorage database
│   │   ├── twilioService.js       # SMS notifications
│   │   ├── apiService.js          # API client (legacy)
│   │   └── notificationService.js # SMS service wrapper
│   │
│   ├── navigation/           # Navigation configuration
│   │   └── AppNavigator.js   # Stack + Tab navigation
│   │
│   ├── utils/                # Utility functions
│   │   ├── authContext.js    # Authentication state
│   │   └── responsive.js     # Responsive utilities
│   │
│   ├── styles/               # Styling system
│   │   ├── theme.js          # Design tokens
│   │   └── globalStyles.js   # Reusable styles
│   │
│   ├── config/               # Configuration files
│   │   ├── twilioConfig.js   # Twilio template
│   │   └── awsConfig.js      # AWS SNS config (unused)
│   │
│   └── App.js                # Root component
│
├── assets/                   # Images, fonts, icons
├── android/                  # Android build files
├── ios/                      # iOS build files
├── temp/                     # Commit backups
│
├── package.json              # Dependencies
├── babel.config.js           # Babel configuration
├── metro.config.js           # Metro bundler config
├── app.json                  # App metadata
└── README.md                 # This file
```

## Key Dependencies

```json

{
  "react": "19.1.0",
  "react-native": "0.80.2",
  "@react-navigation/native": "^7.0.13",
  "@react-navigation/stack": "^7.1.6",
  "@react-navigation/bottom-tabs": "^7.2.3",
  "@react-native-async-storage/async-storage": "^2.1.0",
  "@react-native-community/datetimepicker": "^8.4.0",
  "react-native-vector-icons": "^10.2.0",
  "axios": "^1.7.9"
}

```

## Security Features

- **Mock Authentication** with session persistence
- **Role-based Access Control** (admin vs artist permissions)
- **Input Validation** on all forms
- **Local Data Storage** with AsyncStorage encryption support
- **Phone Number Validation** for SMS delivery
- **Error Handling** with user-friendly messages

## Troubleshooting

### Common Issues

**1. Metro Bundler Cache Issues**
```bash
npm start -- --reset-cache
```

**2. iOS Build Errors**
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

**3. AsyncStorage Data Reset**
```javascript
// In app, run:
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
// Then restart app to reseed data
```

**4. SMS Not Sending**
- Verify Twilio credentials in `twilioConfig.local.js`
- Check phone number format (+1 for US)
- View console logs for Twilio API errors
- Test with SMSTestComponent

**5. Navigation Errors**
- Ensure all screens are registered in AppNavigator
- Check navigation.navigate() calls use correct screen names
- Verify TabNavigator configuration matches user role

### Development Tips

**Hot Reload:**
- Press `R` twice in iOS Simulator to reload
- Shake device to open dev menu
- Enable Fast Refresh for instant updates

**Debugging:**
- Use React Native Debugger for Redux-like state inspection
- Console.log in components shows in Metro terminal
- Use CustomAlert for user-facing error messages

**Testing SMS:**
- Use SMSTestComponent (accessible from admin dashboard)
- Test with dummy credentials (simulation mode)
- Add real Twilio credentials for production testing

**Database Inspection:**
```javascript
// Add to any screen during development:
const debugDB = async () => {
  const workers = await dbService.getWorkers();
  const clients = await dbService.getClients();
  const appointments = await dbService.getAppointments();
  console.log('DB State:', { workers, clients, appointments });
};
```

## Development Workflow

### Adding a New Feature

1. **Plan the feature:**
   - Define data structure (if new collection needed)
   - Identify affected screens/components
   - Sketch UI flow

2. **Update database service:**
   - Add methods to `localTattooService.js`
   - Update seed data if needed

3. **Create/modify screens:**
   - Use existing patterns (CustomAlert, LoadingSpinner)
   - Follow globalStyles for consistency
   - Add to AppNavigator if new screen

4. **Test thoroughly:**
   - Test CRUD operations
   - Verify error handling
   - Check responsive layout
   - Test on iPad simulator

5. **Update README:**
   - Document new feature
   - Update architecture section
   - Add any new configuration

### Code Style Guidelines

**Imports Order:**
1. React/React Native imports
2. Third-party libraries
3. Local components
4. Services/utilities
5. Styles/theme

**Component Structure:**
```javascript
// 1. Imports
// 2. Component definition
// 3. State declarations
// 4. useEffect hooks
// 5. Helper functions
// 6. Event handlers
// 7. Render logic
// 8. StyleSheet
// 9. Export
```

**Naming Conventions:**
- Components: PascalCase (e.g., `NewAppointmentModal`)
- Functions: camelCase (e.g., `handleSave`)
- Constants: UPPER_SNAKE_CASE (e.g., `STORE_KEYS`)
- Files: Match component name (e.g., `AdminDashboard.js`)

## Production Deployment

### Pre-deployment Checklist

- [ ] Update Twilio credentials in `twilioConfig.local.js`
- [ ] Remove console.log statements
- [ ] Test all CRUD operations
- [ ] Verify SMS sending for US numbers
- [ ] Test authentication flow
- [ ] Check analytics calculations
- [ ] Verify commission calculations (20%/80%)
- [ ] Test on physical iPad device
- [ ] Update app version in `app.json`

### iOS Build

```bash
# 1. Update version
# Edit app.json: "version": "1.0.1"

# 2. Clean build
cd ios
xcodebuild clean
rm -rf build/
pod deintegrate && pod install

# 3. Build for release
cd ..
npx react-native run-ios --configuration Release

# 4. Archive for App Store (in Xcode)
# Open ios/PetraTatto.xcworkspace in Xcode
# Product → Archive
# Distribute App → App Store Connect
```

### Post-deployment

- Monitor crash reports
- Check SMS delivery logs
- Gather user feedback
- Plan next iteration

## Future Enhancements

### Planned Features
- [ ] Client portal (view appointments, make payments)
- [ ] Advanced analytics with charts
- [ ] Inventory management for tattoo supplies
- [ ] Photo gallery for artist portfolios
- [ ] Appointment reminders (24h before)
- [ ] Multi-shop support
- [ ] Export reports (PDF/Excel)
- [ ] International SMS support (beyond US)
- [ ] Push notifications
- [ ] Backend integration (optional cloud sync)

### Technical Improvements
- [ ] Unit tests with Jest
- [ ] E2E tests with Detox
- [ ] TypeScript migration
- [ ] Redux for state management
- [ ] Offline mode improvements
- [ ] Data export/import functionality
- [ ] Backup/restore features

## Support & Contributing

For issues, questions, or contributions:
- Repository: NutrinoDaya/PetraTattoo
- Current Version: 1.0.0
- Last Updated: December 9, 2025

## License

This project is proprietary software developed for Petra Tatto shop management.

---

**Built with ❤️ using React Native**

## Support

For support and feature requests, please contact the development team.