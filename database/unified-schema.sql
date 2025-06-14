-- Unified Database Schema for Balan Coffee & Roastery with CRM
-- Combines original e-commerce schema with CRM extensions
-- Database: BalanCoffeeDB

-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BalanCoffeeDB')
BEGIN
    CREATE DATABASE BalanCoffeeDB;
END
GO

USE BalanCoffeeDB;
GO

-- =============================================================================
-- USER ROLES AND PERMISSIONS (CRM Extension)
-- =============================================================================

-- User Roles and Permissions
CREATE TABLE UserRoles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    nameVi NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    descriptionVi NVARCHAR(500) NULL,
    permissions NTEXT NOT NULL, -- JSON array of permissions
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- =============================================================================
-- UNIFIED USERS TABLE (Original + CRM Extensions)
-- =============================================================================

-- Enhanced Users Table with CRM features
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Original e-commerce fields
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NULL, -- NULL for OAuth users
    firstName NVARCHAR(100) NOT NULL,
    lastName NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20) NULL,
    address NVARCHAR(500) NULL,
    city NVARCHAR(100) NULL,
    postalCode NVARCHAR(20) NULL,
    role NVARCHAR(20) NOT NULL DEFAULT 'customer', -- customer, admin (legacy)
    isActive BIT NOT NULL DEFAULT 1,
    emailVerified BIT NOT NULL DEFAULT 0,
    facebookId NVARCHAR(100) NULL,
    profileImage NVARCHAR(500) NULL,
    
    -- CRM Extension fields
    roleId INT NULL, -- Reference to UserRoles for detailed permissions
    department NVARCHAR(100) NULL,
    manager INT NULL, -- Self-reference to Users table
    territories NVARCHAR(500) NULL, -- JSON array of territories
    salesQuota DECIMAL(12,2) NULL,
    lastLoginAt DATETIME2 NULL,
    isOnline BIT NOT NULL DEFAULT 0,
    
    -- Timestamps
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign Keys
    FOREIGN KEY (roleId) REFERENCES UserRoles(id) ON DELETE SET NULL,
    FOREIGN KEY (manager) REFERENCES Users(id) ON DELETE SET NULL
);

-- =============================================================================
-- ORIGINAL E-COMMERCE TABLES
-- =============================================================================

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
    flavorNotes NVARCHAR(500) NULL,
    altitude NVARCHAR(100) NULL,
    isActive BIT NOT NULL DEFAULT 1,
    isFeatured BIT NOT NULL DEFAULT 0,
    seoTitle NVARCHAR(255) NULL,
    seoDescription NVARCHAR(500) NULL,
    seoKeywords NVARCHAR(500) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Product Images Table
CREATE TABLE ProductImages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    productId INT NOT NULL,
    imageUrl NVARCHAR(500) NOT NULL,
    altText NVARCHAR(255) NULL,
    sortOrder INT NOT NULL DEFAULT 0,
    isPrimary BIT NOT NULL DEFAULT 0,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
);

-- Categories Table
CREATE TABLE Categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    nameVi NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) NOT NULL UNIQUE,
    description NTEXT NULL,
    descriptionVi NTEXT NULL,
    parentId INT NULL,
    sortOrder INT NOT NULL DEFAULT 0,
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (parentId) REFERENCES Categories(id) ON DELETE NO ACTION
);

-- Product Categories Junction Table
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
    status NVARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    paymentStatus NVARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid, failed, refunded
    paymentMethod NVARCHAR(50) NULL, -- momo, vnpay, cod
    paymentId NVARCHAR(255) NULL, -- External payment ID
    
    -- Customer Info (for guest orders or override)
    customerEmail NVARCHAR(255) NOT NULL,
    customerPhone NVARCHAR(20) NULL,
    customerFirstName NVARCHAR(100) NOT NULL,
    customerLastName NVARCHAR(100) NOT NULL,
    
    -- Shipping Address
    shippingAddress NVARCHAR(500) NOT NULL,
    shippingCity NVARCHAR(100) NOT NULL,
    shippingPostalCode NVARCHAR(20) NULL,
    shippingMethod NVARCHAR(100) NULL,
    shippingCost DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Order Totals
    subtotal DECIMAL(10,2) NOT NULL,
    taxAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discountAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    totalAmount DECIMAL(10,2) NOT NULL,
    
    -- Additional Info
    notes NTEXT NULL,
    trackingNumber NVARCHAR(100) NULL,
    
    -- Timestamps
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    shippedAt DATETIME2 NULL,
    deliveredAt DATETIME2 NULL,
    
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL
);

