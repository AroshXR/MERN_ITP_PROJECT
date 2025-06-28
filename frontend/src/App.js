import { Routes, Route } from 'react-router-dom';
import Home from './Components/Home/Home';
import AddUser from './Components/AddUser/AddUser';
import ViewDetails from './Components/ViewDetails/ViewDetails';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddUser />} />
        <Route path="/viewDetails" element={<ViewDetails />} />
      </Routes>
  );
}

export default App;
