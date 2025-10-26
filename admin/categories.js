/* ---- 
   LOGIC RIÊNG CỦA TRANG CATEGORIES
   (Đã thêm Icon vào các nút)
---- */

let allCategories = []; // Biến tạm lưu danh mục

// Gán sự kiện sau khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    loadCategoriesAndDropdown();

    // Gán sự kiện submit cho form
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleSaveCategory);
    }
    
    // Gán sự kiện click cho nút Hủy (nếu không dùng inline onclick)
    // Ví dụ: 
    // const cancelButton = document.querySelector('.btn-secondary[onclick="resetForm()"]');
    // if (cancelButton) {
    //    cancelButton.removeAttribute('onclick'); // Xóa onclick cũ
    //    cancelButton.addEventListener('click', resetForm);
    // }
});

function loadCategoriesAndDropdown() {
    try {
        allCategories = db.getCategories();
    } catch(e) {
        console.error("Lỗi khi lấy danh mục từ DB:", e);
        allCategories = []; // Đảm bảo là mảng rỗng nếu lỗi
    }
    
    const tableBody = document.getElementById('category-table-body');
    const parentSelect = document.getElementById('cat-parent');

    // Kiểm tra element tồn tại
    if (!tableBody || !parentSelect) {
        console.error("Không tìm thấy table body hoặc parent select.");
        return;
    }

    // Reset
    tableBody.innerHTML = '';
    parentSelect.innerHTML = '<option value="null">-- Không có --</option>';

    if (allCategories.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Chưa có danh mục nào.</td></tr>';
        return;
    }
    
    // Tạo map để tra cứu tên danh mục cha
    const categoryMap = new Map(allCategories.map(c => [c.id, c.name]));

    allCategories.forEach(cat => {
        // 1. Thêm vào Bảng
        const row = document.createElement('tr');
        row.id = `cat-row-${cat.id}`;
        // Lấy tên danh mục cha, nếu không có ID hoặc không tìm thấy -> '-'
        const parentName = cat.parentId ? (categoryMap.get(cat.parentId) || '-') : '-';
        
        // SỬA LẠI innerHTML để thêm icon
        row.innerHTML = `
            <td>${cat.id}</td>
            <td>${cat.name}</td>
            <td>${parentName}</td>
            <td class="action-buttons">
                <button class="btn btn-success btn-small" onclick="editCategory('${cat.id}')" title="Sửa danh mục">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="btn btn-accent btn-small" onclick="deleteCategory('${cat.id}', '${cat.name}')" title="Xóa danh mục">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </td>
        `;
        tableBody.appendChild(row);

        // 2. Thêm vào Dropdown (Danh mục cha)
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        parentSelect.appendChild(option);
    });
}

// Xử lý LƯU danh mục
function handleSaveCategory(e) {
    e.preventDefault(); // Ngăn form submit mặc định
    
    const categoryData = {
        id: document.getElementById('category-id').value,
        name: document.getElementById('cat-name').value.trim(), // Trim để xóa khoảng trắng thừa
        parentId: document.getElementById('cat-parent').value === 'null' ? null : document.getElementById('cat-parent').value
    };

    // Kiểm tra tên danh mục không được rỗng
    if (!categoryData.name) {
        alert("Vui lòng nhập tên danh mục.");
        return;
    }

    // Nếu id là 'new' thì xóa đi để DB tự tạo
    if (categoryData.id === 'new') {
        categoryData.id = null;
    }

    try {
        db.saveCategory(categoryData);
        alert(`Đã lưu danh mục "${categoryData.name}"!`);
        
        resetForm(); // Reset form sau khi lưu
        loadCategoriesAndDropdown(); // Tải lại bảng và dropdown
    } catch(e) {
        console.error("Lỗi khi lưu danh mục:", e);
        alert("Có lỗi xảy ra khi lưu danh mục.");
    }
}

// Hàm SỬA danh mục (đổ dữ liệu vào form)
function editCategory(id) {
    const category = allCategories.find(c => c.id === id);
    if (category) {
        document.getElementById('category-id').value = category.id;
        document.getElementById('cat-name').value = category.name;
        // Đặt giá trị cho select, đảm bảo chọn đúng 'null' nếu không có parentId
        document.getElementById('cat-parent').value = category.parentId || 'null'; 
        document.getElementById('category-form-title').innerText = `Sửa Danh mục (ID: ${id})`;
        window.scrollTo(0, 0); // Cuộn lên đầu trang để thấy form
    } else {
        console.warn(`Không tìm thấy danh mục với ID: ${id} để sửa.`);
    }
}

// Hàm XÓA danh mục
function deleteCategory(id, name) {
    // Thêm cảnh báo về danh mục con hoặc sản phẩm liên quan (nếu có logic phức tạp hơn)
    if (confirm(`Bạn có chắc muốn xóa danh mục "${name}"?\nLưu ý: Hành động này không thể hoàn tác.`)) {
        try {
            db.deleteCategory(id);
            loadCategoriesAndDropdown(); // Tải lại bảng và dropdown
        } catch(e) {
            console.error("Lỗi khi xóa danh mục:", e);
            alert("Có lỗi xảy ra khi xóa danh mục.");
        }
    }
}

// Hàm HỦY (reset form về trạng thái thêm mới)
function resetForm() {
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.reset(); // Reset các giá trị input/select
    }
    // Đặt lại các giá trị ẩn và tiêu đề
    document.getElementById('category-id').value = 'new';
    document.getElementById('category-form-title').innerText = 'Thêm Danh mục';
    // Đảm bảo select danh mục cha quay về "-- Không có --"
    document.getElementById('cat-parent').value = 'null'; 
}