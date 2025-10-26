/* ---- 
   LOGIC RIÊNG CỦA TRANG ORDERS
---- */

const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

document.addEventListener('DOMContentLoaded', function() {
    // Gán sự kiện cho bộ lọc
    document.getElementById('status-filter').addEventListener('change', loadOrders);
    
    // Tải lần đầu
    loadOrders();
});

function loadOrders() {
    const allOrders = db.getOrders();
    const tableBody = document.getElementById('orders-table-body');
    const filter = document.getElementById('status-filter').value;
    
    tableBody.innerHTML = ''; // Xóa cũ

    const filteredOrders = allOrders.filter(order => {
        return filter === 'all' || order.status === filter;
    });
    
    // Sắp xếp mới nhất lên đầu
    filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredOrders.length === 0) {
         tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Không có đơn hàng nào.</td></tr>';
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
                <a href="order-detail.html?id=${order.id}" class="btn btn-success">Xem</a>
            </td>
        `;
    });
}