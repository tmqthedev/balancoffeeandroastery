@echo off
echo 🧪 Testing CRM Admin Integration...
echo.
echo 📱 Opening test pages in browser...
echo.

REM Open the test admin page
start http://localhost:3001/admin/test

REM Wait a moment then open CRM page  
timeout /t 3 /nobreak >nul
start http://localhost:3001/admin/crm

echo ✅ Test pages opened!
echo.
echo 📋 Check the following:
echo 1. Admin test page should show "SUCCESS!" message
echo 2. CRM page should show dashboard or login prompt
echo 3. Check browser console for any errors
echo.
echo 💡 If you need to login:
echo Email: admin@balancoffee.com
echo Password: password123
echo.
pause