-- Order Items Table
CREATE TABLE OrderItems (
    id INT IDENTITY(1,1) PRIMARY KEY,
    orderId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL,
    unitPrice DECIMAL(10,2) NOT NULL,
    totalPrice DECIMAL(10,2) NOT NULL,
    productSnapshot NTEXT NULL, -- JSON snapshot of product at time of order
    FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE NO ACTION
);

-- Blog Posts Table
CREATE TABLE BlogPosts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    titleVi NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) NOT NULL UNIQUE,
    excerpt NVARCHAR(500) NULL,
    excerptVi NVARCHAR(500) NULL,
    content NTEXT NOT NULL,
    contentVi NTEXT NOT NULL,
    featuredImage NVARCHAR(500) NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, published, archived
    authorId INT NOT NULL,
    publishedAt DATETIME2 NULL,
    seoTitle NVARCHAR(255) NULL,
    seoDescription NVARCHAR(500) NULL,
    seoKeywords NVARCHAR(500) NULL,
    viewCount INT NOT NULL DEFAULT 0,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (authorId) REFERENCES Users(id) ON DELETE NO ACTION
);

-- Contact Messages Table
CREATE TABLE ContactMessages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20) NULL,
    subject NVARCHAR(255) NOT NULL,
    message NTEXT NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'new', -- new, read, replied, archived
    isRead BIT NOT NULL DEFAULT 0,
    repliedAt DATETIME2 NULL,
    repliedBy INT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (repliedBy) REFERENCES Users(id) ON DELETE SET NULL
);

-- Shopping Cart Table (for registered users)
CREATE TABLE ShoppingCart (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    addedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE,
    UNIQUE(userId, productId)
);

-- =============================================================================
-- CRM EXTENSION TABLES
-- =============================================================================

-- User Activity Logs
CREATE TABLE UserActivityLogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    action NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NOT NULL,
    ipAddress NVARCHAR(45) NULL,
    userAgent NVARCHAR(500) NULL,
    metadata NTEXT NULL, -- JSON for additional data
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Customer Segments
CREATE TABLE CustomerSegments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    nameVi NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    descriptionVi NVARCHAR(500) NULL,
    criteria NTEXT NOT NULL, -- JSON criteria for segmentation
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Customer Segment Assignments
CREATE TABLE CustomerSegmentAssignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customerId INT NOT NULL,
    segmentId INT NOT NULL,
    assignedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    assignedBy INT NOT NULL,
    FOREIGN KEY (customerId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (segmentId) REFERENCES CustomerSegments(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedBy) REFERENCES Users(id) ON DELETE NO ACTION
);

-- Customer Interactions
CREATE TABLE CustomerInteractions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customerId INT NOT NULL,
    type NVARCHAR(50) NOT NULL, -- call, email, meeting, note, order, support
    subject NVARCHAR(255) NOT NULL,
    description NTEXT NULL,
    outcome NVARCHAR(100) NULL,
    nextAction NVARCHAR(255) NULL,
    nextActionDate DATETIME2 NULL,
    assignedTo INT NULL,
    createdBy INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (customerId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTo) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE NO ACTION
);

-- Sales Pipeline Stages
CREATE TABLE SalesPipelineStages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    nameVi NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    orderIndex INT NOT NULL,
    winProbability DECIMAL(5,2) NOT NULL DEFAULT 0, -- Percentage 0-100
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Sales Opportunities
CREATE TABLE SalesOpportunities (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NTEXT NULL,
    customerId INT NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    probability DECIMAL(5,2) NOT NULL DEFAULT 0,
    stage NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'open', -- open, won, lost
    expectedCloseDate DATETIME2 NULL,
    actualCloseDate DATETIME2 NULL,
    lostReason NVARCHAR(255) NULL,
    assignedTo INT NULL,
    createdBy INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (customerId) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (assignedTo) REFERENCES Users(id) ON DELETE SET NULL
);

