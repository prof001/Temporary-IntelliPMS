/* eslint-disable eqeqeq */
/* eslint-disable prefer-destructuring */
const db = require('../db/index');

// get room status
exports.getRoomStatus = (request, response) => {
  const { hotelId } = request.params;
  db.query(
    `select hotelId, roomId, roomNumber, roomStatus,
    notForSale, cleanRoom, dropOffKey, lostKey from rooms where hotelId = ? order by roomNumber`,
    [hotelId],
    (err, res) => {
      if (err) throw err;
      response.status(200).send(res);
    }
  );
};

// get checkInRooms
exports.getCheckedInRooms = (request, response) => {
  const { hotelId } = request.params;
  let checkedInRooms;

  const getBills = () => {
    const count = checkedInRooms.length;
    for (const i in checkedInRooms) {
      if (checkedInRooms[i].changed_room === 'true') {
        // Bills with extended stay
        const sql = `SELECT amount FROM laundry_services WHERE checkInId = ? 
          AND statuss = 'completed' AND paymentStatus='unpaid'
          UNION
          SELECT amount FROM room_services WHERE checkInId = ? 
          AND statuss = 'completed' AND paymentStatus='unpaid'
          UNION
          SELECT amount FROM housekeeping WHERE checkInId = ? 
          AND statuss = 'completed' AND paymentStatus='unpaid'
          UNION
          SELECT cost AS amount FROM extend_stay WHERE checkInId = ?
          UNION
          SELECT (DATEDIFF(NOW(), (a.checkInDate)) - c.oldRoomStayDays) * b.adjustedPrice AS amount  
          FROM checkin_out a
          INNER JOIN rooms b ON a.roomId = b.roomId
          INNER JOIN changed_rooms c ON a.checkInId = c.checkInId
          WHERE a.checkInId = ?
          UNION
          SELECT a.oldRoomStayDays * b.adjustedPrice AS amount
          FROM changed_rooms a 
          INNER JOIN rooms b ON a.oldRoomId = b.roomId
          INNER JOIN checkin_out c ON a.checkInId = c.checkInId
          WHERE a.checkInId = ?`;
        db.query(
          sql,
          [
            checkedInRooms[i].checkInId,
            checkedInRooms[i].checkInId,
            checkedInRooms[i].checkInId,
            checkedInRooms[i].checkInId,
            checkedInRooms[i].checkInId,
            checkedInRooms[i].checkInId,
          ],
          (err, res) => {
            if (err) throw err;

            const totalBill = res.reduce((a, b) => a + b.amount, 0);
            checkedInRooms[i].totalBill = totalBill;

            if (count - 1 === +i) {
              response.status(200).send(checkedInRooms);
            }
          }
        );
      } else {
        const sql = `SELECT amount FROM laundry_services WHERE checkInId = ? 
          AND statuss = 'completed' AND paymentStatus='unpaid'
          UNION
          SELECT amount FROM room_services WHERE checkInId = ? 
          AND statuss = 'completed' AND paymentStatus='unpaid'
          UNION
          SELECT amount FROM housekeeping WHERE checkInId = ? 
          AND statuss = 'completed' AND paymentStatus='unpaid'
          UNION
          SELECT DATEDIFF(NOW(), checkInDate)*b.adjustedPrice AS amount  
          FROM checkin_out a INNER JOIN rooms b ON a.roomId = b.roomId
          WHERE a.statuss = 'active' AND a.checkInId = ?
          UNION
          SELECT cost AS amount FROM extend_stay WHERE checkInId = ?`;
        db.query(
          sql,
          [
            checkedInRooms[i].checkInId,
            checkedInRooms[i].checkInId,
            checkedInRooms[i].checkInId,
            checkedInRooms[i].checkInId,
            checkedInRooms[i].checkInId,
          ],
          (err, res) => {
            if (err) throw err;

            const totalBill = res.reduce((a, b) => a + b.amount, 0);
            checkedInRooms[i].totalBill = totalBill;

            if (count - 1 === +i) {
              response.status(200).send(checkedInRooms);
            }
          }
        );
      }
    }
  };

  const getDeposits = () => {
    const count = checkedInRooms.length;
    for (const i in checkedInRooms) {
      if (checkedInRooms[i].reservationId !== null) {
        db.query(
          `SELECT amount FROM billings
          WHERE billedFor = 'reservation' AND billedForId = ? UNION
          SELECT amount FROM billings
          WHERE billedFor = 'reservation-checkin' AND billedForId = ? UNION
          SELECT amount FROM billings
          WHERE billedFor = 'extra payment' AND billedForId = ?`,
          [
            checkedInRooms[i].reservationId,
            checkedInRooms[i].checkInId,
            checkedInRooms[i].checkInId,
          ],
          (err, res) => {
            if (err) throw err;
            const totalDeposit = res.reduce((a, b) => a + b.amount, 0);
            checkedInRooms[i].totalDeposit = totalDeposit;

            if (count - 1 === +i) {
              getBills();
            }
          }
        );
      } else {
        db.query(
          `SELECT amount FROM billings
          WHERE billedFor = 'checkin' AND billedForId = ? UNION
          SELECT amount FROM billings
          WHERE billedFor = 'extra payment' AND billedForId = ?`,
          [checkedInRooms[i].checkInId, checkedInRooms[i].checkInId],
          (err, res) => {
            if (err) throw err;
            const totalDeposit = res.reduce((a, b) => a + b.amount, 0);
            checkedInRooms[i].totalDeposit = totalDeposit;

            if (count - 1 === +i) {
              getBills();
            }
          }
        );
      }
    }
  };

  db.query(
    `SELECT a.checkInId, a.roomId, b.roomNumber, a.checkInDate, a.checkOutDate,
    a.extended, c.extensionOption, c.extensionLength, a.numOfGuests, a.reservationId, b.dropOffKey,
    a.changedRoom FROM checkin_out a LEFT JOIN rooms b ON a.roomId = b.roomId
    LEFT JOIN extend_stay c ON a.checkInId = c.checkInId
    WHERE a.statuss = 'active' AND b.hotelId = ? ORDER BY b.roomNumber`,
    [hotelId],
    (err, res) => {
      if (err) throw err;
      checkedInRooms = res;
      getDeposits();
    }
  );
};

