/* ---- 
   ADMIN-LAYOUT.JS (Đã thêm Icon)
---- */
document.addEventListener('DOMContentLoaded', function() {
    
    const currentPage = window.location.pathname.split('/').pop();

    // Đã thêm thẻ <i class="..."></i> vào trước mỗi link
    const sidebarHTML = `
    <aside class="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
            <ul>
                <li><a href="dashboard.html" 
                       class="${currentPage === 'dashboard.html' ? 'active' : ''}">
                       <i class="fas fa-tachometer-alt"></i> Dashboard 
                   </a></li>
                
                <li><a href="orders.html" 
                       class="${(currentPage === 'orders.html' || currentPage === 'order-detail.html') ? 'active' : ''}">
                       <i class="fas fa-box-open"></i> Quản lý Đơn hàng 
                   </a></li>

                <li><a href="products.html" 
                       class="${(currentPage === 'products.html' || currentPage === 'product-form.html') ? 'active' : ''}">
                       <i class="fas fa-shopping-bag"></i> Quản lý Sản phẩm 
                   </a></li>

                <li><a href="categories.html" 
                       class="${currentPage === 'categories.html' ? 'active' : ''}">
                       <i class="fas fa-sitemap"></i> Quản lý Danh mục 
                   </a></li>
                
                <li><a href="customers.html" 
                       class="${currentPage === 'customers.html' ? 'active' : ''}">
                       <i class="fas fa-users"></i> Quản lý Khách hàng 
                   </a></li>

                <li><a href="promotions.html" 
                       class="${currentPage === 'promotions.html' ? 'active' : ''}">
                       <i class="fas fa-tags"></i> Quản lý Khuyến mãi 
                   </a></li>
                
                <li><a href="interactions.html" 
                       class="${currentPage === 'interactions.html' ? 'active' : ''}">
                       <i class="fas fa-comments"></i> Quản lý Tương tác 
                   </a></li>

               
                <li><a href="#">
                        <i class="fas fa-sign-out-alt"></i> Đăng xuất
                    </a></li>
            </ul>
        </nav>
    </aside>
    `;

    const sidebarPlaceholder = document.getElementById('admin-sidebar-placeholder');
    if (sidebarPlaceholder) {
        sidebarPlaceholder.innerHTML = sidebarHTML;
    } else {
        console.error("Không tìm thấy #admin-sidebar-placeholder.");
    }

});