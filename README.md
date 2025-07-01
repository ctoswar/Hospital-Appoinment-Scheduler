# HealthPortal - Healthcare Management System

A comprehensive healthcare management system built with React that provides separate portals for patients and doctors, enabling efficient appointment management, medical records tracking, and healthcare communication.

## 🚀 Features

### Patient Portal
- **Dashboard Overview**: Welcome screen with health statistics and upcoming appointments
- **Appointment Management**: Book, view, search, and cancel appointments
- **Doctor Discovery**: Browse available healthcare professionals with ratings and specialties
- **Medical Records**: Access test results, medications, and health history
- **Profile Management**: View and manage personal and health information
- **Real-time Updates**: Socket.IO integration for live appointment updates

### Doctor Portal
- **Professional Dashboard**: Overview of patient appointments and schedule
- **Appointment Management**: Manage patient bookings and schedules
- **Patient Records**: Access to patient medical history and information

### General Features
- **Authentication System**: Secure login with JWT tokens
- **Responsive Design**: Mobile-friendly interface with modern UI/UX
- **Real-time Notifications**: Live updates using Socket.IO
- **Search & Filter**: Advanced filtering for appointments and doctors
- **Status Management**: Track appointment statuses (confirmed, pending, completed, cancelled)

## 🛠️ Technology Stack

- **Frontend**: React 18+ with Hooks
- **Styling**: CSS3 with custom properties and animations
- **Icons**: Lucide React icon library
- **Real-time Communication**: Socket.IO client
- **HTTP Client**: Fetch API
- **State Management**: React useState and useEffect hooks
- **Authentication**: JWT token-based authentication
- **Local Storage**: Browser storage for user sessions

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Backend API server (running on port 5000 by default)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd healthportal
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Required Dependencies**
   Make sure these packages are installed:
   ```bash
   npm install react react-dom react-router-dom socket.io-client lucide-react
   ```

5. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

6. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 🏗️ Project Structure

```
src/
├── App.js                 # Main application component
├── Homepage.js            # Landing/login page
├── DoctorPortal.js        # Doctor-specific interface
├── styles/
│   ├── PatientPortal.css  # Patient portal styles
│   └── Navigation.css     # Navigation component styles
└── components/            # Reusable components (if any)
```

## 🔧 Configuration

### API Configuration
The application expects a backend API with the following endpoints:

- `GET /api/appointments` - Retrieve user appointments
- `POST /api/appointments` - Create new appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/doctors` - Retrieve available doctors

### Socket.IO Events
- `appointments:update` - Triggered when appointments are modified
- `connect_error` - Handles connection errors

### Authentication
- JWT tokens stored in localStorage
- Automatic token validation on app initialization
- Secure API requests with Authorization headers

## 🎨 Styling & Theming

The application uses CSS custom properties for theming:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --warning-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  --secondary-gradient: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}
```

### Key Style Features
- Responsive grid layouts
- Smooth animations and transitions
- Modern card-based design
- Hover effects and micro-interactions
- Status-based color coding
- Mobile-first approach

## 🔐 Security Features

- JWT token authentication
- Secure API communication with credentials
- Input validation and sanitization
- Protected routes based on user roles
- Automatic session management

## 📱 Responsive Design

The application is fully responsive with breakpoints for:
- Mobile devices (< 768px)
- Tablets (768px - 1024px)
- Desktop (> 1024px)

## 🚀 Deployment

### Build Optimization
```bash
npm run build
```

### Environment Variables for Production
```env
REACT_APP_API_URL=https://your-api-domain.com
```

### Deployment Platforms
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

## 🧪 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📋 API Requirements

Your backend API should support:

### Authentication Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /auth/verify` - Token verification

### Data Endpoints
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/doctors` - List doctors
- `GET /api/patients` - List patients (for doctors)

## 🔄 State Management

The application uses React's built-in state management:
- `useState` for component-level state
- `useEffect` for side effects and API calls
- Props for data flow between components
- LocalStorage for persistent user sessions

## 🎯 Usage Examples

### Booking an Appointment
```javascript
const bookingData = {
  patientName: "John Doe",
  doctorName: "Dr. Smith",
  date: "2025-07-15",
  time: "10:00",
  type: "General Checkup"
};
```

### Socket Connection
```javascript
const socket = io('http://localhost:5000', {
  withCredentials: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend server is running
   - Verify REACT_APP_API_URL environment variable
   - Check CORS configuration on backend

2. **Socket.IO Connection Issues**
   - Ensure Socket.IO server is running
   - Check network connectivity
   - Verify WebSocket support

3. **Authentication Errors**
   - Clear localStorage and try logging in again
   - Check token expiration
   - Verify API authentication endpoints

4. **Styling Issues**
   - Clear browser cache
   - Check CSS file imports
   - Verify custom properties support

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review API endpoint requirements

## 🔮 Future Enhancements

- [ ] Mobile app version (React Native)
- [ ] Push notifications
- [ ] Video consultation integration
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Offline functionality
- [ ] Integration with health devices
- [ ] Prescription management
- [ ] Insurance verification