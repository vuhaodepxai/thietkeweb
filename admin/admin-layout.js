/* ---- 
   BƯỚC 1: ADMIN-LAYOUT.JS (FILE MỚI)
   File này sẽ tự động chèn Sidebar vào các trang admin
   và tự động kích hoạt link đúng.
---- */
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Lấy tên file HTML hiện tại (ví dụ: "dashboard.html")
    const currentPage = window.location.pathname.split('/').pop();

    // 2. Định nghĩa HTML của Sidebar
    // Chú ý: Chúng ta dùng ${currentPage === '...' ? 'active' : ''}
    // để tự động thêm class 'active'
    const sidebarHTML = `
    <aside class="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
            <ul>
                <li><a href="dashboard.html" 
                       class="${currentPage === 'dashboard.html' ? 'active' : ''}">
                       Dashboard (Tổng quan) [AD-09]
                   </a></li>
                
                <li><a href="orders.html" 
                       class="${(currentPage === 'orders.html' || currentPage === 'order-detail.html') ? 'active' : ''}">
                       Quản lý Đơn hàng [AD-04]
                   </a></li>

                <li><a href="products.html" 
                       class="${(currentPage === 'products.html' || currentPage === 'product-form.html') ? 'active' : ''}">
                       Quản lý Sản phẩm [AD-02]
                   </a></li>

                <li><a href="categories.html" 
                       class="${currentPage === 'categories.html' ? 'active' : ''}">
                       Quản lý Danh mục [AD-03]
                   </a></li>
                
                <li><a href="customers.html" 
                       class="${currentPage === 'customers.html' ? 'active' : ''}">
                       Quản lý Khách hàng [AD-05]
                   </a></li>

                <li><a href="promotions.html" 
                       class="${currentPage === 'promotions.html' ? 'active' : ''}">
                       Quản lý Khuyến mãi [AD-06]
                   </a></li>
                
                <li><a href="interactions.html" 
                       class="${currentPage === 'interactions.html' ? 'active' : ''}">
                       Quản lý Tương tác [AD-08]
                   </a></li>

                <li><a href="#">Đăng xuất</a></li>
            </ul>
        </nav>
    </aside>
    `;

    // 3. Tìm vị trí (placeholder) và chèn Sidebar vào
    const sidebarPlaceholder = document.getElementById('admin-sidebar-placeholder');
    if (sidebarPlaceholder) {
        sidebarPlaceholder.innerHTML = sidebarHTML;
    } else {
        console.error("Không tìm thấy #admin-sidebar-placeholder.");
    }

});