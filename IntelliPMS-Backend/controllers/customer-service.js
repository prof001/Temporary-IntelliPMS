const db = require('../db/index');

// Get Laundry Service
exports.getLaundryServices = (request, response) => {
  const { statuss } = request.query;
  const { hotelId } = request.params;
  let laundryDetails;

  const getServices = () => {
    // eslint-disable-next-line prefer-destructuring
    const length = laundryDetails.length;

    for (const i in laundryDetails) {
      const sql = `SELECT serviceName, serviceCost, quantity FROM laundry_items a
        INNER JOIN hotel_services b ON a.serviceId = b.serviceId
        WHERE laundryId = ?`;

      db.query(sql, [laundryDetails[i].laundryId], (err, res) => {
        if (err) throw err;
        laundryDetails[i].items = res;

        if (length - 1 === +i) {
          response.status(200).send(laundryDetails);
        }
      });
    }
  };

  const sql = `SELECT a.laundryId, a.guestId, CONCAT(b.guestTitle, ' ', b.lastName, ' ', b.firstName) 
  AS guestName, a.createdBy, a.createdDateTime, a.dueDateTime, a.completedDateTime, a.statuss, a.amount,
  a.paymentStatus FROM laundry_services a LEFT JOIN guests b ON a.guestId = b.guestId
  LEFT JOIN rooms c ON a.roomId = c.roomId
  WHERE c.hotelId= ? AND a.statuss = ? ORDER BY createdDateTime DESC`;
  db.query(sql, [hotelId, statuss], (err, res) => {
    if (err) throw err;
    laundryDetails = res;
    if (laundryDetails.length === 0) {
      response.status(200).send(laundryDetails);
    } else {
      getServices();
    }
    // response.status(200).send(res);
  });
};

// create Laundry Service
exports.createLaundryService = (request, response) => {
  const {
    guestId,
    checkInId,
    roomId,
    createdDateTime,
    createdBy,
    dueDateTime,
    amount,
    paymentStatus,
    items,
  } = request.body;
  const dateTime = createdDateTime;

  const addLaundryItems = (laundryId) => {
    for (const item of items) {
      db.query(
        `insert into laundry_items(laundryId, checkInId, serviceId, quantity)
          values (?, ?, ?, ?)`,
        [laundryId, checkInId, item.itemName, item.quantity],
        (err, res) => {
          if (err) throw err;
        }
      );
    }
    response
      .status(200)
      .send({ message: 'Laundry request created successfully' });
  };
  const sql = `INSERT INTO laundry_services (guestId, checkInId, roomId, createdDateTime, dueDateTime,
    statuss, amount, paymentStatus, createdBy)VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [
      guestId,
      checkInId,
      roomId,
      dateTime,
      dueDateTime,
      'unprocessed',
      amount,
      paymentStatus,
      createdBy,
    ],
    (err, res) => {
      if (err) throw err;

      const laundryId = res.insertId;
      addLaundryItems(laundryId);
    }
  );
};

// Count Unprocess laundry Request
exports.countUnprocessedLaundryRequest = (request, response) => {
  db.query(
    'SELECT COUNT(*) AS num FROM laundry_services WHERE statuss = ?',
    ['unprocessed'],
    (err, res) => {
      if (err) throw err;

      response.status(200).send(res[0]);
    }
  );
};

// Update Laundry Request
exports.updateLaundryRequest = (request, response) => {
  const { laundryId, action } = request.body;
  if (action === 'processing') {
    const { processingBy } = request.body;
    db.query(
      'update laundry_services set statuss = ?, processingBy = ? where laundryId = ?',
      [action, processingBy, laundryId],
      (err, res) => {
        if (err) throw err;

        response.status(200).send({ message: 'Update successful' });
      }
    );
  } else if (action === 'completed') {
    const { completedDateTime, completedBy } = request.body;
    db.query(
      'update laundry_services set statuss = ?, completedBy = ?, completedDateTime = ? where laundryId = ?',
      [action, completedBy, completedDateTime, laundryId],
      (err, res) => {
        if (err) throw err;

        response.status(200).send({ message: 'Update successful' });
      }
    );
  }
};

// get rooms services
exports.getRoomServices = (request, response) => {
  const { statuss } = request.query;
  const { hotelId } = request.params;
  const sql = `SELECT a.roomServiceId, a.guestId, CONCAT(b.guestTitle, ' ', b.lastName, ' ', b.firstName) 
  AS guestName, c.roomId, c.roomNumber, a.createdBy, a.createdDateTime, a.completedDateTime, 
  a.statuss, a.amount FROM room_services a 
  LEFT JOIN guests b ON a.guestId = b.guestId
  LEFT JOIN rooms c ON a.roomId = c.roomId
  WHERE c.hotelId= ? AND  a.statuss = ? ORDER BY createdDateTime DESC`;
  db.query(sql, [hotelId, statuss], (err, res) => {
    if (err) throw err;

    response.status(200).send(res);
  });
};

// update room services
exports.updateRoomServices = (request, response) => {
  const { roomServiceId, action } = request.body;

  if (action === 'processing') {
    const { processingBy } = request.body;
    db.query(
      'update room_services set statuss = ?, processingBy = ? where roomServiceId = ?',
      [action, processingBy, roomServiceId],
      (err, res) => {
        if (err) throw err;
        response
          .status(200)
          .send({ message: 'room-service updated successfully' });
      }
    );
  } else if (action === 'completed') {
    const { completedDateTime, completedBy } = request.body;
    db.query(
      'update room_services set statuss = ?, completedBy = ?, completedDateTime = ? where roomServiceId = ?',
      [action, completedBy, completedDateTime, roomServiceId],
      (err, res) => {
        if (err) throw err;
        response
          .status(200)
          .send({ message: 'room-service updated successfully' });
      }
    );
  }
};

// create room services
exports.createRoomService = (request, response) => {
  const {
    guestId,
    checkInId,
    invoiceId,
    roomId,
    createdDateTime,
    numOfItems,
    amount,
    paymentStatus,
    waiterId,
    createdBy,
  } = request.body;

  const sql = `insert into room_services(guestId, checkInId, invoiceId, roomId, createdDateTime,
  numOfItems, amount, paymentStatus, statuss, waiterId, createdBy) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [
      guestId,
      checkInId,
      invoiceId,
      roomId,
      createdDateTime,
      numOfItems,
      amount,
      paymentStatus,
      'unprocessed',
      waiterId,
      createdBy,
    ],
    (err, res) => {
      if (err) throw err;
      response.status(200).send({ message: 'New Room Service is created' });
    }
  );
};

