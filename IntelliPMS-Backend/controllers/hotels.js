/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
// DB connection path
const db = require('../db/index');

// get hotels
exports.getHotels = (request, response) => {
  const { email } = request.query;
  let hotels;

  const getRoomsNum = () => {
    const len = hotels.length;
    for (const i in hotels) {
      db.query(
        'SELECT COUNT(*) AS totalRoomsCreated FROM rooms WHERE hotelId = ?',
        [hotels[i].hotelId],
        (err, res) => {
          if (err) throw err;
          hotels[i].totalRoomsCreated = res[0].totalRoomsCreated;

          if (+i === len - 1) {
            response.status(200).send(hotels);
          }
        }
      );
    }
  };

  const getManager = () => {
    const len = hotels.length;
    for (const i in hotels) {
      db.query(
        `SELECT CONCAT(lastName, ' ', firstName) AS managerName FROM employees a
        INNER JOIN employees_hotels b ON a.employeeId = b.employeeId
        WHERE employeeRole = 'manager' AND hotelId = ? LIMIT 1`,
        [hotels[i].hotelId],
        (err, res) => {
          if (err) throw err;
          if (res.length === 0) {
            hotels[i].managerName = 'No Manager';
          } else {
            hotels[i].managerName = res[0].managerName;
          }
          if (+i === len - 1) {
            getRoomsNum();
          }
        }
      );
    }
  };

  const getEmployeeNum = () => {
    const len = hotels.length;
    for (const i in hotels) {
      db.query(
        `SELECT COUNT(*) AS totalEmployees FROM employees_hotels 
      WHERE hotelId = ?`,
        [hotels[i].hotelId],
        (err, res) => {
          if (err) throw err;
          hotels[i].totalEmployees = res[0].totalEmployees;

          if (+i === len - 1) {
            getManager();
          }
        }
      );
    }
  };

  if (email) {
    db.query(
      `SELECT c.hotelId, c.hotelName, c.address, c.location, c.picture FROM employees a
      INNER JOIN employees_hotels b ON a.employeeId = b.employeeId
      INNER JOIN hotels c ON b.hotelId = c.hotelId
      WHERE emailAddress = ?`,
      [email],
      (err, res) => {
        if (err) throw err;
        hotels = res;
        getEmployeeNum();
      }
    );
  } else {
    db.query('select * from hotels', (err, res) => {
      if (err) throw err;
      response.status(200).send(res);
    });
  }
};

// get the full detail of a hotel
exports.getHotelInfo = (request, response) => {
  const { hotelId } = request.params;

  db.query('select * from hotels where hotelId = ?', [hotelId], (err, res) => {
    if (err) throw err;
    const hotel = res[0];
    let services = [];

    db.query(
      'SELECT serviceId, serviceName, serviceCost FROM hotel_services WHERE hotelId = ?',
      [hotelId],
      (err2, res2) => {
        if (err2) throw err;

        if (hotel !== undefined) {
          services = res2;
          hotel.services = services;
          response.status(200).send(hotel);
        } else {
          response
            .status(404)
            .send({ message: 'Requested hotel does not exist' });
        }
      }
    );
  });
};

// get the list of rooms in a hotel
exports.getHotelRooms = (request, response) => {
  const { hotelId } = request.params;
  const { roomType, freeDate } = request.query;
  const hotelRooms = [];

  const getAvailableRooms = () => {
    const sql = `SELECT a.roomId, a.hotelId, a.roomNumber, a.adjustedPrice AS cost, 
    b.roomTypeName, b.icon, a.roomStatus,a.currentOccupant, a.picture, a.lostKey, 
    a.dropOffKey, NULL AS freeDate FROM rooms a 
    INNER JOIN hotel_roomtype b ON a.roomTypeId = b.roomTypeId
    WHERE a.hotelId = ? AND a.roomStatus = 'available' AND b.roomTypeId = ?
    ORDER BY roomNumber`;
    db.query(sql, [hotelId, roomType], (err, res) => {
      if (err) throw err;
      for (const room of res) {
        hotelRooms.push(room);
      }
      response.status(200).send(hotelRooms);
    });
  };

  const sql1 = `SELECT a.roomId, a.hotelId, a.roomNumber, a.adjustedPrice AS cost, a.roomStatus,
      CONCAT(b.guestTitle, ' ', b.lastName, ' ', b.firstName) AS currentOccupant, a.picture,
      a.lostKey, a.dropOffKey, d.roomTypeName, d.icon, c.checkOutDate AS freeDate
      FROM rooms a LEFT JOIN guests b ON a.currentOccupant = b.guestId
      LEFT JOIN checkin_out c ON c.roomId = a.roomId
      LEFT JOIN hotel_roomtype d ON a.roomTypeId = d.roomTypeId 
      WHERE a.hotelId = ? AND c.statuss = 'active' AND a.roomStatus = 'occupied' 
      AND c.checkOutDate <= ? AND d.roomTypeId = ? ORDER BY a.roomNumber`;
  db.query(sql1, [hotelId, freeDate, roomType], (err, res) => {
    if (err) throw err;
    for (const room of res) {
      hotelRooms.push(room);
    }
    getAvailableRooms();
  });
};

