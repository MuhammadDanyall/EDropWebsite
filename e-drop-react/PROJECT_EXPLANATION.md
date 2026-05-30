# E-DROP React Project - Complete Explanation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [Key Dependencies](#3-key-dependencies)
4. [Main Files & Components](#4-main-files--components)
   - [src/main.jsx](#srcmainjsx)
   - [src/App.jsx](#srcappjsx)
   - [src/components/Header.jsx](#srccomponentsheaderjsx)
   - [src/components/Footer.jsx](#srccomponentsfooterjsx)
   - [src/components/AIChatbot.jsx](#srccomponentsaichatbotjsx)
   - [src/components/AuthModal.jsx](#srccomponentsauthmodaljsx)
   - [src/pages/Home.jsx](#srcpageshomejsx)
   - [src/hooks/useAuthGate.js](#srchooksuseauthgatejs)
5. [Styling & Design](#5-styling--design)
6. [How to Run the Project](#6-how-to-run-the-project)
7. [Backend Connection](#7-backend-connection)


---

## 1. Project Overview

**E-DROP** is a modern logistics and transportation platform built with React, offering three main services:
- **E-CAB**: Taxi service for city travel
- **E-SHIPPING**: Fast and secure parcel delivery
- **E-CARGO**: Heavy logistics and freight management

The project uses **React 19** with **Vite** as the build tool, and **React Router DOM** for navigation.


---

## 2. Project Structure

```
e-drop-react/
├── public/                     # Static assets
│   └── pictures/               # Project images and assets
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/             # Reusable UI components
│   │   ├── AIChatbot.jsx       # AI-powered chatbot
│   │   ├── AuthModal.jsx       # Login/Signup modal
│   │   ├── Chatbot.jsx         # Legacy chatbot
│   │   ├── CostEstimator.jsx   # Cost calculator
│   │   ├── Footer.jsx          # Website footer
│   │   ├── Header.jsx          # Navigation header
│   │   ├── PaymentModal.jsx    # Payment modal
│   │   ├── ProtectedRoute.jsx  # Route protection
│   │   ├── RestrictedAccessModal.jsx
│   │   └── SmartMap.jsx        # Map component
│   ├── hooks/                  # Custom React hooks
│   │   └── useAuthGate.js      # Authentication hook
│   ├── pages/                  # Page components
│   │   ├── About.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── ECab.jsx
│   │   ├── ECargo.jsx
│   │   ├── EShipping.jsx
│   │   ├── FAQ.jsx
│   │   ├── Home.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   └── TermsConditions.jsx
│   ├── styles/                 # CSS stylesheets
│   │   ├── AdminDashboard.css
│   │   ├── ecab.css
│   │   ├── ecargo.css
│   │   ├── eship.css
│   │   ├── mobile-fixes.css
│   │   ├── paymentModal.css
│   │   └── styles.css
│   ├── App.css
│   ├── App.jsx                 # Main app component
│   ├── index.css
│   └── main.jsx                # App entry point
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```


---

## 3. Key Dependencies

The project uses these main npm packages (from `package.json`):

### Production Dependencies:
- **react**: ^19.2.0 - The core React library
- **react-dom**: ^19.2.0 - DOM rendering for React
- **react-router-dom**: ^7.13.1 - Client-side routing
- **axios**: ^1.13.6 - HTTP client for API requests
- **leaflet**: ^1.9.4 - Map library
- **react-leaflet**: ^5.0.0 - React wrapper for Leaflet
- **express**: ^5.2.1 - Web framework (for backend)
- **mongoose**: ^9.3.1 - MongoDB ODM
- **cors**: ^2.8.6 - CORS middleware
- **dotenv**: ^17.3.1 - Environment variables

### Development Dependencies:
- **vite**: ^7.3.1 - Fast build tool and dev server
- **@vitejs/plugin-react**: ^5.1.1 - React plugin for Vite
- **eslint**: ^9.39.1 - Linting tool


---

## 4. Main Files & Components

### src/main.jsx
The entry point of the application. It renders the main `<App />` component wrapped in:
- `StrictMode`: For development mode warnings
- `BrowserRouter`: For React Router functionality

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```


### src/App.jsx
This is the **main application component**. It manages:
- Authentication modal state
- Route definitions
- Global chatbot component
- Header/Footer visibility

Key features:
1. **Routing Setup**: Uses React Router's `<Routes>` and `<Route>`
2. **Scroll Handling**: Smooth scroll to hash links
3. **Conditional Components**: Hides header/footer on admin routes

```javascript
function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // ...
  
  return (
    <>
      {!isAdminRoute && <AIChatbot />}
      <div className={isAdminRoute ? "admin-only-layout" : "app-container"}>
        {!isAdminRoute && <Header onAuthClick={openAuth} />}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            {/* ... other routes */}
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </>
  );
}
```


### src/components/Header.jsx
The navigation header component with:
- Logo and brand name
- Navigation menu
- User authentication status
- Hamburger menu for mobile

Key functionality:
- Checks `sessionStorage` for logged-in user
- Shows LOGIN/SIGNUP or USER GREETING/LOGOUT based on auth state
- Closes mobile menu on route change
- Admin sees "Dashboard" link if role is admin


### src/components/Footer.jsx
Website footer with:
- Company info and quick links
- Contact information (phone, email, location)
- Social media links
- Links to Privacy Policy and Terms & Conditions

Features:
- Fetches contact info dynamically from backend (`/api/content`)
- Responsive grid layout


### src/components/AIChatbot.jsx
AI-powered chatbot component with professional design!

Features:
- Fixed floating button in bottom-right corner
- Animated toggle button (rotates when opening/closing)
- Chat window with header, messages area, and input
- Bot avatar and typing indicator
- Sends messages to backend API (`/api/chatbot/chat`)
- Uses Google Gemini AI for responses (via backend)

Styling:
- Gradient colors (#ff6b35 to #f7931e)
- Smooth animations and transitions
- Professional, modern look


### src/components/AuthModal.jsx
Authentication modal for login, signup, forgot password, and OTP verification.

Features:
1. **Login**: Email + password
2. **Signup**: Full name, email, phone, password, role (customer/driver)
3. **Forgot Password**: Send OTP to email
4. **Verify OTP**: Verify 6-digit OTP
5. **Reset Password**: Set new password after OTP verification
6. **Admin OTP**: Extra security for admin login

Password validation:
- At least 8 characters
- 1 uppercase, 1 lowercase, 1 number, 1 special character


### src/pages/Home.jsx
The main landing page with these sections:
1. Preloader (loading screen)
2. Hero Section with stats
3. About Us
4. Services (E-CAB, E-SHIPPING, E-CARGO, future plans)
5. Testimonials carousel
6. Team section
7. FAQ accordion
8. Tracking section
9. Contact form

Key functionality:
- Testimonial slider (auto-rotates every 5 seconds)
- Scroll-based animations
- Magnetic button effects
- Dynamic content from backend
- Shipment/Cargo tracking


### src/hooks/useAuthGate.js
Custom React hook to manage authentication state.

```javascript
export const useAuthGate = () => {
  const [user, setUser] = useState(null);
  const [isAuthAlertOpen, setIsAuthAlertOpen] = useState(false);

  useEffect(() => {
    // Check sessionStorage for user data
    const checkUser = () => {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch(e){}
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleRestrictedClick = (e) => {
    if (!user) {
      if (e) e.preventDefault();
      setIsAuthAlertOpen(true);
      return false;
    }
    return true;
  };

  return { user, isAuthAlertOpen, setIsAuthAlertOpen, handleRestrictedClick };
};
```


---

## 5. Styling & Design

The project uses modern CSS with these features:

### Key CSS Files:
- **src/styles/styles.css**: Main stylesheet with global styles
- **src/App.css**: Component-specific styles
- **src/index.css**: Base reset styles

### Design Highlights:
- **Colors**: Primary gradient #ff6b35 (orange) to #f7931e (lighter orange)
- **Font**: Poppins (Google Font)
- **Animations**: Fade-in, slide, bounce, pulse effects
- **Responsive**: Mobile-first design with media queries
- **Glass Morphism**: Modern translucent effects


---

## 6. How to Run the Project

### Prerequisites:
- Node.js (v18 or higher)
- npm (or yarn)

### Steps:
1. **Install dependencies**:
   ```bash
   cd e-drop-react
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   This will start Vite dev server, usually at `http://localhost:5173`

3. **Build for production**:
   ```bash
   npm run build
   ```
   Creates optimized files in `dist/` folder

4. **Preview production build**:
   ```bash
   npm run preview
   ```


---

## 7. Backend Connection

The frontend connects to a Node.js/Express backend at `http://localhost:5000`

### API Endpoints Used:
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-admin-otp` - Admin OTP verification
- `GET /api/content` - Fetch dynamic site content
- `POST /api/contact/send` - Send contact form
- `GET /api/shipments/track/:id` - Track shipment
- `GET /api/cargo/track/:id` - Track cargo
- `POST /api/chatbot/chat` - Chat with AI bot


---

## Summary

This is a professional, fully-featured React project with:
- Modern UI/UX design
- Complete authentication system
- AI-powered chatbot
- Responsive layout
- Backend API integration
- Dynamic content management

Perfect for your final defense presentation!
