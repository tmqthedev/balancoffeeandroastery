-- CRM System Database Schema Extension
-- Additional tables for comprehensive CRM functionality

USE BalanCoffeeDB;
GO

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
    interactionType NVARCHAR(50) NOT NULL, -- email, phone, chat, meeting, social
    channel NVARCHAR(100) NULL, -- specific channel info
    subject NVARCHAR(255) NOT NULL,
    content NTEXT NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'completed', -- scheduled, completed, cancelled
    assignedTo INT NULL, -- staff member handling interaction
    duration INT NULL, -- in minutes
    outcome NVARCHAR(500) NULL,
    scheduledAt DATETIME2 NULL,
    completedAt DATETIME2 NULL,
    metadata NTEXT NULL, -- JSON for additional data
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    createdBy INT NOT NULL,
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
    winProbability DECIMAL(5,2) NOT NULL DEFAULT 0, -- percentage
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Sales Opportunities
CREATE TABLE SalesOpportunities (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    customerId INT NOT NULL,
    stageId INT NOT NULL,
    assignedTo INT NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    probability DECIMAL(5,2) NOT NULL DEFAULT 0,
    expectedCloseDate DATETIME2 NULL,
    actualCloseDate DATETIME2 NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'open', -- open, won, lost, cancelled
    lostReason NVARCHAR(500) NULL,
    description NTEXT NULL,
    notes NTEXT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (customerId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (stageId) REFERENCES SalesPipelineStages(id) ON DELETE NO ACTION,
    FOREIGN KEY (assignedTo) REFERENCES Users(id) ON DELETE NO ACTION
);

-- Marketing Campaigns
CREATE TABLE MarketingCampaigns (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    nameVi NVARCHAR(255) NOT NULL,
    type NVARCHAR(50) NOT NULL, -- email, sms, social, display, search
    status NVARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, active, paused, completed, cancelled
    budget DECIMAL(12,2) NULL,
    spent DECIMAL(12,2) NOT NULL DEFAULT 0,
    targetAudience NTEXT NULL, -- JSON criteria
    channels NVARCHAR(500) NULL, -- comma-separated channels
    startDate DATETIME2 NULL,
    endDate DATETIME2 NULL,
    description NTEXT NULL,
    goals NTEXT NULL, -- JSON goals and KPIs
    createdBy INT NOT NULL,
    assignedTo INT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE NO ACTION,
    FOREIGN KEY (assignedTo) REFERENCES Users(id) ON DELETE SET NULL
);

-- Campaign Performance Metrics
CREATE TABLE CampaignMetrics (
    id INT IDENTITY(1,1) PRIMARY KEY,
    campaignId INT NOT NULL,
    metricType NVARCHAR(50) NOT NULL, -- impressions, clicks, conversions, revenue
    value DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    metadata NTEXT NULL, -- JSON for additional data
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (campaignId) REFERENCES MarketingCampaigns(id) ON DELETE CASCADE
);

-- Support Tickets
CREATE TABLE SupportTickets (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ticketNumber NVARCHAR(50) NOT NULL UNIQUE,
    customerId INT NULL,
    customerEmail NVARCHAR(255) NOT NULL,
    customerName NVARCHAR(200) NOT NULL,
    subject NVARCHAR(255) NOT NULL,
    description NTEXT NOT NULL,
    priority NVARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
    status NVARCHAR(50) NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed, cancelled
    category NVARCHAR(100) NULL,
    assignedTo INT NULL,
    resolution NTEXT NULL,
    satisfactionRating INT NULL, -- 1-5 rating
    satisfactionFeedback NTEXT NULL,
    firstResponseAt DATETIME2 NULL,
    resolvedAt DATETIME2 NULL,
    closedAt DATETIME2 NULL,
    tags NVARCHAR(500) NULL,
    metadata NTEXT NULL, -- JSON for additional data
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (customerId) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (assignedTo) REFERENCES Users(id) ON DELETE SET NULL
);

-- Ticket Messages/Replies
CREATE TABLE TicketMessages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ticketId INT NOT NULL,
    senderId INT NULL, -- NULL for customer messages
    senderType NVARCHAR(20) NOT NULL, -- customer, staff
    message NTEXT NOT NULL,
    attachments NTEXT NULL, -- JSON array of file URLs
    isInternal BIT NOT NULL DEFAULT 0, -- internal staff notes
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ticketId) REFERENCES SupportTickets(id) ON DELETE CASCADE,
    FOREIGN KEY (senderId) REFERENCES Users(id) ON DELETE SET NULL
);

