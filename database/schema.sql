-- Coffee E-commerce Database Schema for Microsoft SQL Server
-- Database: BalanCoffeeRoastery

-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BalanCoffeeDB')
BEGIN
    CREATE DATABASE BalanCoffeeDB;
END
GO

USE BalanCoffeeDB;
GO

-- Users Table
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NULL, -- NULL for OAuth users
    firstName NVARCHAR(100) NOT NULL,
    lastName NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20) NULL,
    address NVARCHAR(500) NULL,
    city NVARCHAR(100) NULL,
    postalCode NVARCHAR(20) NULL,
    role NVARCHAR(20) NOT NULL DEFAULT 'customer', -- customer, admin
    isActive BIT NOT NULL DEFAULT 1,
    emailVerified BIT NOT NULL DEFAULT 0,
    facebookId NVARCHAR(100) NULL,
    profileImage NVARCHAR(500) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Products Table
CREATE TABLE Products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    nameVi NVARCHAR(255) NOT NULL, -- Vietnamese name
    slug NVARCHAR(255) NOT NULL UNIQUE,
    description NTEXT NULL,
    descriptionVi NTEXT NULL, -- Vietnamese description
    shortDescription NVARCHAR(500) NULL,
    shortDescriptionVi NVARCHAR(500) NULL,
    price DECIMAL(10,2) NOT NULL,
    comparePrice DECIMAL(10,2) NULL, -- Original price for discounts
    sku NVARCHAR(50) NOT NULL UNIQUE,
    stockQuantity INT NOT NULL DEFAULT 0,
    weight DECIMAL(8,2) NULL, -- in grams
    roastLevel NVARCHAR(50) NULL, -- light, medium, dark
    origin NVARCHAR(100) NULL, -- coffee origin
    processingMethod NVARCHAR(100) NULL, -- washed, natural, honey
    images NTEXT NULL, -- JSON array of image URLs
    isActive BIT NOT NULL DEFAULT 1,
    isFeatured BIT NOT NULL DEFAULT 0,
    metaTitle NVARCHAR(255) NULL,
    metaTitleVi NVARCHAR(255) NULL,
    metaDescription NVARCHAR(500) NULL,
    metaDescriptionVi NVARCHAR(500) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Product Categories Table
CREATE TABLE Categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    nameVi NVARCHAR(100) NOT NULL,
    slug NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(500) NULL,
    descriptionVi NVARCHAR(500) NULL,
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Product-Category Junction Table
CREATE TABLE ProductCategories (
    productId INT NOT NULL,
    categoryId INT NOT NULL,
    PRIMARY KEY (productId, categoryId),
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES Categories(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE Orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    orderNumber NVARCHAR(50) NOT NULL UNIQUE,
    userId INT NULL, -- NULL for guest orders
    customerEmail NVARCHAR(255) NOT NULL,
    customerName NVARCHAR(200) NOT NULL,
    customerPhone NVARCHAR(20) NULL,
    shippingAddress NVARCHAR(500) NOT NULL,
    shippingCity NVARCHAR(100) NOT NULL,
    shippingPostalCode NVARCHAR(20) NULL,
    shippingProvince NVARCHAR(100) NULL,
    billingAddress NVARCHAR(500) NULL,
    billingCity NVARCHAR(100) NULL,
    billingPostalCode NVARCHAR(20) NULL,
    billingProvince NVARCHAR(100) NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    shippingFee DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
    paymentMethod NVARCHAR(50) NOT NULL DEFAULT 'cod', -- cod, ipos, qr, momo, vnpay
    paymentStatus NVARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
    -- iPOS Integration fields
    iposOrderId NVARCHAR(100) NULL, -- iPOS order ID
    qrCode NTEXT NULL, -- QR code content
    qrCodeUrl NVARCHAR(500) NULL, -- QR code image URL
    paymentUrl NVARCHAR(500) NULL, -- iPOS payment page URL
    transactionId NVARCHAR(100) NULL, -- Transaction ID from iPOS
    paidAt DATETIME2 NULL, -- Payment completion time
    expiresAt DATETIME2 NULL, -- QR code expiry time
    notes NTEXT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL
);
    total DECIMAL(10,2) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
    paymentMethod NVARCHAR(50) NOT NULL, -- momo, vnpay, cod
    paymentStatus NVARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid, failed, refunded
    paymentId NVARCHAR(255) NULL, -- Payment gateway transaction ID
    notes NVARCHAR(1000) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL
);

-- Order Products Table
CREATE TABLE OrderProducts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    orderId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL, -- Price at time of order
    productName NVARCHAR(255) NOT NULL, -- Snapshot of product name
    productSku NVARCHAR(50) NOT NULL, -- Snapshot of SKU
    FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE NO ACTION
);

