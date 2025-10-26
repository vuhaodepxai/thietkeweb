/* ---- 
   LOGIC RIÊNG CỦA TRANG CATEGORIES
---- */

let allCategories = []; // Biến tạm lưu danh mục

document.addEventListener('DOMContentLoaded', function() {
    loadCategoriesAndDropdown();

    // Gán sự kiện cho form
    document.getElementById('category-form').addEventListener('submit', handleSaveCategory);
    document.querySelector('.btn-secondary[onclick="resetForm()"]').addEventListener('click', resetForm);
});

function loadCategoriesAndDropdown() {
    allCategories = db.getCategories();
    const tableBody = document.getElementById('category-table-body');
    const parentSelect = document.getElementById('cat-parent');

    // Reset
    tableBody.innerHTML = '';
    parentSelect.innerHTML = '<option value="null">-- Không có --</option>';

    if (allCategories.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Chưa có danh mục.</td></tr>';
        return;
    }
    
    const categoryMap = new Map(allCategories.map(c => [c.id, c.name]));

    allCategories.forEach(cat => {
        // 1. Thêm vào Bảng
        const row = document.createElement('tr');
        row.id = `cat-row-${cat.id}`;
        const parentName = cat.parentId ? categoryMap.get(cat.parentId) : '-';
        
        row.innerHTML = `
            <td>${cat.id}</td>
            <td>${cat.name}</td>
            <td>${parentName}</td>
            <td class="action-buttons">
                <button class="btn btn-success" onclick="editCategory('${cat.id}')">Sửa</button>
                <button class="btn btn-accent" onclick="deleteCategory('${cat.id}', '${cat.name}')">Xóa</button>
            </td>
        `;
        tableBody.appendChild(row);

        // 2. Thêm vào Dropdown
        parentSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });
}

// Xử lý LƯU
function handleSaveCategory(e) {
    e.preventDefault();
    
    const categoryData = {
        id: document.getElementById('category-id').value,
        name: document.getElementById('cat-name').value,
        parentId: document.getElementById('cat-parent').value === 'null' ? null : document.getElementById('cat-parent').value
    };

    if (categoryData.id === 'new') {
        categoryData.id = null;
    }

    db.saveCategory(categoryData);
    alert(`Đã lưu danh mục "${categoryData.name}"!`);
    
    resetForm();
    loadCategoriesAndDropdown(); // Tải lại cả bảng và dropdown
}

// Hàm SỬA
function editCategory(id) {
    const category = allCategories.find(c => c.id === id);
    if (category) {
        document.getElementById('category-id').value = category.id;
        document.getElementById('cat-name').value = category.name;
        document.getElementById('cat-parent').value = category.parentId || 'null';
        document.getElementById('category-form-title').innerText = `Sửa Danh mục (ID: ${id})`;
        window.scrollTo(0, 0); // Cuộn lên đầu trang
    }
}

// Hàm XÓA
function deleteCategory(id, name) {
    if (confirm(`Bạn có chắc muốn xóa danh mục "${name}"?\n(Cảnh báo: Nên xóa sản phẩm thuộc danh mục này trước.)`)) {
        db.deleteCategory(id);
        loadCategoriesAndDropdown(); // Tải lại
    }
}

// Hàm HỦY (reset form)
function resetForm() {
    document.getElementById('category-form').reset();
    document.getElementById('category-id').value = 'new';
    document.getElementById('category-form-title').innerText = 'Thêm Danh mục';
}