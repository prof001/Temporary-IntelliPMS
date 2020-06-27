const { Router } = require('express');

const reportsController = require('../controllers/reports');
const auth = require('../middlewares/auth');

const router = Router();

// get room status
router.get('/:hotelId/getRoomStatus', auth, reportsController.getRoomStatus);

// get checkedIn room
router.get(
  '/:hotelId/getCheckedInRooms',
  auth,
  reportsController.getCheckedInRooms
);

router.get('/:hotelId/getCheckInOut', auth, reportsController.getCheckInOut);

router.get('/:hotelId/getDailyRevenue', auth, reportsController.dailyRevenue);

router.get(
  '/:hotelId/getCustomerServiceStats',
  auth,
  reportsController.customerServiceStats
);

// room revenue
router.get('/:hotelId/getRoomRevenue', auth, reportsController.roomRevenue);

// get room type revenue
router.get(
  '/:hotelId/getRoomTypeRevenue',
  auth,
  reportsController.roomTypeRevenue
);

// Get hotel statis
router.get('/:hotelId/hotelStats', auth, reportsController.hotelsStats);

// Get cash register
router.get(
  '/:hotelId/cashRegister',
  auth,
  reportsController.cashRegisterStatus
);

// Get Total Activities Count
router.get(
  '/:hotelId/totalActivityCount',
  auth,
  reportsController.totalActivityCount
);

router.get('/:hotelId/revenueStats', reportsController.revenueStats);

router.get('/:hotelId/customers', reportsController.customers);

// guestsStats
router.get('/:hotelId/guestsStats', reportsController.getGuestStats);
module.exports = router;