exports.countUnprocessedRoomServiceRequest = (request, response) => {
  db.query(
    'SELECT COUNT(*) AS num FROM room_services WHERE statuss = ?',
    ['unprocessed'],
    (err, res) => {
      if (err) throw err;

      response.status(200).send(res[0]);
    }
  );
};

// get issue Comments
exports.getIssuesComments = (request, response) => {
  const { statuss } = request.query;
  const sql = `SELECT a.issueCommentId, a.guestId, CONCAT(b.guestTitle, ' ', b.lastName, ' ', b.firstName)
      AS guestName, a.createdBy, a.type, a.note, a.createdDateTime, a.resolvedDateTime, a.statuss 
      FROM issues_comments a LEFT JOIN guests b ON a.guestId = b.guestId
      WHERE statuss=? ORDER BY createdDateTime DESC`;

  db.query(sql, [statuss], (err, res) => {
    if (err) throw err;

    response.status(200).send(res);
  });
};

// update issue comments
exports.updateIssuesComments = (request, response) => {
  const { issueCommentId, action } = request.body;

  if (action === 'processing') {
    const { processingBy } = request.body;

    db.query(
      'update issues_comments set statuss = ?, processingBy = ? where issueCommentId = ?',
      [action, processingBy, issueCommentId],
      (err, res) => {
        if (err) throw err;
        response.status(200).send({ message: 'Issue updated successfully' });
      }
    );
  } else if (action === 'resolved') {
    const { resolvedDateTime, completedBy } = request.body;
    db.query(
      'update issues_comments set statuss = ?, completedBy = ?, resolvedDateTime=? where issueCommentId = ?',
      [action, completedBy, resolvedDateTime, issueCommentId],
      (err, res) => {
        if (err) throw err;
        response.status(200).send({ message: 'Issue updated successfully' });
      }
    );
  }
};

// create issues comments
exports.createIssuesComment = (request, response) => {
  const {
    guestId,
    type,
    note,
    createdDateTime,
    checkInId,
    createdBy,
  } = request.body;
  db.query(
    `insert into issues_comments(guestId, checkInId, type, note, createdDateTime, statuss, createdBy)
      values (?, ?, ?, ?, ?, ?, ?)`,
    [guestId, checkInId, type, note, createdDateTime, 'unprocessed', createdBy],
    (err, res) => {
      if (err) throw err;
      response.status(200).send({ message: 'New issue comment created' });
    }
  );
};