exports.getCheckInOut = (request, response) => {
  const { hotelId } = request.params;
  let checkinOutDetails;
  const { startDate, endDate } = request.query;

  // multiple guest function
  const getMultipleGuest = () => {
    const len = checkinOutDetails.length;
    if (len === 0) {
      response.status(200).send([]);
    } else {
      let count = 0;
      for (const i in checkinOutDetails) {
        if (checkinOutDetails[i].guestName === null) {
          db.query(
            `SELECT CONCAT(b.guestTitle, ' ',b.lastName, ' ', b.firstName) AS multipleGuestName
          FROM multiple_staying_guest_table a
          INNER JOIN guests b ON b.guestId = a.guestId
          WHERE tempGuestId =  ?`,
            [checkinOutDetails[i].guestId],
            (err, res) => {
              if (err) throw err;
              const myGuest = res.map((obj) => obj.multipleGuestName);
              checkinOutDetails[i].guestName = myGuest;
              count += 1;
              if (count === len) {
                response.status(200).send(checkinOutDetails);
              }
            }
          );
        } else {
          count += 1;
          if (count === len) {
            response.status(200).send(checkinOutDetails);
          }
        }
      }
    }
  };
  if (startDate && endDate) {
    db.query(
      `SELECT  a.checkInId, c.roomId, c.roomTypeId, c.roomNumber, a.guestId,
      CONCAT(b.guestTitle, ' ',b.lastName, ' ', b.firstName) AS guestName, 
      a.createdBy, c.roomTypeId, c.roomNumber, a.checkInDate, a.checkOutDate, 
      a.numOfGuests, a.actualCheckOutDate, a.statuss, a.reservationId   
      FROM checkin_out a
      LEFT JOIN guests b ON a.guestId = b.guestId
      JOIN rooms c ON a.roomId = c.roomId 
      WHERE (a.checkInDate >= ? AND a.checkInDate <= ?)
      OR (a.actualCheckOutDate >= ? AND a.actualCheckOutDate <= ?) 
      AND c.hotelId = ? ORDER BY a.checkInDate DESC, a.actualCheckOutDate DESC`,
      [startDate, endDate, startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        checkinOutDetails = res;
        getMultipleGuest();
      }
    );
  } else if (startDate) {
    db.query(
      `SELECT  a.checkInId, c.roomId, c.roomTypeId, c.roomNumber, a.guestId,
      CONCAT(b.guestTitle, ' ',b.lastName, ' ', b.firstName) AS guestName, 
      a.createdBy, c.roomTypeId, c.roomNumber, a.checkInDate, a.checkOutDate, 
      a.numOfGuests, a.actualCheckOutDate, a.statuss, a.reservationId   
      FROM checkin_out a
      LEFT JOIN guests b ON a.guestId = b.guestId
      JOIN rooms c ON a.roomId = c.roomId 
      WHERE (a.checkInDate >= ? AND a.checkInDate <= NOW())
      OR (a.actualCheckOutDate >= ? AND a.actualCheckOutDate <= NOW()) 
      AND c.hotelId = ? ORDER BY a.checkInDate DESC, a.actualCheckOutDate DESC`,
      [startDate, startDate, hotelId],
      (err, res) => {
        if (err) throw err;
        checkinOutDetails = res;
        getMultipleGuest();
      }
    );
  } else if (endDate) {
    db.query(
      `SELECT  a.checkInId, c.roomId, c.roomTypeId, c.roomNumber, a.guestId,
      CONCAT(b.guestTitle, ' ',b.lastName, ' ', b.firstName) AS guestName, 
      a.createdBy, c.roomTypeId, c.roomNumber, a.checkInDate, a.checkOutDate, 
      a.numOfGuests, a.actualCheckOutDate, a.statuss, a.reservationId   
      FROM checkin_out a
      LEFT JOIN guests b ON a.guestId = b.guestId
      JOIN rooms c ON a.roomId = c.roomId 
      WHERE (a.checkInDate >= NOW() AND a.checkInDate <= ?)
      OR (a.actualCheckOutDate >= NOW() AND a.actualCheckOutDate <= ?) 
      AND c.hotelId = ? ORDER BY a.checkInDate DESC, a.actualCheckOutDate DESC`,
      [endDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        checkinOutDetails = res;
        getMultipleGuest();
      }
    );
  }
};

