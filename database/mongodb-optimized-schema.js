// ==============================================
// SCHEMA TỐI ƯU CHO MONGODB - CHỈ CÁC FIELD CẦN THIẾT
// Dựa trên phân tích frontend React components
// ==============================================

use('balancoffee');

print("🚀 Tạo schema tối ưu cho Balan Coffee & Roastery...");

// Xóa collections cũ nếu tồn tại
print("🧹 Dọn dẹp database...");
db.users.drop();
db.categories.drop();
db.products.drop();
db.orders.drop();
db.blogs.drop();
db.contacts.drop();
db.carts.drop();

// 1. TẠO COLLECTION USERS
print("👤 Tạo collection Users...");
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "fullName", "role"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email phải có định dạng hợp lệ"
        },
        password: {
          bsonType: "string",
          minLength: 6,
          description: "Mật khẩu tối thiểu 6 ký tự"
        },
        fullName: {
          bsonType: "string",
          minLength: 2,
          description: "Họ tên đầy đủ"
        },
        phone: {
          bsonType: "string",
          description: "Số điện thoại"
        },
        address: {
          bsonType: "string",
          description: "Địa chỉ giao hàng"
        },
        avatar: {
          bsonType: "string",
          description: "URL ảnh đại diện"
        },
        role: {
          bsonType: "string",
          enum: ["user"],
          description: "Vai trò người dùng"
        },
        isActive: {
          bsonType: "bool",
          description: "Trạng thái tài khoản"
        },
        provider: {
          bsonType: "string",
          enum: ["local", "facebook", "google"],
          description: "Nhà cung cấp đăng nhập"
        },
        providerId: {
          bsonType: "string",
          description: "ID từ nhà cung cấp"
        },
        createdAt: {
          bsonType: "date",
          description: "Ngày tạo tài khoản"
        },
        updatedAt: {
          bsonType: "date",
          description: "Ngày cập nhật"
        }
      }
    }
  }
});

// 2. TẠO COLLECTION CATEGORIES
print("📂 Tạo collection Categories...");
db.createCollection("categories", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "slug", "isActive"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 2,
          description: "Tên danh mục"
        },
        slug: {
          bsonType: "string",
          pattern: "^[a-z0-9-]+$",
          description: "Slug cho URL"
        },
        description: {
          bsonType: "string",
          description: "Mô tả danh mục"
        },
        image: {
          bsonType: "string",
          description: "URL hình ảnh danh mục"
        },
        isActive: {
          bsonType: "bool",
          description: "Trạng thái hiển thị"
        },
        createdAt: {
          bsonType: "date",
          description: "Ngày tạo"
        },
        updatedAt: {
          bsonType: "date",
          description: "Ngày cập nhật"
        }
      }
    }
  }
});

// 3. TẠO COLLECTION PRODUCTS
print("☕ Tạo collection Products...");
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "slug", "price", "categoryId", "isActive"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 2,
          description: "Tên sản phẩm"
        },
        slug: {
          bsonType: "string",
          pattern: "^[a-z0-9-]+$",
          description: "Slug cho URL"
        },
        description: {
          bsonType: "string",
          description: "Mô tả sản phẩm"
        },
        price: {
          bsonType: "number",
          minimum: 0,
          description: "Giá sản phẩm"
        },
        comparePrice: {
          bsonType: "number",
          minimum: 0,
          description: "Giá so sánh (giá gạch ngang)"
        },
        stockQuantity: {
          bsonType: "int",
          minimum: 0,
          description: "Số lượng tồn kho"
        },
        weight: {
          bsonType: "number",
          minimum: 0,
          description: "Trọng lượng (gram)"
        },
        image_url: {
          bsonType: "string",
          description: "URL hình ảnh chính"
        },
        images: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "Danh sách URL hình ảnh"
        },
        categoryId: {
          bsonType: "objectId",
          description: "ID danh mục"
        },
        category: {
          bsonType: "object",
          properties: {
            name: { bsonType: "string" },
            slug: { bsonType: "string" }
          },
          description: "Thông tin danh mục"
        },
        origin: {
          bsonType: "string",
          description: "Xuất xứ"
        },
        roast_level: {
          bsonType: "string",
          description: "Mức độ rang"
        },
        flavor_profile: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "Hương vị đặc trưng"
        },
        brewing_methods: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "Phương pháp pha chế"
        },
        isFeatured: {
          bsonType: "bool",
          description: "Sản phẩm nổi bật"
        },
        isActive: {
          bsonType: "bool",
          description: "Trạng thái hiển thị"
        },
        rating: {
          bsonType: "object",
          properties: {
            average: {
              bsonType: "number",
              minimum: 0,
              maximum: 5
            },
            count: {
              bsonType: "int",
              minimum: 0
            }
          },
          description: "Đánh giá sản phẩm"
        },
        createdAt: {
          bsonType: "date",
          description: "Ngày tạo"
        },
        updatedAt: {
          bsonType: "date",
          description: "Ngày cập nhật"
        }
      }
    }
  }
});

