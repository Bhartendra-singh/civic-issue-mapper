import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import SubmitReport from './pages/SubmitReport';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyReports from './pages/MyReports';
import MapExplorer from './pages/MapExplorer';
import AdminRoute from './components/common/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import VerifyEmail from './pages/VerifyEmail';
import VerificationBanner from './components/common/VerificationBanner';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ReportDetail from './pages/ReportDetail';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <VerificationBanner />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/submit-report"
            element = {
              <ProtectedRoute>
                <SubmitReport />
              </ProtectedRoute>
            }
          /> 

          <Route
            path="/my-reports"
            element={
              <ProtectedRoute>
                <MyReports />
              </ProtectedRoute>
            }
          />

          <Route path="/map" element={<MapExplorer />} />

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}



export default App;