/* ---- 
   LOGIC RIÊNG CỦA TRANG INTERACTIONS
---- */

document.addEventListener('DOMContentLoaded', function() {
    loadInteractions();
});

function loadInteractions() {
    const interactions = db.getInteractions();
    const reviewsContainer = document.getElementById('reviews-container');
    const qaContainer = document.getElementById('qa-container');
    
    reviewsContainer.innerHTML = '';
    qaContainer.innerHTML = '';

    const allReviews = interactions.filter(i => i.type === 'review');
    const allQA = interactions.filter(i => i.type === 'qa');

    // Xử lý Reviews
    if (allReviews.length === 0) {
        reviewsContainer.innerHTML = '<p>Chưa có đánh giá nào.</p>';
    } else {
        allReviews.forEach(item => {
            reviewsContainer.appendChild(createReviewItem(item));
        });
    }

    // Xử lý Q&A
    if (allQA.length === 0) {
        qaContainer.innerHTML = '<p>Chưa có câu hỏi nào.</p>';
    } else {
        allQA.forEach(item => {
            qaContainer.appendChild(createQAItem(item));
        });
    }
}

function createReviewItem(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'interaction-item';
    itemDiv.id = `interaction-${item.id}`;

    const stars = '⭐️'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
    itemDiv.innerHTML = `
        <p><strong>Người dùng:</strong> ${item.user} (SP: ${item.product})</p>
        <p><strong>Đánh giá:</strong> ${stars}</p>
        <p><i>"${item.content}"</i></p>
        <div class="interaction-actions">
            <button class="btn btn-success" onclick="approveReview('${item.id}')">Duyệt (Hiển thị)</button>
            <button class="btn btn-accent" onclick="deleteInteraction('${item.id}')">Xóa</button>
        </div>
    `;
    
    if (item.status === 'approved') {
        itemDiv.classList.add('approved');
        itemDiv.querySelector('.interaction-actions').innerHTML = '<p style="color: green;">Đã duyệt.</p>';
    }
    return itemDiv;
}

function createQAItem(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'interaction-item';
    itemDiv.id = `interaction-${item.id}`;

    itemDiv.innerHTML = `
        <p><strong>Người dùng:</strong> ${item.user} (SP: ${item.product})</p>
        <p><strong>Câu hỏi:</strong> <i>"${item.content}"</i></p>
        <div class="interaction-actions">
            <button class="btn btn-primary" onclick="toggleAnswerForm('${item.id}')">Trả lời</button>
            <button class="btn btn-accent" onclick="deleteInteraction('${item.id}')">Xóa</button>
        </div>
        <form class="answer-form" id="form-${item.id}" onsubmit="submitAnswer(event, '${item.id}')">
            <textarea rows="3" placeholder="Nhập câu trả lời của bạn..." required></textarea>
            <button type="submit" class="btn btn-success" style="margin-top: 5px;">Gửi trả lời</button>
        </form>
    `;
    
    if (item.status === 'answered' && item.answer) {
        itemDiv.classList.add('answered');
        itemDiv.querySelector('.interaction-actions').remove(); 
        itemDiv.querySelector('.answer-form').remove(); 
        const answerDiv = document.createElement('div');
        answerDiv.className = 'answer-display';
        answerDiv.innerHTML = `<strong>Admin đã trả lời:</strong> ${item.answer}`;
        itemDiv.appendChild(answerDiv);
    }
    return itemDiv;
}

// --- Hàm xử lý cho Đánh giá ---
function approveReview(id) {
    db.updateInteractionStatus(id, 'approved');
    const itemDiv = document.getElementById(`interaction-${id}`);
    itemDiv.classList.add('approved');
    itemDiv.querySelector('.interaction-actions').innerHTML = '<p style="color: green;">Đã duyệt.</p>';
}

// --- Hàm xử lý cho Hỏi đáp ---
function toggleAnswerForm(id) {
    const form = document.getElementById(`form-${id}`);
    form.style.display = (form.style.display === 'block') ? 'none' : 'block';
}

function submitAnswer(event, id) {
    event.preventDefault();
    const form = document.getElementById(`form-${id}`);
    const answer = form.querySelector('textarea').value;
    
    if (answer) {
        db.updateInteractionStatus(id, 'answered', answer);
        loadInteractions(); // Tải lại toàn bộ để cập nhật giao diện
    }
}

// --- Hàm Xóa chung ---
function deleteInteraction(id) {
    if (confirm('Bạn có chắc muốn xóa tương tác này?')) {
        // (Trong demo, chúng ta chỉ thay đổi giao diện)
        // db.deleteInteraction(id) // Cần thêm hàm này vào DB nếu muốn xóa thật
        const itemDiv = document.getElementById(`interaction-${id}`);
        itemDiv.style.opacity = '0.5';
        itemDiv.innerHTML = '<p style="color: red; text-align: center; font-weight: bold;">ĐÃ XÓA (DEMO)</p>';
        
        // Cần thêm hàm db.deleteInteraction(id) vào mock-db nếu muốn xóa vĩnh viễn
        alert('Đã xóa (demo)!');
    }
}