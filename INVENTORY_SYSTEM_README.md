# Inventory Management System

## Overview

This Inventory Management System has been implemented for the Klassy Shirts MERN stack clothing store project. It provides comprehensive inventory management capabilities for both administrators and customers.

## Features Implemented

### 🛍️ Customer Features (Outlet)

1. **Product Browsing**
   - View all available products in a responsive grid/list layout
   - Product cards with images, names, prices, and stock information
   - Toggle between grid and list view modes

2. **Advanced Filtering & Search**
   - Search by product name, description, or brand
   - Filter by category (T-Shirts, Hoodies, Pants, Accessories, Shoes, Dresses, Jackets)
   - Filter by size (XS, S, M, L, XL, XXL, One Size)
   - Filter by color
   - Price range filtering (min/max price)
   - Multiple sorting options (newest, oldest, price low/high, name A-Z/Z-A)

3. **Pagination**
   - Responsive pagination with configurable items per page
   - Navigation between pages

4. **Product Details Page**
   - Detailed product information with image gallery
   - Size and color selection
   - Quantity selector
   - Add to cart functionality (integrated with existing cart system)
   - Wishlist and share buttons
   - Customer reviews and ratings
   - Review submission (for authenticated users)

### 🔧 Admin Features (Inventory Management)

1. **Product Management**
   - Add new products with comprehensive details
   - Edit existing products
   - Soft delete products (set as inactive)
   - View all products including inactive ones

2. **Inventory Control**
   - Stock management
   - Product status management (active/inactive)
   - Bulk operations support

3. **Admin Dashboard**
   - Tabular view of all inventory items
   - Search and filter functionality
   - Quick actions (view, edit, delete)
   - Stock level indicators
   - Status badges

4. **Product Categories**
   - T-Shirts
   - Hoodies
   - Pants
   - Accessories
   - Shoes
   - Dresses
   - Jackets

## Technical Implementation

### Backend (Node.js/Express/MongoDB)

#### Models
- **InventoryItem**: Complete product model with all necessary fields
- **Review**: Customer review system with ratings and comments

#### Controllers
- **InventoryController**: Handles all inventory CRUD operations
- **ReviewController**: Manages customer reviews and ratings

#### Routes
- **InventoryRoutes**: RESTful API endpoints for inventory management
- **ReviewRoutes**: Review management endpoints

#### API Endpoints

**Public Endpoints (Customers)**
```
GET /inventory - Get all active items with filters
GET /inventory/:id - Get single item details
GET /reviews/item/:itemId - Get reviews for an item
```

**Protected Endpoints (Admin)**
```
GET /inventory/admin/all - Get all items (including inactive)
POST /inventory/admin - Create new item
PUT /inventory/admin/:id - Update item
DELETE /inventory/admin/:id - Soft delete item
PUT /inventory/admin/:id/stock - Update stock
```

**Review Endpoints**
```
POST /reviews - Create review (authenticated users)
PUT /reviews/:reviewId - Update review
DELETE /reviews/:reviewId - Delete review
GET /reviews/admin/all - Get all reviews (admin only)
```

### Frontend (React)

#### Components
- **Outlet**: Main product browsing page with filters
- **ItemInfo**: Detailed product page with reviews
- **InventoryManagement**: Admin dashboard for inventory control

#### Features
- Responsive design following existing project theme
- Real-time search and filtering
- Pagination
- Modal forms for admin operations
- Integration with existing authentication system
- Error handling and loading states

## Database Schema

### InventoryItem
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required, min: 0),
  category: String (enum: categories),
  size: [String] (required),
  color: [String] (required),
  stock: Number (required, min: 0),
  imageUrl: String (required),
  brand: String (required),
  material: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Review
```javascript
{
  itemId: ObjectId (ref: InventoryItem),
  userId: ObjectId (ref: User),
  username: String,
  rating: Number (1-5),
  title: String (max: 100),
  comment: String (max: 500),
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## Installation & Setup

### 1. Backend Setup
```bash
cd backend
npm install
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Database Seeding
```bash
cd backend
node seedInventory.js
```

### 4. Start the Application
```bash
# Backend (from backend directory)
npm start

# Frontend (from frontend directory)
npm start
```

## Usage

### For Customers
1. Navigate to `/outlet` to browse products
2. Use filters to find specific items
3. Click on any product card to view details
4. Select size, color, and quantity
5. Add items to cart
6. Leave reviews for purchased items

### For Admins
1. Login with admin credentials
2. Navigate to `/inventoryManagement`
3. Use the "Add New Item" button to create products
4. Edit existing items using the edit button
5. Manage stock levels
6. View and manage customer reviews

## Integration with Existing System

### Authentication
- Uses existing `AuthGuard` system
- Admin-only routes protected with `ProtectedRoute`
- User authentication required for reviews

### Cart Integration
- "Add to Cart" functionality ready for integration
- Compatible with existing `OrderManagement` system
- Uses same styling and theme as existing components

### Navigation
- Added "Outlet" link to main navigation
- Integrated with existing routing system
- Follows existing design patterns

## Styling & Theming

The system follows the existing project's design language:
- Dark gradient headers
- Consistent button styling
- Responsive design
- Card-based layouts
- Consistent color scheme
- Mobile-friendly interface

## Security Features

- Input validation on all forms
- SQL injection prevention through Mongoose
- XSS protection
- Authentication required for admin functions
- User authorization for review management

## Performance Optimizations

- Database indexing for search performance
- Pagination to limit data transfer
- Image optimization
- Lazy loading for large lists
- Efficient filtering and sorting

## Future Enhancements

1. **Image Management**
   - Multiple product images
   - Image upload functionality
   - Image optimization

2. **Advanced Features**
   - Bulk import/export
   - Inventory alerts
   - Sales analytics
   - Product variants

3. **Integration**
   - Payment gateway integration
   - Email notifications
   - Social media sharing

## Troubleshooting

### Common Issues

1. **Database Connection**
   - Ensure MongoDB is running
   - Check connection string in `app.js`

2. **Image Loading**
   - Verify image URLs are accessible
   - Check CORS settings

3. **Authentication**
   - Ensure user is logged in for admin functions
   - Check user type for admin access

### Error Handling
- All API endpoints include proper error handling
- Frontend displays user-friendly error messages
- Console logging for debugging

## Support

For issues or questions regarding the Inventory Management System:
1. Check the console for error messages
2. Verify database connectivity
3. Ensure all dependencies are installed
4. Check authentication status

---

**Note**: This system is designed to integrate seamlessly with the existing Klassy Shirts project while maintaining the established design patterns and functionality.
