/* Query to get list of rooms in a hotel*/
SELECT a.roomId, a.hotelId, a.roomNumber, a.roomType, a.cost, a.picture, a.roomStatus,
  a.currentOccupant, CASE WHEN a.roomStatus = 'reserved' THEN c.reservationEndDate ELSE b.checkOutDate END AS freeDate,
  CONCAT(d.guestTitle, ' ',d.lastName,' ', d.firstName) AS currentOccupantName, a.lostKey, a.dropOffKey
FROM rooms a LEFT JOIN checkin_out b ON a.currentOccupant = b.guestId
  LEFT JOIN reservations c ON a.currentOccupant = c.payingGuestId
  LEFT JOIN guests d ON a.currentOccupant = d.guestId
WHERE hotelId = ?
GROUP BY a.roomId
ORDER BY roomStatus
= 'occupied' DESC, lostKey = 'true', roomStatus = 'reserved' DESC, roomNumber

/*Query 1 to update the hotelId in the billings table*/
UPDATE billings a 
INNER JOIN checkin_out b
ON a.billedForId = b.checkInId
INNER JOIN rooms c ON b.roomId = c.roomId
SET a.hotelId = c.hotelId
WHERE a.billedFor = 'checkin' OR a.billedFor = 'balance during checkout'
OR a.billedFor = 'extra payment' OR a.billedFor = 'reservation checkin'

/*Query 2 to update the hotelId in the billings table*/
UPDATE billings a
INNER JOIN reservations b
ON a.billedForId = b.reservationId
SET a.hotelId = b.hotelId
WHERE a.billedFor = 'reservation'

