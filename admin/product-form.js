/* ---- 
   LOGIC RIÊNG CỦA TRANG PRODUCT-FORM (BẢN NÂNG CẤP)
   - Hỗ trợ biến thể (name, value, price, stock)
---- */

// Biến toàn cục để lưu trữ ảnh Base64 mới
let newProductImageBase64 = null;

document.addEventListener('DOMContentLoaded', function() {
    
    // Lấy các element quan trọng
    const form = document.getElementById('product-form');
    const imageUpload = document.getElementById('product-image-upload');
    const addVariantBtn = document.getElementById('add-variant-btn');
    const variantsContainer = document.getElementById('variants-container');

    // 1. Tải danh mục vào dropdown
    loadCategories();
    
    // 2. Kiểm tra URL (Thêm mới hay Chỉnh sửa)
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    
    if (productId && productId !== 'new') {
        loadProductData(productId);
    } else {
        document.getElementById('form-title').innerText = 'Thêm Sản phẩm Mới';
        document.getElementById('product-id').value = 'new';
        document.getElementById('image-preview').src = 'https://via.placeholder.com/150';
    }

    // 3. Gán sự kiện cho form
    imageUpload.addEventListener('change', handleImagePreview);
    addVariantBtn.addEventListener('click', () => addVariantRow()); // Thêm hàng rỗng
    
    // Xóa biến thể (dùng event delegation)
    variantsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-variant-btn')) {
            e.target.closest('.variant-item').remove();
        }
    });

    // Xử lý khi bấm LƯU (Submit)
    form.addEventListener('submit', submitForm);
});


/**
 * Tải danh mục cho dropdown
 */
function loadCategories() {
    try {
        const categories = db.getCategories();
        const selectBox = document.getElementById('product-category');
        selectBox.innerHTML = '<option value="">-- Chọn danh mục --</option>'; 
        
        categories.forEach(cat => {
            selectBox.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
    } catch(e) {
        console.error("Lỗi khi tải danh mục:", e);
    }
}

/**
 * Tải dữ liệu sản phẩm vào form khi "Sửa"
 * @param {string} productId - ID của sản phẩm
 */
function loadProductData(productId) {
    const product = db.getProductById(productId);
    
    if (!product) {
        alert('Không tìm thấy sản phẩm!');
        window.location.href = 'products.html';
        return;
    }

    // Cập nhật tiêu đề và ID
    document.getElementById('form-title').innerText = `Cập nhật Sản phẩm (ID: ${productId})`;
    document.getElementById('product-id').value = product.id;

    // Đổ dữ liệu text (giá và tồn kho gốc)
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-price').value = product.price; // Giá gốc
    document.getElementById('product-stock').value = product.stock; // Tồn kho gốc (tổng)
    
    // Đặt ảnh
    const currentImage = product.image || 'https://via.placeholder.com/150';
    document.getElementById('image-preview').src = currentImage;
    document.getElementById('product-image-old').value = currentImage; 

    // Đặt danh mục
    setTimeout(() => {
        document.getElementById('product-category').value = product.category;
    }, 100); 

    // Đổ dữ liệu biến thể (NÂNG CẤP)
    if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach(variant => {
            // Truyền cả 4 giá trị
            addVariantRow(variant.name, variant.value, variant.price, variant.stock);
        });
    }
}

/**
 * Xử lý khi chọn file ảnh: Đọc và hiển thị preview
 * @param {Event} event - Sự kiện 'change' từ input file
 */
function handleImagePreview(event) {
    const file = event.target.files[0];
    if (!file) {
        newProductImageBase64 = null; 
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('image-preview').src = e.target.result;
        newProductImageBase64 = e.target.result; 
    };
    reader.onerror = function(e) {
        console.error("Lỗi đọc file:", e);
        newProductImageBase64 = null;
    };
    reader.readAsDataURL(file); 
}

/**
 * Thêm một hàng nhập biến thể vào DOM (NÂNG CẤP)
 * @param {string} [name=''] - Tên biến thể (ví dụ: Màu)
 * @param {string} [value=''] - Giá trị (ví dụ: Đen)
 * @param {number} [price=0] - Giá của biến thể
 * @param {number} [stock=0] - Tồn kho của biến thể
 */
function addVariantRow(name = '', value = '', price = 0, stock = 0) {
    const container = document.getElementById('variants-container');
    const newItem = document.createElement('div');
    newItem.className = 'variant-item';
    
    // Thêm 4 input: name, value, price, stock
    // ĐÃ THÊM PLACEHOLDER RÕ RÀNG
    newItem.innerHTML = `
        <input type="text" placeholder="Tên (ví dụ: Màu)" class="variant-name" value="${name}">
        <input type="text" placeholder="Giá trị (ví dụ: Đen)" class="variant-value" value="${value}">
        <input type="number" placeholder="Giá" class="variant-price" value="${price || 0}">
        <input type="number" placeholder="Tồn kho" class="variant-stock" value="${stock || 0}">
        <button type="button" class="btn btn-accent btn-small remove-variant-btn">Xóa</button>
    `;
    
    container.appendChild(newItem);
}

/**
 * Thu thập và Lưu toàn bộ dữ liệu form (NÂNG CẤP)
 * @param {Event} event - Sự kiện 'submit'
 */
function submitForm(event) {
    event.preventDefault(); 
    
    // 1. Thu thập Biến thể (NÂNG CẤP)
    const variants = [];
    document.querySelectorAll('.variant-item').forEach(item => {
        const name = item.querySelector('.variant-name').value.trim();
        const value = item.querySelector('.variant-value').value.trim();
        const price = parseInt(item.querySelector('.variant-price').value, 10) || 0;
        const stock = parseInt(item.querySelector('.variant-stock').value, 10) || 0;
        
        if (name && value) {
            variants.push({ name, value, price, stock });
        }
    });

    // 2. Xác định ảnh để lưu
    let imageToSave = document.getElementById('product-image-old').value; 
    if (newProductImageBase64) {
        imageToSave = newProductImageBase64; 
    }

    // 3. Thu thập dữ liệu chính
    const productData = {
        id: document.getElementById('product-id').value, 
        name: document.getElementById('product-name').value,
        price: parseInt(document.getElementById('product-price').value, 10), // Giá gốc
        stock: parseInt(document.getElementById('product-stock').value, 10), // Tồn kho gốc
        category: document.getElementById('product-category').value,
        description: document.getElementById('product-description').value,
        image: imageToSave, 
        variants: variants // Lưu mảng biến thể đã nâng cấp
    };
    
    // Ghi chú: File db.js đã tự động tính tổng tồn kho từ biến thể
    // và ghi đè vào product.stock khi lưu.

    if (productData.id === 'new') {
        productData.id = null;
    }

    // 4. Gọi DB để lưu
    try {
        db.saveProduct(productData);
        alert(`Đã lưu sản phẩm: ${productData.name}!`);
        window.location.href = 'products.html'; 
    } catch (e) {
        console.error("Lỗi khi lưu sản phẩm:", e);
        alert("Có lỗi xảy ra, không thể lưu sản phẩm.");
    }
}