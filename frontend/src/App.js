import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthGuard/AuthGuard';
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
import AdminApplicantManagement from './Components/AdminApplicantManagement/AdminApplicantManagement';
import AdminApplicantDetail from './Components/AdminApplicantManagement/AdminApplicantDetail';
import AdminPanel from './Components/AdminPanel/AdminPanel';
import ContactUs from './Components/Home/ContactUs';
import OrderManagement from './Components/OrderManagement/OrderManagement';
import PaymentManagement from './Components/PaymentManagement/PaymentManagement';
import TailorHome from './Components/Home/Tailor_Interface/TailorHome';
import UserHome from './Components/Home/UserHome/UserHome';
import SupplierManagement from './Components/Supplier-management/SupplierManagement';
import SkinToneColorGuide from './Components/SkinToneColorGuide/SkinToneColorGuide';
import Unauthorized from './Components/Unauthorized/Unauthorized';

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
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin-applicants" element={<AdminApplicantManagement />} />
        <Route path="/admin-applicants/:id" element={<AdminApplicantDetail />} />
        <Route path="/orderManagement" element={<OrderManagement />}/>
        <Route path='/paymentManagement' element={<PaymentManagement />}/>
        <Route path='/userHome' element={<UserHome />}/>
        <Route path='/supplierManagement' element={<SupplierManagement />}/>
        <Route path='/tailorHome' element={<TailorHome />}/>
        <Route path='/color-guide' element={<SkinToneColorGuide />}/>

      </Routes>
    </AuthProvider>
  );
}

export default App;