// room Daily  revenue
exports.dailyRevenue = (request, response) => {
  const revenue = [];
  let roomRevenue;
  let roomServiceRevenue;
  let laundryServiceRevenue;
  let houseKeepingRevenue;
  const combinedRevenue = [];
  const { startDate, endDate } = request.query;
  const { hotelId } = request.params;

  const combineResult = () => {
    const dates = revenue.map((obj) => obj.eachDay);
    const uniqueDates = [...new Set(dates)];
    uniqueDates.sort();

    for (const i in uniqueDates) {
      combinedRevenue.push({
        date: uniqueDates[i],
        roomRevenue: null,
        roomServiceRevenue: null,
        laundryServiceRevenue: null,
        houseKeepingRevenue: null,
      });

      for (const val of roomRevenue) {
        if (val.eachDay === uniqueDates[i]) {
          combinedRevenue[i].roomRevenue = val.roomRevenue;
        }
      }

      for (const val of roomServiceRevenue) {
        if (val.eachDay === uniqueDates[i]) {
          combinedRevenue[i].roomServiceRevenue = val.roomServiceRevenue;
        }
      }

      for (const val of laundryServiceRevenue) {
        if (val.eachDay === uniqueDates[i]) {
          combinedRevenue[i].laundryServiceRevenue = val.laundryServiceRevenue;
        }
      }

      for (const val of houseKeepingRevenue) {
        if (val.eachDay === uniqueDates[i]) {
          combinedRevenue[i].houseKeepingRevenue = val.houseKeepingRevenue;
        }
      }
    }
    response.status(200).send(combinedRevenue);
  };

  const getHouseKeepingRevenue = () => {
    db.query(
      `SELECT DATE_FORMAT(endDateTime,'%d/%m/%Y') AS eachDay, 
      SUM(amount) AS houseKeepingRevenue FROM housekeeping a
      INNER JOIN rooms b ON a.roomId = b.roomId
      WHERE endDateTime >= ? 
      AND endDateTime <= ? AND b.hotelId = ?
      AND statuss = 'completed' GROUP BY CAST(endDateTime AS DATE)`,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        houseKeepingRevenue = res;
        revenue.push(...res);
        combineResult();
      }
    );
  };

  const getLaundryServiceRevenue = () => {
    db.query(
      `SELECT DATE_FORMAT(completedDateTime,'%d/%m/%Y') AS eachDay, 
      SUM(amount) AS laundryServiceRevenue 
      FROM laundry_services a
      INNER JOIN rooms b ON a.roomId = b.roomId
      WHERE completedDateTime >= ? 
      AND completedDateTime <= ? AND b.hotelId = ?
      AND statuss = 'completed' GROUP BY CAST(completedDateTime AS DATE)`,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        laundryServiceRevenue = res;
        revenue.push(...res);
        getHouseKeepingRevenue();
      }
    );
  };

  const getRoomServiceRevenue = () => {
    db.query(
      `SELECT DATE_FORMAT(a.completedDateTime,'%d/%m/%Y') AS eachDay, 
      SUM(a.amount) AS roomServiceRevenue FROM room_services a
      INNER JOIN rooms b ON a.roomId = b.roomId
      WHERE a.completedDateTime >= ? 
      AND a.completedDateTime <= ? AND b.hotelId = ?
      AND a.statuss = 'completed' GROUP BY CAST(a.completedDateTime AS DATE) `,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        roomServiceRevenue = res;
        revenue.push(...res);
        getLaundryServiceRevenue();
      }
    );
  };

  db.query(
    `SELECT DATE_FORMAT(a.checkInDate,'%d/%m/%Y') AS eachDay, SUM(adjustedPrice) AS roomRevenue
    FROM checkin_out a
    LEFT JOIN rooms b ON a.roomId = b.roomId
    WHERE a.checkInDate >= ? AND a.checkInDate <= ?
    GROUP BY CAST(a.checkInDate AS DATE)`,
    [startDate, endDate, hotelId],
    (err, res) => {
      if (err) throw err;
      roomRevenue = res;
      revenue.push(...res);
      getRoomServiceRevenue();
    }
  );
};

exports.customerServiceStats = (request, response) => {
  const { hotelId } = request.params;
  const stats = {};

  const issuesCommentsStats = () => {
    db.query(
      `SELECT a.statuss, COUNT(*) AS num
      FROM issues_comments a INNER JOIN checkin_out b ON a.checkInId = b.checkInId
      INNER JOIN rooms c ON b.roomId = c.roomId 
      WHERE c.hotelId = ? GROUP BY a.statuss`,
      [hotelId],
      (err, res) => {
        if (err) throw err;

        const issuesComments = {};
        res.forEach((e) => {
          if (e.statuss === 'unprocessed') {
            issuesComments.unprocessed = e.num;
          } else if (e.statuss === 'processing') {
            issuesComments.processing = e.num;
          } else {
            issuesComments.completed = e.num;
          }
        });
        const zeroService = {
          unprocessed: 0,
          processing: 0,
          completed: 0,
        };
        const newIssuesComments = { ...zeroService, ...issuesComments };
        stats.issuesComments = newIssuesComments;
        response.status(200).send(stats);
      }
    );
  };

  const houseKeepingStats = () => {
    db.query(
      `SELECT statuss, COUNT(*) AS num
      FROM housekeeping a INNER JOIN rooms b ON a.roomId = b.roomId
      WHERE b.hotelId = ? GROUP BY statuss ORDER BY statuss DESC`,
      [hotelId],
      (err, res) => {
        if (err) throw err;

        const housekeeping = {};
        res.forEach((e) => {
          if (e.statuss === 'unprocessed') {
            housekeeping.unprocessed = e.num;
          } else if (e.statuss === 'processing') {
            housekeeping.processing = e.num;
          } else {
            housekeeping.completed = e.num;
          }
        });
        const zeroService = {
          unprocessed: 0,
          processing: 0,
          completed: 0,
        };
        const newHousekeeping = { ...zeroService, ...housekeeping };
        stats.housekeeping = newHousekeeping;
        issuesCommentsStats();
      }
    );
  };

  const laundryServiceStats = () => {
    db.query(
      `SELECT statuss, COUNT(*) AS num
      FROM laundry_services a INNER JOIN rooms b ON a.roomId = b.roomId
      WHERE b.hotelId = ? GROUP BY statuss ORDER BY statuss DESC`,
      [hotelId],
      (err, res) => {
        if (err) throw err;

        const laundryService = {};
        res.forEach((e) => {
          if (e.statuss === 'unprocessed') {
            laundryService.unprocessed = e.num;
          } else if (e.statuss === 'processing') {
            laundryService.processing = e.num;
          } else {
            laundryService.completed = e.num;
          }
        });
        const zeroService = {
          unprocessed: 0,
          processing: 0,
          completed: 0,
        };
        const newLaundryService = { ...zeroService, ...laundryService };

        stats.laundryService = newLaundryService;
        houseKeepingStats();
      }
    );
  };

  db.query(
    `SELECT statuss, COUNT(*) AS num
      FROM room_services a INNER JOIN rooms b ON a.roomId = b.roomId
      WHERE b.hotelId = ? GROUP BY statuss ORDER BY statuss DESC`,
    [hotelId],
    (err, res) => {
      if (err) throw err;

      const roomService = {};
      res.forEach((e) => {
        if (e.statuss === 'unprocessed') {
          roomService.unprocessed = e.num;
        } else if (e.statuss === 'processing') {
          roomService.processing = e.num;
        } else {
          roomService.completed = e.num;
        }
      });
      const zeroService = {
        unprocessed: 0,
        processing: 0,
        completed: 0,
      };
      const newRoomService = { ...zeroService, ...roomService };
      stats.roomService = newRoomService;
      laundryServiceStats();
    }
  );
};