-- Marketing Campaigns
CREATE TABLE MarketingCampaigns (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    nameVi NVARCHAR(255) NOT NULL,
    description NTEXT NULL,
    type NVARCHAR(50) NOT NULL, -- email, sms, social, display, search
    status NVARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, active, paused, completed
    budget DECIMAL(12,2) NULL,
    spent DECIMAL(12,2) NOT NULL DEFAULT 0,
    startDate DATETIME2 NULL,
    endDate DATETIME2 NULL,
    targetAudience NTEXT NULL, -- JSON criteria
    content NTEXT NULL, -- Campaign content
    metrics NTEXT NULL, -- JSON metrics
    createdBy INT NOT NULL,
    assignedTo INT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE NO ACTION,
    FOREIGN KEY (assignedTo) REFERENCES Users(id) ON DELETE SET NULL
);

-- Support Tickets
CREATE TABLE SupportTickets (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ticketNumber NVARCHAR(50) NOT NULL UNIQUE,
    subject NVARCHAR(255) NOT NULL,
    description NTEXT NOT NULL,
    customerId INT NULL,
    assignedTo INT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
    priority NVARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
    category NVARCHAR(100) NULL,
    tags NVARCHAR(500) NULL, -- Comma-separated tags
    resolution NTEXT NULL,
    satisfactionRating INT NULL, -- 1-5 rating
    satisfactionComment NTEXT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    resolvedAt DATETIME2 NULL,
    closedAt DATETIME2 NULL,
    FOREIGN KEY (customerId) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (assignedTo) REFERENCES Users(id) ON DELETE SET NULL
);

-- Ticket Messages
CREATE TABLE TicketMessages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ticketId INT NOT NULL,
    message NTEXT NOT NULL,
    isInternal BIT NOT NULL DEFAULT 0, -- Internal notes vs customer messages
    attachments NVARCHAR(1000) NULL, -- JSON array of attachment URLs
    senderId INT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ticketId) REFERENCES SupportTickets(id) ON DELETE CASCADE,
    FOREIGN KEY (senderId) REFERENCES Users(id) ON DELETE SET NULL
);

-- Knowledge Base Articles
CREATE TABLE KnowledgeBase (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    titleVi NVARCHAR(255) NOT NULL,
    content NTEXT NOT NULL,
    contentVi NTEXT NOT NULL,
    category NVARCHAR(100) NOT NULL,
    tags NVARCHAR(500) NULL,
    isPublic BIT NOT NULL DEFAULT 1,
    viewCount INT NOT NULL DEFAULT 0,
    helpfulCount INT NOT NULL DEFAULT 0,
    authorId INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (authorId) REFERENCES Users(id) ON DELETE NO ACTION
);

-- System Configurations
CREATE TABLE SystemConfigurations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    module NVARCHAR(100) NOT NULL, -- general, sales, marketing, support, etc.
    configKey NVARCHAR(100) NOT NULL,
    configValue NTEXT NOT NULL,
    dataType NVARCHAR(20) NOT NULL DEFAULT 'string', -- string, number, boolean, json
    description NVARCHAR(500) NULL,
    isEditable BIT NOT NULL DEFAULT 1,
    updatedBy INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UNIQUE(module, configKey),
    FOREIGN KEY (updatedBy) REFERENCES Users(id) ON DELETE NO ACTION
);

-- Data Import/Export Jobs
CREATE TABLE DataJobs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    type NVARCHAR(50) NOT NULL, -- import, export, backup
    entity NVARCHAR(100) NOT NULL, -- users, products, orders, etc.
    status NVARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    fileName NVARCHAR(255) NULL,
    filePath NVARCHAR(500) NULL,
    recordsProcessed INT NOT NULL DEFAULT 0,
    recordsTotal INT NULL,
    errorMessage NTEXT NULL,
    metadata NTEXT NULL, -- JSON for additional job data
    createdBy INT NOT NULL,
    startedAt DATETIME2 NULL,
    completedAt DATETIME2 NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE NO ACTION
);

