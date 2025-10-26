/* ---- 
   ADMIN-MOCK-DB.JS (BẢN SỬA LỖI LƯU TRỮ LOCALSTORAGE)
   File này sẽ đọc từ localStorage trước,
   và chỉ tạo dữ liệu mặc định nếu localStorage trống.
---- */

(function(window) {
    'use strict';

    // Tên key trong localStorage
    const DB_NAME = 'adminTechShopData';

    // Dữ liệu mặc định (Dùng khi KHÔNG có gì trong localStorage)
    const defaultData = {
        products: [
            { id: 'SP001', name: 'iPhone 15 Pro Max 256GB', price: 29990000, stock: 50, category: 'dienthoai', image: 'https://via.placeholder.com/50' },
            { id: 'SP002', name: 'Macbook Air M2 13-inch', price: 24500000, stock: 30, category: 'laptop', image: 'https://via.placeholder.com/50' },
            { id: 'SP003', name: 'Tai nghe Sony WH-1000XM5', price: 7490000, stock: 120, category: 'phukien', image: 'https://via.placeholder.com/50' }
        ],
        categories: [
            { id: 'cat01', name: 'Điện thoại', parentId: null },
            { id: 'cat02', name: 'Laptop', parentId: null },
            { id: 'cat03', name: 'Phụ kiện', parentId: null },
            { id: 'cat04', name: 'iPhone', parentId: 'cat01' }
        ],
        promotions: [
            { id: 'PROMO01', code: 'SALE10', description: 'Giảm 10% tổng đơn hàng', type: '%', value: 10, start: '2025-10-20', end: '2025-10-30', status: 'active' },
            { id: 'PROMO02', code: 'FREESHIP', description: 'Miễn phí vận chuyển', type: 'vnd', value: 30000, start: '2025-10-01', end: '2025-10-31', status: 'active' }
        ],
        interactions: [
            { id: 'INT01', type: 'review', user: 'Nguyễn Văn A', product: 'iPhone 15 Pro Max', rating: 5, content: 'Sản phẩm tuyệt vời, giao hàng nhanh.', status: 'pending' },
            { id: 'INT02', type: 'review', user: 'Trần Thị B', product: 'Macbook Air M2', rating: 2, content: 'Máy bị trầy xước nhẹ ở góc.', status: 'pending' },
            { id: 'INT03', type: 'qa', user: 'Lê Văn C', product: 'Tai nghe Sony', content: 'Tai nghe này có chống nước không shop?', status: 'pending', answer: null }
        ],
        customers: [
            { id: 'KH001', name: 'Nguyễn Văn A', email: 'vana@gmail.com', phone: '0909123456', totalOrders: 2, totalSpent: 37480000 },
            { id: 'KH002', name: 'Trần Thị B', email: 'thib@gmail.com', phone: '0909654321', totalOrders: 1, totalSpent: 24500000 },
            { id: 'KH003', name: 'Lê Văn C', email: 'vanc@gmail.com', phone: '0988111222', totalOrders: 0, totalSpent: 0 }
        ],
        orders: [
            { 
                id: 'ORD001', 
                customerName: 'Nguyễn Văn A', 
                date: '2025-10-20T10:30:00', 
                total: 29990000, 
                status: 'pending',
                paymentMethod: 'COD',
                items: [
                    { productId: 'SP001', name: 'iPhone 15 Pro Max 256GB', quantity: 1, price: 29990000 }
                ],
                shippingAddress: '123 Đường ABC, Quận 1, TP. HCM'
            },
            { 
                id: 'ORD002', 
                customerName: 'Trần Thị B', 
                date: '2025-10-21T14:00:00', 
                total: 24500000, 
                status: 'processing',
                paymentMethod: 'Thẻ Tín Dụng',
                items: [
                    { productId: 'SP002', name: 'Macbook Air M2 13-inch', quantity: 1, price: 24500000 }
                ],
                shippingAddress: '456 Đường XYZ, Quận Ba Đình, Hà Nội'
            },
            { 
                id: 'ORD003', 
                customerName: 'Nguyễn Văn A', 
                date: '2025-10-22T09:15:00', 
                total: 7490000, 
                status: 'completed',
                paymentMethod: 'COD',
                items: [
                    { productId: 'SP003', name: 'Tai nghe Sony WH-1000XM5', quantity: 1, price: 7490000 }
                ],
                shippingAddress: '123 Đường ABC, Quận 1, TP. HCM'
            }
        ]
    };

    // --- CÁC HÀM LÕI (ĐÃ SỬA LẠI LOGIC) ---

    // 1. Hàm lưu vào localStorage
    function saveDatabase(db) {
        if (!db) return; // Ngăn lưu trữ dữ liệu rỗng
        try {
            localStorage.setItem(DB_NAME, JSON.stringify(db));
            // console.log('DB ĐÃ LƯU:', db); // (Bỏ comment này để debug)
        } catch (e) {
            console.error('Lỗi khi lưu vào localStorage:', e);
        }
    }

    // 2. Hàm khởi tạo (Chỉ chạy 1 lần)
    function initDatabase() {
        // console.log('KHỞI TẠO DB MẶC ĐỊNH...'); // (Bỏ comment này để debug)
        saveDatabase(defaultData); // Lưu dữ liệu mặc định
        return defaultData;
    }

    // 3. Hàm đọc từ localStorage (QUAN TRỌNG NHẤT)
    function getDatabase() {
        let db;
        const data = localStorage.getItem(DB_NAME);

        if (data && data !== 'undefined' && data !== 'null') {
            // Nếu CÓ dữ liệu trong storage
            try {
                db = JSON.parse(data);
                // console.log('DB TẢI TỪ STORAGE:', db); // (Bỏ comment này để debug)
            } catch (e) {
                // Dữ liệu bị hỏng -> Khởi tạo lại
                console.error('Lỗi parse JSON, khởi tạo lại DB:', e);
                db = initDatabase();
            }
        } else {
            // Lần đầu tiên chạy, hoặc storage bị xóa -> Khởi tạo
            db = initDatabase();
        }

        // Đảm bảo tất cả các key đều tồn tại (phòng trường hợp bạn thêm data mới)
        let needsSave = false;
        for (const key in defaultData) {
            if (!db.hasOwnProperty(key)) {
                db[key] = defaultData[key];
                needsSave = true;
            }
        }
        if (needsSave) {
            saveDatabase(db);
        }

        return db;
    }

    // --- API CÔNG KHAI (Giữ nguyên tên, nhưng logic bên trong đã đúng) ---
    // Giờ đây, mỗi hàm save/delete sẽ LƯU THẬT vào localStorage
    
    window.db = {
        // --- Products ---
        getProducts: function() {
            return getDatabase().products;
        },
        getProductById: function(id) {
            return getDatabase().products.find(p => p.id === id);
        },
        saveProduct: function(product) {
            const db = getDatabase(); // Lấy DB *hiện tại*
            if (product.id && product.id !== 'new') {
                // Cập nhật
                const index = db.products.findIndex(p => p.id === product.id);
                if (index > -1) {
                    db.products[index] = { ...db.products[index], ...product };
                }
            } else {
                // Thêm mới
                product.id = 'SP' + new Date().getTime(); // Tạo ID tạm
                product.image = 'https://via.placeholder.com/50'; // Ảnh tạm
                db.products.push(product);
            }
            saveDatabase(db); // <-- Lưu lại DB đã bị thay đổi
        },
        deleteProduct: function(id) {
            let db = getDatabase();
            db.products = db.products.filter(p => p.id !== id);
            saveDatabase(db); // <-- Lưu lại DB đã bị thay đổi
        },

        // --- Categories ---
        getCategories: function() {
            return getDatabase().categories;
        },
        saveCategory: function(category) {
            const db = getDatabase();
            if (category.id && category.id !== 'new') {
                const index = db.categories.findIndex(c => c.id === category.id);
                if (index > -1) db.categories[index] = { ...db.categories[index], ...category };
            } else {
                category.id = 'cat' + new Date().getTime();
                db.categories.push(category);
            }
            saveDatabase(db);
        },
        deleteCategory: function(id) {
            let db = getDatabase();
            db.categories = db.categories.filter(c => c.id !== id);
            saveDatabase(db);
        },

        // --- Promotions ---
        getPromotions: function() {
            return getDatabase().promotions;
        },
        deletePromotion: function(id) {
            let db = getDatabase();
            db.promotions = db.promotions.filter(p => p.id !== id);
            saveDatabase(db);
        },

        // --- Interactions ---
        getInteractions: function() {
            return getDatabase().interactions;
        },
        updateInteractionStatus: function(id, newStatus, answer = null) {
            const db = getDatabase();
            const index = db.interactions.findIndex(i => i.id === id);
            if (index > -1) {
                db.interactions[index].status = newStatus;
                if(answer) db.interactions[index].answer = answer;
            }
            saveDatabase(db);
        },

        // --- Customers ---
        getCustomers: function() {
            return getDatabase().customers;
        },

        // --- Orders ---
        getOrders: function() {
            return getDatabase().orders;
        },
        getOrderById: function(id) {
            return getDatabase().orders.find(o => o.id === id);
        },
        updateOrderStatus: function(id, newStatus) {
            const db = getDatabase();
            const index = db.orders.findIndex(o => o.id === id);
            if (index > -1) db.orders[index].status = newStatus;
            saveDatabase(db);
        },
        
        // --- HÀM DEBUG: Xóa toàn bộ DB ---
        // Bạn có thể gọi hàm này từ Console (gõ: db.resetDatabase())
        // để quay về dữ liệu mặc định
        resetDatabase: function() {
            console.warn('ĐÃ XÓA TOÀN BỘ LOCALSTORAGE VÀ TẠO LẠI DB!');
            localStorage.removeItem(DB_NAME);
            initDatabase();
            location.reload(); // Tải lại trang
        }
    };

})(window);