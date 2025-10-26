/* ---- 
   LOGIC RIÊNG CỦA TRANG ORDERS
   (Đã thêm icon Xem <0xF0><0x9F><0x91><0x8F>️)
---- */

const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

document.addEventListener('DOMContentLoaded', function() {
    // Gán sự kiện cho bộ lọc
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', loadOrders);
    }
    
    // Tải lần đầu
    loadOrders();
});

function loadOrders() {
    const allOrders = db.getOrders();
    const tableBody = document.getElementById('orders-table-body');
    const filterSelect = document.getElementById('status-filter');
    const filter = filterSelect ? filterSelect.value : 'all'; // Lấy giá trị lọc
    
    if (!tableBody) {
        console.error("Không tìm thấy tbody với ID 'orders-table-body'");
        return; 
    }
    
    tableBody.innerHTML = ''; // Xóa cũ

    const filteredOrders = allOrders.filter(order => {
        return filter === 'all' || order.status === filter;
    });
    
    // Sắp xếp mới nhất lên đầu
    filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredOrders.length === 0) {
         tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Không có đơn hàng nào khớp.</td></tr>';
         return;
    }

    filteredOrders.forEach(order => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customerName}</td>
            <td>${new Date(order.date).toLocaleString('vi-VN')}</td>
            <td>${formatter.format(order.total)}</td>
            <td><span class="status-${order.status}">${order.status}</span></td>
            <td class="action-buttons">
                <a href="order-detail.html?id=${order.id}" class="btn btn-success btn-small" title="Xem chi tiết đơn hàng">
                    <i class="fas fa-eye"></i> Xem
                </a>
                </td>
        `;
    });
}

// (Optional) Bạn có thể thêm hàm cancelOrder nếu muốn
/*
function cancelOrder(orderId) {
    if (confirm(`Bạn có chắc muốn HỦY đơn hàng ${orderId}? Hành động này không thể hoàn tác.`)) {
        db.updateOrderStatus(orderId, 'cancelled');
        loadOrders(); // Tải lại danh sách
        alert(`Đã hủy đơn hàng ${orderId}.`);
    }
}
*/