exports.getAllHotelRooms = (request, response) => {
  const { hotelId } = request.params;
  const hotelRooms = [];

  const getAvailableRooms = () => {
    const sql = `SELECT a.roomId, a.hotelId, a.roomNumber, a.adjustedPrice AS cost, 
        b.roomTypeName, b.roomTypeId, b.icon, a.roomStatus, a.currentOccupant, a.picture, a.lostKey, 
        a.dropOffKey, a.notForSale, NULL as checkInDate, NULL AS freeDate FROM rooms a 
        INNER JOIN hotel_roomtype b ON a.roomTypeId = b.roomTypeId
        WHERE a.hotelId = ? AND a.roomStatus = 'available'
        ORDER BY roomNumber`;
    db.query(sql, [hotelId], (err, res) => {
      if (err) throw err;
      for (const room of res) {
        hotelRooms.push(room);
      }
      response.status(200).send(hotelRooms);
    });
  };

  const sql1 = `SELECT a.roomId, a.hotelId, c.checkInId, a.roomNumber, a.adjustedPrice AS cost, a.roomStatus,
      a.currentOccupant AS guestId, CONCAT(b.guestTitle, ' ', b.lastName, ' ', b.firstName) AS currentOccupant, 
      a.picture, a.lostKey, a.dropOffKey, a.notForSale, d.roomTypeName, d.roomTypeId, d.icon, c.checkInDate,
      c.checkOutDate AS freeDate FROM rooms a LEFT JOIN guests b ON a.currentOccupant = b.guestId
      LEFT JOIN checkin_out c ON c.roomId = a.roomId
      LEFT JOIN hotel_roomtype d ON a.roomTypeId = d.roomTypeId 
      WHERE a.hotelId = ? AND c.statuss = 'active' AND a.roomStatus = 'occupied' 
      ORDER BY a.roomNumber`;
  db.query(sql1, [hotelId], (err, res) => {
    if (err) throw err;
    for (const room of res) {
      hotelRooms.push(room);
    }
    getAvailableRooms();
  });
};

exports.getReservationInfo = (request, response) => {
  const { hotelId, reservationId } = request.params;
  let reservationInfo;

  const sql = `SELECT a.reservationId, a.hotelId, a.payingGuestId, a.numOfRooms, a.adultsPerRoom, a.childrenPerRoom,
      CONCAT(b.guestTitle, ' ', b.lastName, ' ', b.firstName) AS payingGuestName, c.roomTypeName, c.icon, 
      a.billingId, a.totalPayment, a.reservationStartDateTime, a.reservationEndDateTime, 
      a.roomTypeId, b.phoneNumber, NULL AS billings
      FROM reservations a INNER JOIN guests b ON a.payingGuestId = b.guestId
      INNER JOIN hotel_roomtype c ON a.roomTypeId = c.roomTypeId 
      WHERE a.hotelId = ? AND a.reservationId = ?`;
  db.query(sql, [hotelId, reservationId], (err, res) => {
    if (err) throw err;

    if (res.length === 1) {
      reservationInfo = res[0];
      const sql2 =
        'select billingId, amount from billings where billingId = ? or multipleBillingsId = ?';
      db.query(
        sql2,
        [reservationInfo.billingId, reservationInfo.billingId],
        (err2, res2) => {
          reservationInfo.billings = res2;
          response.status(200).send(reservationInfo);
        }
      );
    } else {
      response.status(404).send({ message: 'Reservation does not exist' });
    }
  });
};

// get rooms and attributes
exports.getRoomsInfo = (request, response) => {
  const { roomId, hotelId } = request.params;
  const attributes = [];
  let roomDetails;

  const getMultipleGuest = (multipleGuestId) => {
    db.query(
      `SELECT a.guestId, CONCAT(guestTitle, ' ', lastName, ' ', firstName) AS occupantName
        FROM multiple_staying_guest_table a INNER JOIN guests b ON a.guestId = b.guestId
        WHERE tempGuestId = ?`,
      [multipleGuestId],
      (err, res) => {
        if (err) throw err;
        roomDetails.occupants = res;

        response.status(200).send(roomDetails);
      }
    );
  };

  const sql = `SELECT a.roomId, a.hotelId, a.roomNumber, d.roomTypeName, a.roomTypeId, d.icon, a.adjustedPrice AS cost, 
      a.picture, a.roomStatus, CONCAT(b.guestTitle, ' ',b.lastName,' ', b.firstName, ' ',b.otherName) 
      AS currentOccupant, c.buildingName, a.currentOccupant AS occupantId 
      FROM rooms a LEFT JOIN guests b ON a.currentOccupant = b.guestId 
      LEFT JOIN buildings c ON a.buildingId = c.buildingId
      LEFT JOIN hotel_roomtype d ON a.roomTypeId = d.roomTypeId
      WHERE a.hotelId = ? AND a.roomId = ?`;

  db.query(sql, [hotelId, roomId], (err, res) => {
    if (err) throw err;
    roomDetails = res[0];

    db.query(
      'select * from room_attributes where roomId = ?',
      [roomId],
      (err2, res2) => {
        if (err2) throw err2;
        const values = res2;

        for (const i of values) {
          attributes.push(i.attribute);
        }

        if (roomDetails !== undefined) {
          roomDetails.attributes = attributes;
          if (
            roomDetails.roomStatus === 'occupied' &&
            roomDetails.currentOccupant === null
          ) {
            getMultipleGuest(roomDetails.occupantId);
          } else {
            response.status(200).send(roomDetails);
          }
        } else {
          response.status(200).send({ message: 'Room does not exist' });
        }
      }
    );
  });
};

