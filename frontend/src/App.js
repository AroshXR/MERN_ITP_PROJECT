import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthGuard/AuthGuard';
import ProtectedRoute from './AuthGuard/ProtectedRoute';
import Home from './Components/Home/Home';
import LoginPage from './Components/Login_Register/Login';
import RegisterPage from './Components/Login_Register/Register';
import ClothCustomizer from './Components/clothing-customizer/ClothCustomizer';
import Career from './Components/Career/Career';
import ApplicantDashboard from './Components/ApplicantDashboard/ApplicantDashboard';
import AdminJobManagement from './Components/AdminJobManagement/AdminJobManagement';
import AdminApplicantManagement from './Components/AdminApplicantManagement/AdminApplicantManagement';
import AdminApplicantDetail from './Components/AdminApplicantManagement/AdminApplicantDetail';
import AdminPanel from './Components/AdminPanel/AdminPanel';
import ContactUs from './Components/ContactUsPage/ContactUsPage';
import OrderManagement from './Components/OrderManagement/OrderManagement';
import PaymentManagement from './Components/PaymentManagement/PaymentManagement';
import PaymentDetailsDisplay from './Components/PaymentDetailsDisplay/PaymentDetailsDisplay';
import TailorHome from './Components/Home/Tailor_Interface/TailorHome';
import UserHome from './Components/Home/UserHome/UserHome';
import SupplierManagement from './Components/Supplier-management/SupplierManagement';
import InventoryManagement from './Components/Inventory-management/InventoryManagement';
import SkinToneColorGuide from './Components/SkinToneColorGuide/SkinToneColorGuide';
import Unauthorized from './Components/Unauthorized/Unauthorized';
import UserAccount from './Components/UserManagement/UserAccount';
import AdminUserManagement from './Components/AdminManagement/AdminUserManagement';
import PrivacyPolicy from './Components/PrivacyPolicy_Terms/PrivacyPolicy';
import TermsConditions from './Components/PrivacyPolicy_Terms/TermsAndConditions';

import RentalHome from './pages/RentalHome';
import OutfitDetails from './pages/OutfitDetails';
import Outfits from './pages/Outfits';
import MyBookings from './pages/MyBookings';
import Layout from './pages/owner/Layout';
import Dashboard from './pages/owner/Dashboard';
import AddOutfit from './pages/owner/AddOutfit';
import ManageOutfits from './pages/owner/ManageOutfits';
import ManageBookings from './pages/owner/ManageBookings';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/career" element={<Career />} />
        <Route path="/customizer" element={<ClothCustomizer />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />

        {/* Applicant and informational routes */}
        <Route path="/applicant-dashboard" element={<ApplicantDashboard />} />
        <Route path="/color-guide" element={<SkinToneColorGuide />} />

        {/* Authenticated customer & applicant routes */}
        <Route
          path="/userHome"
          element={(
            <ProtectedRoute allowedUserTypes={["Customer", "Applicant"]}>
              <UserHome />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/orderManagement"
          element={(
            <ProtectedRoute allowedUserTypes={["Customer", "Applicant"]}>
              <OrderManagement />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/paymentManagement"
          element={(
            <ProtectedRoute allowedUserTypes={["Customer", "Applicant"]}>
              <PaymentManagement />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/paymentDetails"
          element={(
            <ProtectedRoute allowedUserTypes={["Customer", "Applicant"]}>
              <PaymentDetailsDisplay />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/user/account"
          element={(
            <ProtectedRoute allowedUserTypes={["Customer", "Applicant", "Tailor"]}>
              <UserAccount />
            </ProtectedRoute>
          )}
        />

        {/* Tailor experience */}
        <Route
          path="/tailorHome"
          element={(
            <ProtectedRoute allowedUserTypes="Tailor">
              <TailorHome />
            </ProtectedRoute>
          )}
        />

        {/* Supplier management - restricted to admin by default */}
        <Route
          path="/supplierManagement"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <SupplierManagement />
            </ProtectedRoute>
          )}
        />

        {/* Inventory management - restricted to admin by default */}
        <Route
          path="/inventoryManagement"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <InventoryManagement />
            </ProtectedRoute>
          )}
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <AdminPanel />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin-jobs"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <AdminJobManagement />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin-applicants"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <AdminApplicantManagement />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin-applicants/:id"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <AdminApplicantDetail />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/users"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <AdminUserManagement />
            </ProtectedRoute>
          )}
        />


        <Route path='/rentalHome' element={<RentalHome />}/>
        <Route path='/outfit-details/:id' element = {<OutfitDetails/>}/>
        <Route path='/outfits' element = {<Outfits/>}/>
        <Route path='/my-bookings' element = {<MyBookings/>}/>
        <Route path='/owner' element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path='add-outfit' element={<AddOutfit />} />
            <Route path='manage-outfits' element={<ManageOutfits />} />
            <Route path='manage-bookings' element={<ManageBookings />} />
        </Route>




      </Routes>
    </AuthProvider>
  );
}

export default App;
