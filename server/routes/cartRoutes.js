const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.use(protect);
router.get('/', getCart);
router.post('/', [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be >= 1'),
], validate, addToCart);
router.put('/:id', [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be >= 1')], validate, updateCartItem);
router.delete('/clear', clearCart);  // must be before /:id
router.delete('/:id', removeCartItem);

module.exports = router;
