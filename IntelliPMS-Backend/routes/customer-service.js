const { Router } = require('express');

const customerServiceController = require('../controllers/customer-service');
const auth = require('../middlewares/auth');

const router = Router();

router.get(
  '/:hotelId/laundry-services',
  auth,
  customerServiceController.getLaundryServices
);

router.post(
  '/:hotelId/laundry-service/create',
  auth,
  customerServiceController.createLaundryService
);

router.get(
  '/:hotelId/laundry-services/countUnprocessed',
  auth,
  customerServiceController.countUnprocessedLaundryRequest
);

router.put(
  '/:hotelId/laundry-service/update',
  auth,
  customerServiceController.updateLaundryRequest
);
// get room service
router.get(
  '/:hotelId/room-services',
  auth,
  customerServiceController.getRoomServices
);
// update room-service
router.put(
  '/:hotelId/room-service/update',
  customerServiceController.updateRoomServices
);

// Create  room service
router.post(
  '/:hotelId/room-service/create',
  auth,
  customerServiceController.createRoomService
);

router.get(
  '/:hotelId/room-services/countUnprocessed',
  auth,
  customerServiceController.countUnprocessedRoomServiceRequest
);

// get issues comments
router.get(
  '/:hotelId/issues-comments',
  auth,
  customerServiceController.getIssuesComments
);

// update issues comments updated
router.put(
  '/:hotelId/issues-comments/update',
  auth,
  customerServiceController.updateIssuesComments
);

// create issues comments
router.post(
  '/:hotelId/issues-comments/create',
  auth,
  customerServiceController.createIssuesComment
);

router.get(
  '/:hotelId/issues-comments/countUnprocessed',
  auth,
  customerServiceController.countUnprocessedIssuesComments
);

// get  house keep services
router.get(
  '/:hotelId/housekeeping',
  auth,
  customerServiceController.getHouseKeepingServices
);

// count unprocessed
router.get(
  '/:hotelId/housekeeping/countUnprocessed',
  auth,
  customerServiceController.countUnprocessedHouseKeepingRequest
);

// update house keep services
router.put(
  '/:hotelId/housekeeping/update',
  auth,
  customerServiceController.updateHouseKeepingRequest
);

// create house keeping sevices
router.post(
  '/:hotelId/housekeeping/create',
  auth,
  customerServiceController.createHousekeepingServices
);

module.exports = router;