-- Automation Rules
CREATE TABLE AutomationRules (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NTEXT NULL,
    trigger NVARCHAR(100) NOT NULL, -- customer_created, order_placed, etc.
    conditions NTEXT NULL, -- JSON conditions
    actions NTEXT NOT NULL, -- JSON actions to execute
    isActive BIT NOT NULL DEFAULT 1,
    lastExecuted DATETIME2 NULL,
    executionCount INT NOT NULL DEFAULT 0,
    createdBy INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE NO ACTION
);

-- Automation Execution Logs
CREATE TABLE AutomationExecutionLogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ruleId INT NOT NULL,
    triggeredBy NVARCHAR(100) NOT NULL, -- Event that triggered the rule
    entityId INT NULL, -- ID of the entity that triggered (user, order, etc.)
    status NVARCHAR(50) NOT NULL, -- success, failed, skipped
    result NTEXT NULL, -- JSON result of execution
    errorMessage NTEXT NULL,
    executedBy INT NULL,
    executedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ruleId) REFERENCES AutomationRules(id) ON DELETE CASCADE,
    FOREIGN KEY (executedBy) REFERENCES Users(id) ON DELETE SET NULL
);

-- Custom Reports
CREATE TABLE Reports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    nameVi NVARCHAR(255) NOT NULL,
    description NTEXT NULL,
    query NTEXT NOT NULL, -- SQL query or JSON query definition
    parameters NTEXT NULL, -- JSON parameter definitions
    chartConfig NTEXT NULL, -- JSON chart configuration
    isPublic BIT NOT NULL DEFAULT 0,
    category NVARCHAR(100) NULL,
    createdBy INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE NO ACTION
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Users indexes
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Users_Role ON Users(role);
CREATE INDEX IX_Users_RoleId ON Users(roleId);
CREATE INDEX IX_Users_Manager ON Users(manager);
CREATE INDEX IX_Users_IsActive ON Users(isActive);

-- Products indexes
CREATE INDEX IX_Products_Slug ON Products(slug);
CREATE INDEX IX_Products_SKU ON Products(sku);
CREATE INDEX IX_Products_IsActive ON Products(isActive);
CREATE INDEX IX_Products_IsFeatured ON Products(isFeatured);
CREATE INDEX IX_Products_Price ON Products(price);

-- Orders indexes
CREATE INDEX IX_Orders_UserId ON Orders(userId);
CREATE INDEX IX_Orders_Status ON Orders(status);
CREATE INDEX IX_Orders_PaymentStatus ON Orders(paymentStatus);
CREATE INDEX IX_Orders_OrderNumber ON Orders(orderNumber);
CREATE INDEX IX_Orders_CreatedAt ON Orders(createdAt);

-- CRM indexes
CREATE INDEX IX_UserActivityLogs_UserId ON UserActivityLogs(userId);
CREATE INDEX IX_CustomerInteractions_CustomerId ON CustomerInteractions(customerId);
CREATE INDEX IX_CustomerInteractions_AssignedTo ON CustomerInteractions(assignedTo);
CREATE INDEX IX_SalesOpportunities_CustomerId ON SalesOpportunities(customerId);
CREATE INDEX IX_SalesOpportunities_AssignedTo ON SalesOpportunities(assignedTo);
CREATE INDEX IX_SalesOpportunities_Status ON SalesOpportunities(status);
CREATE INDEX IX_SupportTickets_CustomerId ON SupportTickets(customerId);
CREATE INDEX IX_SupportTickets_AssignedTo ON SupportTickets(assignedTo);
CREATE INDEX IX_SupportTickets_Status ON SupportTickets(status);
CREATE INDEX IX_SupportTickets_Priority ON SupportTickets(priority);

-- =============================================================================
-- DEFAULT DATA
-- =============================================================================

