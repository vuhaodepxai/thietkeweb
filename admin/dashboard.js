/* ---- 
   LOGIC RIÊNG CỦA TRANG DASHBOARD
---- */

// Định nghĩa màu sắc từ CSS để dùng trong Chart
const chartColors = {
    primary: '#3CE0DD',
    secondary: '#0E3D40',
    accent: '#E03A3C',
    success: '#3DDC84',
    warning: '#FFB347',
    grey: '#E0E0E0'
};

const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

// Chạy code khi DOM đã sẵn sàng (dùng defer nên không cần DOMContentLoaded)
try {
    const orders = db.getOrders();
    const customers = db.getCustomers();
    const products = db.getProducts();

    updateStatCards(orders, customers, products);
    updateRecentOrders(orders);
    renderOrderStatusChart(orders);
    renderRevenueChart(orders);
} catch (e) {
    console.error("Lỗi khi tải dữ liệu Dashboard:", e);
    alert("Không thể tải dữ liệu Dashboard. Vui lòng reset DB (db.resetDatabase()) và thử lại.");
}


// --- Định nghĩa các hàm ---

function updateStatCards(orders, customers, products) {
    const totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0);
    
    const newOrdersCount = orders.filter(o => o.status === 'pending').length;

    document.getElementById('stat-revenue').innerText = formatter.format(totalRevenue);
    document.getElementById('stat-new-orders').innerText = newOrdersCount;
    document.getElementById('stat-customers').innerText = customers.length;
    document.getElementById('stat-products').innerText = products.length;
}

function updateRecentOrders(orders) {
    const tableBody = document.getElementById('recent-orders-table');
    if (!tableBody) return; // Thoát nếu không tìm thấy
    
    tableBody.innerHTML = ''; // Xóa cũ
    const recentOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    recentOrders.forEach(order => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td><a href="order-detail.html?id=${order.id}">${order.id}</a></td>
            <td>${order.customerName}</td>
            <td>${new Date(order.date).toLocaleDateString('vi-VN')}</td>
            <td>${formatter.format(order.total)}</td>
            <td><span class="status-${order.status}">${order.status}</span></td>
        `;
    });
}

function renderOrderStatusChart(orders) {
    const ctx = document.getElementById('orderStatusChart')?.getContext('2d');
    if (!ctx) return; // Thoát nếu không có canvas
    
    const statusCounts = {
        pending: 0, processing: 0, shipped: 0, completed: 0, cancelled: 0
    };
    
    orders.forEach(order => {
        if(statusCounts.hasOwnProperty(order.status)) {
            statusCounts[order.status]++;
        }
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'],
            datasets: [{
                label: 'Số lượng đơn',
                data: [
                    statusCounts.pending,
                    statusCounts.processing,
                    statusCounts.shipped,
                    statusCounts.completed,
                    statusCounts.cancelled
                ],
                backgroundColor: [
                    chartColors.warning, chartColors.primary, '#8A2BE2', chartColors.success, chartColors.accent
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function renderRevenueChart(orders) {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (!ctx) return;
    
    const revenueByDay = {}; 
    const completedOrders = orders.filter(o => o.status === 'completed');

    completedOrders.forEach(order => {
        const date = new Date(order.date).toLocaleDateString('vi-VN');
        if (!revenueByDay[date]) revenueByDay[date] = 0;
        revenueByDay[date] += order.total;
    });

    const labels = Object.keys(revenueByDay);
    const data = Object.values(revenueByDay);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu (VND)',
                data: data,
                backgroundColor: chartColors.primary,
                borderColor: chartColors.secondary,
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) { return value / 1000000 + ' Tr'; }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) { return formatter.format(context.parsed.y); }
                    }
                }
            }
        }
    });
}