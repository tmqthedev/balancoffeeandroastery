/**
 * Security middleware for Express.js application
 * Implements various security features to protect the API from common attacks
 */
const { body, param, query, validationResult } = require('express-validator');

// Validate and sanitize request inputs
const validateRequest = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  };
};

// Product validation rules
const productValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Tên sản phẩm phải có từ 3 đến 255 ký tự'),
  body('nameVi')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Tên tiếng Việt phải có từ 3 đến 255 ký tự'),
  body('description')
    .optional()
    .isString()
    .withMessage('Mô tả phải là chuỗi'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Giá phải là số dương'),
  body('stockQuantity')
    .isInt({ min: 0 })
    .withMessage('Số lượng trong kho phải là số nguyên dương'),
  body('sku')
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU phải có từ 3 đến 50 ký tự'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive phải là giá trị boolean'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured phải là giá trị boolean')
];

// User validation rules
const userValidationRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ')
    .isLength({ max: 255 })
    .withMessage('Email không được quá 255 ký tự'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Mật khẩu phải có từ 6 đến 128 ký tự')
    .matches(/^(?=.*[a-zA-Z])/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ cái')
    .not()
    .contains(' ')
    .withMessage('Mật khẩu không được chứa khoảng trắng'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ và tên phải có từ 2 đến 100 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
    .withMessage('Họ và tên chỉ được chứa chữ cái và khoảng trắng'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tên phải có từ 1 đến 50 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ]+$/)
    .withMessage('Tên chỉ được chứa chữ cái'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Họ phải có từ 1 đến 50 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
    .withMessage('Họ chỉ được chứa chữ cái và khoảng trắng'),
  body('phone')
    .notEmpty()
    .withMessage('Số điện thoại là bắt buộc')
    .matches(/^[0-9+\-\s()]{8,20}$/)
    .withMessage('Số điện thoại không hợp lệ')
    .custom((value) => {
      const phoneClean = value.replace(/[\s\-\(\)]/g, '');
      if (phoneClean.startsWith('0') && phoneClean.length !== 10) {
        throw new Error('Số điện thoại Việt Nam phải có 10 chữ số (bắt đầu bằng 0)');
      }
      if (phoneClean.startsWith('+84') && phoneClean.length !== 12) {
        throw new Error('Số điện thoại quốc tế phải có định dạng +84xxxxxxxxx');
      }
      return true;
    }),
  // Optional demographic fields with validation
  body('dateOfBirth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Ngày sinh không hợp lệ')
    .custom((value) => {
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (birthDate > today) {
          throw new Error('Ngày sinh không thể là ngày trong tương lai');
        }
        if (age < 13) {
          throw new Error('Bạn phải từ 13 tuổi trở lên để đăng ký');
        }
        if (age > 120) {
          throw new Error('Ngày sinh không hợp lệ');
        }
      }
      return true;
    }),
  body('gender')
    .optional({ checkFalsy: true })
    .isIn(['male', 'female', 'other'])
    .withMessage('Giới tính không hợp lệ'),
  body('occupation')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nghề nghiệp không được quá 100 ký tự'),
  body('coffeePreference')
    .optional({ checkFalsy: true })
    .isIn(['light', 'medium', 'dark', 'mixed'])
    .withMessage('Sở thích cà phê không hợp lệ'),
  body('marketingConsent')
    .optional({ checkFalsy: true })
    .isBoolean()
    .withMessage('Đồng ý marketing phải là giá trị boolean'),
  // Optional address fields with better validation
  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Địa chỉ không được quá 255 ký tự'),
  body('ward')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Phường/Xã không được quá 100 ký tự'),
  body('district')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Quận/Huyện không được quá 100 ký tự'),
  body('city')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tỉnh/Thành phố không được quá 100 ký tự'),
  body('province')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tỉnh không được quá 100 ký tự'),
  body('postalCode')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9]{5,6}$/)
    .withMessage('Mã bưu điện phải có 5-6 chữ số'),
];

// Login validation rules
const loginValidationRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Mật khẩu không được để trống')
];

// Order validation rules
const orderValidationRules = [
  body('customerInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('customerInfo.fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ và tên phải có từ 2 đến 100 ký tự'),
  body('customerInfo.firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên phải có từ 2 đến 50 ký tự'),
  body('customerInfo.lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Họ phải có từ 2 đến 50 ký tự'),
  body('customerInfo.phone')
    .optional()
    .matches(/^[0-9+\-\s()]{8,20}$/)
    .withMessage('Số điện thoại không hợp lệ'),
  body('shippingAddress.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Địa chỉ phải có từ 5 đến 200 ký tự'),
  body('shippingAddress.wardCommune')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Phường/Xã phải có từ 2 đến 100 ký tự'),
  body('shippingAddress.district')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Quận/Huyện phải có từ 2 đến 100 ký tự'),
  body('shippingAddress.province')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Tỉnh/Thành phố phải có từ 2 đến 100 ký tự'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Đơn hàng phải có ít nhất 1 sản phẩm'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('ID sản phẩm không hợp lệ'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Số lượng phải là số nguyên dương'),
  body('items.*.price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Giá sản phẩm phải là số dương'),
  body('paymentMethod')
    .isIn(['contact', 'cod'])
    .withMessage('Phương thức thanh toán không hợp lệ'),
  body('subtotal')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Tổng phụ phải là số dương'),
  body('total')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Tổng cộng phải là số dương')
];

// Blog validation rules
const blogValidationRules = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Tiêu đề phải có từ 5 đến 255 ký tự'),
  body('titleVi')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Tiêu đề tiếng Việt phải có từ 5 đến 255 ký tự'),
  body('content')
    .isLength({ min: 10 })
    .withMessage('Nội dung phải có ít nhất 10 ký tự'),
  body('contentVi')
    .isLength({ min: 10 })
    .withMessage('Nội dung tiếng Việt phải có ít nhất 10 ký tự'),
  body('status')
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Trạng thái bài viết không hợp lệ')
];

// Contact form validation rules
const contactValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên phải có từ 2 đến 100 ký tự'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Tiêu đề phải có từ 5 đến 200 ký tự'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Nội dung phải có từ 10 đến 10000 ký tự')
];

// Validate ID param
const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID không hợp lệ')
];

// Validate pagination params
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Trang phải là số nguyên dương'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Giới hạn phải là số nguyên dương và không quá 100')
];

// Address validation rules
const addressValidationRules = [
  body('fullName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Họ tên không được để trống và không quá 100 ký tự'),
  body('phone')
    .matches(/^[0-9+\-\s()]{8,20}$/)
    .withMessage('Số điện thoại không hợp lệ'),
  body('street')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Địa chỉ không được để trống và không quá 255 ký tự'),
  body('ward')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Phường/Xã không được để trống và không quá 100 ký tự'),
  body('district')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Quận/Huyện không được để trống và không quá 100 ký tự'),
  body('city')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tỉnh/Thành phố không được để trống và không quá 100 ký tự'),
  body('postalCode')
    .optional()
    .trim()
    .matches(/^[0-9]{5,6}$/)
    .withMessage('Mã bưu điện phải có 5-6 chữ số'),
  body('label')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Nhãn địa chỉ không được quá 50 ký tự'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault phải là giá trị boolean')
];

module.exports = {
  validateRequest,
  productValidationRules,
  userValidationRules,
  loginValidationRules,
  orderValidationRules,
  blogValidationRules,
  contactValidationRules,
  validateIdParam,
  validatePagination,
  addressValidationRules
};