-- Insert default user roles
INSERT INTO UserRoles (name, nameVi, description, descriptionVi, permissions) VALUES
('Super Admin', 'Quản trị viên tối cao', 'Full system access', 'Quyền truy cập toàn hệ thống', '["*"]'),
('Sales Manager', 'Quản lý bán hàng', 'Sales team management', 'Quản lý đội ngũ bán hàng', '["sales.*", "customers.read", "customers.update", "reports.sales"]'),
('Marketing Manager', 'Quản lý marketing', 'Marketing campaign management', 'Quản lý chiến dịch marketing', '["marketing.*", "customers.read", "campaigns.*", "reports.marketing"]'),
('Customer Service', 'Dịch vụ khách hàng', 'Customer support and service', 'Hỗ trợ và chăm sóc khách hàng', '["support.*", "customers.read", "customers.update", "tickets.*"]'),
('Sales Representative', 'Nhân viên bán hàng', 'Sales activities', 'Hoạt động bán hàng', '["sales.read", "sales.create", "customers.read", "opportunities.*"]'),
('Content Manager', 'Quản lý nội dung', 'Content and blog management', 'Quản lý nội dung và blog', '["content.*", "blogs.*", "knowledge_base.*"]');

-- Insert default admin user
INSERT INTO Users (email, password, firstName, lastName, role, emailVerified, roleId) 
VALUES ('admin@balancoffee.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewAmh5.qX3.2J.8W', 'Admin', 'User', 'admin', 1, 1);

-- Insert default categories
INSERT INTO Categories (name, nameVi, slug, description, descriptionVi) VALUES
('Cà phê', 'Cà phê', 'ca-phe', 'Premium coffee beans', 'Hạt cà phê cao cấp'),
('Arabica', 'Arabica', 'arabica', 'Premium Arabica coffee', 'Cà phê Arabica cao cấp'),
('Robusta', 'Robusta', 'robusta', 'Strong Robusta coffee', 'Cà phê Robusta đậm đà'),
('Cà phê pha máy', 'Cà phê pha máy', 'ca-phe-pha-may', 'Espresso coffee', 'Cà phê espresso');

-- Insert default pipeline stages
INSERT INTO SalesPipelineStages (name, nameVi, description, orderIndex, winProbability) VALUES
('Lead', 'Khách hàng tiềm năng', 'Initial contact made', 1, 10),
('Qualified', 'Đã xác định', 'Lead has been qualified', 2, 25),
('Proposal', 'Đề xuất', 'Proposal sent to customer', 3, 50),
('Negotiation', 'Thương lượng', 'In negotiation phase', 4, 75),
('Closed Won', 'Thành công', 'Deal won', 5, 100),
('Closed Lost', 'Thất bại', 'Deal lost', 6, 0);

-- Insert default customer segments
INSERT INTO CustomerSegments (name, nameVi, description, descriptionVi, criteria) VALUES
('VIP Customers', 'Khách hàng VIP', 'High-value customers', 'Khách hàng có giá trị cao', '{"total_orders": {">=": 10}, "total_spent": {">=": 5000000}}'),
('New Customers', 'Khách hàng mới', 'First-time buyers', 'Khách hàng mua lần đầu', '{"total_orders": {"=": 1}, "days_since_first_order": {"<=": 30}}'),
('Regular Customers', 'Khách hàng thường xuyên', 'Regular repeat customers', 'Khách hàng mua lại thường xuyên', '{"total_orders": {">=": 3}, "days_since_last_order": {"<=": 90}}'),
('At Risk', 'Có nguy cơ rời bỏ', 'Customers at risk of churning', 'Khách hàng có nguy cơ rời bỏ', '{"days_since_last_order": {">=": 180}, "total_orders": {">=": 2}}');

-- Insert default system configurations
INSERT INTO SystemConfigurations (module, configKey, configValue, dataType, description, updatedBy) VALUES
('general', 'company_name', 'Balan Coffee & Roastery', 'string', 'Company name', 1),
('general', 'company_address', '123 Coffee Street, District 1, Ho Chi Minh City', 'string', 'Company address', 1),
('general', 'company_phone', '+84 123 456 789', 'string', 'Company phone', 1),
('general', 'company_email', 'info@balancoffee.com', 'string', 'Company email', 1),
('sales', 'default_currency', 'VND', 'string', 'Default currency', 1),
('sales', 'tax_rate', '10', 'number', 'Default tax rate percentage', 1),
('marketing', 'email_from_name', 'Balan Coffee', 'string', 'Default email from name', 1),
('support', 'default_ticket_priority', 'medium', 'string', 'Default ticket priority', 1),
('system', 'data_retention_days', '2555', 'number', 'Data retention period in days (7 years)', 1);

GO

PRINT 'Unified database schema created successfully with CRM extensions!';
GO
