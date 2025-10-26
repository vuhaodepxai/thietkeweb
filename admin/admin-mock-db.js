/* ---- 
   ADMIN-MOCK-DB.JS (BẢN TỔNG HỢP CUỐI CÙNG - ĐÃ XÓA Thanh toán)
   - Đã sửa lỗi localStorage (lưu/tải đúng).
   - Đã nâng cấp Biến thể (có giá, tồn kho).
   - Hỗ trợ Nhiều Hình ảnh ('images' là mảng).
---- */

(function(window) {
    'use strict';

    // Tên key trong localStorage
    const DB_NAME = 'adminTechShopData';

    // Dữ liệu mặc định (ĐÃ SỬA 'image' thành 'images' VÀ CẬP NHẬT BIẾN THỂ)
    const defaultData = {
        products: [
            { 
                id: 'SP001', 
                name: 'iPhone 15 Pro Max 256GB', 
                price: 29990000, 
                stock: 50, // stock = 20 + 30
                category: 'cat01', 
                images: ['https://via.placeholder.com/400x400.png?text=iPhone+Image+1'], // Giờ là mảng
                description: 'Mô tả cho iPhone 15', 
                variants: [
                    {name: 'Màu', value: 'Titan Tự nhiên', price: 29990000, stock: 20},
                    {name: 'Màu', value: 'Titan Đen', price: 30500000, stock: 30}
                ] 
            },
            { 
                id: 'SP002', 
                name: 'Macbook Air M2 13-inch', 
                price: 24500000, 
                stock: 30, 
                category: 'cat02', 
                images: [], // Mảng rỗng
                description: 'Mô tả cho Macbook', 
                variants: [] 
            },
            { 
                id: 'SP003', 
                name: 'Tai nghe Sony WH-1000XM5', 
                price: 7490000, 
                stock: 120, 
                category: 'cat03', 
                images: [], 
                description: 'Mô tả cho Tai nghe', 
                variants: [] 
            }
        ],
        categories: [
            { id: 'cat01', name: 'Điện thoại', parentId: null },
            { id: 'cat02', name: 'Laptop', parentId: null },
            { id: 'cat03', name: 'Phụ kiện', parentId: null },
            { id: 'cat04', name: 'iPhone', parentId: 'cat01' }
        ],
        promotions: [
            { id: 'PROMO01', code: 'SALE10', description: 'Giảm 10% tổng đơn hàng', type: '%', value: 10, start: '2025-10-20', end: '2025-10-30', status: 'active' }
        ],
        interactions: [
            { id: 'INT01', type: 'review', user: 'Nguyễn Văn A', product: 'iPhone 15 Pro Max', rating: 5, content: 'Sản phẩm tuyệt vời.', status: 'pending' }
        ],
        customers: [
            { id: 'KH001', name: 'Nguyễn Văn A', email: 'vana@gmail.com', phone: '0909123456', totalOrders: 2, totalSpent: 37480000 },
            { id: 'KH002', name: 'Trần Thị B', email: 'thib@gmail.com', phone: '0909654321', totalOrders: 1, totalSpent: 24500000 }
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
            }
        ]
        // Đã xóa 'paymentSettings'
    };

    // --- CÁC HÀM LÕI (Logic lưu/tải localStorage - Đã kiểm tra và cập nhật) ---

    function saveDatabase(db) {
        if (!db) return; 
        try {
            // Loại bỏ các hàm (nếu có) trước khi lưu
            const dataToSave = JSON.parse(JSON.stringify(db)); 
            localStorage.setItem(DB_NAME, JSON.stringify(dataToSave));
        } catch (e) {
            console.error('Lỗi khi lưu vào localStorage:', e);
            // Có thể thêm thông báo cho người dùng ở đây
        }
    }

    function initDatabase() {
        console.log("Khởi tạo Database mặc định vào localStorage.");
        saveDatabase(defaultData); // Lưu dữ liệu mặc định
        return defaultData;
    }

    function getDatabase() {
        let db;
        const data = localStorage.getItem(DB_NAME);

        if (data && data !== 'undefined' && data !== 'null') {
            try {
                db = JSON.parse(data);
                // console.log('DB tải từ STORAGE:', db); 
            } catch (e) {
                console.error('Lỗi parse JSON từ localStorage, khởi tạo lại DB:', e);
                db = initDatabase();
            }
        } else {
            // Lần đầu tiên chạy hoặc storage trống
            console.log("localStorage trống, khởi tạo DB.");
            db = initDatabase();
        }

        // Đảm bảo tất cả các key chính đều tồn tại (đã bỏ paymentSettings)
        let needsSave = false;
        const coreKeys = ['products', 'categories', 'promotions', 'interactions', 'customers', 'orders'];
        for (const key of coreKeys) {
            if (!db.hasOwnProperty(key)) {
                console.warn(`Khôi phục key chính bị thiếu: ${key}`);
                db[key] = defaultData[key] ? JSON.parse(JSON.stringify(defaultData[key])) : []; // Deep copy
                needsSave = true;
            }
        }
        // Xóa key paymentSettings cũ nếu còn sót lại
        if (db.hasOwnProperty('paymentSettings')) {
             console.warn("Xóa key 'paymentSettings' cũ khỏi localStorage.");
             delete db.paymentSettings;
             needsSave = true;
        }

        // Kiểm tra và nâng cấp cấu trúc products (quan trọng)
        if (db.products && Array.isArray(db.products)) {
            db.products.forEach(p => {
                let productNeedsSave = false;
                // Chuyển đổi image -> images
                if (!p.hasOwnProperty('images') || !Array.isArray(p.images)) {
                    console.warn(`Chuyển đổi image->images cho sản phẩm ${p.id || 'mới'}`);
                    p.images = p.image && typeof p.image === 'string' ? [p.image] : [];
                    productNeedsSave = true;
                }
                // Xóa key 'image' cũ
                if (p.hasOwnProperty('image')) {
                    delete p.image;
                    productNeedsSave = true;
                }
                 // Đảm bảo có trường variants (mảng)
                 if (!p.hasOwnProperty('variants') || !Array.isArray(p.variants)) {
                     console.warn(`Thêm mảng 'variants' cho sản phẩm ${p.id || 'mới'}`);
                     p.variants = [];
                     productNeedsSave = true;
                 }
                 // Đảm bảo các variant có đủ trường (price, stock)
                 p.variants.forEach(v => {
                     if (!v.hasOwnProperty('price')) {
                         v.price = 0; // Giá mặc định
                         productNeedsSave = true;
                     }
                     if (!v.hasOwnProperty('stock')) {
                         v.stock = 0; // Tồn kho mặc định
                         productNeedsSave = true;
                     }
                 });
                 if(productNeedsSave) needsSave = true;
            });
        } else {
            // Nếu không có products hoặc không phải mảng
            console.warn("Khôi phục mảng 'products'.");
            db.products = defaultData.products ? JSON.parse(JSON.stringify(defaultData.products)) : [];
            needsSave = true;
        }
        
        if (needsSave) {
            console.log("Cập nhật lại cấu trúc DB trong localStorage do có thay đổi.");
            saveDatabase(db);
        }

        return db;
    }

    // --- API CÔNG KHAI (window.db) ---
    
    window.db = {
        // --- Promotions (THÊM HÀM MỚI) ---
        getPromotions: function() {
            return getDatabase().promotions;
        },
        // HÀM MỚI: Lấy một khuyến mãi theo ID
        getPromotionById: function(id) {
            // Kiểm tra xem promotions có tồn tại và là mảng không
            const promotions = getDatabase().promotions;
            if (!promotions || !Array.isArray(promotions)) {
                return undefined; // Hoặc null, tùy bạn muốn xử lý
            }
            return promotions.find(p => p.id === id);
        },
        // HÀM MỚI: Lưu (thêm mới hoặc cập nhật) khuyến mãi
        savePromotion: function(promoData) {
            const db = getDatabase();
            // Đảm bảo các trường cần thiết tồn tại, đặt giá trị mặc định nếu cần
             promoData.type = promoData.type || '%'; 
             // Chuyển đổi giá trị sang số, mặc định là 0 nếu lỗi
             promoData.value = parseFloat(promoData.value) || 0; 
             promoData.status = promoData.status || 'inactive';
             // Định dạng ngày tháng nếu có, ngược lại là null
             promoData.start = promoData.start || null;
             promoData.end = promoData.end || null;


            if (promoData.id && promoData.id !== 'new') {
                // Cập nhật khuyến mãi đã có
                const index = db.promotions.findIndex(p => p.id === promoData.id);
                if (index > -1) {
                    // Merge dữ liệu cũ và mới
                    db.promotions[index] = { ...db.promotions[index], ...promoData };
                } else {
                     // Có ID nhưng không tìm thấy -> coi như thêm mới (hoặc báo lỗi)
                     console.warn(`Không tìm thấy ID khuyến mãi ${promoData.id} để cập nhật, thêm mới thay thế.`);
                     promoData.id = 'PROMO' + new Date().getTime(); // Tạo ID mới
                     db.promotions.push(promoData);
                }
            } else {
                // Thêm khuyến mãi mới
                promoData.id = 'PROMO' + new Date().getTime(); // Tạo ID duy nhất
                db.promotions.push(promoData);
            }
            saveDatabase(db); // Lưu thay đổi vào localStorage
        },
        deletePromotion: function(id) {
            let db = getDatabase();
            // Đảm bảo promotions là một mảng trước khi filter
            if (db.promotions && Array.isArray(db.promotions)) {
                 db.promotions = db.promotions.filter(p => p.id !== id);
                 saveDatabase(db);
            }
        },
        // --- Products ---
        getProducts: function() {
            return getDatabase().products;
        },
        getProductById: function(id) {
            return getDatabase().products.find(p => p.id === id);
        },
        saveProduct: function(product) {
            const db = getDatabase(); 
            
            // Luôn đảm bảo images và variants là mảng hợp lệ trước khi lưu
             if (!product.images || !Array.isArray(product.images)) {
                 product.images = [];
             }
             if (!product.variants || !Array.isArray(product.variants)) {
                 product.variants = [];
             }
            
            // Tự động cập nhật tồn kho gốc (tổng biến thể)
            if (product.variants.length > 0) {
                product.stock = product.variants.reduce((total, v) => total + (parseInt(v.stock, 10) || 0), 0);
            } else {
                 // Nếu không có biến thể, tồn kho gốc là cái người dùng nhập
                 product.stock = parseInt(product.stock, 10) || 0; 
            }

            if (product.id && product.id !== 'new') {
                // Cập nhật
                const index = db.products.findIndex(p => p.id === product.id);
                if (index > -1) {
                    // Merge cẩn thận, đảm bảo không mất dữ liệu không liên quan
                    db.products[index] = { ...db.products[index], ...product }; 
                } else {
                     console.warn(`Không tìm thấy sản phẩm ${product.id} để cập nhật, thêm mới thay thế.`);
                     product.id = 'SP' + new Date().getTime(); 
                     db.products.push(product); // Đã có images/variants hợp lệ
                }
            } else {
                // Thêm mới
                product.id = 'SP' + new Date().getTime(); 
                db.products.push(product); // Đã có images/variants hợp lệ
            }
            saveDatabase(db); 
        },
        deleteProduct: function(id) {
            let db = getDatabase();
            db.products = db.products.filter(p => p.id !== id);
            saveDatabase(db);
        },

        // --- Categories ---
        getCategories: function() { return getDatabase().categories; },
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
        getPromotions: function() { return getDatabase().promotions; },
        deletePromotion: function(id) {
            let db = getDatabase();
            db.promotions = db.promotions.filter(p => p.id !== id);
            saveDatabase(db);
        },

        // --- Interactions ---
        getInteractions: function() { return getDatabase().interactions; },
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
        getCustomers: function() { return getDatabase().customers; },

        // --- Orders ---
        getOrders: function() { return getDatabase().orders; },
        getOrderById: function(id) { return getDatabase().orders.find(o => o.id === id); },
        updateOrderStatus: function(id, newStatus) {
            const db = getDatabase();
            const index = db.orders.findIndex(o => o.id === id);
            if (index > -1) db.orders[index].status = newStatus;
            saveDatabase(db);
        },
        
        // ĐÃ XÓA getPaymentSettings và savePaymentSettings

        // --- Reset ---
        resetDatabase: function() {
            if (confirm("Bạn có chắc muốn xóa TOÀN BỘ dữ liệu (sản phẩm, đơn hàng...) và quay về mặc định không? Hành động này không thể hoàn tác.")) {
                console.warn('ĐÃ XÓA TOÀN BỘ LOCALSTORAGE VÀ TẠO LẠI DB!');
                localStorage.removeItem(DB_NAME);
                initDatabase(); // Tạo lại DB từ defaultData
                location.reload(); 
            }
        }
    };

    // Tự động kiểm tra và cập nhật cấu trúc DB khi script load lần đầu
    // Đặt trong try...catch để tránh lỗi chặn toàn bộ script
    try {
        getDatabase(); 
    } catch(e) {
        console.error("Lỗi nghiêm trọng khi khởi tạo hoặc kiểm tra DB:", e);
        // Có thể thử reset cứng nếu lỗi quá nặng
        // localStorage.removeItem(DB_NAME);
        // initDatabase();
        // location.reload();
    }

})(window);