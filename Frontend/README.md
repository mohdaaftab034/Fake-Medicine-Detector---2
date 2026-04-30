# MediGuard - AI-Powered Fake Medicine Detector

A professional, modern web application built for India to help citizens detect fake medicines using AI-powered scanning and verification.

## 🎯 Features

- **Medicine Scanner** - Upload photos to instantly verify medicine authenticity
- **Batch Verification** - Verify medicines using batch numbers and manufacturer data
- **Report Fake Medicines** - Multi-step form to report counterfeit medicines to CDSCO
- **Medicine Information** - Search and learn how to identify genuine medicines
- **Find Verified Chemists** - Locate trusted chemist shops near you with ratings
- **Real-time Alerts** - Get notified about fake medicine batches and drug recalls
- **Admin Dashboard** - View statistics, heatmaps, and recent reports
- **Responsive Design** - Fully optimized for mobile and desktop devices

## 🛠️ Tech Stack

- **Frontend Framework**: React.js 18 with Vite
- **Styling**: Tailwind CSS with custom dark theme
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Context API

## 📁 Project Structure

```
src/
├── assets/              # Images and static assets
├── components/          # Reusable components
│   ├── common/         # Navbar, Footer, Loader, etc.
│   ├── scanner/        # Scanner-related components
│   ├── report/         # Report form components
│   ├── dashboard/      # Dashboard components
│   └── medicine/       # Medicine search/info components
├── pages/              # Full page components
├── context/            # React Context for global state
├── hooks/              # Custom React hooks
├── services/           # API service functions
├── utils/              # Helper functions, constants, validators
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## 🎨 Design System

### Colors
- **Primary**: #00B4D8 (Cyan Blue) - Trust, Medical
- **Secondary**: #0077B6 (Deep Blue)
- **Success**: #06D6A0 (Green) - Genuine
- **Danger**: #EF233C (Red) - Fake Alert
- **Warning**: #FFB703 (Amber) - Suspicious
- **Background**: #0A0F1E (Very Dark Navy)
- **Dark Cards**: #111827

### Features
- Dark theme with futuristic medical-grade feel
- Glassmorphism effects on cards
- Glowing effects on CTAs
- Smooth animations and transitions
- Full responsiveness

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
```bash
cd Fake\ Medicine\ Detector
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview
```

## 📱 Pages & Features

### 1. Home Page
- Hero section with animated gradient background
- Stats counter with count-up animations
- How It Works section with visual flow
- Features grid (6 features)
- Testimonials section
- Active alert banner
- CTA sections

### 2. Medicine Scanner
- Dual tab interface (Upload Photo / Scan Barcode)
- Drag & drop image upload
- Barcode manual input
- Loading animation with progress bar
- Result display with confidence score
- Scan history sidebar

### 3. Batch Verification
- Simple form with 3 fields
- Batch number and manufacturer input
- Medicine category selector
- Verification with visual results

### 4. Report Fake Medicine
- Multi-step form (3 steps) with progress indicator
- Step 1: Medicine details
- Step 2: Evidence upload and location
- Step 3: Reporter details (optional/anonymous)
- Success screen with case ID

### 5. Medicine Information
- Search medicines by name/manufacturer
- Medicine cards with details
- Click to expand for full information
- Genuine packaging guide
- Drug interactions warnings

### 6. Find Nearby Chemist
- Map placeholder
- List of verified chemists
- Filter options (verified, open now)
- Distance and rating display
- Direct call functionality

### 7. Dashboard
- 4 stat cards with trends
- India heatmap of fake medicines
- Recent reports table
- Top counterfeited medicines chart
- Quick statistics panel

### 8. Alerts
- Real-time alerts from government
- Severity-based filtering (Critical/High/Medium/Low)
- Affected areas display
- Mark as read / Dismiss functionality
- Emergency helpline info

### 9. Not Found Page
- Custom 404 page with medicine theme
- Quick links to important sections

## 🔌 Mock Data

The application includes comprehensive mock data for development:
- 10 sample medicines with detailed information
- 8 nearby chemists with ratings and verification status
- 10 recent fake medicine reports
- 6 active government alerts
- Dashboard statistics

All API calls simulate realistic 1.5-second delays.

## 📝 Component Documentation

### Custom Hooks
- `useScanner()` - Medicine scanning and batch verification
- `useLocation()` - Geolocation handling
- `useReport()` - Fake medicine reporting

### Context
- `AppContext` - Global state for scan history, alerts, reports, user preferences

### Services
- `scannerService.js` - Scan and batch verification APIs
- `medicineService.js` - Medicine search and info APIs
- `reportService.js` - Report submission APIs

## 🎯 Key Features Implemented

✅ Professional dark theme with glassmorphism
✅ Fully responsive mobile-first design
✅ Smooth page transitions and animations
✅ Form validation with error messages
✅ Image preview before upload
✅ Progress bars and loading states
✅ Multi-step form with state management
✅ Mock data persistence in localStorage
✅ Toast notifications for user feedback
✅ Skeleton loaders for data sections
✅ Icon library integration
✅ Custom animations and transitions

## 🔐 Security & Privacy

- No real API calls (demo purposes)
- Data stored in browser localStorage only
- Anonymous reporting option
- No personal data collection without consent

## 📞 Support

For issues or questions, contact:
- CDSCO Helpline: 1800-180-3024
- Email: support@mediguard.in

## 📄 License

Built for Hack4Good 2025 - Making India's medicine supply safer.

---

**Note**: This is a hackathon project with mock data. For production, integrate with real CDSCO APIs and government databases.
