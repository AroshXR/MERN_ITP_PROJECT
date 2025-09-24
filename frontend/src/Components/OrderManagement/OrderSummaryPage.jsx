import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthGuard/AuthGuard';
import './OrderSummaryPage.css';

// Helper: safe number parsing
const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

// Compute summary metrics from an orders array
const computeSummary = (orders) => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + toNumber(order.totalAmount || order.total || order.amount || (order.orderDetails && order.orderDetails.total)), 0);
    const completedOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'completed').length;
    const pendingOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'pending' || (o.status || '').toLowerCase() === 'processing').length;
    const cancelledOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'cancelled' || (o.status || '').toLowerCase() === 'canceled' || (o.status || '').toLowerCase() === 'failed').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completedOrders,
        pendingOrders,
        cancelledOrders
    };
};

const formatCurrency = (value) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);

const toDateOnly = (d) => {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return null;
    // Normalize to date-only for comparison
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export default function OrderSummaryPage() {
    const { getToken } = useAuth?.() || {};

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportGenerated, setReportGenerated] = useState(false);

    // Fetch all orders once. We compute summaries client-side from the order table data
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError('');
            try {
                const token = typeof getToken === 'function' ? getToken() : null;
                const response = await axios.get('http://localhost:5001/payment', {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined
                });
                const list = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data?.orders) ? response.data.orders : (Array.isArray(response.data) ? response.data : []));
                setOrders(list);
            } catch (err) {
                setError('Failed to load orders.');
                // eslint-disable-next-line no-console
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const overall = useMemo(() => computeSummary(orders), [orders]);

    const filteredOrders = useMemo(() => {
        if (!startDate && !endDate) return orders;
        const start = startDate ? toDateOnly(startDate) : null;
        const end = endDate ? toDateOnly(endDate) : null;
        return orders.filter((o) => {
            const orderDate = toDateOnly(o.createdAt || o.orderDate || o.date || o.created_on || o.CreatedAt);
            if (!orderDate) return false;
            if (start && orderDate < start) return false;
            if (end) {
                // Include end date (treat as end of day)
                const endInclusive = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
                if (orderDate > endInclusive) return false;
            }
            return true;
        });
    }, [orders, startDate, endDate]);

    const filteredSummary = useMemo(() => computeSummary(filteredOrders), [filteredOrders]);

    const handleGenerateReport = () => {
        setReportGenerated(true);
    };

    const handleDownloadCSV = () => {
        // Build a simple CSV containing the summary + each order row in the filtered set
        const header = [
            'Report From', 'Report To', 'Total Orders', 'Total Revenue', 'Average Order Value', 'Completed', 'Pending', 'Cancelled'
        ];
        const summaryRow = [
            startDate || '-',
            endDate || '-',
            filteredSummary.totalOrders,
            filteredSummary.totalRevenue,
            filteredSummary.averageOrderValue,
            filteredSummary.completedOrders,
            filteredSummary.pendingOrders,
            filteredSummary.cancelledOrders
        ];

        const orderHeader = ['Order ID', 'Customer', 'Status', 'Total', 'Date'];
        const orderRows = filteredOrders.map((o) => [
            o.id || o._id || o.OrderID || '',
            (o.customerName || o.customer || (o.userId && (o.userId.firstName && o.userId.lastName ? `${o.userId.firstName} ${o.userId.lastName}` : o.userId.email)) || o.user?.name || o.user?.email || ''),
            o.status || '',
            toNumber(o.totalAmount || o.total || o.amount || (o.orderDetails && o.orderDetails.total)),
            (o.createdAt || o.orderDate || o.date || o.CreatedAt || '')
        ]);

        const escapeCsv = (value) => {
            if (value == null) return '';
            const str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        };

        const csvParts = [];
        csvParts.push(header.map(escapeCsv).join(','));
        csvParts.push(summaryRow.map(escapeCsv).join(','));
        csvParts.push('');
        csvParts.push(orderHeader.map(escapeCsv).join(','));
        orderRows.forEach((row) => csvParts.push(row.map(escapeCsv).join(',')));

        const csvContent = csvParts.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `order-summary-${startDate || 'all'}-to-${endDate || 'all'}.csv`;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="order-summary-page">
            <h1 className="page-title">Order Summary</h1>

            {loading && (
                <div className="state state-loading">Loading orders...</div>
            )}
            {!loading && error && (
                <div className="state state-error">{error}</div>
            )}

            {!loading && !error && (
                <>
                    <section className="summary-grid">
                        <div className="card">
                            <div className="label">Total Orders</div>
                            <div className="value">{overall.totalOrders}</div>
                        </div>
                        <div className="card">
                            <div className="label">Total Revenue</div>
                            <div className="value">{formatCurrency(overall.totalRevenue)}</div>
                        </div>
                        <div className="card">
                            <div className="label">Average Order Value</div>
                            <div className="value">{formatCurrency(overall.averageOrderValue)}</div>
                        </div>
                        <div className="card">
                            <div className="label">Completed</div>
                            <div className="value">{overall.completedOrders}</div>
                        </div>
                        <div className="card">
                            <div className="label">Pending</div>
                            <div className="value">{overall.pendingOrders}</div>
                        </div>
                        <div className="card">
                            <div className="label">Cancelled</div>
                            <div className="value">{overall.cancelledOrders}</div>
                        </div>
                    </section>

                    <section className="report-section">
                        <h2 className="section-title">Generate Order Summary Report</h2>

                        <div className="filters">
                            <div className="field">
                                <label htmlFor="startDate">From</label>
                                <input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="endDate">To</label>
                                <input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div className="actions">
                                <button className="btn primary" onClick={handleGenerateReport}>Generate</button>
                                <button className="btn" onClick={handleDownloadCSV} disabled={!filteredOrders.length}>Download CSV</button>
                            </div>
                        </div>

                        {reportGenerated && (
                            <div className="report">
                                <div className="report-summary">
                                    <div className="row"><span>Period:</span> <strong>{startDate || 'All'} - {endDate || 'All'}</strong></div>
                                    <div className="row"><span>Total Orders:</span> <strong>{filteredSummary.totalOrders}</strong></div>
                                    <div className="row"><span>Total Revenue:</span> <strong>{formatCurrency(filteredSummary.totalRevenue)}</strong></div>
                                    <div className="row"><span>Average Order Value:</span> <strong>{formatCurrency(filteredSummary.averageOrderValue)}</strong></div>
                                    <div className="row"><span>Completed:</span> <strong>{filteredSummary.completedOrders}</strong></div>
                                    <div className="row"><span>Pending:</span> <strong>{filteredSummary.pendingOrders}</strong></div>
                                    <div className="row"><span>Cancelled:</span> <strong>{filteredSummary.cancelledOrders}</strong></div>
                                </div>

                                <div className="table-wrapper">
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Customer</th>
                                                <th>Status</th>
                                                <th>Total</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.map((o) => (
                                                <tr key={o.id || o._id || o.OrderID}>
                                                    <td>{o.id || o._id || o.OrderID}</td>
                                                    <td>{(o.customerName || o.customer || (o.userId && (o.userId.firstName && o.userId.lastName ? `${o.userId.firstName} ${o.userId.lastName}` : o.userId.email)) || o.user?.name || o.user?.email || '-')}</td>
                                                    <td className={`status ${String(o.status || '').toLowerCase()}`}>{o.status || '-'}</td>
                                                    <td>{formatCurrency(toNumber(o.totalAmount || o.total || o.amount || (o.orderDetails && o.orderDetails.total)))}</td>
                                                    <td>{o.createdAt || o.orderDate || o.date || o.CreatedAt || '-'}</td>
                                                </tr>
                                            ))}
                                            {!filteredOrders.length && (
                                                <tr>
                                                    <td colSpan={5} className="empty">No orders for the selected period.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
