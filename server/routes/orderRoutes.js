const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus, getSalesReport } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.use(protect);

// Admin routes MUST come before /:id to avoid param conflict
router.get('/admin/all', adminOnly, getAllOrders);
router.get('/admin/report', adminOnly, getSalesReport);
router.put('/admin/:id/status', adminOnly, [body('status').notEmpty().withMessage('Status required')], validate, updateOrderStatus);

router.post('/', [
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.full_name').notEmpty().withMessage('Full name required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone required'),
  body('shippingAddress.address_line1').notEmpty().withMessage('Address required'),
  body('shippingAddress.city').notEmpty().withMessage('City required'),
  body('shippingAddress.state').notEmpty().withMessage('State required'),
  body('shippingAddress.postal_code').notEmpty().withMessage('Postal code required'),
], validate, createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