// room revenue
exports.roomRevenue = (request, response) => {
  const revenue = [];
  let roomServiceRevenue;
  let laundryServiceRevenue;
  let houseKeepingRevenue;
  const combinedRevenue = [];
  const { startDate, endDate } = request.query;
  const { hotelId } = request.params;

  const combineResult = () => {
    for (const i in revenue) {
      combinedRevenue.push({
        roomId: revenue[i].roomId,
        roomNumber: revenue[i].roomNumber,
        numberCheckedIn: revenue[i].numberCheckedIn,
        roomRevenue: revenue[i].roomRevenue,
        roomServiceRevenue: null,
        laundryServiceRevenue: null,
        houseKeepingRevenue: null,
      });
      // for room service revenue
      for (const val of roomServiceRevenue) {
        if (val.roomId === revenue[i].roomId) {
          combinedRevenue[i].roomServiceRevenue = val.roomServiceCharges;
        }
      }

      // for laundry service revenue
      for (const val of laundryServiceRevenue) {
        if (val.roomId === revenue[i].roomId) {
          combinedRevenue[i].laundryServiceRevenue = val.laundryServiceCharges;
        }
      }

      // fro house keeping revenue
      for (const val of houseKeepingRevenue) {
        if (val.roomId === revenue[i].roomId) {
          combinedRevenue[i].houseKeepingRevenue = val.housekeepingCharges;
        }
      }
    }
    response.status(200).send(combinedRevenue);
  };

  const getHouseKeepingRevenue = () => {
    db.query(
      `SELECT a.roomId, COUNT(*) AS numberofCharges, SUM(a.amount) AS housekeepingCharges 
      FROM housekeeping a
      INNER JOIN rooms b ON a.roomId = b.roomId 
      WHERE endDateTime >= ?
      AND endDateTime <= ?
      AND statuss = 'completed' AND b.hotelId = ? GROUP BY b.roomId `,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        houseKeepingRevenue = res;
        combineResult();
      }
    );
  };

  const getLaundryServiceRevenue = () => {
    db.query(
      `SELECT a.roomId, COUNT(*) AS numberofCharges, SUM(a.amount) AS laundryServiceCharges 
      FROM laundry_services a
      INNER JOIN rooms b ON a.roomId = b.roomId 
      WHERE completedDateTime >= ?
      AND completedDateTime <= ? AND b.hotelId = ?
      AND statuss = 'completed' GROUP BY b.roomId `,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        laundryServiceRevenue = res;
        getHouseKeepingRevenue();
      }
    );
  };

  const getRoomServiceRevenue = () => {
    db.query(
      `SELECT a.roomId, COUNT(*) AS numberofCharges, SUM(a.amount) AS roomServiceCharges 
      FROM room_services a
      INNER JOIN rooms b ON a.roomId = b.roomId 
      WHERE completedDateTime >= ?
      AND completedDateTime <= ? 
      AND statuss = 'completed' AND b.hotelId = ? GROUP BY b.roomId `,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        roomServiceRevenue = res;
        getLaundryServiceRevenue();
      }
    );
  };

  db.query(
    `SELECT a.roomId, b.roomNumber, COUNT(*) AS numberCheckedIn, b.adjustedPrice* COUNT(*) AS roomRevenue 
    FROM checkin_out a
    INNER JOIN rooms b ON b.roomId = a.roomId 
    WHERE a.checkInDate >= ? AND a.checkInDate <= ? AND b.hotelId = ?
    GROUP BY a.roomId`,
    [startDate, endDate, hotelId],
    (err, res) => {
      if (err) throw err;
      revenue.push(...res);
      getRoomServiceRevenue();
    }
  );
};