// 4. TẠO COLLECTION ORDERS
print("🛒 Tạo collection Orders...");
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["orderNumber", "status", "totalAmount", "items"],
      properties: {
        orderNumber: {
          bsonType: "string",
          description: "Mã đơn hàng"
        },
        customerId: {
          bsonType: "objectId",
          description: "ID khách hàng"
        },
        customerInfo: {
          bsonType: "object",
          properties: {
            fullName: { bsonType: "string" },
            email: { bsonType: "string" },
            phone: { bsonType: "string" }
          },
          description: "Thông tin khách hàng"
        },
        status: {
          bsonType: "string",
          enum: ["pending", "confirmed", "processing", "shipping", "delivered", "cancelled"],
          description: "Trạng thái đơn hàng"
        },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["productId", "name", "price", "quantity"],
            properties: {
              productId: { bsonType: "objectId" },
              name: { bsonType: "string" },
              price: { bsonType: "number", minimum: 0 },
              quantity: { bsonType: "int", minimum: 1 },
              image: { bsonType: "string" }
            }
          },
          description: "Danh sách sản phẩm"
        },
        totalAmount: {
          bsonType: "number",
          minimum: 0,
          description: "Tổng thanh toán"
        },
        shippingAddress: {
          bsonType: "object",
          properties: {
            fullName: { bsonType: "string" },
            phone: { bsonType: "string" },
            address: { bsonType: "string" }
          },
          description: "Địa chỉ giao hàng"
        },
        paymentMethod: {
          bsonType: "string",
          enum: ["cod", "momo", "vnpay"],
          description: "Phương thức thanh toán"
        },
        paymentStatus: {
          bsonType: "string",
          enum: ["pending", "paid", "failed"],
          description: "Trạng thái thanh toán"
        },
        createdAt: {
          bsonType: "date",
          description: "Ngày tạo"
        },
        updatedAt: {
          bsonType: "date",
          description: "Ngày cập nhật"
        }
      }
    }
  }
});

// 5. TẠO COLLECTION BLOGS
print("📝 Tạo collection Blogs...");
db.createCollection("blogs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "slug", "content", "status"],
      properties: {
        title: {
          bsonType: "string",
          minLength: 5,
          description: "Tiêu đề bài viết"
        },
        slug: {
          bsonType: "string",
          pattern: "^[a-z0-9-]+$",
          description: "Slug cho URL"
        },
        excerpt: {
          bsonType: "string",
          description: "Tóm tắt bài viết"
        },
        content: {
          bsonType: "string",
          minLength: 50,
          description: "Nội dung bài viết"
        },
        featuredImage: {
          bsonType: "string",
          description: "Ảnh đại diện"
        },
        image_url: {
          bsonType: "string",
          description: "URL hình ảnh chính (alias cho featuredImage)"
        },
        authorName: {
          bsonType: "string",
          description: "Tên tác giả"
        },
        category: {
          bsonType: "object",
          properties: {
            name: { bsonType: "string" }
          },
          description: "Thông tin danh mục"
        },
        tags: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "Thẻ tag"
        },
        status: {
          bsonType: "string",
          enum: ["draft", "published", "archived"],
          description: "Trạng thái bài viết"
        },
        publishedAt: {
          bsonType: "date",
          description: "Ngày xuất bản"
        },
        read_time: {
          bsonType: "int",
          minimum: 1,
          description: "Thời gian đọc (phút)"
        },
        meta_keywords: {
          bsonType: "string",
          description: "Từ khóa meta"
        },
        created_at: {
          bsonType: "date",
          description: "Ngày tạo"
        },
        updated_at: {
          bsonType: "date",
          description: "Ngày cập nhật"
        }
      }
    }
  }
});

