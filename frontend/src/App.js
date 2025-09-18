import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthGuard/authGuard';
import ProtectedRoute from './AuthGuard/ProtectedRoute';
import Home from './Components/Home/Home';
// import AddUser from './Components/AddUser/AddUser';
// import ViewDetails from './Components/ViewDetails/ViewDetails';
import LoginPage from './Components/Login_Register/Login';
import RegisterPage from './Components/Login_Register/Register';
import ClothCustomizer from './Components/clothing-customizer/ClothCustomizer';
import Career from './Components/Career/Career';
import ApplicantDashboard from './Components/ApplicantDashboard/ApplicantDashboard';
import AdminJobManagement from './Components/AdminJobManagement/AdminJobManagement';
import ContactUs from './Components/Home/ContactUs';
import OrderManagement from './Components/OrderManagement/OrderManagement';
import PaymentManagement from './Components/PaymentManagement/PaymentManagement';
import TailorHome from './Components/Home/Tailor_Interface/TailorHome';
import UserHome from './Components/Home/UserHome/UserHome';
import SupplierManagement from './Components/Supplier-management/SupplierManagement';
import Unauthorized from './Components/Unauthorized/Unauthorized';
import Outfits from './pages/Outfits';
import MyBookings from './pages/MyBookings';
import OutfitDetails from './pages/OutfitDetails';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* All Routes - No Authentication Required */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/customizer" element={<ClothCustomizer />} />
        <Route path="/career" element={<Career />} />
        <Route path="/applicant-dashboard" element={<ApplicantDashboard />} />
        <Route path="/admin-jobs" element={<AdminJobManagement />} />
        <Route path="/orderManagement" element={<OrderManagement />}/>
        <Route path='/paymentManagement' element={<PaymentManagement />}/>
        <Route path='/userHome' element={<UserHome />}/>
        <Route path='/supplierManagement' element={<SupplierManagement />}/>
        <Route path='/tailorHome' element={<TailorHome />}/>
        <Route path="/Outfits" element={<Outfits />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/outfit/:id" element={<OutfitDetails />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;