// Get room type revenue
exports.roomTypeRevenue = (request, response) => {
  const revenue = [];
  let roomServiceRevenue;
  let laundryServiceRevenue;
  let houseKeepingRevenue;
  const combinedRevenue = [];
  const { startDate, endDate } = request.query;
  const { hotelId } = request.params;

  const combineResult = () => {
    for (const i in revenue) {
      combinedRevenue.push({
        roomTypeId: revenue[i].roomTypeId,
        roomTypeName: revenue[i].roomTypeName,
        roomRevenue: revenue[i].roomTypeRevenue,
        numberCheckedIn: revenue[i].numberCheckedIn,
        roomServiceRevenue: null,
        laundryServiceRevenue: null,
        houseKeepingRevenue: null,
      });

      for (const val of roomServiceRevenue) {
        if (val.roomTypeId === revenue[i].roomTypeId) {
          combinedRevenue[i].roomServiceRevenue = val.roomServiceCharges;
        }
      }

      for (const val of laundryServiceRevenue) {
        if (val.roomTypeId === revenue[i].roomTypeId) {
          combinedRevenue[i].laundryServiceRevenue = val.laundryServiceCharges;
        }
      }
      // fro house keeping revenue
      for (const val of houseKeepingRevenue) {
        if (val.roomTypeId === revenue[i].roomTypeId) {
          combinedRevenue[i].houseKeepingRevenue = val.houseKeepingCharges;
        }
      }
    }
    response.status(200).send(combinedRevenue);
  };

  const getHouseKeepingRevenue = () => {
    db.query(
      `SELECT b.roomTypeId, c.roomTypeName, COUNT(*) AS numberofCharges, SUM(a.amount) AS houseKeepingCharges 
      FROM housekeeping a
      INNER JOIN rooms b ON a.roomId = b.roomId 
      INNER JOIN hotel_roomtype c ON c.roomTypeId = b.roomTypeId
      WHERE endDateTime >= ? AND endDateTime <= ? AND b.hotelId = ?
      AND statuss = 'completed' GROUP BY b.roomTypeId`,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        houseKeepingRevenue = res;
        combineResult();
      }
    );
  };

  const getLaundryServiceRevenue = () => {
    db.query(
      `SELECT b.roomTypeId, c.roomTypeName, COUNT(*) AS numberofCharges, SUM(a.amount) AS laundryServiceCharges 
      FROM laundry_services a
      INNER JOIN rooms b ON a.roomId = b.roomId 
      INNER JOIN hotel_roomtype c ON c.roomTypeId = b.roomTypeId
      WHERE completedDateTime >= ?
      AND completedDateTime <= ? AND b.hotelId = ?
      AND statuss = 'completed' 
      GROUP BY b.roomTypeId `,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        laundryServiceRevenue = res;
        // revenue.push(...res);
        getHouseKeepingRevenue();
      }
    );
  };

  const getRoomServiceRevenue = () => {
    db.query(
      `SELECT b.roomTypeId, c.roomTypeName, COUNT(*) AS numberofCharges, SUM(a.amount) AS roomServiceCharges 
      FROM room_services a
      INNER JOIN rooms b ON a.roomId = b.roomId 
      INNER JOIN hotel_roomtype c ON c.roomTypeId = b.roomTypeId
      WHERE completedDateTime >= ?
      AND completedDateTime <= ? AND b.hotelId = ?
      AND statuss = 'completed' 
      GROUP BY b.roomTypeId`,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        roomServiceRevenue = res;
        // revenue.push(...res);
        getLaundryServiceRevenue();
      }
    );
  };

  db.query(
    `SELECT b.roomTypeId, c.roomTypeName,  COUNT(*) AS numberCheckedIn, 
    SUM(b.adjustedPrice) AS roomTypeRevenue FROM checkin_out a
    INNER JOIN rooms  b ON b.roomId = a.roomId 
    INNER JOIN hotel_roomtype c ON c.roomTypeId = b.roomTypeId
    WHERE a.checkInDate >= ? AND a.checkInDate <= ? AND b.hotelId = ?
    GROUP BY b.roomTypeId UNION
    SELECT roomTypeId, roomTypeName, 0 AS numberCheckedIn, 0 AS roomTypeRevenue FROM hotel_roomtype
    WHERE hotelId = ? AND roomTypeId NOT IN (
    SELECT b.roomTypeId FROM checkin_out a
    INNER JOIN rooms  b ON b.roomId = a.roomId 
    INNER JOIN hotel_roomtype c ON c.roomTypeId = b.roomTypeId
    WHERE a.checkInDate >= ? AND a.checkInDate <= ? AND b.hotelId = ?
    GROUP BY b.roomTypeId)`,
    [startDate, endDate, hotelId, hotelId, startDate, endDate, hotelId],
    (err, res) => {
      if (err) throw err;
      // roomRevenue = res;
      revenue.push(...res);
      getRoomServiceRevenue();
    }
  );
};

// Getb Hotels Statistics
exports.hotelsStats = (request, response) => {
  const { startDate, endDate } = request.query;
  const { hotelId } = request.params;
  let totalStaff;
  let totalNoRooms;
  let currentOccupiedRooms;
  let numOfLostKey;
  let numOfDueOut;
  let numOfCleanRooms;
  let numOfLoginStaff;

  const combineResult = () => {
    const result = {
      ...totalNoRooms,
      availableRooms: currentOccupiedRooms[0].num,
      occupiedRooms: currentOccupiedRooms[1].num,
      ...totalStaff,
      ...numOfLoginStaff,
      ...numOfCleanRooms,
      ...numOfLostKey,
      ...numOfDueOut,
    };
    response.status(200).send(result);
  };

  // total number of rooms
  const getTotalNoRooms = () => {
    db.query(
      `SELECT b.hotelId, b.hotelName, COUNT(*) AS totalNumberOfRooms
      FROM rooms a
      INNER JOIN hotels b ON b.hotelId = a.hotelId 
      WHERE a.hotelId = ?`,
      [hotelId],
      (err, res) => {
        if (err) throw err;
        totalNoRooms = res[0];
        combineResult();
      }
    );
  };

  // Get current Occupied Rooms
  const getCurrentOccupiedRooms = () => {
    db.query(
      `SELECT a.roomStatus AS hotelStats, COUNT(*) AS num
      FROM rooms a
      INNER JOIN hotels b ON b.hotelId = a.hotelId 
      WHERE a.hotelId = ?
      GROUP BY a.roomStatus`,
      [hotelId],
      (err, res) => {
        if (err) throw err;
        currentOccupiedRooms = res;
        getTotalNoRooms();
      }
    );
  };

  // Get No. current LostKey
  const getNumOfLostKey = () => {
    db.query(
      `SELECT COUNT(*) AS currentLostKey
      FROM rooms a
      INNER JOIN hotels b ON b.hotelId = a.hotelId 
      WHERE  a.lostKey = 'true'  AND a.hotelId = ?`,
      [hotelId],
      (err, res) => {
        if (err) throw err;

        numOfLostKey = res[0];
        getCurrentOccupiedRooms();
      }
    );
  };

  // Get No. current Due out/ expired checkout dates
  const getNumOfDueOut = () => {
    db.query(
      `SELECT COUNT(*) AS dueOut
      FROM rooms a INNER JOIN checkin_out b ON b.roomId = a.roomId
      WHERE a.hotelId = ? AND b.statuss = 'active' AND DATEDIFF(b.checkOutDate, NOW()) < 0`,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;

        numOfDueOut = res[0];
        getNumOfLostKey();
      }
    );
  };

  // Get No. current Rooms that are clean
  const getNumOfCleanRooms = () => {
    db.query(
      `SELECT COUNT(*) AS totalOfCleanRooms
      FROM rooms a
      INNER JOIN hotels b ON b.hotelId = a.hotelId 
      WHERE  a.cleanRoom = 'true'  AND a.hotelId = ?`,
      [hotelId],
      (err, res) => {
        if (err) throw err;
        numOfCleanRooms = res[0];
        getNumOfDueOut();
      }
    );
  };

  //
  const getNumOFLoginStaff = () => {
    db.query(
      `SELECT COUNT(*) AS numberOfLoggedInStaff
      FROM employees_hotels a
      INNER JOIN hotels b ON b.hotelId = a.hotelId 
      INNER JOIN login_activities c ON c.employeeId = a.employeeId  
      WHERE c.loginStatus ='loggedIn' AND a.hotelId = ?`,
      [hotelId],
      (err, res) => {
        if (err) throw err;
        numOfLoginStaff = res[0];
        getNumOfCleanRooms();
      }
    );
  };

  // Get total staff
  db.query(
    `SELECT COUNT(*) AS totalStaff
      FROM employees_hotels a
      INNER JOIN hotels b ON b.hotelId = a.hotelId 
      WHERE  a.hotelId = ?`,
    [hotelId],
    (err, res) => {
      if (err) throw err;
      totalStaff = res[0];
      getNumOFLoginStaff();
    }
  );
};