// 6. TẠO COLLECTION CONTACTS
print("📞 Tạo collection Contacts...");
db.createCollection("contacts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "subject", "message"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 2,
          description: "Họ tên người liên hệ"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email hợp lệ"
        },
        phone: {
          bsonType: "string",
          description: "Số điện thoại"
        },
        subject: {
          bsonType: "string",
          minLength: 5,
          description: "Chủ đề liên hệ"
        },
        message: {
          bsonType: "string",
          minLength: 10,
          description: "Nội dung tin nhắn"
        },
        status: {
          bsonType: "string",
          enum: ["new", "processing", "replied", "closed"],
          description: "Trạng thái xử lý"
        },
        createdAt: {
          bsonType: "date",
          description: "Ngày tạo"
        },
        updatedAt: {
          bsonType: "date",
          description: "Ngày cập nhật"
        }
      }
    }
  }
});

// 7. TẠO COLLECTION CARTS
print("🛍️ Tạo collection Carts...");
db.createCollection("carts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sessionId", "items"],
      properties: {
        sessionId: {
          bsonType: "string",
          description: "ID session hoặc user"
        },
        userId: {
          bsonType: "objectId",
          description: "ID người dùng (nếu đã đăng nhập)"
        },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["productId", "quantity"],
            properties: {
              productId: { bsonType: "objectId" },
              quantity: { bsonType: "int", minimum: 1 }
            }
          },
          description: "Danh sách sản phẩm trong giỏ"
        },
        totalItems: {
          bsonType: "int",
          minimum: 0,
          description: "Tổng số sản phẩm"
        },
        totalAmount: {
          bsonType: "number",
          minimum: 0,
          description: "Tổng giá trị giỏ hàng"
        },
        createdAt: {
          bsonType: "date",
          description: "Ngày tạo"
        },
        updatedAt: {
          bsonType: "date",
          description: "Ngày cập nhật"
        }
      }
    }
  }
});

// TẠO INDEXES CHO HIỆU SUẤT
print("🔍 Tạo indexes...");

// Users indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "providerId": 1 });
db.users.createIndex({ "createdAt": -1 });

// Categories indexes
db.categories.createIndex({ "slug": 1 }, { unique: true });
db.categories.createIndex({ "isActive": 1 });

// Products indexes
db.products.createIndex({ "slug": 1 }, { unique: true });
db.products.createIndex({ "categoryId": 1 });
db.products.createIndex({ "isActive": 1 });
db.products.createIndex({ "isFeatured": 1 });
db.products.createIndex({ "price": 1 });
db.products.createIndex({ "name": "text", "description": "text" });

