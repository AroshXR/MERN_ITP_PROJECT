import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import axios from 'axios';
import { Search, Filter, Grid, List, Star, ShoppingCart } from 'lucide-react';
import './Outlet.css';

const Outlet = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const categories = ['T-Shirts', 'Hoodies', 'Pants', 'Accessories', 'Shoes', 'Dresses', 'Jackets'];
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

    useEffect(() => {
        fetchItems();
    }, [currentPage, sortBy, sortOrder]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 12,
                sortBy,
                sortOrder
            });

            if (searchTerm) params.append('search', searchTerm);
            if (selectedCategory) params.append('category', selectedCategory);
            if (priceRange.min) params.append('minPrice', priceRange.min);
            if (priceRange.max) params.append('maxPrice', priceRange.max);
            if (selectedSize) params.append('size', selectedSize);
            if (selectedColor) params.append('color', selectedColor);

            const response = await axios.get(`http://localhost:5001/inventory?${params}`);
            
            if (response.data.status === 'ok') {
                setItems(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            setError('Failed to fetch items');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchItems();
    };

    const handleFilterReset = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setPriceRange({ min: '', max: '' });
        setSelectedSize('');
        setSelectedColor('');
        setCurrentPage(1);
        fetchItems();
    };

    const handleAddToCart = (item) => {
        // This will integrate with the existing cart system
        // For now, we'll just show an alert
        alert(`Added ${item.name} to cart!`);
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={16}
                    fill={i <= rating ? '#ffc107' : 'none'}
                    color="#ffc107"
                />
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="outlet-container">
                <NavBar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading items...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="outlet-container">
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={fetchItems} className="retry-button">Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="outlet-container">
            <NavBar />
            <div className="outlet-content">
                <div className="outlet-header">
                    <h1>Our Collection</h1>
                    <p>Discover our latest fashion items</p>
                </div>

                {/* Filters Section */}
                <div className="filters-section">
                    <div className="search-filters">
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button onClick={handleSearch} className="search-btn">Search</button>
                        </div>

                        <div className="filter-controls">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            <select
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
                            >
                                <option value="">All Sizes</option>
                                {sizes.map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>

                            <div className="price-range">
                                <input
                                    type="number"
                                    placeholder="Min Price"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="Max Price"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                                />
                            </div>

                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                            >
                                <option value="createdAt-desc">Newest First</option>
                                <option value="createdAt-asc">Oldest First</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Name: A to Z</option>
                                <option value="name-desc">Name: Z to A</option>
                            </select>

                            <div className="view-toggle">
                                <button
                                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid size={20} />
                                </button>
                                <button
                                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <List size={20} />
                                </button>
                            </div>

                            <button onClick={handleFilterReset} className="reset-btn">
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Items Grid/List */}
                <div className={`items-container ${viewMode}`}>
                    {items.length === 0 ? (
                        <div className="empty-state">
                            <p>No items found matching your criteria.</p>
                            <button onClick={handleFilterReset} className="reset-btn">
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item._id} className="item-card">
                                <div className="item-image">
                                    <img src={item.imageUrl} alt={item.name} />
                                    <div className="item-overlay">
                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() => handleAddToCart(item)}
                                        >
                                            <ShoppingCart size={20} />
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                                <div className="item-info">
                                    <h3>{item.name}</h3>
                                    <p className="item-brand">{item.brand}</p>
                                    <p className="item-description">{item.description}</p>
                                    <div className="item-details">
                                        <span className="item-category">{item.category}</span>
                                        <span className="item-price">${item.price}</span>
                                    </div>
                                    <div className="item-colors">
                                        {item.color.slice(0, 3).map((color, index) => (
                                            <span
                                                key={index}
                                                className="color-dot"
                                                style={{ backgroundColor: color.toLowerCase() }}
                                                title={color}
                                            />
                                        ))}
                                        {item.color.length > 3 && (
                                            <span className="more-colors">+{item.color.length - 3}</span>
                                        )}
                                    </div>
                                    <div className="item-sizes">
                                        {item.size.slice(0, 4).map((size, index) => (
                                            <span key={index} className="size-tag">{size}</span>
                                        ))}
                                        {item.size.length > 4 && (
                                            <span className="more-sizes">+{item.size.length - 4}</span>
                                        )}
                                    </div>
                                    <div className="item-stock">
                                        {item.stock > 0 ? (
                                            <span className="in-stock">In Stock ({item.stock})</span>
                                        ) : (
                                            <span className="out-of-stock">Out of Stock</span>
                                        )}
                                    </div>
                                </div>
                                <Link to={`/outlet/${item._id}`} className="item-link">
                                    View Details
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                            >
                                {page}
                            </button>
                        ))}
                        
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Outlet;