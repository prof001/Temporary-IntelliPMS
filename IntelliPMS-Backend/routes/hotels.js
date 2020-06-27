const { Router } = require('express');
const handleHotelPix = require('../middlewares/hotel_pix_handler');
const handleRoomPix = require('../middlewares/room_pix_handler');
// DB connect

// const helper = require('../utility/helper_functions');
const hotelsController = require('../controllers/hotels');
const auth = require('../middlewares/auth');

const router = Router();

// get hotels
router.get('/', auth, hotelsController.getHotels);

// Study this route
router.get('/:hotelId', auth, hotelsController.getHotelInfo);

// select rooms mapped to a hotel
router.get('/:hotelId/rooms', auth, hotelsController.getHotelRooms);

router.get('/:hotelId/allRooms', hotelsController.getAllHotelRooms);

router.get(
  '/:hotelId/reservations',
  auth,
  hotelsController.getHotelReservations
);

router.get(
  '/:hotelId/reservation/:reservationId',
  auth,
  hotelsController.getReservationInfo
);

// get rooms and attributes
router.get('/:hotelId/rooms/:roomId', auth, hotelsController.getRoomsInfo);

// update room
router.put(
  '/:hotelId/rooms/:roomId',
  auth,
  handleHotelPix,
  hotelsController.updateRooms
);

// Create Hotel
router.post('/createHotel', auth, handleHotelPix, hotelsController.createHotel);

router.put('/:hotelId/edit', (request, response) => {
  console.log(request.body);
});

// Create Room
router.post(
  '/:hotelId/createRoom',
  auth,
  handleRoomPix,
  hotelsController.createRoom
);

// Create Hotel Services
router.post(
  '/:hotelId/createService',
  auth,
  hotelsController.createHotelService
);

router.get(
  '/:hotelId/getHotelAccountDetails',
  auth,
  hotelsController.getHotelAccountDetails
);

router.get(
  '/:hotelId/getHotelPosDetails',
  auth,
  hotelsController.getHotelPosDetails
);

//  get the total rooms type available
router.get(
  '/:hotelId/roomAvailabilitySummary',
  auth,
  hotelsController.getAvailableRoomsSummary
);

// get all checkin rooms and by room types
router.get(
  '/:hotelId/currentCheckInRooms',

  hotelsController.getCheckedInRooms
);

// get guest details by email
router.get('/:hotelId/guestEmailsList', auth, hotelsController.guestEmailList);

// create room type
router.post('/:hotelId/createRoomType', auth, hotelsController.createRoomType);

// create Building
router.post(
  '/:hotelId/createBuilding',
  auth,
  hotelsController.createHotelBuilding
);

// get Hotel room types, base price
router.get(
  '/:hotelId/hotelRoomTypes',
  auth,
  hotelsController.getHotelRoomTypes
);

// get hotel building
router.get('/:hotelId/hotelBuildings', auth, hotelsController.getHotelBuilding);

// get Hotel account
router.get('/:hotelId/getAccounts', auth, hotelsController.getAccounts);

// check checkAvailability
router.get(
  '/:hotelId/:roomId/checkAvailability',
  auth,
  hotelsController.checkAvailability
);

// Current Guest
router.get('/:hotelId/currentGuests', auth, hotelsController.getCurrentGuests);

router.get('/:hotelId/services', auth, hotelsController.getHotelServices);

router.get('/:hotelId/staffs', auth, hotelsController.getHotelStaffs);

// get room number
router.get('/:hotelId/roomNumbers', auth, hotelsController.getRoomNumbers);

// get room number
router.get('/:hotelId/roomTypes', auth, hotelsController.getRoomTypes);

// get hotel building
router.get('/:hotelId/hotelBuildings', auth, hotelsController.getBuildings);

// get current check in Guest by name
router.get(
  '/:hotelId/currentCheckinByGuestName',
  auth,

  hotelsController.getCheckedInRoomsByGuestNames
);

// get cash register
router.get('/:hotelId/cashRegisters', auth, hotelsController.cashRegisters);

// not for sale
router.put('/:hotelId/notForSale', auth, hotelsController.notForSale);
module.exports = router;
