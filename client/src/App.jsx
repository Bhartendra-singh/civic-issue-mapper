import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import SubmitReport from './pages/SubmitReport';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyReports from './pages/MyReports';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}



export default App;