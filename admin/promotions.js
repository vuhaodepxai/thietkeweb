/* ---- 
   LOGIC RIÊNG CỦA TRANG PROMOTIONS
---- */

document.addEventListener('DOMContentLoaded', function() {
    loadPromotions();
});

function loadPromotions() {
    const promotions = db.getPromotions();
    const tableBody = document.getElementById('promo-table-body');
    tableBody.innerHTML = '';

    if (!promotions || promotions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Chưa có khuyến mãi nào.</td></tr>';
        return;
    }

    promotions.forEach(promo => {
        const row = document.createElement('tr');
        row.id = `promo-row-${promo.id}`;
        
        const valueFormatted = promo.type === '%' ? `${promo.value}%` : new Intl.NumberFormat('vi-VN').format(promo.value) + 'đ';
        const statusText = promo.status === 'active' ? '<span style="color: green;">Đang chạy</span>' : '<span style="color: grey;">Hết hạn</span>';

        row.innerHTML = `
            <td>${promo.code}</td>
            <td>${promo.description}</td>
            <td>${valueFormatted}</td>
            <td>${promo.start}</td>
            <td>${promo.end}</td>
            <td>${statusText}</td>
            <td class="action-buttons">
                <button class="btn btn-success" onclick="alert('Chức năng Sửa chưa được code')">Sửa</button>
                <button class="btn btn-accent" onclick="deletePromotion('${promo.id}', '${promo.code}')">Xóa</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function deletePromotion(id, code) {
    if (confirm(`Bạn có chắc muốn xóa mã "${code}"?`)) {
        db.deletePromotion(id);
        // Tải lại toàn bộ danh sách (đơn giản nhất)
        loadPromotions();
    }
}