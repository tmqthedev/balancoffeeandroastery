import React from 'react';

const PasswordStrengthIndicator = ({ password }) => {
    const calculateStrength = (password) => {
        if (!password) return { score: 0, feedback: [] };
        
        let score = 0;
        const feedback = [];
        
        // Length check
        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('Ít nhất 8 ký tự');
        }
        
        // Uppercase check
        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Ít nhất 1 chữ hoa');
        }
        
        // Lowercase check
        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Ít nhất 1 chữ thường');
        }
        
        // Number check
        if (/[0-9]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Ít nhất 1 chữ số');
        }
        
        // Special character check
        if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Ít nhất 1 ký tự đặc biệt');
        }
        
        return { score, feedback };
    };
    
    const getStrengthInfo = (score) => {
        if (score <= 1) {
            return { 
                label: 'Rất yếu', 
                color: 'bg-red-500', 
                textColor: 'text-red-600',
                width: '20%' 
            };
        } else if (score === 2) {
            return { 
                label: 'Yếu', 
                color: 'bg-orange-500', 
                textColor: 'text-orange-600',
                width: '40%' 
            };
        } else if (score === 3) {
            return { 
                label: 'Trung bình', 
                color: 'bg-yellow-500', 
                textColor: 'text-yellow-600',
                width: '60%' 
            };
        } else if (score === 4) {
            return { 
                label: 'Mạnh', 
                color: 'bg-green-500', 
                textColor: 'text-green-600',
                width: '80%' 
            };
        } else {
            return { 
                label: 'Rất mạnh', 
                color: 'bg-green-600', 
                textColor: 'text-green-700',
                width: '100%' 
            };
        }
    };
    
    if (!password) return null;
    
    const { score, feedback } = calculateStrength(password);
    const strengthInfo = getStrengthInfo(score);
    
    return (
        <div className="mt-2 space-y-2">
            {/* Strength Bar */}
            <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${strengthInfo.color} transition-all duration-300 ease-in-out`}
                        style={{ width: strengthInfo.width }}
                    />
                </div>
                <span className={`text-sm font-medium ${strengthInfo.textColor}`}>
                    {strengthInfo.label}
                </span>
            </div>
            
            {/* Feedback */}
            {feedback.length > 0 && (
                <div className="text-xs text-gray-600">
                    <span>Để tăng độ mạnh: </span>
                    <span>{feedback.join(', ')}</span>
                </div>
            )}
            
            {/* Success message */}
            {score >= 4 && (
                <div className="flex items-center text-xs text-green-600">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Mật khẩu đủ mạnh!
                </div>
            )}
        </div>
    );
};

export default PasswordStrengthIndicator;