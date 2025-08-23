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
    .withMessage('Email không hợp lệ'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Họ không được để trống'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Tên không được để trống'),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]{8,20}$/)
    .withMessage('Số điện thoại không hợp lệ'),
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
  body('customerEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('customerName')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Tên khách hàng phải có từ 3 đến 100 ký tự'),
  body('customerPhone')
    .optional()
    .matches(/^[0-9+\-\s()]{8,20}$/)
    .withMessage('Số điện thoại không hợp lệ'),
  body('shippingAddress')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Địa chỉ giao hàng phải có từ 5 đến 500 ký tự'),
  body('shippingCity')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Thành phố giao hàng phải có từ 2 đến 100 ký tự'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Đơn hàng phải có ít nhất 1 sản phẩm'),
  body('items.*.productId')
    .isInt({ min: 1 })
    .withMessage('ID sản phẩm không hợp lệ'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Số lượng phải là số nguyên dương'),
  body('paymentMethod')
    .isIn(['momo', 'cod'])
    .withMessage('Phương thức thanh toán không hợp lệ')
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

module.exports = {
  validateRequest,
  productValidationRules,
  userValidationRules,
  loginValidationRules,
  orderValidationRules,
  blogValidationRules,
  contactValidationRules,
  validateIdParam,
  validatePagination
};
