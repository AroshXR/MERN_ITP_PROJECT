import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../AuthGuard/AuthGuard";
import "./OrderSummaryPage.css";
import { useNavigate } from "react-router-dom";
const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

// Compute total for a single order from Orders collection
const computeOrderTotal = (order) => {
    // In Orders model, Price is stored as the total per order
    if (order.Price !== undefined && order.Price !== null) {
        return toNumber(order.Price);
    }
    // Fallbacks for safety
    if (order.price !== undefined && order.price !== null) {
        return toNumber(order.price);
    }
    if (order.total !== undefined && order.total !== null) {
        return toNumber(order.total);
    }
    return 0;
};

const computeSummary = (orders) => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + computeOrderTotal(order), 0);
    const completedOrders = orders.filter(
        (o) => (o.status || "").toLowerCase() === "completed"
    ).length;
    const pendingOrders = orders.filter((o) =>
        ["pending", "processing"].includes((o.status || "").toLowerCase())
    ).length;
    const cancelledOrders = orders.filter((o) =>
        ["cancelled", "canceled", "failed"].includes(
            (o.status || "").toLowerCase()
        )
    ).length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completedOrders,
        pendingOrders,
        cancelledOrders,
    };
};

const formatCurrency = (value) =>
    new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
    }).format(value);

