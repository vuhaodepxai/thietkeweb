/* ---- 
   LOGIC RIÊNG CỦA TRANG PRODUCTS 
   (Đã nâng cấp Lọc Danh mục Cha/Con)
---- */

document.addEventListener('DOMContentLoaded', function() {
    loadCategoryFilter();
    loadProducts();

    // Gán sự kiện cho bộ lọc và tìm kiếm
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    if (searchInput) {
        searchInput.addEventListener('input', loadProducts);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', loadProducts);
    }
});

/**
 * (ĐÃ SỬA) Tải danh mục vào ô select lọc (có phân cấp)
 */
function loadCategoryFilter() {
    const categories = db.getCategories();
    const selectBox = document.getElementById('category-filter');
    
    selectBox.innerHTML = '<option value="">-- Tất cả Danh mục --</option>'; 

    // Lọc ra danh mục cha (không có parentId)
    const parentCategories = categories.filter(cat => !cat.parentId);
    
    parentCategories.forEach(parentCat => {
        // Thêm danh mục cha
        const parentOption = document.createElement('option');
        parentOption.value = parentCat.id; 
        parentOption.textContent = parentCat.name;
        selectBox.appendChild(parentOption);

        // Tìm và thêm các danh mục con trực tiếp của nó
        const childCategories = categories.filter(childCat => childCat.parentId === parentCat.id);
        childCategories.forEach(childCat => {
            const childOption = document.createElement('option');
            childOption.value = childCat.id;
            // Thêm "-- " để thụt vào cho dễ nhìn
            childOption.textContent = `-- ${childCat.name}`; 
            selectBox.appendChild(childOption);
        });
    });

    // Thêm các danh mục mồ côi (nếu có - ít gặp)
    const orphanCategories = categories.filter(cat => cat.parentId && !categories.some(p => p.id === cat.parentId));
    orphanCategories.forEach(orphanCat => {
         const option = document.createElement('option');
         option.value = orphanCat.id;
         option.textContent = orphanCat.name + " (Mồ côi)"; // Đánh dấu
         selectBox.appendChild(option);
    });
}

/**
 * (ĐÃ SỬA) Tải danh sách sản phẩm (có lọc cha/con)
 */
function loadProducts() {
    const allProducts = db.getProducts(); 
    const tableBody = document.getElementById('product-table-body');
    
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const selectedCategoryId = document.getElementById('category-filter').value;

    const allCategories = db.getCategories(); // Lấy lại danh sách categories
    const categoryMap = new Map(allCategories.map(c => [c.id, c.name]));

    tableBody.innerHTML = ''; 

    // ---- LOGIC LỌC NÂNG CẤP ----
    const filteredProducts = allProducts.filter(product => {
        // 1. Lọc theo tên (giữ nguyên)
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        
        // 2. Lọc theo danh mục (Nâng cấp)
        let categoryMatch = true; // Mặc định là khớp
        if (selectedCategoryId) { // Nếu có chọn danh mục
            // Tìm tất cả ID con trực tiếp của danh mục đã chọn
            const childCategoryIds = allCategories
                .filter(cat => cat.parentId === selectedCategoryId)
                .map(cat => cat.id);
            
            // Danh sách ID hợp lệ bao gồm ID đã chọn và các ID con của nó
            const allowedCategoryIds = [selectedCategoryId, ...childCategoryIds];
            
            // Kiểm tra xem category của sản phẩm có nằm trong danh sách hợp lệ không
            categoryMatch = allowedCategoryIds.includes(product.category); 
        }
        
        // Trả về true nếu khớp cả hai
        return nameMatch && categoryMatch;
    });
    // ---- KẾT THÚC LOGIC LỌC ----


    if (!filteredProducts || filteredProducts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Không tìm thấy sản phẩm nào khớp.</td></tr>';
        return;
    }

    // Hiển thị sản phẩm đã lọc (code hiển thị giữ nguyên)
    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        row.id = `product-row-${product.id}`; 
        
        const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
        const categoryName = categoryMap.get(product.category) || product.category;
        const totalStock = product.stock || 0; 
        const hasVariants = (product.variants && product.variants.length > 0);

        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${priceFormatted}</td>
            <td>${totalStock}</td> 
            <td>${categoryName}</td>
            <td class="action-buttons">
                <button 
                    class="btn btn-secondary btn-small" 
                    onclick="viewVariants('${product.id}')" 
                    ${!hasVariants ? 'disabled' : ''} 
                    title="${hasVariants ? 'Xem chi tiết biến thể' : 'Sản phẩm không có biến thể'}">
                    <i class="fas fa-eye"></i> 
                </button>
                <a href="product-form.html?id=${product.id}" class="btn btn-success btn-small" title="Sửa sản phẩm gốc">
                    <i class="fas fa-edit"></i> 
                </a>
                <button class="btn btn-accent btn-small" onclick="deleteProduct('${product.id}', '${product.name}')" title="Xóa sản phẩm gốc">
                    <i class="fas fa-trash"></i> 
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Hàm viewVariants giữ nguyên
function viewVariants(productId) {
    const product = db.getProductById(productId);
    if (!product || !product.variants || product.variants.length === 0) return;

    const modal = document.getElementById('variant-modal');
    const modalProductName = document.getElementById('modal-product-name');
    const modalDetailsContainer = document.getElementById('modal-variant-details');
    
    modalProductName.textContent = `Biến thể của: ${product.name}`; 
    
    let tableHTML = `<table><thead><tr><th>Tên</th><th>Giá trị</th><th>Giá</th><th>Tồn kho</th></tr></thead><tbody>`;
    const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
    product.variants.forEach(v => {
        tableHTML += `<tr><td>${v.name||'N/A'}</td><td>${v.value||'N/A'}</td><td>${formatter.format(v.price||0)}</td><td>${v.stock||0}</td></tr>`;
    });
    tableHTML += `</tbody></table>`;

    modalDetailsContainer.innerHTML = tableHTML; 
    modal.classList.add('active'); 
}

// Hàm closeVariantModal giữ nguyên
function closeVariantModal() {
    const modal = document.getElementById('variant-modal');
    modal.classList.remove('active'); 
}

// Hàm deleteProduct giữ nguyên
function deleteProduct(productId, productName) {
    if (confirm(`Bạn có chắc muốn xóa sản phẩm gốc "${productName}" (ID: ${productId}) và TẤT CẢ các biến thể của nó không?`)) {
        db.deleteProduct(productId);
        loadProducts(); // Tải lại bảng (đã tự động lọc)
        alert(`Đã xóa sản phẩm ${productName}!`);
    }
}