// update room
exports.updateRooms = (request, response) => {
  const { roomId, hotelId } = request.params;
  const { roomNumber, roomType, cost } = request.body;

  let attributes = [];

  if (request.body.attributes !== null) {
    attributes = request.body.attributes.split(',');
  }

  db.query(
    'delete from room_attributes where roomId = ?',
    [roomId],
    (err, res) => {
      if (err) throw err;

      for (const i of attributes) {
        db.query(
          'insert into room_attributes (roomId, attribute) values (?, ?)',
          [roomId, i],
          (err3, res3) => {
            if (err3) throw err3;
          }
        );
      }
    }
  );

  if (request.file !== undefined) {
    const url = `${request.protocol}://${request.get('host')}`;
    const imagePath = `${url}/images/hotels/${request.file.filename}`;

    db.query(
      'update rooms set roomTypeId = ?, adjustedPrice = ?, roomNumber = ?, picture = ? where hotelId = ? and roomId = ?',
      [roomType, cost, roomNumber, imagePath, hotelId, roomId],
      (err, res) => {
        if (err) throw err;

        response
          .status(200)
          .send({ message: 'Room Info updated successfully' });
      }
    );
  } else {
    db.query(
      'update rooms set roomTypeId = ?, adjustedPrice = ?, roomNumber = ? where hotelId = ? and roomId = ?',
      [roomType, cost, roomNumber, hotelId, roomId],
      (err, res) => {
        if (err) throw err;

        response
          .status(200)
          .send({ message: 'Room Info updated successfully' });
      }
    );
  }
};

// create Hotels
exports.createHotel = (request, response) => {
  const { hotelName, numOfRooms, address, location, createdBy } = request.body;
  const bankAccountDetails = JSON.parse(request.body.bankAccountDetails);
  const posDetails = JSON.parse(request.body.posDetails);

  const url = `${request.protocol}://${request.get('host')}`;
  const imagePath = `${url}/images/hotels/${request.file.filename}`;

  const addPosDetails = (hotelId) => {
    for (const pos of posDetails) {
      db.query(
        `insert into hotel_pos_details(hotelId, bankName, posId)
        values (?, ?, ?)`,
        [hotelId, pos.posBankName, pos.posId],
        (err2, res2) => {
          if (err2) throw err2;
        }
      );
    }
    response
      .status(201)
      .send({ message: 'Hotel successfully created', hotelId });
  };

  db.query(
    `insert into hotels(hotelName, numOfRooms, address, location, picture, createdBy)
    values (?, ?, ?, ?, ?, ?)`,
    [hotelName, numOfRooms, address, location, imagePath, createdBy],
    (err, res) => {
      if (err) throw err;

      const hotelId = res.insertId;
      for (const account of bankAccountDetails) {
        db.query(
          `insert into hotel_account_details(hotelId, bankName, accountNumber)
          values (?, ?, ?)`,
          [hotelId, account.bankName, account.accountNumber],
          (err2, res2) => {
            if (err2) throw err2;
          }
        );
      }
      addPosDetails(hotelId);
    }
  );
};

