// Script để reset tài khoản mặc định trong Azure SQL Database
require('dotenv').config();
const bcrypt = require('bcryptjs');

async function resetDefaultAccounts() {
    const db = require('./config/database');
    
    try {
        console.log('🔍 Connecting to Azure SQL Database...');
        await db.connect();
        console.log('✅ Connected successfully');
        
        // Tạo hash password cho password123
        const hashedPassword = await bcrypt.hash('password123', 12);
        console.log('🔐 Generated password hash');
        
        // Xóa tài khoản cũ nếu có
        console.log('🗑️  Cleaning old accounts...');
        await db.execute(
            'DELETE FROM Users WHERE email IN (@adminEmail, @userEmail)',
            { 
                adminEmail: 'admin@balancoffee.com',
                userEmail: 'user@example.com'
            }
        );
        
        // Tạo admin account
        console.log('👤 Creating admin account...');
        const adminResult = await db.execute(
            `INSERT INTO Users (email, password, firstName, lastName, role, emailVerified, isActive)
             OUTPUT INSERTED.id, INSERTED.email, INSERTED.role
             VALUES (@email, @password, @firstName, @lastName, 'admin', 1, 1)`,
            {
                email: 'admin@balancoffee.com',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'BalanCoffee'
            }
        );
        console.log('✅ Admin created:', adminResult.recordset[0]);
        
        // Tạo customer account
        console.log('👤 Creating customer account...');
        const customerResult = await db.execute(
            `INSERT INTO Users (email, password, firstName, lastName, role, emailVerified, isActive)
             OUTPUT INSERTED.id, INSERTED.email, INSERTED.role
             VALUES (@email, @password, @firstName, @lastName, 'customer', 1, 1)`,
            {
                email: 'user@example.com',
                password: hashedPassword,
                firstName: 'John',
                lastName: 'Doe'
            }
        );
        console.log('✅ Customer created:', customerResult.recordset[0]);
        
        // Kiểm tra kết quả
        console.log('\n📋 Verifying accounts...');
        const accounts = await db.query(
            'SELECT id, email, firstName, lastName, role, emailVerified, isActive FROM Users WHERE email IN (@adminEmail, @userEmail)',
            { 
                adminEmail: 'admin@balancoffee.com',
                userEmail: 'user@example.com'
            }
        );
        
        console.log('✅ Default accounts in database:');
        accounts.forEach(account => {
            console.log(`   - ${account.email} (${account.role}) - Active: ${account.isActive}`);
        });
        
        console.log('\n🎉 Setup completed successfully!');
        console.log('\n📝 Login credentials:');
        console.log('   Admin: admin@balancoffee.com / password123');
        console.log('   Customer: user@example.com / password123');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        await db.close();
        process.exit(0);
    }
}

resetDefaultAccounts();
