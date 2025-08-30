// import React, { createContext, useState, useContext, useEffect } from 'react';
// import axios from 'axios';

// const AuthGuard = createContext();

// export const useAuth = () => {
//     return useContext(AuthGuard);
// };

// export const AuthProvider = ({ children }) => {
//     const [currentUser, setCurrentUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [token, setToken] = useState(localStorage.getItem('token'));

//     useEffect(() => {
//         const checkAuth = async () => {
//             const storedToken = localStorage.getItem('token');
//             if (storedToken) {
//                 try {
//                     axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                    
//                     const response = await axios.get('http://localhost:5000/userHome'); 
//                     setCurrentUser(response.data.user);
//                     setToken(storedToken);
//                 } catch (error) {
//                     console.error('Token validation failed:', error);
//                     logout();
//                 }
//             }
//             setLoading(false);
//         };

//         checkAuth();
//     }, []);

//     const login = (token, userData) => {
//         localStorage.setItem('token', token);
//         setToken(token);
//         setCurrentUser(userData);
//         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     };

//     const logout = () => {
//         localStorage.removeItem('token');
//         setToken(null);
//         setCurrentUser(null);
//         delete axios.defaults.headers.common['Authorization'];
//     };

//     const isAuthenticated = () => {
//         return !!token && !!currentUser;
//     };

//     const value = {
//         currentUser,
//         token,
//         login,
//         logout,
//         loading,
//         isAuthenticated
//     };

//     return (
//         <AuthGuard.Provider value={value}>
//             {children}
//         </AuthGuard.Provider>
//     );
// };