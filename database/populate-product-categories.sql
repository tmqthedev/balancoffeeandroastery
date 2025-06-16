-- Insert sample data into ProductCategories table
-- This will assign categories to existing products

-- First, let's see what we have
SELECT 'Current Products:' as info;
SELECT id, name, nameVi FROM Products WHERE isActive = 1;

SELECT 'Current Categories:' as info;
SELECT id, name, nameVi, slug FROM Categories WHERE isActive = 1;

-- Clear existing ProductCategories (if any)
DELETE FROM ProductCategories;

-- Assign categories to products
-- Product 1: Arabica Cầu Đất Premium -> Arabica category
INSERT INTO ProductCategories (productId, categoryId) VALUES (1, 1);

-- Product 2: Robusta Lâm Đồng -> Robusta category  
INSERT INTO ProductCategories (productId, categoryId) VALUES (2, 2);

-- Product 3: Specialty Blend -> Blends category
INSERT INTO ProductCategories (productId, categoryId) VALUES (3, 3);

-- Product 4: Dark Roast Supreme -> Dark Roast category
INSERT INTO ProductCategories (productId, categoryId) VALUES (4, 4);

-- Product 5: Medium Roast Classic -> can have multiple categories
INSERT INTO ProductCategories (productId, categoryId) VALUES (5, 1); -- Arabica
INSERT INTO ProductCategories (productId, categoryId) VALUES (5, 3); -- Blends

-- Verify the data
SELECT 'ProductCategories after insert:' as info;
SELECT 
    pc.productId, 
    pc.categoryId,
    p.name as productName,
    c.name as categoryName,
    c.slug as categorySlug
FROM ProductCategories pc
LEFT JOIN Products p ON pc.productId = p.id
LEFT JOIN Categories c ON pc.categoryId = c.id
ORDER BY pc.productId, pc.categoryId;
