import { Routes, Route } from 'react-router-dom';
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


function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/add" element={<AddUser />} /> */}
        {/* <Route path="/viewDetails" element={<ViewDetails />} /> */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/customizer" element={<ClothCustomizer />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/orderManagement" element={<OrderManagement />}/>
        <Route path='/paymentManagement' element={<PaymentManagement />}/>
        <Route path='/tailorHome' element={<TailorHome />}/>
      </Routes>
  );
}

export default App;