-- Knowledge Base Articles
CREATE TABLE KnowledgeBaseArticles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    titleVi NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) NOT NULL UNIQUE,
    content NTEXT NOT NULL,
    contentVi NTEXT NOT NULL,
    excerpt NVARCHAR(500) NULL,
    excerptVi NVARCHAR(500) NULL,
    category NVARCHAR(100) NOT NULL,
    tags NVARCHAR(500) NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, published, archived
    viewCount INT NOT NULL DEFAULT 0,
    helpfulCount INT NOT NULL DEFAULT 0,
    notHelpfulCount INT NOT NULL DEFAULT 0,
    authorId INT NOT NULL,
    publishedAt DATETIME2 NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (authorId) REFERENCES Users(id) ON DELETE NO ACTION
);

-- System Configurations
CREATE TABLE SystemConfigurations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    module NVARCHAR(100) NOT NULL,
    configKey NVARCHAR(100) NOT NULL,
    configValue NTEXT NULL,
    dataType NVARCHAR(50) NOT NULL DEFAULT 'string', -- string, number, boolean, json, array
    description NVARCHAR(500) NULL,
    isSecret BIT NOT NULL DEFAULT 0, -- for sensitive data
    updatedBy INT NOT NULL,
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (updatedBy) REFERENCES Users(id) ON DELETE NO ACTION,
    UNIQUE(module, configKey)
);

-- Data Import/Export Jobs
CREATE TABLE DataJobs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    type NVARCHAR(50) NOT NULL, -- import, export, backup
    status NVARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    dataType NVARCHAR(100) NOT NULL, -- customers, products, orders, etc.
    fileName NVARCHAR(255) NULL,
    filePath NVARCHAR(500) NULL,
    recordsTotal INT NULL,
    recordsProcessed INT NOT NULL DEFAULT 0,
    recordsSuccessful INT NOT NULL DEFAULT 0,
    recordsFailed INT NOT NULL DEFAULT 0,
    errorLog NTEXT NULL,
    options NTEXT NULL, -- JSON configuration
    startedAt DATETIME2 NULL,
    completedAt DATETIME2 NULL,
    createdBy INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE NO ACTION
);

-- Marketing Automation Rules
CREATE TABLE AutomationRules (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    nameVi NVARCHAR(255) NOT NULL,
    description NVARCHAR(500) NULL,
    triggerType NVARCHAR(100) NOT NULL, -- customer_action, time_based, data_change
    triggerConditions NTEXT NOT NULL, -- JSON conditions
    actions NTEXT NOT NULL, -- JSON actions to perform
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
    targetId INT NOT NULL, -- customer or other entity ID
    targetType NVARCHAR(50) NOT NULL, -- customer, order, etc.
    status NVARCHAR(50) NOT NULL, -- success, failed, skipped
    actionsPerformed NTEXT NULL, -- JSON log of actions
    errorMessage NTEXT NULL,
    executedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ruleId) REFERENCES AutomationRules(id) ON DELETE CASCADE
);

-- Reports and Dashboards
CREATE TABLE Reports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    nameVi NVARCHAR(255) NOT NULL,
    type NVARCHAR(100) NOT NULL, -- sales, marketing, customer, system
    category NVARCHAR(100) NULL,
    description NVARCHAR(500) NULL,
    query NTEXT NOT NULL, -- SQL query or report definition
    parameters NTEXT NULL, -- JSON parameter definitions
    chartConfig NTEXT NULL, -- JSON chart configuration
    isPublic BIT NOT NULL DEFAULT 0,
    isScheduled BIT NOT NULL DEFAULT 0,
    scheduleConfig NTEXT NULL, -- JSON schedule configuration
    createdBy INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE NO ACTION
);

-- Report Executions
CREATE TABLE ReportExecutions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    reportId INT NOT NULL,
    parameters NTEXT NULL, -- JSON parameters used
    status NVARCHAR(50) NOT NULL DEFAULT 'running', -- running, completed, failed
    resultData NTEXT NULL, -- JSON result data
    executionTime INT NULL, -- in milliseconds
    errorMessage NTEXT NULL,
    executedBy INT NULL,
    executedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (reportId) REFERENCES Reports(id) ON DELETE CASCADE,
    FOREIGN KEY (executedBy) REFERENCES Users(id) ON DELETE SET NULL
);