// create rooms
exports.createRoom = (request, response) => {
  const {
    roomNumber,
    roomType,
    adjustedPrice,
    building,
    createdBy
  } = request.body;
  const { hotelId } = request.params;

  let attributes = [];
  if (request.body.attributes) {
    attributes = request.body.attributes.split(',');
  }

  let imagePath = null;
  if (request.file !== undefined) {
    const url = `${request.protocol}://${request.get('host')}`;
    imagePath = `${url}/images/employees/${request.file.filename}`;
  }

  const insertAttributes = (roomId) => {
    if (attributes.length > 0) {
      for (const i of attributes) {
        db.query(
          'insert into room_attributes (roomId, attribute) values (?, ?)',
          [roomId, i],
          (err3, res3) => {
            if (err3) throw err3;
          }
        );
      }
      response.status(200).send({ message: 'Room Created successfully' });
    } else {
      response.status(200).send({ message: 'Room Created successfully' });
    }
  };

  db.query(
    `insert into rooms(hotelId, roomNumber, roomTypeId, buildingId, adjustedPrice, roomStatus,
      currentOccupant, picture, createdBy) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      hotelId,
      roomNumber,
      roomType,
      building,
      adjustedPrice,
      'available',
      0,
      imagePath,
      createdBy
    ],
    (err1, res1) => {
      if (err1) throw err1;
      const roomId = res1.insertId;
      insertAttributes(roomId);
    }
  );
};

// create hotel services
exports.createHotelService = (request, response) => {
  const { serviceId, serviceName, serviceType, serviceCost } = request.body;

  const { hotelId } = request.params;
  db.query(
    `insert into hotel_services(serviceId, hotelId, serviceType, serviceName, serviceCost)
    values (?, ?, ?, ?, ?)`,
    [serviceId, hotelId, serviceType, serviceName, serviceCost],
    (err, res) => {
      if (err) throw err;
      response.status(200).send({ message: 'Service added successfuly' });
    }
  );
};

exports.getHotelAccountDetails = (request, response) => {
  const { hotelId } = request.params;
  const { bankAccountId } = request.query;

  if (bankAccountId) {
    db.query(
      'SELECT * FROM hotel_account_details WHERE hotelId = ? and bankAccountId = ?',
      [hotelId, bankAccountId],
      (err, res) => {
        if (err) throw err;

        response.status(200).send(res[0]);
      }
    );
  } else {
    db.query(
      'SELECT * FROM hotel_account_details WHERE hotelId = ?',
      [hotelId],
      (err, res) => {
        if (err) throw err;

        response.status(200).send(res);
      }
    );
  }
};

exports.getHotelPosDetails = (request, response) => {
  const { hotelId } = request.params;
  const { posSn } = request.query;

  if (posSn) {
    db.query(
      'SELECT * FROM hotel_pos_details WHERE hotelId = ? and posSn = ?',
      [hotelId, posSn],
      (err, res) => {
        if (err) throw err;

        response.status(200).send(res[0]);
      }
    );
  } else {
    db.query(
      'SELECT * FROM hotel_pos_details WHERE hotelId = ?',
      [hotelId],
      (err, res) => {
        if (err) throw err;

        response.status(200).send(res);
      }
    );
  }
};

// Get available rooms
exports.getAvailableRoomsSummary = (request, response) => {
  const { hotelId } = request.params;
  const { dateTime } = request.query;

  db.query(
    `SELECT a.roomTypeId, COUNT(a.roomStatus) AS totalAvailable, b.roomTypeName
    FROM rooms a 
    INNER JOIN hotel_roomtype b ON a.roomTypeId = b.roomTypeId
    WHERE a.hotelId = ? AND a.roomStatus = 'available' GROUP BY a.roomTypeId
    UNION
    SELECT a.roomTypeId, 0 AS totalAvailable, b.roomTypeName
    FROM rooms a INNER JOIN hotel_roomtype b ON a.roomTypeId = b.roomTypeId
    WHERE a.hotelId = ? AND a.roomTypeId NOT IN (SELECT a.roomTypeId FROM rooms a 
    INNER JOIN hotel_roomtype b ON a.roomTypeId = b.roomTypeId
    WHERE a.hotelId = ? AND a.roomStatus = 'available' GROUP BY a.roomTypeId)`,
    [hotelId, hotelId, hotelId],
    (err, res) => {
      if (err) throw err;

      db.query(
        `SELECT a.roomTypeId, COUNT(a.roomStatus) AS totalAvailable, c.roomTypeName
        FROM rooms a LEFT JOIN checkin_out b ON a.roomId = b.roomId
        LEFT JOIN hotel_roomtype c ON a.roomTypeId = c.roomTypeId
        WHERE a.hotelId = ? AND b.statuss = 'active' AND checkOutDate <= ?
        GROUP BY a.roomTypeId`,
        [hotelId, dateTime],
        (err2, res2) => {
          let availableRooms;
          if (res2 === undefined) {
            availableRooms = res;
          } else {
            availableRooms = [...res, ...res2];
          }
          const availableRoomsObj = {};
          for (const i in availableRooms) {
            if (availableRooms[i].roomTypeName in availableRoomsObj) {
              availableRoomsObj[availableRooms[i].roomTypeName] +=
                availableRooms[i].totalAvailable;
            } else {
              availableRoomsObj[availableRooms[i].roomTypeName] =
                availableRooms[i].totalAvailable;
            }
          }

          const availableRooms2 = [];
          for (const room in availableRoomsObj) {
            availableRooms2.push({
              roomTypeName: room,
              totalAvailable: availableRoomsObj[room]
            });
          }
          response.status(200).send(availableRooms2);
        }
      );
    }
  );
};

// get guest details by email
exports.guestEmailList = (request, response) => {
  const { hotelId } = request.params;
  const { email } = request.query;
  const myEmail = `%${email}%`;

  db.query(
    `SELECT email, CONCAT(guestTitle, ' ', lastName, ' ', firstName) AS guestName
    FROM guests WHERE email LIKE ? LIMIT 10 `,
    [myEmail],
    (err, res) => {
      if (err) throw err;

      response.status(200).send(res);
    }
  );
};

// create Hotel room type
exports.createRoomType = (request, response) => {
  const {
    roomTypeName,
    quantity,
    basePrice,
    minimumPrice,
    shortDescription,
    icon
  } = request.body;
  const { hotelId } = request.params;

  db.query(
    `insert into hotel_roomtype(hotelId, roomTypeName, quantity, basePrice,
    minimumPrice, shortDescription, icon) values (?, ?, ?, ?, ?, ?, ?)`,
    [
      hotelId,
      roomTypeName,
      quantity,
      basePrice,
      minimumPrice,
      shortDescription,
      icon
    ],
    (err, res) => {
      if (err) throw err;
      response.status(200).send({ message: 'Room Type Created' });
    }
  );
};

// create Hotel Building
exports.createHotelBuilding = (request, response) => {
  const { buildingName, numOfRooms, startingRoom, endingRoom } = request.body;

  const { hotelId } = request.params;

  db.query(
    `insert into buildings (hotelId, buildingName, numOfRooms,
    startingRoom, endingRoom) values (?, ?, ?, ?, ?)`,
    [hotelId, buildingName, numOfRooms, startingRoom, endingRoom],
    (err, res) => {
      if (err) throw err;
      response.status(200).send({ message: 'Hotel Building Created' });
    }
  );
};

exports.getHotelReservations = (request, response) => {
  const { hotelId } = request.params;
  const { startDate, roomType } = request.query;

  let reservations;

  const getBillingInfo = () => {
    for (const i in reservations) {
      db.query(
        `select billingId, amount from billings where billingId = ? or 
        multipleBillingsId = ?`,
        [reservations[i].billingId, reservations[i].billingId],
        (err, res) => {
          if (err) throw err;
          reservations[i].billings = res;
          if (+i + 1 === reservations.length) {
            response.status(200).send(reservations);
          }
        }
      );
    }
  };

  if (roomType && startDate) {
    const sql = `SELECT a.reservationId, a.hotelId, a.payingGuestId, a.numOfRooms, a.adultsPerRoom, a.childrenPerRoom,
        CONCAT(b.guestTitle, ' ', b.lastName, ' ', b.firstName) AS payingGuestName, a.roomTypeId, c.roomTypeName, 
        a.billingId, a.totalPayment, c.icon, a.reservationStartDateTime, a.reservationEndDateTime, NULL AS billings 
        FROM reservations a INNER JOIN guests b ON a.payingGuestId = b.guestId
        INNER JOIN hotel_roomtype c ON a.roomTypeId = c.roomTypeId 
        WHERE a.hotelId = ? AND a.roomTypeId = ? AND a.reservationStartDateTime >= ? AND a.statuss = ?`;
    db.query(sql, [hotelId, roomType, startDate, 'active'], (err, res) => {
      if (err) throw err;

      if (res.length > 0) {
        reservations = res;
        getBillingInfo();
      } else {
        response.status(204).send({ message: 'No reservations exist' });
      }
    });
  } else if (roomType) {
    const sql = `SELECT a.reservationId, a.hotelId, a.payingGuestId, a.numOfRooms, a.adultsPerRoom, a.childrenPerRoom,
        CONCAT(b.guestTitle, ' ', b.lastName, ' ', b.firstName) AS payingGuestName, a.roomTypeId, c.roomTypeName, 
        a.billingId, a.totalPayment, c.icon, a.reservationStartDateTime, a.reservationEndDateTime, NULL AS billings 
        FROM reservations a INNER JOIN guests b ON a.payingGuestId = b.guestId
        INNER JOIN hotel_roomtype c ON a.roomTypeId = c.roomTypeId 
        WHERE a.hotelId = ? AND a.roomTypeId = ? AND a.statuss = ?`;
    db.query(sql, [hotelId, roomType, 'active'], (err, res) => {
      if (err) throw err;

      if (res.length > 0) {
        reservations = res;
        getBillingInfo();
      } else {
        response.status(204).send({ message: 'No reservations exist' });
      }
    });
  } else if (startDate) {
    const sql = `SELECT a.reservationId, a.hotelId, a.payingGuestId, a.numOfRooms, a.adultsPerRoom, a.childrenPerRoom,
        CONCAT(b.guestTitle, ' ', b.lastName, ' ', b.firstName) AS payingGuestName, a.roomTypeId, c.roomTypeName, 
        a.billingId, a.totalPayment, c.icon, a.reservationStartDateTime, a.reservationEndDateTime, NULL AS billings 
        FROM reservations a INNER JOIN guests b ON a.payingGuestId = b.guestId
        INNER JOIN hotel_roomtype c ON a.roomTypeId = c.roomTypeId 
        WHERE a.hotelId = ? AND a.reservationStartDateTime >= ? AND a.statuss = ?`;
    db.query(sql, [hotelId, startDate, 'active'], (err, res) => {
      if (err) throw err;

      if (res.length > 0) {
        reservations = res;
        getBillingInfo();
      } else {
        response.status(204).send({ message: 'No reservations exist' });
      }
    });
  } else {
    const sql = `SELECT a.reservationId, a.hotelId, a.payingGuestId, a.numOfRooms, a.adultsPerRoom, a.childrenPerRoom,
        CONCAT(b.guestTitle, ' ', b.lastName, ' ', b.firstName) AS payingGuestName, a.roomTypeId, c.roomTypeName, 
        a.billingId, a.totalPayment, c.icon, a.reservationStartDateTime, a.reservationEndDateTime, NULL AS billings 
        FROM reservations a INNER JOIN guests b ON a.payingGuestId = b.guestId
        INNER JOIN hotel_roomtype c ON a.roomTypeId = c.roomTypeId WHERE a.hotelId = ? AND a.statuss = ?`;
    db.query(sql, [hotelId, 'active'], (err, res) => {
      if (err) throw err;

      if (res.length > 0) {
        reservations = res;
        getBillingInfo();
      } else {
        response.status(204).send({ message: 'No reservations exist' });
      }
    });
  }
};

// get all waiter
exports.getHotelStaffs = (request, response) => {
  const { hotelId } = request.params;
  const { role } = request.query;

  db.query(
    `SELECT employeeId, CONCAT(firstName, ' ', lastName) AS employeeName
  FROM employees WHERE employeeRole = ?`,
    [role],
    (err, res) => {
      if (err) throw err;
      response.status(200).send(res);
    }
  );
};

// Get the list of all checkedIn rooms
exports.getCheckedInRooms = (request, response) => {
  const { hotelId } = request.params;
  const { roomType } = request.query;
  let roomsDetail;

  // TODO Get the name of the paying guest of a particular room
  const getPayingGuestName = () => {
    for (const i in roomsDetail) {
      if (roomsDetail[i].currentOccupant === null) {
        db.query(
          `SELECT CONCAT(guestTitle, ' ', lastName, ' ', firstName) AS payingGuestName
          FROM multiple_staying_guest_table a
          INNER JOIN guests b ON a.guestId = b.guestId
          WHERE tempGuestId = ? AND (guestType = 3 OR guestType = 1) LIMIT 1`,
          [roomsDetail[i].payingGuestId],
          (err, res) => {
            if (err) throw err;
            roomsDetail[i].payingGuestName = res[0].payingGuestName;
          }
        );
      }
    }
  };

  if (roomType) {
    db.query(
      `SELECT b.checkInId, a.roomId, a.hotelId, a.roomNumber, a.roomTypeId, d.roomTypeName, d.icon, a.adjustedPrice AS cost, a.roomStatus,
      CONCAT(c.guestTitle, ' ', c.lastName, ' ', c.firstName) AS currentOccupant, a.picture, b.checkInDate,
      a.lostKey, a.dropOffKey, currentOccupant AS payingGuestId, NULL AS payingGuestName,
      b.checkOutDate AS freeDate FROM rooms a LEFT JOIN checkin_out b ON a.roomId = b.roomId
      LEFT JOIN guests c ON a.currentOccupant = c.guestId
      LEFT JOIN hotel_roomtype d ON a.roomTypeId = d.roomTypeId
      WHERE a.hotelId = ? AND a.roomTypeId = ? AND b.statuss = 'active' ORDER BY roomNumber`,
      [hotelId, roomType],
      (err, res) => {
        if (err) throw err;
        roomsDetail = res;
        response.status(200).send(roomsDetail);
      }
    );
  } else {
    const sql = `SELECT b.checkInId, a.roomId, a.hotelId, a.roomNumber, a.roomTypeId, d.roomTypeName, d.icon, a.adjustedPrice AS cost, 
        a.roomStatus, CONCAT(c.guestTitle, ' ', c.lastName, ' ', c.firstName) AS currentOccupant, a.picture, b.checkInDate,
        a.lostKey, a.dropOffKey, currentOccupant AS payingGuestId, NULL AS payingGuestName,
        b.checkOutDate AS freeDate FROM rooms a LEFT JOIN checkin_out b ON a.roomId = b.roomId
        LEFT JOIN guests c ON a.currentOccupant = c.guestId
        LEFT JOIN hotel_roomtype d ON a.roomTypeId = d.roomTypeId
        WHERE a.hotelId = ? AND b.statuss = 'active' ORDER BY roomNumber`;
    db.query(sql, [hotelId], (err, res) => {
      if (err) throw err;
      roomsDetail = res;
      response.status(200).send(roomsDetail);
    });
  }
};

// get from hotel-roomtype roomTypeName, basePrice
exports.getHotelRoomTypes = (request, response) => {
  const { hotelId } = request.params;

  db.query(
    `SELECT roomTypeId, roomTypeName, basePrice
    FROM hotel_roomtype WHERE hotelId = ? `,
    [hotelId],
    (err, res) => {
      if (err) throw err;

      response.status(200).send(res);
    }
  );
};

// get hotel buildings
exports.getHotelBuilding = (request, response) => {
  const { hotelId } = request.params;

  db.query(
    'SELECT buildingId, buildingName FROM buildings WHERE hotelId = ?',
    [hotelId],
    (err, res) => {
      if (err) throw err;

      response.status(200).send(res);
    }
  );
};

// get hotel buildings
exports.getAccounts = (request, response) => {
  const { hotelId } = request.params;
  const { bankName, accountNumber, posId } = request.query;
  // const Account = [];
  let account1;
  let account2;
  let Account;
  const myAccount = () => {
    db.query(
      'SELECT bankName, accountNumber, "bank" AS accountType FROM hotel_account_details WHERE hotelId = ?',
      [hotelId, bankName, accountNumber],
      (err, res) => {
        if (err) throw err;
        account1 = res;
        const combinedAccount = [];

        for (const acc of account1) {
          combinedAccount.push(acc);
        }
        for (const acc of account2) {
          combinedAccount.push(acc);
        }
        // combinedAccount = Array.prototype.push.apply(account1, account2);
        response.status(200).send(combinedAccount);
        // Account.push(account1, account2);
      }
    );
  };
  // not working
  db.query(
    'SELECT bankName, posId, "pos" AS accountType FROM hotel_pos_details WHERE hotelId = ?',
    [hotelId, bankName, posId],
    (err, res) => {
      if (err) throw err;
      account2 = res;
      // function
      myAccount();
    }
  );
};

// check availability
exports.checkAvailability = (request, response) => {
  const { hotelId, roomId } = request.params;
  const { checkOutDate } = request.query;

  db.query(
    `SELECT * FROM rooms a
    JOIN checkin_out b ON a.hotelId = b.roomId
    WHERE a.hotelId= ? AND b.roomId= ? AND a.roomStatus= 'available' AND b.checkOutDate= ?`,
    [hotelId, roomId, checkOutDate],
    (err, res) => {
      if (err) throw err;
      if (res.length !== 0) {
        response.status(200).send({ message: 'Available' });
      } else {
        response.status(200).send({ message: 'UN-Available' });
      }
    }
  );
};

exports.getCurrentGuests = (request, response) => {
  const { hotelId } = request.params;

  let guestsList1;
  let guestsList2;

  const getMultipleGuests = () => {
    const sql = `SELECT a.roomId, a.hotelId, b.guestId, b.tempGuestId, a.roomNumber, a.roomTypeId, e.roomTypeName, 
        d.checkInId, CONCAT(c.guestTitle, ' ',c.lastName, ' ', c.firstName) AS guestName, d.checkInDate,
        d.checkOutDate, b.guestType FROM rooms a
        INNER JOIN multiple_staying_guest_table b ON a.currentOccupant = b.tempGuestId
        INNER JOIN guests c ON b.guestId = c.guestId
        INNER JOIN checkin_out d ON a.roomId = d.roomId
        INNER JOIN hotel_roomtype e ON a.roomTypeId = e.roomTypeId
        where d.statuss = 'active' and a.hotelId = ?`;
    db.query(sql, [hotelId], (err, res) => {
      if (err) throw err;
      guestsList2 = res;

      const guests = guestsList1.concat(guestsList2);
      response.status(200).send(guests);
    });
  };

  const sql = `SELECT a.roomId, a.hotelId, b.guestId, c.checkInId, a.roomNumber, a.roomTypeId, d.roomTypeName,
      CONCAT(b.guestTitle, ' ',b.lastName, ' ', b.firstName) AS guestName, d.roomTypeName, 
      c.checkInDate, c.checkOutDate, 3 AS guestType FROM rooms a
      INNER JOIN guests b ON a.currentOccupant = b.guestId
      INNER JOIN checkin_out c ON a.roomId = c.roomId
      INNER JOIN hotel_roomtype d ON a.roomTypeId = d.roomTypeId
      WHERE c.statuss = 'active' AND a.hotelId = ?`;
  db.query(sql, [hotelId], (err, res) => {
    if (err) throw err;
    guestsList1 = res;
    getMultipleGuests();
  });
};

exports.getHotelServices = (request, response) => {
  const { hotelId } = request.params;
  const { serviceType } = request.query;
  db.query(
    `select serviceId, serviceName, serviceCost 
    from hotel_services where serviceType = ? and hotelId = ?`,
    [serviceType, hotelId],
    (err, res) => {
      if (err) throw err;

      response.status(200).send(res);
    }
  );
};

// Get Room number
exports.getRoomNumbers = (request, response) => {
  const { hotelId } = request.params;
  db.query('select roomNumber from rooms ', [hotelId], (err, res) => {
    if (err) throw err;

    const roomNumbers = res.map((obj) => obj.roomNumber);
    response.status(200).send({ roomNumbers });
  });
};

// Get Room Type
exports.getRoomTypes = (request, response) => {
  const { hotelId } = request.params;
  db.query(
    'select roomTypeName from hotel_roomtype where hotelId = ? ',
    [hotelId],
    (err, res) => {
      if (err) throw err;

      const roomtypes = res.map((obj) => obj.roomTypeName);
      response.status(200).send({ roomtypes });
    }
  );
};

// Get hotel building
exports.getBuildings = (request, response) => {
  const { hotelId } = request.params;
  db.query('select buildingName from buildings ', [hotelId], (err, res) => {
    if (err) throw err;

    const buildings = res.map((obj) => obj.buildingName);
    response.status(200).send({ buildings });
  });
};

// Get the list of all checkedIn rooms by Customers name
exports.getCheckedInRoomsByGuestNames = (request, response) => {
  const { hotelId } = request.params;
  const { firstName, lastName } = request.query;
  let roomsDetail;

  // Get the name of the paying guest of a particular room
  const getPayingGuestName = () => {
    for (const i in roomsDetail) {
      if (roomsDetail[i].currentOccupant === null) {
        db.query(
          `SELECT CONCAT(guestTitle, ' ', lastName, ' ', firstName) AS payingGuestName
          FROM multiple_staying_guest_table a
          INNER JOIN guests b ON a.guestId = b.guestId
          WHERE tempGuestId = ? AND (guestType = 3 OR guestType = 1) LIMIT 1`,
          [roomsDetail[i].payingGuestId],
          (err, res) => {
            if (err) throw err;
            roomsDetail[i].payingGuestName = res[0].payingGuestName;
          }
        );
      }
    }
  };

  if (firstName || lastName) {
    db.query(
      `SELECT b.checkInId, a.roomId, a.hotelId, a.roomNumber, a.roomTypeId, d.roomTypeName, d.icon, a.adjustedPrice
      AS cost, a.roomStatus,
      CONCAT(c.guestTitle, ' ', c.lastName, ' ', c.firstName) AS currentOccupant, a.picture, b.checkInDate,
      a.lostKey, a.dropOffKey, currentOccupant AS payingGuestId, NULL AS payingGuestName,
      b.checkOutDate AS freeDate 
      FROM rooms a 
      LEFT JOIN checkin_out b ON a.roomId = b.roomId
      LEFT JOIN guests c ON a.currentOccupant = c.guestId
      LEFT JOIN hotel_roomtype d ON a.roomTypeId = d.roomTypeId
      WHERE a.hotelId = ? AND (c.firstName = ? OR c.lastName= ?) AND b.statuss = 'active' ORDER BY roomNumber`,
      [hotelId, firstName, lastName],
      (err, res) => {
        if (err) throw err;
        roomsDetail = res;
        response.status(200).send(roomsDetail);
      }
    );
  } else {
    const sql = `SELECT b.checkInId, a.roomId, a.hotelId, a.roomNumber, a.roomTypeId, d.roomTypeName, d.icon, a.adjustedPrice AS cost, 
        a.roomStatus, CONCAT(c.guestTitle, ' ', c.lastName, ' ', c.firstName) AS currentOccupant, a.picture, b.checkInDate,
        a.lostKey, a.dropOffKey, currentOccupant AS payingGuestId, NULL AS payingGuestName,
        b.checkOutDate AS freeDate FROM rooms a LEFT JOIN checkin_out b ON a.roomId = b.roomId
        LEFT JOIN guests c ON a.currentOccupant = c.guestId
        LEFT JOIN hotel_roomtype d ON a.roomTypeId = d.roomTypeId
        WHERE a.hotelId = ? AND b.statuss = 'active' ORDER BY roomNumber`;
    db.query(sql, [hotelId], (err, res) => {
      if (err) throw err;
      roomsDetail = res;
      response.status(200).send(roomsDetail);
    });
  }
};

// get cash register audit

exports.cashRegisters = (request, response) => {
  const { hotelId } = request.params;
  const { status } = request.query;
  let totalCashRegister;

  // get total transaction Count
  const getTransactionCount = () => {
    const len = totalCashRegister.length;
    for (const i in totalCashRegister) {
      db.query(
        'SELECT COUNT(*) AS totalTransactions FROM register_activities WHERE registerId = ? ',
        [totalCashRegister[i].registerId],
        (err, res) => {
          if (err) throw err;

          totalCashRegister[i].totalTransactions = res[0].totalTransactions;

          if (+i === len - 1) {
            response.status(200).send(totalCashRegister);
          }
        }
      );
    }
  };

  // Get the Total Cash
  const getTotalCash = () => {
    const len = totalCashRegister.length;
    for (const i in totalCashRegister) {
      db.query(
        `SELECT b.amount FROM register_activities a
        JOIN billings b ON b.billingId= a.billingId
        WHERE a.registerId= ? UNION
        SELECT cashOnHand AS amount FROM register WHERE registerId = ?`,
        [totalCashRegister[i].registerId, totalCashRegister[i].registerId],
        (err, res) => {
          if (err) throw err;
          const totalCost = res.reduce((a, b) => a + b.amount, 0);

          totalCashRegister[i].totalCash = totalCost;
          if (+i === len - 1) {
            getTransactionCount();
          }
        }
      );
    }
  };

  // get employee details
  db.query(
    `SELECT a.registerId, a.employeeId, a.statuss, a.totalAmountOnClose, b.employeeRole AS department,
    a.dateTimeOpened, a.dateTimeClosed, CONCAT(b.lastName, ' ', b.firstName) AS employeeName, a.cashOnHand
      FROM register a INNER JOIN employees b ON a.employeeId= b.employeeId
      INNER JOIN employees_hotels c ON b.employeeId = c.employeeId
      WHERE c.hotelId = ? AND a.statuss = ?`,
    [hotelId, status],
    (err, res) => {
      if (err) throw err;
      totalCashRegister = res;
      getTotalCash();
      // response.status(200).send(res);
    }
  );
};

// change key
exports.notForSale = (request, response) => {
  const { roomId, status } = request.body;

  db.query(
    'update rooms set notForSale = ? where roomId = ?',
    [status, roomId],
    (err, res) => {
      if (err) throw err;
      response.status(200).send({ message: 'Sale status updated' });
    }
  );
};