-- Blog Posts Table
CREATE TABLE Blogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    titleVi NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) NOT NULL UNIQUE,
    excerpt NVARCHAR(500) NULL,
    excerptVi NVARCHAR(500) NULL,
    content NTEXT NOT NULL,
    contentVi NTEXT NOT NULL,
    featuredImage NVARCHAR(500) NULL,
    authorId INT NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, published, archived
    publishedAt DATETIME2 NULL,
    metaTitle NVARCHAR(255) NULL,
    metaTitleVi NVARCHAR(255) NULL,
    metaDescription NVARCHAR(500) NULL,
    metaDescriptionVi NVARCHAR(500) NULL,
    tags NVARCHAR(500) NULL, -- Comma-separated tags
    viewCount INT NOT NULL DEFAULT 0,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (authorId) REFERENCES Users(id) ON DELETE NO ACTION
);

-- Contact Forms Table
CREATE TABLE Contacts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20) NULL,
    subject NVARCHAR(255) NOT NULL,
    message NTEXT NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'new', -- new, replied, closed
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    repliedAt DATETIME2 NULL
);

-- Newsletter Subscriptions Table
CREATE TABLE Subscriptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Shopping Cart Table (for registered users)
CREATE TABLE CartItems (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
);

-- Website Settings Table
CREATE TABLE Settings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    settingKey NVARCHAR(100) NOT NULL UNIQUE,
    settingValue NTEXT NULL,
    settingType NVARCHAR(50) NOT NULL DEFAULT 'text', -- text, number, boolean, json
    description NVARCHAR(255) NULL,
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create Indexes for better performance
CREATE INDEX IX_Products_Slug ON Products(slug);
CREATE INDEX IX_Products_IsActive ON Products(isActive);
CREATE INDEX IX_Products_IsFeatured ON Products(isFeatured);
CREATE INDEX IX_Orders_UserId ON Orders(userId);
CREATE INDEX IX_Orders_Status ON Orders(status);
CREATE INDEX IX_Orders_CreatedAt ON Orders(createdAt);
CREATE INDEX IX_Blogs_Slug ON Blogs(slug);
CREATE INDEX IX_Blogs_Status ON Blogs(status);
CREATE INDEX IX_Blogs_PublishedAt ON Blogs(publishedAt);
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Users_Role ON Users(role);

-- Insert default settings
INSERT INTO Settings (settingKey, settingValue, settingType, description) VALUES
('site_name', 'Balan Coffee & Roastery', 'text', 'Website name'),
('site_description', 'Premium Vietnamese coffee beans and expert roasting', 'text', 'Website description'),
('contact_email', 'info@balancoffee.com', 'text', 'Contact email'),
('contact_phone', '+84 123 456 789', 'text', 'Contact phone'),
('store_address', '123 Coffee Street, District 1, Ho Chi Minh City', 'text', 'Store address'),
('shipping_fee', '30000', 'number', 'Default shipping fee in VND'),
('free_shipping_threshold', '500000', 'number', 'Free shipping threshold in VND'),
('currency', 'VND', 'text', 'Default currency'),
('facebook_app_id', '', 'text', 'Facebook App ID'),
('google_analytics_id', '', 'text', 'Google Analytics Tracking ID'),
('meta_pixel_id', '', 'text', 'Meta Pixel ID'),
('tiktok_pixel_id', '', 'text', 'TikTok Pixel ID');

-- Insert default categories
INSERT INTO Categories (name, nameVi, slug, description, descriptionVi) VALUES
('Arabica', 'Arabica', 'arabica', 'Premium Arabica coffee beans', 'Hạt cà phê Arabica cao cấp'),
('Robusta', 'Robusta', 'robusta', 'Strong Robusta coffee beans', 'Hạt cà phê Robusta đậm đà'),
('Blends', 'Pha trộn', 'blends', 'Expertly crafted coffee blends', 'Hỗn hợp cà phê được pha chế chuyên nghiệp'),
('Single Origin', 'Nguồn gốc đơn', 'single-origin', 'Single origin specialty coffee', 'Cà phê đặc sản nguồn gốc đơn');

-- Insert admin user (password: admin123 - should be changed in production)
INSERT INTO Users (email, password, firstName, lastName, role, emailVerified) VALUES
('admin@balancoffee.com', '$2b$10$rBMNOyKZVhvmQXnDR8WjOeH.Sb.EKgJgO6Vw9LZnYJxWjKxLz9./m', 'Admin', 'User', 'admin', 1);

GO
