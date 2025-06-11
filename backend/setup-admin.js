// Script để tạo admin user trong database thực
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Hàm để cập nhật user thành admin
async function createOrUpdateAdmin() {
    const db = require('./config/database');
    
    try {
        console.log('🔍 Kiểm tra admin user...');
        
        // Kiểm tra xem admin đã tồn tại chưa
        const existingAdmin = await db.query(
            'SELECT id, email, role FROM Users WHERE email = @email',
            { email: 'admin@balancoffee.com' }
        );
        
        if (existingAdmin.length > 0) {
            // Cập nhật role thành admin
            await db.execute(
                'UPDATE Users SET role = @role WHERE email = @email',
                { email: 'admin@balancoffee.com', role: 'admin' }
            );
            console.log('✅ Đã cập nhật admin@balancoffee.com thành admin role');
        } else {
            // Tạo admin user mới
            const hashedPassword = await bcrypt.hash('admin123456', 12);
            
            const result = await db.execute(
                `INSERT INTO Users (email, password, firstName, lastName, phone, role, emailVerified)
                 OUTPUT INSERTED.* 
                 VALUES (@email, @password, @firstName, @lastName, @phone, 'admin', 1)`,
                {
                    email: 'admin@balancoffee.com',
                    password: hashedPassword,
                    firstName: 'Admin',
                    lastName: 'BalanCoffee',
                    phone: '0901234567'
                }
            );
            
            console.log('✅ Đã tạo admin user mới:', result.recordset[0]);
        }
        
        // Kiểm tra kết quả
        const adminUser = await db.query(
            'SELECT id, email, firstName, lastName, role FROM Users WHERE email = @email',
            { email: 'admin@balancoffee.com' }
        );
        
        console.log('👤 Admin user hiện tại:', adminUser[0]);
        
    } catch (error) {
        console.error('❌ Lỗi:', error);
    }
}

// Chạy script
createOrUpdateAdmin();