const toDateOnly = (d) => {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export default function OrderSummaryPage() {
    const { getToken } = useAuth?.() || {};

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportGenerated, setReportGenerated] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError("");
            try {
                const token = typeof getToken === "function" ? getToken() : null;
                const response = await axios.get("http://localhost:5001/orders", {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                const list = Array.isArray(response.data?.data)
                    ? response.data.data
                    : Array.isArray(response.data?.orders)
                        ? response.data.orders
                        : Array.isArray(response.data)
                            ? response.data
                            : [];
                setOrders(list);
            } catch (err) {
                setError("Failed to load orders.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const overall = useMemo(() => computeSummary(orders), [orders]);

    const filteredOrders = useMemo(() => {
        if (!startDate && !endDate) return orders;
        const start = startDate ? toDateOnly(startDate) : null;
        const end = endDate ? toDateOnly(endDate) : null;
        return orders.filter((o) => {
            const orderDate = toDateOnly(
                o.createdAt || o.orderDate || o.date || o.created_on || o.CreatedAt
            );
            if (!orderDate) return false;
            if (start && orderDate < start) return false;
            if (end) {
                const endInclusive = new Date(
                    end.getFullYear(),
                    end.getMonth(),
                    end.getDate(),
                    23,
                    59,
                    59,
                    999
                );
                if (orderDate > endInclusive) return false;
            }
            return true;
        });
    }, [orders, startDate, endDate]);

    const filteredSummary = useMemo(
        () => computeSummary(filteredOrders),
        [filteredOrders]
    );

    const handleGenerateReport = () => {
        setReportGenerated(true);
    };

    const handleDownloadCSV = () => {
        const header = [
            "Report From",
            "Report To",
            "Total Orders",
            "Total Revenue",
            "Average Order Value",
            "Completed",
            "Pending",
            "Cancelled",
        ];
        const summaryRow = [
            startDate || "-",
            endDate || "-",
            filteredSummary.totalOrders,
            filteredSummary.totalRevenue,
            filteredSummary.averageOrderValue,
            filteredSummary.completedOrders,
            filteredSummary.pendingOrders,
            filteredSummary.cancelledOrders,
        ];

        const orderHeader = ["Order ID", "Customer", "Status", "Total", "Date"];
        const orderRows = filteredOrders.map((o) => [
            o.id || o._id || o.OrderID || "",
            o.CustomerName ||
            o.customerName ||
            o.customer ||
            (o.deliveryDetails && 
                (o.deliveryDetails.firstName && o.deliveryDetails.lastName
                    ? `${o.deliveryDetails.firstName} ${o.deliveryDetails.lastName}`
                    : o.deliveryDetails.email)) ||
            (o.AdminID && typeof o.AdminID === 'object' &&
                (o.AdminID.firstName && o.AdminID.lastName
                    ? `${o.AdminID.firstName} ${o.AdminID.lastName}`
                    : o.AdminID.email)) ||
            (o.userId &&
                (o.userId.firstName && o.userId.lastName
                    ? `${o.userId.firstName} ${o.userId.lastName}`
                    : o.userId.email)) ||
            o.user?.name ||
            o.user?.email ||
            "",
            o.status || "",
            computeOrderTotal(o),
            o.createdAt || o.orderDate || o.date || o.CreatedAt || "",
        ]);

        const escapeCsv = (value) => {
            if (value == null) return "";
            const str = String(value);
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        };

        const csvParts = [];
        csvParts.push(header.map(escapeCsv).join(","));
        csvParts.push(summaryRow.map(escapeCsv).join(","));
        csvParts.push("");
        csvParts.push(orderHeader.map(escapeCsv).join(","));
        orderRows.forEach((row) => csvParts.push(row.map(escapeCsv).join(",")));

        const csvContent = csvParts.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const fileName = `order-summary-${startDate || "all"}-to-${endDate || "all"
            }.csv`;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadPDF = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        
        // Get the current report data
        const reportData = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order Summary Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { color: #2980b9; margin-bottom: 10px; }
                    .summary-section { margin-bottom: 30px; }
                    .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .summary-table th, .summary-table td { 
                        border: 1px solid #ddd; 
                        padding: 8px; 
                        text-align: left; 
                    }
                    .summary-table th { background-color: #3498db; color: white; }
                    .orders-table { width: 100%; border-collapse: collapse; }
                    .orders-table th, .orders-table td { 
                        border: 1px solid #ddd; 
                        padding: 6px; 
                        text-align: left; 
                        font-size: 12px;
                    }
                    .orders-table th { background-color: #2980b9; color: white; }
                    .status-completed { color: #27ae60; font-weight: bold; }
                    .status-pending { color: #f39c12; font-weight: bold; }
                    .status-cancelled { color: #e74c3c; font-weight: bold; }
                    .status-canceled { color: #e74c3c; font-weight: bold; }
                    .status-failed { color: #e74c3c; font-weight: bold; }
                    .status-processing { color: #f39c12; font-weight: bold; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Order Summary Report</h1>
                    <p><strong>Report Period:</strong> ${startDate || "All"} - ${endDate || "All"}</p>
                    <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="summary-section">
                    <h2>Summary</h2>
                    <table class="summary-table">
                        <tr>
                            <th>Metric</th>
                            <th>Value</th>
                        </tr>
                        <tr>
                            <td>Total Orders</td>
                            <td>${filteredSummary.totalOrders}</td>
                        </tr>
                        <tr>
                            <td>Total Revenue</td>
                            <td>${formatCurrency(filteredSummary.totalRevenue)}</td>
                        </tr>
                        <tr>
                            <td>Average Order Value</td>
                            <td>${formatCurrency(filteredSummary.averageOrderValue)}</td>
                        </tr>
                        <tr>
                            <td>Completed Orders</td>
                            <td>${filteredSummary.completedOrders}</td>
                        </tr>
                        <tr>
                            <td>Pending Orders</td>
                            <td>${filteredSummary.pendingOrders}</td>
                        </tr>
                        <tr>
                            <td>Cancelled Orders</td>
                            <td>${filteredSummary.cancelledOrders}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="orders-section">
                    <h2>Order Details</h2>
                    <table class="orders-table">
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
                            ${filteredOrders.map((o) => `
                                <tr>
                                    <td>${o.id || o._id || o.OrderID || ""}</td>
                                    <td>${
                                        o.CustomerName ||
                                        o.customerName ||
                                        o.customer ||
                                        (o.deliveryDetails && 
                                            (o.deliveryDetails.firstName && o.deliveryDetails.lastName
                                                ? `${o.deliveryDetails.firstName} ${o.deliveryDetails.lastName}`
                                                : o.deliveryDetails.email)) ||
                                        (o.AdminID && typeof o.AdminID === 'object' &&
                                            (o.AdminID.firstName && o.AdminID.lastName
                                                ? `${o.AdminID.firstName} ${o.AdminID.lastName}`
                                                : o.AdminID.email)) ||
                                        (o.userId &&
                                            (o.userId.firstName && o.userId.lastName
                                                ? `${o.userId.firstName} ${o.userId.lastName}`
                                                : o.userId.email)) ||
                                        o.user?.name ||
                                        o.user?.email ||
                                        ""
                                    }</td>
                                    <td class="status-${String(o.status || "").toLowerCase()}">${o.status || ""}</td>
                                    <td>${formatCurrency(computeOrderTotal(o))}</td>
                                    <td>${o.createdAt || o.orderDate || o.date || o.CreatedAt || ""}</td>
                                </tr>
                            `).join('')}
                            ${!filteredOrders.length ? `
                                <tr>
                                    <td colspan="5" style="text-align: center; font-style: italic;">
                                        No orders for the selected period.
                                    </td>
                                </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(reportData);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print dialog
        printWindow.onload = () => {
            printWindow.print();
        };
    };

    return (
        <div className="orderSummaryPage">
            <header className="header">
                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
                <div className="header-content">
                    <h1>Order Summary</h1>
                    <p>Generate a summary report of your orders</p>
                </div>
            </header>


            {loading && <div className="state">Loading orders...</div>}
            {!loading && error && <div className="state error">{error}</div>}

            {!loading && !error && (
                <>
                    <section className="summaryGrid">
                        <div className="card">
                            <h3>Total Orders</h3>
                            <p>{overall.totalOrders}</p>
                        </div>
                        <div className="card">
                            <h3>Total Revenue</h3>
                            <p>{formatCurrency(overall.totalRevenue)}</p>
                        </div>
                        <div className="card">
                            <h3>Average Value</h3>
                            <p>{formatCurrency(overall.averageOrderValue)}</p>
                        </div>
                        <div className="card">
                            <h3>Completed</h3>
                            <p>{overall.completedOrders}</p>
                        </div>
                        <div className="card">
                            <h3>Pending</h3>
                            <p>{overall.pendingOrders}</p>
                        </div>
                        <div className="card">
                            <h3>Cancelled</h3>
                            <p>{overall.cancelledOrders}</p>
                        </div>
                    </section>

                    <section className="reportSection">
                        <h2>Generate Report</h2>

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
                                <button className="btn primary" onClick={handleGenerateReport}>
                                    Generate
                                </button>
                                <button
                                    className="btn"
                                    onClick={handleDownloadCSV}
                                    disabled={!filteredOrders.length}
                                >
                                    Download CSV
                                </button>
                                <button
                                    className="btn"
                                    onClick={handleDownloadPDF}
                                    disabled={!filteredOrders.length}
                                >
                                    Download PDF
                                </button>
                            </div>
                        </div>

                        {reportGenerated && (
                            <div className="reportDetails">
                                <div className="reportInfo">
                                    <div>
                                        <span>Period:</span>{" "}
                                        <strong>
                                            {startDate || "All"} - {endDate || "All"}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>Total Orders:</span>{" "}
                                        <strong>{filteredSummary.totalOrders}</strong>
                                    </div>
                                    <div>
                                        <span>Total Revenue:</span>{" "}
                                        <strong>{formatCurrency(filteredSummary.totalRevenue)}</strong>
                                    </div>
                                    <div>
                                        <span>Average Value:</span>{" "}
                                        <strong>
                                            {formatCurrency(filteredSummary.averageOrderValue)}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>Completed:</span>{" "}
                                        <strong>{filteredSummary.completedOrders}</strong>
                                    </div>
                                    <div>
                                        <span>Pending:</span>{" "}
                                        <strong>{filteredSummary.pendingOrders}</strong>
                                    </div>
                                    <div>
                                        <span>Cancelled:</span>{" "}
                                        <strong>{filteredSummary.cancelledOrders}</strong>
                                    </div>
                                </div>

                                <div className="tableWrapper">
                                    <table className="orderTable">
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
                                                    <td>
                                                        {o.CustomerName ||
                                                        o.customerName ||
                                                        o.customer ||
                                                        (o.deliveryDetails && 
                                                            (o.deliveryDetails.firstName && o.deliveryDetails.lastName
                                                                ? `${o.deliveryDetails.firstName} ${o.deliveryDetails.lastName}`
                                                                : o.deliveryDetails.email)) ||
                                                        (o.AdminID && typeof o.AdminID === 'object' &&
                                                            (o.AdminID.firstName && o.AdminID.lastName
                                                                ? `${o.AdminID.firstName} ${o.AdminID.lastName}`
                                                                : o.AdminID.email)) ||
                                                        (o.userId &&
                                                            (o.userId.firstName && o.userId.lastName
                                                                ? `${o.userId.firstName} ${o.userId.lastName}`
                                                                : o.userId.email)) ||
                                                        o.user?.name ||
                                                        o.user?.email ||
                                                        "-"}
                                                    </td>
                                                    <td className={`orderStatus ${String(o.status || "").toLowerCase()}`}>
                                                        {o.status || "-"}
                                                    </td>
                                                    <td>{formatCurrency(computeOrderTotal(o))}</td>
                                                    <td>{o.createdAt || o.orderDate || o.date || o.CreatedAt || "-"}</td>
                                                </tr>
                                            ))}
                                            {!filteredOrders.length && (
                                                <tr>
                                                    <td colSpan={5} className="empty">
                                                        No orders for the selected period.
                                                    </td>
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
