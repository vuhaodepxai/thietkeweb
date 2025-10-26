/* ---- 
   LOGIC RIÊNG CỦA TRANG ORDER-DETAIL
---- */

const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
let currentOrderId = null;

document.addEventListener('DOMContentLoaded', function() {
    // 1. Lấy ID từ URL
    const params = new URLSearchParams(window.location.search);
    currentOrderId = params.get('id');

    if (!currentOrderId) {
        alert('Không tìm thấy ID đơn hàng!');
        window.location.href = 'orders.html';
        return;
    }

    // 2. Lấy dữ liệu từ DB
    const order = db.getOrderById(currentOrderId);

    if (!order) {
        alert('Không tìm thấy đơn hàng!');
        window.location.href = 'orders.html';
        return;
    }

    // 3. Đổ dữ liệu ra
    loadOrderDetails(order);

    // 4. Gán sự kiện cho nút Cập nhật
    document.getElementById('update-status-btn').addEventListener('click', updateStatus);
});

function loadOrderDetails(order) {
    document.getElementById('order-title').innerText = `Chi tiết Đơn hàng: #${order.id}`;
    document.getElementById('current-status').innerText = order.status;
    document.getElementById('current-status').className = `status-${order.status}`;
    document.getElementById('update-status').value = order.status;

    // 4. Thông tin khách
    document.getElementById('customer-info').innerHTML = `
        <p><strong>Tên Khách hàng:</strong> ${order.customerName}</p>
        <p><strong>Địa chỉ giao:</strong> ${order.shippingAddress}</p>
        <p><strong>Thanh toán:</strong> ${order.paymentMethod}</p>
    `;

    // 5. Danh sách sản phẩm
    const itemsTable = document.getElementById('order-items-table').getElementsByTagName('tbody')[0];
    itemsTable.innerHTML = ''; // Xóa cũ
    
    order.items.forEach(item => {
        const row = itemsTable.insertRow();
        row.innerHTML = `
            <td>${item.name} (ID: ${item.productId})</td>
            <td>${item.quantity}</td>
            <td>${formatter.format(item.price)}</td>
            <td>${formatter.format(item.price * item.quantity)}</td>
        `;
    });
    // Thêm hàng Tổng cộng
    const totalRow = itemsTable.insertRow();
    totalRow.innerHTML = `<td colspan="3" style="text-align: right; font-weight: bold;">TỔNG CỘNG</td><td style="font-weight: bold; color: var(--accent);">${formatter.format(order.total)}</td>`;
}

function updateStatus() {
    const newStatus = document.getElementById('update-status').value;
    if (confirm(`Bạn có chắc muốn cập nhật trạng thái đơn hàng #${currentOrderId} thành "${newStatus}"?`)) {
        
        // Cập nhật trong DB giả
        db.updateOrderStatus(currentOrderId, newStatus);
        
        // Cập nhật giao diện
        document.getElementById('current-status').innerText = newStatus;
        document.getElementById('current-status').className = `status-${newStatus}`;
        
        alert('Cập nhật trạng thái thành công!');
    }
}