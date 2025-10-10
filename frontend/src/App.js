import { Routes, Route, Navigate } from 'react-router-dom';
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
import TailorMyOrders from './pages/tailor/MyOrders';
import TailorOrderDetail from './pages/tailor/OrderDetail';
import UserHome from './Components/Home/UserHome/UserHome';
import SupplierManagement from './Components/Supplier-management/SupplierManagement';
import MaterialInventoryManagement from './Components/MaterialInventory-management/MaterialInventoryManagement';
import SkinToneColorGuide from './Components/SkinToneColorGuide/SkinToneColorGuide';
import Unauthorized from './Components/Unauthorized/Unauthorized';
import UserAccount from './Components/UserManagement/UserAccount';
import AdminUserManagement from './Components/AdminManagement/AdminUserManagement';
import PrivacyPolicy from './Components/PrivacyPolicy_Terms/PrivacyPolicy';
import TermsConditions from './Components/PrivacyPolicy_Terms/TermsAndConditions';
import Outlet from './Components/Outlet/Outlet';
import OutletDetail from './Components/Outlet/OutletDetail';
import AdminOutlet from './Components/AdminOutlet/AdminOutlet';
import ClothingInventoryManagement from './Components/ClothingInventoryManagement/ClothingInventoryManagement';
import OrderSummaryPage from './Components/OrderManagement/OrderSummaryPage';
import BookingReport from './pages/admin/BookingReport';
import LearnMore from './Components/LearnMore/LearnMore';


import RentalHome from './pages/RentalHome';
import OutfitDetails from './pages/OutfitDetails';
import Outfits from './pages/Outfits';
import MyBookings from './pages/MyBookings';
import EditBooking from './pages/EditBooking';
import Layout from './pages/owner/Layout';
import Dashboard from './pages/owner/Dashboard';
import AddOutfit from './pages/owner/AddOutfit';
import EditOutfit from './pages/owner/EditOutfit';
import ManageOutfits from './pages/owner/ManageOutfits';
import ManageBookings from './pages/owner/ManageBookings';
import Reports from './pages/owner/Reports';
//import { Toaster} from 'react-hot-toast'

import AdminHub from './Components/AdminHub/AdminHub';
import AdminCustomOrders from './pages/admin/CustomOrders';
import AdminCustomOrderDetail from './pages/admin/CustomOrderDetail';
import AdminTailors from './pages/admin/Tailors';
import AdminClothCustomizer from './Components/clothing-customizer/admin-cloth-customizer';

// Gate that redirects logged-in customers to UserHome on outlet routes only
import { useAuth } from './AuthGuard/AuthGuard';
const OutletGate = ({ id = null }) => {
  // Always allow access to Outlet and OutletDetail for all roles
  // Render Outlet or OutletDetail based on whether an id is provided via route match
  return id ? <OutletDetail /> : <Outlet />;
};


function App() {
  return (
    <AuthProvider>
      
      <Routes>
       // {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/career" element={<Career />} />
        <Route path="/customizer" element={<ClothCustomizer />} />
        <Route path="/outlet" element={<OutletGate />} />
        <Route path="/outlet/:id" element={<OutletGate id />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/orderSummary" element={<OrderSummaryPage />} />

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
            <ProtectedRoute allowedUserTypes="Admin">
              <PaymentDetailsDisplay />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/user/account"
          element={(
            <ProtectedRoute allowedUserTypes={["Customer", "Applicant", "Tailor", "Admin"]}>
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
        <Route
          path="/tailor/orders"
          element={(
            <ProtectedRoute allowedUserTypes="Tailor">
              <TailorMyOrders />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/tailor/orders/:id"
          element={(
            <ProtectedRoute allowedUserTypes="Tailor">
              <TailorOrderDetail />
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
              <MaterialInventoryManagement />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin-outlet"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <AdminOutlet />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/clothing-inventory"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <ClothingInventoryManagement />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin-hub"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <AdminHub />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/custom-orders"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <AdminCustomOrders />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/custom-orders/:id"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <AdminCustomOrderDetail />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/tailors"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <AdminTailors />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin-cloth-customizer"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <AdminClothCustomizer />
            </ProtectedRoute>
          )}
        />
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
        <Route
          path="/admin/booking-reports"
          element={(
            <ProtectedRoute allowedUserTypes="Admin">
              <BookingReport />
            </ProtectedRoute>
          )}
        />


        <Route path='/rentalHome' element={<RentalHome />}/>
        <Route path='/outfit-details/:id' element = {<OutfitDetails/>}/>
        <Route path='/outfits' element = {<Outfits/>}/>
        <Route 
          path='/my-bookings' 
          element={
            <ProtectedRoute allowedUserTypes={["Customer", "Applicant"]}>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route 
          path='/edit-booking/:bookingId' 
          element={
            <ProtectedRoute allowedUserTypes={["Customer", "Applicant"]}>
              <EditBooking />
            </ProtectedRoute>
          }
        />
        <Route 
          path='/owner' 
          element={
            <ProtectedRoute allowedUserTypes={["owner", "Admin"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
            <Route index element={<Dashboard />} />
            <Route path='add-outfit' element={<AddOutfit />} />
            <Route path='edit-outfit/:outfitId' element={<EditOutfit />} />
            <Route path='manage-outfits' element={<ManageOutfits />} />
            <Route path='manage-bookings' element={<ManageBookings />} />
            <Route path='reports' element={<Reports />} />
        </Route>




      </Routes>
    </AuthProvider>
  );
}

export default App;
