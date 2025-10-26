/* ---- 
   LOGIC RIÊNG CỦA TRANG CUSTOMERS
---- */

document.addEventListener('DOMContentLoaded', function() {
    loadCustomers();
});

function loadCustomers() {
    const customers = db.getCustomers();
    const tableBody = document.getElementById('customers-table-body');
    const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

    tableBody.innerHTML = ''; // Xóa cũ

    if (!customers || customers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Chưa có khách hàng nào.</td></tr>';
        return;
    }

    customers.forEach(customer => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.totalOrders}</td>
            <td>${formatter.format(customer.totalSpent)}</td>
        `;
    });
}