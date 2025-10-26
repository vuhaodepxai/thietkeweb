/* ---- 
   LOGIC RIÊNG CỦA TRANG DASHBOARD
   (Đã sửa lỗi màu sắc cho khớp với CSS)
---- */

// Định nghĩa màu sắc từ CSS (đã sửa cho đúng)
const chartColors = {
    primary: '#cadbd4',     // Màu xanh nhạt (giống --primary trong css)
    secondary: '#2a4dfc',   // Màu xanh dương (giống --secondary trong css)
    accent: '#E03A3C',
    success: '#3DDC84',
    warning: '#FFB347',
    grey: '#E0E0E0'
};

const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

// Code sẽ chạy sau khi 'defer' tải xong
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
    console.error("Hãy kiểm tra xem 'admin-mock-db.js' đã được tải đúng chưa.");
}


// --- Định nghĩa các hàm ---

function updateStatCards(orders, customers, products) {
    // Kiểm tra nếu orders, customers, products không tồn tại (lỗi db)
    if (!orders || !customers || !products) return; 

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
    if (!orders) return;
    const tableBody = document.getElementById('recent-orders-table');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    const recentOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    if (recentOrders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Chưa có đơn hàng nào.</td></tr>';
        return;
    }

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
    if (!orders) return;
    const ctx = document.getElementById('orderStatusChart')?.getContext('2d');
    if (!ctx) return;
    
    const statusCounts = { pending: 0, processing: 0, shipped: 0, completed: 0, cancelled: 0 };
    
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
                    chartColors.warning, // pending
                    chartColors.secondary, // processing (Sửa thành màu xanh dương)
                    '#8A2BE2',          // shipped (màu tím)
                    chartColors.success, // completed
                    chartColors.accent    // cancelled
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
    if (!orders) return;
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
                backgroundColor: chartColors.primary, // Sửa thành màu xanh nhạt
                borderColor: chartColors.secondary, // Sửa thành màu xanh dương
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