// Get Register status
exports.cashRegisterStatus = (request, response) => {
  const { startDate, endDate } = request.query;
  const { hotelId } = request.params;

  db.query(
    `SELECT statuss AS cashRegisterStatus, COUNT(*) AS totalNumber FROM register
    WHERE (dateTimeOpened >= ? AND dateTimeOpened <= ?)
    OR (dateTimeClosed >= ? AND dateTimeClosed <= ?)
    AND hotelId = ? GROUP BY statuss`,
    [startDate, endDate, startDate, endDate, hotelId],
    (err, res) => {
      if (err) throw err;
      const cashRegister = {};
      res.forEach((e) => {
        if (e.cashRegisterStatus === 'closed') {
          cashRegister.closed = e.totalNumber;
        } else if (e.cashRegisterStatus === 'active') {
          cashRegister.active = e.totalNumber;
        }
      });
      const zeroRegister = {
        closed: 0,
        active: 0,
      };
      const newCashRegister = { ...zeroRegister, ...cashRegister };
      response.status(200).send(newCashRegister);
    }
  );
};

// Get total activity count
exports.totalActivityCount = (request, response) => {
  const { startDate, endDate } = request.query;
  const { hotelId } = request.params;
  // variables
  let numOfCheckedIn;
  let numCheckOut;
  let numReservation;
  let numCheckInReservation;
  let numCancellReservation;
  let numOfExtendStay;
  let numOfChangedRoom;

  // All result
  const totalResult = () => {
    const result = {
      ...numOfCheckedIn,
      ...numCheckOut,
      ...numReservation,
      ...numCheckInReservation,
      ...numCancellReservation,
      ...numOfExtendStay,
      ...numOfChangedRoom,
    };

    response.status(200).send(result);
  };

  // Total num of changed room
  const getNumOfChangedRoom = () => {
    db.query(
      `SELECT COUNT(*) AS numOfRoomsChanged
      FROM changed_rooms a
      INNER JOIN checkin_out b ON b.checkInId = a.checkInId
      INNER JOIN rooms c ON c.roomId = b.roomId
      WHERE a.changedDateTime >= ? AND a.changedDateTime <= ? AND c.hotelId = ?`,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        numOfChangedRoom = res[0];
        totalResult();
      }
    );
  };

  // Get No extend stay
  const getNumOfExtendStay = () => {
    db.query(
      `SELECT COUNT(*) AS numOfExtendStay 
      FROM extend_stay a
      INNER JOIN checkin_out b ON b.checkInId = a.checkInId
      INNER JOIN rooms c ON c.roomId = b.roomId
      WHERE a.extensionDateTime >= ? AND a.extensionDateTime <= ? AND c.hotelId = ?`,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        numOfExtendStay = res[0];
        getNumOfChangedRoom();
      }
    );
  };

  // Get Cancelled Reservation
  const getCancellReservation = () => {
    db.query(
      `SELECT COUNT(*) AS numOfCancelledReservation
          FROM reservations a
          INNER JOIN hotels b ON b.hotelId = a.hotelId  
          WHERE statuss ='cancelled' AND a.cancelledDateTime >= ? AND a.cancelledDateTime <= ?  AND a.hotelId = ?`,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        numCancellReservation = res[0];
        getNumOfExtendStay();
      }
    );
  };
  // get CheckIn Reservations
  const getCheckInReservation = () => {
    db.query(
      `SELECT COUNT(*) AS numOfCheckInReservation
      FROM reservations a
      WHERE a.statuss='checkedIn' AND
      a.checkInDate >= ? AND a.checkInDate <= ? AND a.hotelId = ?`,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        numCheckInReservation = res[0];
        getCancellReservation();
      }
    );
  };

  // get reservations
  const getNumReservation = () => {
    db.query(
      `SELECT COUNT(*) AS numOfReservation
      FROM reservations a
      WHERE a.reservationStartDateTime >= ? AND reservationStartDateTime <= ? `,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        numReservation = res[0];
        getCheckInReservation();
      }
    );
  };

  // no of check-out
  const getNumCheckOut = () => {
    db.query(
      `SELECT COUNT(*) AS numCheckOut 
      FROM checkout a
      INNER JOIN checkin_out b ON b.checkInId = a.checkInId
      INNER JOIN rooms c ON c.roomId = b.roomId
      WHERE a.checkOutDateTime  >= ? AND a.checkOutDateTime <= ? AND c.hotelId = ?`,
      [startDate, endDate, hotelId],
      (err, res) => {
        if (err) throw err;
        numCheckOut = res[0];
        getNumReservation();
      }
    );
  };

  // get no check in
  db.query(
    `SELECT COUNT(*) AS numCheckIn 
    FROM checkin_out a
    INNER JOIN rooms b ON b.roomId = a.roomId
    WHERE a.checkInDate >= ? AND a.checkInDate <= ? AND b.hotelId = ? `,
    [startDate, endDate, hotelId],
    (err, res) => {
      if (err) throw err;
      numOfCheckedIn = res[0];
      getNumCheckOut();
    }
  );
};

