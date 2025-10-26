/* ---- 
   LOGIC RIÊNG CỦA TRANG PROMOTIONS
   (Đã thêm Modal Form Thêm/Sửa)
---- */

document.addEventListener('DOMContentLoaded', function() {
    loadPromotions();

    // Gán sự kiện submit cho form trong modal
    const promoForm = document.getElementById('promo-form');
    if (promoForm) {
        promoForm.addEventListener('submit', handlePromoFormSubmit);
    }
    
    // Sửa nút "Tạo Khuyến mãi Mới" để mở modal
    const createBtn = document.querySelector('header .btn-primary');
    if (createBtn) {
        // Xóa onclick cũ (nếu có) và gán sự kiện mở modal
        createBtn.onclick = () => openPromoModal(); 
        createBtn.href = '#'; // Ngăn hành vi mặc định của thẻ <a>
    }
});

function loadPromotions() {
    let promotions = [];
    try {
        promotions = db.getPromotions() || []; // Lấy dữ liệu, đảm bảo là mảng
    } catch(e) {
        console.error("Lỗi khi lấy danh sách khuyến mãi:", e);
    }

    const tableBody = document.getElementById('promo-table-body');
    
    if (!tableBody) {
        console.error("Không tìm thấy tbody với ID 'promo-table-body'");
        return;
    }
    
    tableBody.innerHTML = ''; // Xóa nội dung cũ

    if (!promotions || promotions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Chưa có khuyến mãi nào.</td></tr>';
        return;
    }

    promotions.forEach(promo => {
        const row = document.createElement('tr');
        row.id = `promo-row-${promo.id}`;
        
        const valueFormatted = promo.type === '%' 
            ? `${promo.value}%` 
            : new Intl.NumberFormat('vi-VN').format(promo.value || 0) + 'đ';
            
        const statusText = promo.status === 'active' 
            ? '<span style="color: var(--success); font-weight: bold;">Đang chạy</span>' 
            : '<span style="color: grey;">Tạm dừng</span>';
            
        // Sửa innerHTML để gọi openPromoModal cho nút Sửa
        row.innerHTML = `
            <td>${promo.code || 'N/A'}</td>
            <td>${promo.description || 'N/A'}</td>
            <td>${valueFormatted}</td>
            <td>${promo.start ? new Date(promo.start).toLocaleDateString('vi-VN') : 'N/A'}</td>
            <td>${promo.end ? new Date(promo.end).toLocaleDateString('vi-VN') : 'N/A'}</td>
            <td>${statusText}</td>
            <td class="action-buttons">
                <button class="btn btn-success btn-small" onclick="openPromoModal('${promo.id}')" title="Sửa khuyến mãi">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="btn btn-accent btn-small" onclick="deletePromotion('${promo.id}', '${promo.code || 'N/A'}')" title="Xóa khuyến mãi">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * (HÀM MỚI) Mở Form Modal Khuyến mãi
 * @param {string | null} promoId - ID của khuyến mãi cần sửa, hoặc null để tạo mới.
 */
function openPromoModal(promoId = null) {
    const modal = document.getElementById('promo-modal');
    const form = document.getElementById('promo-form');
    const title = document.getElementById('modal-promo-title');

    if (!modal || !form || !title) {
        console.error("Không tìm thấy các element của modal.");
        return;
    }

    form.reset(); // Xóa dữ liệu cũ trên form

    if (promoId) {
        // --- CHẾ ĐỘ SỬA ---
        let promo = null;
        try {
            promo = db.getPromotionById(promoId);
        } catch(e) {
            console.error("Lỗi khi lấy thông tin khuyến mãi để sửa:", e);
        }

        if (promo) {
            title.textContent = 'Sửa Khuyến mãi';
            document.getElementById('promo-id').value = promo.id;
            document.getElementById('promo-code').value = promo.code || '';
            document.getElementById('promo-description').value = promo.description || '';
            document.getElementById('promo-type').value = promo.type || '%';
            document.getElementById('promo-value').value = promo.value || 0;
            // Định dạng ngày cho input type="date" (YYYY-MM-DD)
            document.getElementById('promo-start').value = promo.start ? promo.start.split('T')[0] : '';
            document.getElementById('promo-end').value = promo.end ? promo.end.split('T')[0] : '';
            document.getElementById('promo-status').value = promo.status || 'inactive';
        } else {
            alert(`Không tìm thấy khuyến mãi với ID: ${promoId}`);
            return; // Không mở modal nếu không tìm thấy
        }
    } else {
        // --- CHẾ ĐỘ THÊM MỚI ---
        title.textContent = 'Tạo Khuyến mãi Mới';
        document.getElementById('promo-id').value = 'new'; // Đánh dấu là thêm mới
         // Có thể đặt trạng thái mặc định là "Đang chạy"
         document.getElementById('promo-status').value = 'active'; 
    }

    modal.classList.add('active'); // Hiển thị modal
}

/**
 * (HÀM MỚI) Đóng Form Modal Khuyến mãi
 */
function closePromoModal() {
    const modal = document.getElementById('promo-modal');
    if (modal) {
        modal.classList.remove('active'); // Ẩn modal
    }
}

/**
 * (HÀM MỚI) Xử lý khi submit form khuyến mãi
 * @param {Event} event - Sự kiện submit của form
 */
function handlePromoFormSubmit(event) {
    event.preventDefault(); // Ngăn trang tải lại

    // Thu thập dữ liệu từ form
    const promoData = {
        id: document.getElementById('promo-id').value,
        // Chuyển mã thành chữ hoa và xóa khoảng trắng thừa
        code: document.getElementById('promo-code').value.trim().toUpperCase(), 
        description: document.getElementById('promo-description').value.trim(),
        type: document.getElementById('promo-type').value,
        value: document.getElementById('promo-value').value,
        // Xử lý ngày trống -> null
        start: document.getElementById('promo-start').value || null, 
        end: document.getElementById('promo-end').value || null,     
        status: document.getElementById('promo-status').value
    };

    // Kiểm tra cơ bản (ví dụ)
    if (!promoData.code || !promoData.value) {
        alert("Vui lòng nhập Mã khuyến mãi và Giá trị.");
        return;
    }
     // Kiểm tra giá trị hợp lệ
     if (isNaN(parseFloat(promoData.value)) || parseFloat(promoData.value) < 0) {
         alert("Giá trị khuyến mãi không hợp lệ.");
         return;
     }

    try {
        // Lưu bằng hàm của db
        db.savePromotion(promoData);
        
        closePromoModal(); // Đóng modal sau khi lưu thành công
        loadPromotions(); // Tải lại danh sách để thấy thay đổi
        
        alert(`Đã lưu khuyến mãi "${promoData.code}" thành công!`);

    } catch (e) {
        console.error("Lỗi khi lưu khuyến mãi:", e);
        alert("Có lỗi xảy ra khi lưu khuyến mãi.");
    }
}
        
// Hàm deletePromotion giữ nguyên
function deletePromotion(id, code) {
    if (confirm(`Bạn có chắc muốn xóa mã khuyến mãi "${code}" (ID: ${id}) không?`)) {
        try {
            db.deletePromotion(id);
            loadPromotions(); 
        } catch(e) {
            console.error("Lỗi khi xóa khuyến mãi:", e);
            alert("Có lỗi xảy ra khi xóa khuyến mãi.");
        }
    }
}