-- API Integration Logs
CREATE TABLE ApiIntegrationLogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    service NVARCHAR(100) NOT NULL, -- facebook, google, payment_gateway, etc.
    endpoint NVARCHAR(255) NOT NULL,
    method NVARCHAR(10) NOT NULL,
    requestData NTEXT NULL,
    responseData NTEXT NULL,
    statusCode INT NOT NULL,
    responseTime INT NULL, -- in milliseconds
    success BIT NOT NULL,
    errorMessage NTEXT NULL,
    userId INT NULL,
    ipAddress NVARCHAR(45) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IX_UserActivityLogs_UserId ON UserActivityLogs(userId);
CREATE INDEX IX_UserActivityLogs_CreatedAt ON UserActivityLogs(createdAt);
CREATE INDEX IX_CustomerInteractions_CustomerId ON CustomerInteractions(customerId);
CREATE INDEX IX_CustomerInteractions_AssignedTo ON CustomerInteractions(assignedTo);
CREATE INDEX IX_SalesOpportunities_CustomerId ON SalesOpportunities(customerId);
CREATE INDEX IX_SalesOpportunities_AssignedTo ON SalesOpportunities(assignedTo);
CREATE INDEX IX_SalesOpportunities_Status ON SalesOpportunities(status);
CREATE INDEX IX_SupportTickets_CustomerId ON SupportTickets(customerId);
CREATE INDEX IX_SupportTickets_AssignedTo ON SupportTickets(assignedTo);
CREATE INDEX IX_SupportTickets_Status ON SupportTickets(status);
CREATE INDEX IX_SupportTickets_Priority ON SupportTickets(priority);
CREATE INDEX IX_TicketMessages_TicketId ON TicketMessages(ticketId);
CREATE INDEX IX_CampaignMetrics_CampaignId ON CampaignMetrics(campaignId);
CREATE INDEX IX_CampaignMetrics_Date ON CampaignMetrics(date);

-- Update Users table to support CRM roles
ALTER TABLE Users ADD 
    roleId INT NULL,
    department NVARCHAR(100) NULL,
    manager INT NULL,
    territories NVARCHAR(500) NULL, -- JSON array of territories
    salesQuota DECIMAL(12,2) NULL,
    lastLoginAt DATETIME2 NULL,
    isOnline BIT NOT NULL DEFAULT 0;

-- Add foreign key for role
ALTER TABLE Users ADD FOREIGN KEY (roleId) REFERENCES UserRoles(id) ON DELETE SET NULL;
ALTER TABLE Users ADD FOREIGN KEY (manager) REFERENCES Users(id) ON DELETE SET NULL;

-- Insert default user roles
INSERT INTO UserRoles (name, nameVi, description, descriptionVi, permissions) VALUES
('Super Admin', 'Quản trị viên tối cao', 'Full system access', 'Quyền truy cập toàn hệ thống', '["*"]'),
('Sales Manager', 'Quản lý bán hàng', 'Sales team management', 'Quản lý đội ngũ bán hàng', '["sales.*", "customers.read", "customers.update", "reports.sales"]'),
('Marketing Manager', 'Quản lý marketing', 'Marketing campaign management', 'Quản lý chiến dịch marketing', '["marketing.*", "customers.read", "campaigns.*", "reports.marketing"]'),
('Customer Service', 'Dịch vụ khách hàng', 'Customer support and service', 'Hỗ trợ và chăm sóc khách hàng', '["support.*", "customers.read", "customers.update", "tickets.*"]'),
('Sales Representative', 'Nhân viên bán hàng', 'Sales activities', 'Hoạt động bán hàng', '["sales.read", "sales.create", "customers.read", "opportunities.*"]'),
('Content Manager', 'Quản lý nội dung', 'Content and blog management', 'Quản lý nội dung và blog', '["content.*", "blogs.*", "knowledge_base.*"]');

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
('sales', 'quote_validity_days', '30', 'number', 'Quote validity in days', 1),
('marketing', 'email_from_name', 'Balan Coffee', 'string', 'Default email from name', 1),
('marketing', 'email_from_address', 'no-reply@balancoffee.com', 'string', 'Default email from address', 1),
('support', 'default_ticket_priority', 'medium', 'string', 'Default ticket priority', 1),
('support', 'auto_close_resolved_tickets_days', '7', 'number', 'Auto-close resolved tickets after days', 1),
('system', 'data_retention_days', '2555', 'number', 'Data retention period in days (7 years)', 1),
('system', 'backup_frequency_hours', '24', 'number', 'Backup frequency in hours', 1);

GO