exports.revenueStats = (request, response) => {
  const { startDate, endDate } = request.query;
  const { hotelId } = request.params;

  db.query(
    `SELECT billedFor, SUM(amount) AS totalRevenue FROM billings
    WHERE hotelId = ? AND paymentDate >= ? AND paymentDate <= ?
    GROUP BY billedFor
    UNION
    SELECT DISTINCT(billedFor), 0 AS totalRevenue FROM billings
    WHERE billedFor NOT IN (SELECT billedFor FROM billings
    WHERE hotelId = ? AND paymentDate >= ? AND paymentDate <= ?
    GROUP BY billedFor)`,
    [hotelId, startDate, endDate, hotelId, startDate, endDate],
    (err, res) => {
      if (err) throw err;
      response.status(200).send(res);
    }
  );
};

exports.customers = (request, response) => {
  let customers;
  const addHouseKeeping = () => {
    db.query(
      `SELECT guestId, SUM(amount) AS amount 
      FROM housekeeping WHERE paymentStatus = 'paid'
      GROUP BY guestId`,
      (err, res) => {
        if (err) throw err;
        let count = 0;
        const len = res.length;

        for (const cust of res) {
          if (String(cust.guestId).substring(0, 3) === 'MCG') {
            db.query(
              `SELECT a.guestId, SUM(b.amount) AS amount
              FROM multiple_staying_guest_table a
              INNER JOIN housekeeping b ON a.tempGuestId = b.guestId
              WHERE guestType = 1 OR guestType = 3 AND tempGuestId = ?`,
              [cust.guestId],
              (err2, res2) => {
                if (err2) throw err2;
                const guest = customers.filter(
                  (e) => e.guestId == res2[0].guestId
                )[0];
                guest.houseKeepingRevenue += res2[0].amount;

                count += 1;
                if (count === len) {
                  response.status(200).send(customers);
                }
              }
            );
          } else {
            const guest = customers.filter((e) => e.guestId == cust.guestId)[0];
            guest.houseKeepingRevenue += cust.amount;
            count += 1;
            if (count === len) {
              response.status(200).send(customers);
            }
          }
        }
      }
    );
  };

  const addLaundryService = () => {
    db.query(
      `SELECT guestId, SUM(amount) AS amount 
      FROM laundry_services WHERE paymentStatus = 'paid'
      GROUP BY guestId`,
      (err, res) => {
        if (err) throw err;
        let count = 0;
        const len = res.length;

        for (const cust of res) {
          if (String(cust.guestId).substring(0, 3) === 'MCG') {
            db.query(
              `SELECT a.guestId, SUM(b.amount) AS amount
              FROM multiple_staying_guest_table a
              INNER JOIN laundry_services b ON a.tempGuestId = b.guestId
              WHERE guestType = 1 OR guestType = 3 AND tempGuestId = ?`,
              [cust.guestId],
              (err2, res2) => {
                if (err2) throw err2;
                const guest = customers.filter(
                  (e) => e.guestId == res2[0].guestId
                )[0];
                guest.laundryServiceRevenue += res2[0].amount;

                count += 1;
                if (count === len) {
                  addHouseKeeping();
                  // response.status(200).send(customers);
                }
              }
            );
          } else {
            const guest = customers.filter((e) => e.guestId == cust.guestId)[0];
            guest.laundryServiceRevenue += cust.amount;
            count += 1;
            if (count === len) {
              // response.status(200).send(customers);
              addHouseKeeping();
            }
          }
        }
      }
    );
  };

  const addRoomService = () => {
    db.query(
      `SELECT guestId, SUM(amount) AS amount 
      FROM room_services WHERE paymentStatus = 'paid'
      GROUP BY guestId`,
      (err, res) => {
        if (err) throw err;
        let count = 0;
        const len = res.length;

        for (const cust of res) {
          if (String(cust.guestId).substring(0, 3) === 'MCG') {
            db.query(
              `SELECT a.guestId, SUM(b.amount) AS amount
              FROM multiple_staying_guest_table a
              INNER JOIN room_services b ON a.tempGuestId = b.guestId
              WHERE guestType = 1 OR guestType = 3 AND tempGuestId = ?`,
              [cust.guestId],
              (err2, res2) => {
                if (err2) throw err2;
                const guest = customers.filter(
                  (e) => e.guestId == res2[0].guestId
                )[0];
                guest.roomServiceRevenue += res2[0].amount;

                count += 1;
                if (count === len) {
                  addLaundryService();
                  // response.status(200).send(customers);
                }
              }
            );
          } else {
            const guest = customers.filter((e) => e.guestId == cust.guestId)[0];
            guest.roomServiceRevenue += cust.amount;
            count += 1;
            if (count === len) {
              addLaundryService();
              // response.status(200).send(customers);
            }
          }
        }
      }
    );
  };

  const addRoomRevenue = () => {
    db.query(
      `SELECT a.guestId,
      SUM(DATEDIFF(COALESCE(a.actualCheckOutDate, NOW()), a.checkInDate)*b.adjustedPrice) AS amount
      FROM checkin_out a INNER JOIN rooms b ON a.roomId = b.roomId
      GROUP BY guestId`,
      (err, res) => {
        if (err) throw err;
        let count = 0;
        const len = res.length;

        for (const cust of res) {
          if (String(cust.guestId).substring(0, 3) === 'MCG') {
            db.query(
              `SELECT a.guestId,
              SUM(DATEDIFF(COALESCE(b.actualCheckOutDate, NOW()), b.checkInDate)*c.adjustedPrice) AS amount
              FROM multiple_staying_guest_table a
              INNER JOIN checkin_out b ON a.tempGuestId = b.guestId
              INNER JOIN rooms c ON b.roomId = c.roomId
              WHERE (a.guestType = 3 OR a.guestType = 1) AND a.tempGuestId = ?
              GROUP BY guestId`,
              [cust.guestId],
              (err2, res2) => {
                if (err2) throw err2;
                const guest = customers.filter(
                  (e) => e.guestId == res2[0].guestId
                )[0];
                guest.roomRevenue += res2[0].amount;
                count += 1;
                if (count === len) {
                  addRoomService();
                  // response.status(200).send(customers);
                }
              }
            );
          } else {
            for (const guest of customers) {
              if (guest.guestId == cust.guestId) {
                guest.roomRevenue += cust.amount;
                count += 1;
              }
            }
            if (count === len) {
              addRoomService();
            }
          }
        }
      }
    );
  };

  const combineGuestCheckInOut = (checkInDetails) => {
    const len = checkInDetails.length;
    let count = 0;
    for (const cust of checkInDetails) {
      if (String(cust.guestId).substring(0, 3) === 'MCG') {
        db.query(
          `SELECT a.guestId, MAX(b.checkInDate) AS checkInDate, d.hotelName
          FROM multiple_staying_guest_table a
          INNER JOIN checkin_out b ON a.tempGuestId = b.guestId
          INNER JOIN rooms c ON b.roomId = c.roomId
          INNER JOIN hotels d ON c.hotelId = d.hotelId
          WHERE tempGuestId = ? GROUP BY a.guestId`,
          [cust.guestId],
          (err, res) => {
            if (err) throw err;
            const mGuestsList = res.map((e) => e.guestId);
            for (const k of mGuestsList) {
              const guest = customers.filter((e) => e.guestId == k)[0];
              if (!guest.lastCheckIn) {
                guest.lastCheckIn = cust.checkInDate;
                guest.lastHotel = cust.hotelName;
              } else {
                const mGuest = res.filter((e) => e.guestId == k)[0];
                const date1 = new Date(guest.lastCheckIn);
                const date2 = new Date(mGuest.checkInDate);
                if (date2 > date1) {
                  guest.lastCheckIn = mGuest.checkInDate;
                  guest.lastHotel = mGuest.hotelName;
                }
              }
            }
            count += 1;
            if (count === len) {
              addRoomRevenue();
            }
          }
        );
      } else {
        for (const guest of customers) {
          if (cust.guestId == guest.guestId) {
            guest.lastCheckIn = cust.checkInDate;
            guest.lastHotel = cust.hotelName;
            count += 1;
          }
          if (count === len) {
            addRoomRevenue();
          }
        }
      }
    }
  };

  const getLastCheckInOutInfo = () => {
    db.query(
      `SELECT a.guestId, MAX(a.checkInDate) AS checkInDate,
      c.hotelName FROM checkin_out a
      INNER JOIN rooms b ON a.roomId = b.roomId
      INNER JOIN hotels c ON b.hotelId = c.hotelId
      GROUP BY a.guestId`,
      (err, res) => {
        if (err) throw err;
        combineGuestCheckInOut(res);
      }
    );
  };

  db.query(
    `SELECT  guestId, CONCAT(guestTitle, ' ', lastName, ' ', firstName) 
    AS guestName, phoneNumber, 0 as roomRevenue, 0 as roomServiceRevenue, 
    0 as laundryServiceRevenue, 0 as houseKeepingRevenue FROM guests`,
    (err, res) => {
      if (err) throw err;
      customers = res;
      getLastCheckInOutInfo();
    }
  );
};

