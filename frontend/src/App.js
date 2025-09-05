import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthGuard/authGuard';
import ProtectedRoute from './AuthGuard/ProtectedRoute';
import Home from './Components/Home/Home';
// import AddUser from './Components/AddUser/AddUser';
// import ViewDetails from './Components/ViewDetails/ViewDetails';
import LoginPage from './Components/Login_Register/Login';
import RegisterPage from './Components/Login_Register/Register';
import ClothCustomizer from './Components/clothing-customizer/ClothCustomizer';
import ContactUs from './Components/Home/ContactUs';
import OrderManagement from './Components/OrderManagement/OrderManagement';
import PaymentManagement from './Components/PaymentManagement/PaymentManagement';
import TailorHome from './Components/Home/Tailor_Interface/TailorHome';
import UserHome from './Components/Home/UserHome/UserHome';
import SupplierManagement from './Components/Supplier-management/SupplierManagement';
import Unauthorized from './Components/Unauthorized/Unauthorized';
import Outlet from './Components/Outlet/Outlet';
import ItemInfo from './Components/ItemInfo/ItemInfo';
import InventoryManagement from './Components/InventoryManagement/InventoryManagement';
import AdminHome from './Components/Home/AdminHome/AdminHome';


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
        <Route path="/orderManagement" element={<OrderManagement />}/>
        <Route path='/paymentManagement' element={<PaymentManagement />}/>
        <Route path='/userHome' element={<UserHome />}/>
        <Route path='/supplierManagement' element={<SupplierManagement />}/>
        <Route path='/tailorHome' element={<TailorHome />}/>
        <Route path='/outlet' element={<Outlet />}/>
        <Route path='/outlet/:id' element={<ItemInfo />}/>
        <Route path='/adminHome' element={
          <ProtectedRoute requiredUserType="Admin">
            <AdminHome />
          </ProtectedRoute>
        }/>
        <Route path='/inventoryManagement' element={
          <ProtectedRoute requiredUserType="Admin">
            <InventoryManagement />
          </ProtectedRoute>
        }/>

      </Routes>
    </AuthProvider>
  );
}

export default App;