exports.countUnprocessedIssuesComments = (request, response) => {
  db.query(
    'SELECT COUNT(*) AS num FROM issues_comments WHERE statuss = ?',
    ['unprocessed'],
    (err, res) => {
      if (err) throw err;

      response.status(200).send(res[0]);
    }
  );
};

// get all house-keeping service
exports.getHouseKeepingServices = (request, response) => {
  const { statuss } = request.query;
  const { hotelId } = request.params;
  let houseKeepingItems;

  const getServices = () => {
    // eslint-disable-next-line prefer-destructuring
    const length = houseKeepingItems.length;

    for (const i in houseKeepingItems) {
      const sql = `SELECT serviceName, serviceCost, quantity FROM housekeeping_items a
        INNER JOIN hotel_services b ON a.item = b.serviceId
        WHERE houseKeepingId = ?`;

      db.query(sql, [houseKeepingItems[i].houseKeepingId], (err, res) => {
        if (err) throw err;
        houseKeepingItems[i].items = res;

        if (length - 1 === +i) {
          response.status(200).send(houseKeepingItems);
        }
      });
    }
  };

  const sql = `SELECT a.houseKeepingId, a.guestId, CONCAT(b.guestTitle, ' ', b.lastName, ' ', b.firstName) 
  AS guestName, a.checkInId, a.createdDateTime, a.endDateTime, a.amount, a.statuss, a.paymentStatus, 
  a.checkOutId, c.roomNumber FROM housekeeping a LEFT JOIN guests b ON a.guestId = b.guestId
  LEFT JOIN rooms c ON a.roomId = c.roomId WHERE c.hotelId= ? AND statuss = ?`;

  db.query(sql, [hotelId, statuss], (err, res) => {
    if (err) throw err;
    houseKeepingItems = res;
    if (houseKeepingItems.length === 0) {
      response.status(200).send(houseKeepingItems);
    } else {
      getServices();
    }
  });
};

// count unprocessed house keeep service
exports.countUnprocessedHouseKeepingRequest = (request, response) => {
  db.query(
    'SELECT COUNT(*) AS num FROM housekeeping WHERE statuss = ?',
    ['unprocessed'],
    (err, res) => {
      if (err) throw err;

      response.status(200).send(res[0]);
    }
  );
};

// update house keeping services
exports.updateHouseKeepingRequest = (request, response) => {
  const { houseKeepingId, action } = request.body;
  // const { statuss } = request.body;
  if (action === 'processing') {
    const { processingBy } = request.body;
    db.query(
      'update housekeeping set statuss = ?, processingBy = ? where houseKeepingId = ?',
      [action, processingBy, houseKeepingId],
      (err, res) => {
        if (err) throw err;
        response.status(200).send({ message: 'Update successful' });
      }
    );
  } else if (action === 'completed') {
    const { completedDateTime, completedBy } = request.body;
    db.query(
      'update housekeeping set statuss = ?, completedBy = ?, endDateTime = ? where houseKeepingId = ?',
      [action, completedBy, completedDateTime, houseKeepingId],
      (err, res) => {
        if (err) throw err;
        response.status(200).send({ message: 'Update successful' });
      }
    );
  }
};

// create Housekeeping Service
exports.createHousekeepingServices = (request, response) => {
  const {
    guestId,
    checkInId,
    roomId,
    createdDateTime,
    createdBy,
    amount,
    paymentStatus,
    items,
  } = request.body;
  const dateTime = createdDateTime;

  const addHouseKeepingItems = (housekeepingId) => {
    for (const item of items) {
      db.query(
        `insert into housekeeping_items(housekeepingId, checkInId, item, quantity)
           values (?, ?, ?, ?)`,
        [housekeepingId, checkInId, item.itemName, item.quantity],
        (err, res) => {
          if (err) throw err;
        }
      );
    }
    response
      .status(200)
      .send({ message: 'Housekeeping request created successfully' });
  };
  const sql = `insert into housekeeping 
    (guestId, checkInId, roomId, createdDateTime, amount, statuss, paymentStatus, createdBy)
    values (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [
      guestId,
      checkInId,
      roomId,
      dateTime,
      amount,
      'unprocessed',
      paymentStatus,
      createdBy,
    ],
    (err, res) => {
      if (err) throw err;
      const housekeepingId = res.insertId;
      addHouseKeepingItems(housekeepingId);
    }
  );
};