// Customers info On revenue
exports.getGuestStats = (request, response) => {
  const { startDate, endDate } = request.query;
  const { hotelId } = request.params;

  // variables
  let totalGuest;
  let guestDueOut;
  let expecptedGuest;
  let guestTypeInfo;
  // All result
  const totalResult = () => {
    const result = {
      ...totalGuest,
      ...guestTypeInfo,
      ...guestDueOut,
      ...expecptedGuest,
    };
    response.status(200).send(result);
  };

  // Expected guest
  const getExpectedGuest = () => {
    db.query(
      `SELECT SUM(numOfRooms *(adultsPerRoom + childrenPerRoom)) AS expectedGuest
      FROM reservations
      WHERE statuss = 'active' AND hotelId = ?
      ORDER BY reservationId`,
      [hotelId],
      (err, res) => {
        if (err) throw err;
        expecptedGuest = res[0];
        totalResult();
        // getNumOfChangedRoom();
      }
    );
  };

  // Get Guest DueOut
  const getGuestDueOut = () => {
    db.query(
      `SELECT COUNT(*) AS guestDueOut
      FROM rooms a INNER JOIN
      checkin_out b ON b.roomId = a.roomId
      WHERE a.hotelId = ? AND b.statuss = 'active' AND DATEDIFF(b.checkOutDate, NOW()) < 0`,
      [hotelId],
      (err, res) => {
        if (err) throw err;
        guestDueOut = res[0];

        getExpectedGuest();
      }
    );
  };

  // get total paying guest
  const getTotalPayingAndStayingGuest = () => {
    db.query(
      `SELECT 3 AS guestType, COUNT(*) AS num
      FROM checkin_out a
      INNER JOIN guests b ON b.guestId = a.guestId
      INNER JOIN rooms c ON c.roomId = a.roomId
      WHERE a.statuss = 'active' AND hotelId = ?
      UNION
      SELECT guestType, COUNT(*) AS num
      FROM multiple_staying_guest_table a
      INNER JOIN checkin_out b ON a.tempGuestId = b.guestId
      INNER JOIN rooms c ON c.roomId = b.roomId
      WHERE b.statuss = 'active' AND hotelId = ?
      GROUP BY guestType`,
      [hotelId, hotelId],
      (err, res) => {
        if (err) throw err;

        guestTypeInfo = {
          payingGuest: 0,
          stayingGuest: 0,
          stayingPayingGuest: 0,
        };
        for (const guest of res) {
          if (guest.guestType == 1) {
            guestTypeInfo.payingGuest += guest.num;
          } else if (guest.guestType == 2) {
            guestTypeInfo.stayingGuest += guest.num;
          } else {
            guestTypeInfo.stayingPayingGuest += guest.num;
          }
        }
        getGuestDueOut();
      }
    );
  };
  // getTotal number of Guest
  db.query(
    `SELECT  COUNT(*) AS totalGuests
    FROM guests`,
    // [hotelId],
    (err, res) => {
      if (err) throw err;
      totalGuest = res[0];
      getTotalPayingAndStayingGuest();
    }
  );
};
