import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import About from './pages/About'
import Activity from './pages/Activity'
import HealthCheck from './pages/HealthCheck'
import Register from './pages/Register'
import Login from './pages/Login'
import Profile from './pages/Profile'
import VerifyEmail from './pages/VerifyEmail'
import OrgCreate from './pages/OrgCreate'
import OrgProfile from './pages/OrgProfile'
import Donate from './pages/Donate'
import DonationList from './pages/DonationList'
import DonationDetail from './pages/DonationDetail'
import MyDonations from './pages/MyDonations'
import MyClaims from './pages/MyClaims'
import PrivateRoute from './components/PrivateRoute'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/health" element={<HealthCheck />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/donations" element={<DonationList />} />
        <Route path="/donations/:id" element={<DonationDetail />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/activity" element={<PrivateRoute><Activity /></PrivateRoute>} />
        <Route path="/donate" element={<PrivateRoute allowedRoles={['DONOR']}><Donate /></PrivateRoute>} />
        <Route path="/my-donations" element={<PrivateRoute allowedRoles={['DONOR']}><MyDonations /></PrivateRoute>} />
        <Route path="/my-claims" element={<PrivateRoute allowedRoles={['NGO']}><MyClaims /></PrivateRoute>} />
        <Route path="/org/create" element={<PrivateRoute allowedRoles={['NGO']}><OrgCreate /></PrivateRoute>} />
        <Route path="/org/profile" element={<PrivateRoute allowedRoles={['NGO']}><OrgProfile /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
