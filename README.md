# Petra Tatto - Tattoo Shop Management App

A comprehensive tattoo shop management application built with React Native (frontend) and FastAPI (backend), featuring appointment scheduling, payment tracking, notifications, and admin analytics.

## Features

### For Artists (Workers)
- 📅 **Appointment Management**: Schedule, view, and manage customer appointments
- 💰 **Payment Tracking**: Record payments, tips, and track earnings
- 📊 **Personal Dashboard**: View daily/weekly/monthly statistics
- 👤 **Profile Management**: Update personal information and portfolio
- 🔔 **Notifications**: Automatic appointment reminders

### For Admin (Shop Owner)
- 📈 **Analytics Dashboard**: Comprehensive insights with charts and metrics
- 👥 **Staff Management**: Add, remove, and manage artists
- 💼 **Financial Overview**: Track total revenue, commissions (20%), and artist earnings
- 📊 **Reports**: Detailed financial and performance reports
- 🎯 **Business Intelligence**: Payment method analysis, trends, and forecasting

### Technical Features
- 🌙 **Dark Theme**: Professional MMA-inspired design
- 🔐 **JWT Authentication**: Secure role-based access control
- 📱 **Real-time Notifications**: Push notifications for appointments
- 🗄️ **MongoDB Integration**: Robust data storage and retrieval
- 🚀 **Production Ready**: Optimized for iOS deployment

## Installation

### Prerequisites
- Node.js (14.x or higher)
- Python (3.8 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or physical iOS device

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Start the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the main project directory:
```bash
cd ../
```

2. Install dependencies:
```bash
npm install
```

3. Start the Expo development server:
```bash
npm start
```

4. Run on iOS:
```bash
npm run ios
```

## Configuration

### Backend Configuration
- **MongoDB**: Update the connection string in `backend/main.py` if needed
- **JWT Secret**: Change the `SECRET_KEY` in production
- **Admin Credentials**: Default admin login is `admin/admin123`

### Frontend Configuration
- **API URL**: Update `BASE_URL` in `src/services/apiService.js` to match your backend
- **Notifications**: Configure push notification settings in `app.json`

## Database Schema

### Users Collection
```javascript
{
  username: String (unique),
  email: String (unique),
  full_name: String,
  password: String (hashed),
  role: String ("admin" | "worker"),
  is_active: Boolean,
  profile_image: String,
  experience: String,
  specialties: [String],
  created_at: Date
}
```

### Appointments Collection
```javascript
{
  customer_name: String,
  customer_phone: String,
  tattoo_type: String,
  description: String,
  price: Number,
  date: String (YYYY-MM-DD),
  time: String (HH:MM),
  duration: Number (minutes),
  status: String ("upcoming" | "completed" | "cancelled"),
  worker_id: ObjectId,
  created_at: Date
}
```

### Payments Collection
```javascript
{
  customer_name: String,
  tattoo_type: String,
  amount: Number,
  payment_method: String ("cash" | "card"),
  tip_amount: Number,
  date: String (YYYY-MM-DD),
  notes: String,
  worker_id: ObjectId,
  created_at: Date
}
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login

### Workers
- `GET /api/v1/workers` - Get all workers
- `POST /api/v1/workers` - Create worker (admin only)
- `PUT /api/v1/workers/{id}` - Update worker
- `DELETE /api/v1/workers/{id}` - Delete worker (admin only)

### Appointments
- `GET /api/v1/appointments` - Get appointments
- `POST /api/v1/appointments` - Create appointment
- `PUT /api/v1/appointments/{id}` - Update appointment
- `DELETE /api/v1/appointments/{id}` - Delete appointment

### Payments
- `GET /api/v1/payments` - Get payments
- `POST /api/v1/payments` - Create payment
- `PUT /api/v1/payments/{id}` - Update payment
- `DELETE /api/v1/payments/{id}` - Delete payment

### Analytics (Admin Only)
- `GET /api/v1/analytics` - Get comprehensive analytics
- `GET /api/v1/analytics/earnings` - Get earnings breakdown

## Business Logic

### Commission Structure
- **Shop Commission**: 20% of each payment (excluding tips)
- **Artist Earnings**: 80% of payment + 100% of tips
- **Tips**: Belong entirely to the artist

### Appointment Rules
- No duplicate appointments at the same time/date for the same artist
- Appointments show existing bookings when selecting time slots
- Automatic conflict detection and prevention

### Notification System
- **Immediate**: Confirmation sent when appointment is created
- **Reminder**: Notification sent 2 days before appointment
- **Cancellation**: Automatic cleanup of scheduled notifications

## Design System

### Color Palette
- **Primary**: #ff6b35 (Orange/Red accent)
- **Secondary**: #4a90e2 (Blue)
- **Background**: #1a1a1a (Dark)
- **Surface**: #2a2a2a (Card backgrounds)
- **Success**: #28a745
- **Warning**: #ffc107
- **Error**: #dc3545

### Typography
- **Headers**: Bold, high contrast
- **Body**: Clean, readable
- **Accents**: Primary color highlights

## Security Features

- **JWT Authentication** with secure token storage
- **Role-based Access Control** (admin vs worker permissions)
- **Input Validation** on both frontend and backend
- **Password Hashing** using bcrypt
- **API Rate Limiting** and error handling

## Production Deployment

### Backend
1. Update MongoDB connection string for production
2. Change JWT secret key
3. Configure CORS for production domain
4. Set up proper logging and monitoring
5. Deploy to cloud service (AWS, GCP, Azure)

### Frontend
1. Build production bundle: `expo build:ios`
2. Configure App Store Connect
3. Update API endpoints for production
4. Set up push notification certificates
5. Submit to App Store

## Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure connection string is correct and network accessible
2. **Expo Dependencies**: Run `expo install --fix` for version conflicts
3. **iOS Simulator**: Restart if app doesn't load properly
4. **API Connection**: Check BASE_URL in apiService.js matches backend

### Development Tips
- Use `expo start --clear` to clear cache
- Check console for API errors
- Verify MongoDB collections exist
- Test on physical device for notifications

## License

This project is proprietary software developed for Petra Tatto shop management.

## Support

For support and feature requests, please contact the development team.