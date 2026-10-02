const express = require('express');
const router = express.Router();
const {
  createExchange,
  getSentExchanges,
  getReceivedExchanges,
  getExchangeById,
  acceptExchange,
  rejectExchange,
  completeExchange,
} = require('../controllers/exchangeController');
const authMiddleware = require('../middleware/authMiddleware');

// All exchange routes require authentication
router.use(authMiddleware);

router.post('/', createExchange);

router.get('/sent', getSentExchanges);
router.get('/received', getReceivedExchanges);

router.get('/:exchangeId', getExchangeById);

router.patch('/:exchangeId/accept', acceptExchange);
router.patch('/:exchangeId/reject', rejectExchange);
router.patch('/:exchangeId/complete', completeExchange);

module.exports = router;
