/* ---- 
   LOGIC RIÊNG CỦA TRANG PRODUCTS (ĐÃ SỬA LỖI LỆCH CỘT)
   - Đảm bảo 8 <td> khớp 8 <th>
---- */

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

/**
 * Tải danh sách sản phẩm
 */
function loadProducts() {
    const products = db.getProducts(); 
    const tableBody = document.getElementById('product-table-body');
    
    // Lấy danh mục để map ID sang Tên
    const categories = db.getCategories();
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    tableBody.innerHTML = ''; 

    if (!products || products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Chưa có sản phẩm nào.</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.id = `product-row-${product.id}`; 
        
        // Hiển thị giá gốc của sản phẩm
        const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
        
        // Lấy tên danh mục
        const categoryName = categoryMap.get(product.category) || product.category;
        
        // Đếm số biến thể
        const variantsCount = (product.variants && Array.isArray(product.variants)) ? product.variants.length : 0;
        
        // Kiểm tra ảnh
        const imageUrl = product.image || 'https://via.placeholder.com/150';

        // PHẦN SỬA LỖI: Chuỗi innerHTML phải có 8 <td>
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${priceFormatted}</td>
            <td>${product.stock}</td>
            <td>${categoryName}</td>
            <td>${variantsCount}</td> <td class="action-buttons"> <a href="product-form.html?id=${product.id}" class="btn btn-success">Sửa</a>
                <button class="btn btn-accent" onclick="deleteProduct('${product.id}', '${product.name}')">Xóa</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Xóa sản phẩm
 * @param {string} productId - ID sản phẩm
 * @param {string} productName - Tên sản phẩm
 */
function deleteProduct(productId, productName) {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}" (ID: ${productId}) không?`)) {
        
        db.deleteProduct(productId);
        
        const row = document.getElementById(`product-row-${productId}`);
        if (row) {
            row.remove(); 
        }
        
        alert(`Đã xóa sản phẩm ${productName}!`);
        
        const tableBody = document.getElementById('product-table-body');
        if (tableBody.children.length === 0) {
            loadProducts(); 
        }
    }
}