// Orders indexes
db.orders.createIndex({ "orderNumber": 1 }, { unique: true });
db.orders.createIndex({ "customerId": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": -1 });

// Blogs indexes
db.blogs.createIndex({ "slug": 1 }, { unique: true });
db.blogs.createIndex({ "status": 1 });
db.blogs.createIndex({ "publishedAt": -1 });
db.blogs.createIndex({ "title": "text", "content": "text" });

// Contacts indexes
db.contacts.createIndex({ "status": 1 });
db.contacts.createIndex({ "createdAt": -1 });

// Carts indexes
db.carts.createIndex({ "sessionId": 1 });
db.carts.createIndex({ "userId": 1 });
db.carts.createIndex({ "updatedAt": 1 });

// THÊM DỮ LIỆU MẪU
print("📝 Thêm dữ liệu mẫu...");

// Sample Categories
db.categories.insertMany([
  {
    name: "Cà phê hạt",
    slug: "ca-phe-hat",
    description: "Hạt cà phê rang mộc nguyên chất",
    image: "/images/categories/coffee-beans.jpg",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Cà phê pha sẵn",
    slug: "ca-phe-pha-san",
    description: "Đồ uống cà phê pha sẵn",
    image: "/images/categories/beverages.jpg",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Thiết bị pha chế",
    slug: "thiet-bi-pha-che",
    description: "Dụng cụ và thiết bị pha cà phê",
    image: "/images/categories/equipment.jpg",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Sample Products
const categoryId = db.categories.findOne({slug: "ca-phe-hat"})._id;

db.products.insertMany([
  {
    name: "Arabica Cầu Đất",
    slug: "arabica-cau-dat",
    description: "Cà phê Arabica Cầu Đất với hương vị thơm ngon đặc trưng",
    price: 280000,
    comparePrice: 320000,
    stockQuantity: 50,
    weight: 250,
    image_url: "/images/products/arabica-cau-dat.jpg",
    images: ["/images/products/arabica-cau-dat.jpg", "/images/products/arabica-cau-dat-2.jpg"],
    categoryId: categoryId,
    category: { name: "Cà phê hạt", slug: "ca-phe-hat" },
    origin: "Đà Lạt, Lâm Đồng",
    roast_level: "Medium",
    flavor_profile: ["chocolate", "caramel", "nutty"],
    brewing_methods: ["espresso", "drip", "french-press"],
    isFeatured: true,
    isActive: true,
    rating: { average: 4.5, count: 24 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Robusta Lâm Đồng",
    slug: "robusta-lam-dong",
    description: "Cà phê Robusta đậm đà từ vùng cao nguyên Lâm Đồng",
    price: 180000,
    comparePrice: 200000,
    stockQuantity: 30,
    weight: 500,
    image_url: "/images/products/robusta-lam-dong.jpg",
    images: ["/images/products/robusta-lam-dong.jpg"],
    categoryId: categoryId,
    category: { name: "Cà phê hạt", slug: "ca-phe-hat" },
    origin: "Lâm Đồng",
    roast_level: "Dark",
    flavor_profile: ["bitter", "strong", "earthy"],
    brewing_methods: ["vietnamese-drip", "espresso"],
    isFeatured: false,
    isActive: true,
    rating: { average: 4.2, count: 18 },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Sample Blogs
db.blogs.insertMany([
  {
    title: "Cách pha cà phê ngon tại nhà",
    slug: "cach-pha-ca-phe-ngon-tai-nha",
    excerpt: "Hướng dẫn chi tiết cách pha cà phê ngon như quán tại nhà",
    content: "<p>Để pha được một ly cà phê ngon tại nhà, bạn cần chú ý đến chất lượng hạt cà phê, tỷ lệ pha và nhiệt độ nước...</p>",
    featuredImage: "/images/blogs/how-to-brew-coffee.jpg",
    image_url: "/images/blogs/how-to-brew-coffee.jpg",
    authorName: "Balan Coffee & Roastery",
    category: { name: "Hướng dẫn" },
    tags: ["pha cà phê", "hướng dẫn", "cà phê tại nhà"],
    status: "published",
    publishedAt: new Date(),
    read_time: 5,
    meta_keywords: "pha cà phê, cà phê ngon, hướng dẫn pha cà phê",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    title: "Sự khác biệt giữa Arabica và Robusta",
    slug: "su-khac-biet-giua-arabica-va-robusta",
    excerpt: "Tìm hiểu sự khác biệt giữa hai loại cà phê phổ biến nhất",
    content: "<p>Arabica và Robusta là hai loại cà phê phổ biến nhất trên thế giới. Mỗi loại có đặc điểm riêng về hương vị, caffeine...</p>",
    featuredImage: "/images/blogs/arabica-vs-robusta.jpg",
    image_url: "/images/blogs/arabica-vs-robusta.jpg",
    authorName: "Balan Coffee & Roastery",
    category: { name: "Kiến thức" },
    tags: ["arabica", "robusta", "kiến thức cà phê"],
    status: "published",
    publishedAt: new Date(),
    read_time: 7,
    meta_keywords: "arabica robusta khác biệt, loại cà phê, kiến thức cà phê",
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// Sample Regular User
db.users.insertOne({
  email: "user@balancoffee.com",
  password: "$2b$10$example.hash.here", // Placeholder - sẽ được hash thật
  fullName: "Khách hàng mẫu",
  phone: "0123456789",
  address: "Đà Lạt, Lâm Đồng",
  avatar: "/images/avatars/user.jpg",
  role: "user",
  isActive: true,
  provider: "local",
  createdAt: new Date(),
  updatedAt: new Date()
});

print("✅ Hoàn thành! Database đã được tạo với schema tối ưu.");
print("📊 Collections đã tạo: users, categories, products, orders, blogs, contacts, carts");
print("🔍 Indexes đã được tối ưu cho performance");
print("📝 Dữ liệu mẫu đã được thêm");
print("🎉 Sẵn sàng để sử dụng với frontend React!");
