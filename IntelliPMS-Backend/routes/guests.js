const { Router } = require('express');

// DB connection path
const auth = require('../middlewares/auth');
const guestsController = require('../controllers/guests');

const router = Router();

// Get guests
router.get('/', guestsController.getGuests);

// Checkin
router.post('/checkIn', auth, guestsController.checkIn);

// checkout
router.post('/checkOut', auth, guestsController.checkOut);

// Make Reservation
router.post('/makeReservation', auth, guestsController.makeReservation);

// cancelReservation
router.put('/cancelReservation', auth, guestsController.cancelReservation);

router.post('/reservationCheckIn', auth, guestsController.reservationCheckIn);

router.get('/guestEmailsList', auth, guestsController.guestEmailsList);

router.get('/guestNamesList', auth, guestsController.guestNamesList);

router.get(
  '/guestPhoneNumbersList',
  auth,
  guestsController.guestPhoneNumbersList
);

router.get(
  '/checkOutBalanceBills/:checkInId/:roomId',
  auth,
  guestsController.checkOutBalanceBills
);

router.get('/:checkInId/checkInDetails', auth, guestsController.checkInDetails);

router.post('/payExtra', auth, guestsController.insertExtraPayment);

router.put('/editReservation', auth, guestsController.editReservation);

// router.post('/checkOut', auth, guestsController.checkOut);

router.post('/extendStay', auth, guestsController.extendStay);

// change Room
router.post('/changeRoom', auth, guestsController.changeRoom);

// drop off-key
router.post('/dropOffKey', guestsController.dropOffKey);

// pick up key
router.put('/pickUpKey', auth, guestsController.pickUpKey);

// lost key
router.post('/lostKey', auth, guestsController.lostKey);

// clean room

router.post('/cleanRoom', auth, guestsController.cleanRoom);

// change key
router.post('/changeKey', auth, guestsController.changekey);

module.exports = router;
