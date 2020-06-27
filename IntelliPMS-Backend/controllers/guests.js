/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
const moment = require('moment');

const db = require('../db/index');
const helperFunction = require('../utility/helper_functions');

exports.getGuests = (request, response) => {
  const { phoneNumber } = request.query;

  if (phoneNumber) {
    db.query(
      'select * from guests where phoneNumber = ?',
      [phoneNumber],
      (err, res) => {
        if (err) throw err;

        response.status(200).send(res[0]);
      }
    );
  } else {
    db.query('select * from guests', (err, res) => {
      if (err) throw err;

      response.status(200).send(res);
    });
  }
};

exports.checkIn = (request, response) => {
  const {
    guestDetails,
    selectedRoom,
    currentDateTime,
    checkInOutDateTime,
    paymentDetails,
    createdBy,
    registerId,
    hotelId,
  } = request.body;

  let payingGuestId;
  const numOfGuests = guestDetails.length;

  const updateRoom = () => {
    db.query(
      'update rooms set roomStatus = ?, currentOccupant = ? where roomId = ?',
      ['occupied', payingGuestId, selectedRoom.roomId],
      (err, res) => {
        if (err) throw err;

        response.status(201).send({ message: 'Checkin successful!' });
      }
    );
  };

  const updateCheckInOut = (billingId, checkInId) => {
    db.query(
      'update checkin_out set billingId = ? where checkInId = ?',
      [billingId, checkInId],
      (err6, res6) => {
        if (err6) throw err6;
        updateRoom();
      }
    );
  };

  const insertIntoRegisterActivities = (billingId) => {
    db.query(
      'insert into register_activities (registerId, billingId) values (?, ?)',
      [registerId, billingId],
      (err, res) => {
        if (err) throw err;
      }
    );
  };

  const insertBillings = (checkInId) => {
    let billingId;
    let multipleBillingId;
    let passedBillingId;

    const billingCount = paymentDetails.length;
    if (billingCount === 1) {
      multipleBillingId = null;
    } else if (billingCount > 1) {
      multipleBillingId = helperFunction.getMultipleBillingsId();
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const payment of paymentDetails) {
      if (payment.paymentType === 'cash') {
        db.query(
          `insert into billings (billedFor, billedForId, guestId, paymentDate, paymentType, amount, 
            multipleBillingsId, hotelId) values (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'checkin',
            checkInId,
            payingGuestId,
            currentDateTime,
            payment.paymentType,
            payment.amount,
            multipleBillingId,
            hotelId,
          ],
          // eslint-disable-next-line no-loop-func
          (err5, res5) => {
            if (err5) throw err5;
            billingId = res5.insertId;
            insertIntoRegisterActivities(billingId);

            if (billingCount === 1) {
              updateCheckInOut(billingId, checkInId);
            }
          }
        );
      } else if (payment.paymentType === 'Manager Credit') {
        db.query(
          `insert into billings (billedFor, billedForId, guestId, paymentDate, paymentType, amount, 
            multipleBillingsId, managerId, referenceNumber, hotelId) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'checkin',
            checkInId,
            payingGuestId,
            currentDateTime,
            payment.paymentType,
            payment.amount,
            multipleBillingId,
            payment.managerName,
            payment.referenceNumber,
            hotelId,
          ],
          // eslint-disable-next-line no-loop-func
          (err5, res5) => {
            if (err5) throw err5;
            billingId = res5.insertId;

            insertIntoRegisterActivities(billingId);

            if (billingCount === 1) {
              updateCheckInOut(billingId, checkInId);
            }
          }
        );
      } else if (
        payment.paymentType === 'transfer' ||
        payment.paymentType === 'card'
      ) {
        const accountId = payment.bankName;
        db.query(
          `insert into billings (billedFor, billedForId, guestId, paymentDate, paymentType, accountId, 
            transactionId, amount, multipleBillingsId, hotelId) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'checkin',
            checkInId,
            payingGuestId,
            currentDateTime,
            payment.paymentType,
            accountId,
            payment.transactionId,
            payment.amount,
            multipleBillingId,
            hotelId,
          ],
          // eslint-disable-next-line no-loop-func
          (err5, res5) => {
            if (err5) throw err5;
            billingId = res5.insertId;

            insertIntoRegisterActivities(billingId);

            if (billingCount === 1) {
              updateCheckInOut(billingId, checkInId);
            }
          }
        );
      }
    }

    if (billingCount > 1) {
      passedBillingId = multipleBillingId;
      updateCheckInOut(passedBillingId, checkInId);
    }
  };

  const insertMultipleStayingGuest = (checkInId) => {
    for (const guest of guestDetails) {
      db.query(
        'select * from guests where phoneNumber = ?',
        [guest.phoneNumber],
        (err, res) => {
          if (err) throw err;

          if (res.length === 1) {
            const guestId = res[0].guestId;
            const sql = `insert into multiple_staying_guest_table (checkInId, tempGuestId, guestType, guestId)
                values (?, ?, ?, ?)`;
            db.query(
              sql,
              [checkInId, payingGuestId, guest.guestType, guestId],
              (err2, res2) => {
                if (err2) throw err2;
              }
            );
          }
        }
      );
    }
    insertBillings(checkInId);
  };

  const executeCheckIn = () => {
    db.query(
      `insert into checkin_out (guestId, roomId, checkInDate, checkOutDate, numOfGuests, statuss, createdBy)
        values(?, ?, ?, ?, ?, ?, ?)`,
      [
        payingGuestId,
        selectedRoom.roomId,
        checkInOutDateTime.checkInDateTime,
        checkInOutDateTime.checkOutDateTime,
        numOfGuests,
        'active',
        createdBy,
      ],
      (err4, res4) => {
        if (err4) throw err4;
        const checkInId = res4.insertId;

        if (numOfGuests === 1) {
          insertBillings(checkInId);
        } else if (numOfGuests > 1) {
          insertMultipleStayingGuest(checkInId);
        }
      }
    );
  };

  if (numOfGuests === 1) {
    db.query(
      'select guestId from guests where phoneNumber = ?',
      [guestDetails[0].phoneNumber],
      // eslint-disable-next-line consistent-return
      (err1, res1) => {
        if (err1) throw err1;

        if (res1.length === 0) {
          db.query(
            `insert into guests (guestTitle, firstName, lastName, otherName, address, phoneNumber, email,
              country, gender) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              guestDetails[0].guestTitle,
              guestDetails[0].firstName,
              guestDetails[0].lastName,
              guestDetails[0].otherName,
              guestDetails[0].address,
              guestDetails[0].phoneNumber,
              guestDetails[0].email,
              guestDetails[0].country,
              guestDetails[0].gender,
            ],
            (err2, res2) => {
              if (err2) throw err2;
              payingGuestId = res2.insertId;
              executeCheckIn(payingGuestId);
            }
          );
        } else {
          payingGuestId = res1[0].guestId;
          executeCheckIn(payingGuestId);
        }
      }
    );
  } else if (numOfGuests > 1) {
    payingGuestId = helperFunction.getMultipleGuestId();
    let count = 0;
    for (const i in guestDetails) {
      db.query(
        'select guestId from guests where phoneNumber = ?',
        [guestDetails[i].phoneNumber],
        (err1, res1) => {
          if (err1) throw err1;

          if (res1.length === 0) {
            db.query(
              `insert into guests (guestTitle, firstName, lastName, otherName, address, phoneNumber, email,
                country, gender) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                guestDetails[i].guestTitle,
                guestDetails[i].firstName,
                guestDetails[i].lastName,
                guestDetails[i].otherName,
                guestDetails[i].address,
                guestDetails[i].phoneNumber,
                guestDetails[i].email,
                guestDetails[i].country,
                guestDetails[i].gender,
              ],
              (err2, res2) => {
                if (err2) throw err2;
              }
            );
          }
        }
      );
      count += 1;
    }
    if (count === numOfGuests) {
      executeCheckIn();
    }
  }
};

exports.checkOut = (request, response) => {
  const {
    checkInId,
    roomId,
    dateTime,
    balanceInfo,
    guestId,
    amountDuringCheckout,
    deposits,
    debits,
    createdBy,
    registerId,
    hotelId,
  } = request.body;
  const checkOutId = helperFunction.generateCheckOutId();
  const currentDateTime = dateTime;

  const updateRoom = () => {
    db.query(
      'update rooms set roomStatus = ?, currentOccupant = ?, dropOffKey = ? where roomId = ?',
      ['available', 0, 'false', roomId],
      (err, res) => {
        if (err) throw err;
      }
    );
  };

  const updateCheckInOut = () => {
    db.query(
      'update checkin_out set actualCheckOutDate = ?, statuss = ? where checkInId = ?',
      [currentDateTime, 'checkedOut', checkInId],
      (err, res) => {
        if (err) throw err;

        response.status(200).send({ message: 'Checkout successful' });
      }
    );
  };

  const updateBillings = () => {
    for (const deposit of deposits) {
      db.query(
        'update billings set checkOutId = ? where billingId = ?',
        [checkOutId, deposit.billingId],
        (err, res) => {
          if (err) throw err;
        }
      );
    }
  };

  const updateServices = () => {
    for (const debit of debits) {
      let sql;
      if (debit.service === 'Laundry') {
        sql =
          'update laundry_services set paymentStatus = ?, checkOutId = ? where laundryId = ?';
        db.query(sql, ['paid', checkOutId, debit.laundryId], (err, res) => {
          if (err) throw err;
        });
      } else if (debit.service === 'Room Service') {
        sql =
          'update room_services set paymentStatus = ?, checkOutId = ? where roomServiceId = ?';
        db.query(sql, ['paid', checkOutId, debit.roomServiceId], (err, res) => {
          if (err) throw err;
        });
      } else if (debit.service === 'Housekeeping') {
        sql =
          'update housekeeping set paymentStatus = ?, checkOutId = ? where houseKeepingId = ?';
        db.query(
          sql,
          ['paid', checkOutId, debit.houseKeepingId],
          (err, res) => {
            if (err) throw err;
          }
        );
      }
    }
    updateRoom();
    updateCheckInOut();
  };

  const insertIntoRegisterActivities = (billingId) => {
    db.query(
      'insert into register_activities (registerId, billingId) values (?, ?)',
      [registerId, billingId],
      (err, res) => {
        if (err) throw err;
      }
    );
  };

  const insertBilling = (paymentDetails) => {
    let multipleBillingId;

    const billingCount = paymentDetails.length;
    if (billingCount === 1) {
      multipleBillingId = null;
    } else if (billingCount > 1) {
      multipleBillingId = helperFunction.getMultipleBillingsId();
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const payment of paymentDetails) {
      if (payment.paymentType === 'cash') {
        db.query(
          `insert into billings (billedFor, billedForId, guestId, paymentDate, paymentType, amount, 
            multipleBillingsId, checkOutId, hotelId) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'balance during checkout',
            checkInId,
            guestId,
            currentDateTime,
            payment.paymentType,
            payment.amount,
            multipleBillingId,
            checkOutId,
            hotelId,
          ],
          // eslint-disable-next-line no-loop-func
          (err5, res5) => {
            if (err5) throw err5;
            insertIntoRegisterActivities(res5.insertId);
          }
        );
      } else if (payment.paymentType === 'Manager Credit') {
        db.query(
          `insert into billings (billedFor, billedForId, guestId, paymentDate, paymentType, amount, multipleBillingsId, 
            checkOutId, managerId, referenceNumber, hotelId) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'balance during checkout',
            checkInId,
            guestId,
            currentDateTime,
            payment.paymentType,
            payment.amount,
            multipleBillingId,
            checkOutId,
            payment.managerName,
            payment.referenceNumber,
            hotelId,
          ],
          // eslint-disable-next-line no-loop-func
          (err5, res5) => {
            if (err5) throw err5;
            insertIntoRegisterActivities(res5.insertId);
          }
        );
      } else if (
        payment.paymentType === 'transfer' ||
        payment.paymentType === 'card'
      ) {
        const accountId = payment.bankName;
        db.query(
          `insert into billings (billedFor, billedForId, guestId, paymentDate, paymentType, accountId, 
            transactionId, amount, multipleBillingsId, checkOutId, hotelId) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'balance during checkout',
            checkInId,
            guestId,
            currentDateTime,
            payment.paymentType,
            accountId,
            payment.transactionId,
            payment.amount,
            multipleBillingId,
            checkOutId,
            hotelId,
          ],
          // eslint-disable-next-line no-loop-func
          (err5, res5) => {
            if (err5) throw err5;
            insertIntoRegisterActivities(res5.insertId);
          }
        );
      }
    }
    updateBillings();
    updateServices();
  };

  const beginCheckoutProcess = () => {
    if (balanceInfo === 'refund') {
      const { bankName, accountNumber } = request.body;
      db.query(
        `insert into refunds (guestId, checkOutId, bankName, accountNumber, statuss, createdDateTime)
        values (?, ?, ?, ?, ?, ?)`,
        [
          guestId,
          checkOutId,
          bankName,
          accountNumber,
          'unprocessed',
          currentDateTime,
        ],
        (err, res) => {
          if (err) throw err;
          updateServices();
          updateBillings();
        }
      );
    } else if (balanceInfo === 'keep') {
      db.query(
        'insert into guests_credit (guestId, checkOutId, amount, insertedDateTime, statuss) values (?, ?, ?, ?, ?)',
        [guestId, checkOutId, amountDuringCheckout, currentDateTime, 'unused'],
        (err, res) => {
          if (err) throw err;

          updateServices();
          updateBillings();
        }
      );
    } else if (balanceInfo === 'make payment') {
      const { paymentDetails } = request.body;
      insertBilling(paymentDetails);
    } else {
      updateServices();
      updateBillings();
    }
  };

  db.query(
    `insert into checkout (checkOutId, checkInId, checkOutDateTime, balanceInfo,
    amountDuringCheckout, createdBy) values (?, ?, ?, ?, ?, ?)`,
    [
      checkOutId,
      checkInId,
      currentDateTime,
      balanceInfo,
      amountDuringCheckout,
      createdBy,
    ],
    (err, res) => {
      if (err) throw err;

      beginCheckoutProcess();
    }
  );
};

// make Reservation route
exports.makeReservation = (request, response) => {
  const {
    roomTypeId,
    numOfRooms,
    adultsPerRoom,
    childrenPerRoom,
    reservationStartDateTime,
    reservationEndDateTime,
    payingGuest,
    hotelId,
    currentDateTime,
    paymentDetails,
    createdBy,
    registerId,
  } = request.body;
  let payingGuestId;

  const updateReservation = (billingId, reservationId) => {
    db.query(
      'update reservations set billingId = ? where reservationId = ?',
      [billingId, reservationId],
      (err2, res2) => {
        if (err2) throw err2;

        response
          .status(200)
          .send({ message: 'Reservation successfully created' });
      }
    );
  };

  const insertIntoRegisterActivities = (billingId) => {
    db.query(
      'insert into register_activities (registerId, billingId) values (?, ?)',
      [registerId, billingId],
      (err, res) => {
        if (err) throw err;
      }
    );
  };

  const insertBilling = (reservationId) => {
    let billingId;
    let multipleBillingId;
    let passedBillingId;

    const billingCount = paymentDetails.length;

    if (billingCount === 0) {
      passedBillingId = 'No Payment';
      updateReservation(passedBillingId, reservationId);
    } else {
      if (billingCount === 1) {
        multipleBillingId = null;
      } else if (billingCount > 1) {
        multipleBillingId = helperFunction.getMultipleBillingsId();
      }

      for (const payment of paymentDetails) {
        if (payment.paymentType === 'cash') {
          db.query(
            `insert into billings (billedFor, multipleBillingsId, billedForId, guestId, paymentDate, paymentType, 
              amount, hotelId) values (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              'reservation',
              multipleBillingId,
              reservationId,
              payingGuestId,
              currentDateTime,
              payment.paymentType,
              payment.amount,
              hotelId,
            ],
            // eslint-disable-next-line no-loop-func
            (err, res) => {
              if (err) throw err;
              billingId = res.insertId;

              insertIntoRegisterActivities(billingId);

              if (billingCount === 1) {
                updateReservation(billingId, reservationId);
              }
            }
          );
        } else if (payment.paymentType === 'Manager Credit') {
          db.query(
            `insert into billings (billedFor, multipleBillingsId, billedForId, guestId, paymentDate, 
              paymentType, amount, managerId, referenceNumber, hotelId) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              'reservation',
              multipleBillingId,
              reservationId,
              payingGuestId,
              currentDateTime,
              payment.paymentType,
              payment.amount,
              payment.managerName,
              payment.referenceNumber,
              hotelId,
            ],
            // eslint-disable-next-line no-loop-func
            (err, res) => {
              if (err) throw err;
              billingId = res.insertId;

              insertIntoRegisterActivities(billingId);

              if (billingCount === 1) {
                updateReservation(billingId, reservationId);
              }
            }
          );
        } else if (
          payment.paymentType === 'transfer' ||
          payment.paymentType === 'card'
        ) {
          const accountId = payment.bankName;
          db.query(
            `insert into billings (billedFor, billedForId, guestId, paymentDate, paymentType, accountId,
              transactionId, amount, multipleBillingsId, hotelId) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              'reservation',
              reservationId,
              payingGuestId,
              currentDateTime,
              payment.paymentType,
              accountId,
              payment.transactionId,
              payment.amount,
              multipleBillingId,
              hotelId,
            ],
            // eslint-disable-next-line no-loop-func
            (err, res) => {
              if (err) throw err;
              billingId = res.insertId;

              insertIntoRegisterActivities(billingId);

              if (billingCount === 1) {
                updateReservation(billingId, reservationId);
              }
            }
          );
        }
      }

      if (billingCount > 1) {
        passedBillingId = multipleBillingId;
        updateReservation(passedBillingId, reservationId);
      }
    }
  };

  const executeMakeReservation = () => {
    const totalPayment = paymentDetails.reduce((a, b) => a + b.amount, 0);
    db.query(
      `insert into reservations (payingGuestId, numOfRooms, adultsPerRoom, childrenPerRoom, roomTypeId,
        hotelId, totalPayment, reservationStartDateTime, reservationEndDateTime, statuss, createdBy) 
        values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payingGuestId,
        numOfRooms,
        adultsPerRoom,
        childrenPerRoom,
        roomTypeId,
        hotelId,
        totalPayment,
        reservationStartDateTime,
        reservationEndDateTime,
        'active',
        createdBy,
      ],
      (err, res) => {
        if (err) throw err;
        const reservationId = res.insertId;
        insertBilling(reservationId);
      }
    );
  };

  db.query(
    'select guestId from guests where phoneNumber=?',
    [payingGuest.phoneNumber],
    (err, res) => {
      if (err) throw err;
      if (res.length === 0) {
        db.query(
          `insert guests (guestTitle, firstName, lastName, otherName, address, phoneNumber, email, country, gender)
            values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            payingGuest.guestTitle,
            payingGuest.firstName,
            payingGuest.lastName,
            payingGuest.otherName,
            payingGuest.address,
            payingGuest.phoneNumber,
            payingGuest.email,
            payingGuest.country,
            payingGuest.gender,
          ],
          (err2, res2) => {
            if (err2) throw err2;
            payingGuestId = res2.insertId;
            executeMakeReservation();
          }
        );
      } else {
        payingGuestId = res[0].guestId;
        executeMakeReservation();
      }
    }
  );
};

// cancel reservation
exports.cancelReservation = (request, response) => {
  const {
    reservationId,
    currentDateTime,
    cancellationNote,
    cancelledBy,
  } = request.body;
  const dateTime = currentDateTime;

  db.query(
    'update reservations set statuss = ?, cancelledBy = ?, cancellationNote = ?, cancelledDateTime = ? where reservationId = ?',
    ['cancelled', cancelledBy, cancellationNote, dateTime, reservationId],
    (err, res) => {
      if (err) throw err;
      response.status(200).send({ message: 'Reservation cancelled' });
    }
  );
};

exports.reservationCheckIn = (request, response) => {
  const {
    reservationId,
    balanceInfo,
    payingGuestId,
    reservationEndDateTime,
    guestInfo,
    currentDateTime,
    chosenRoom,
    createdBy,
    registerId,
    newGuestBalance,
    hotelId,
  } = request.body;
  const numOfGuests = guestInfo.length;
  let stayingGuestId;
  const dateTime = currentDateTime;

  const updateRoom = () => {
    db.query(
      'update rooms set roomStatus = ?, currentOccupant = ? where roomId = ?',
      ['occupied', stayingGuestId, chosenRoom.roomId],
      (err, res) => {
        if (err) throw err;

        response.status(201).send({ message: 'Checkin successful!' });
      }
    );
  };

  const updateReservation = () => {
    // const newBalance = totalPayment - totalDebit;
    db.query(
      'update reservations set checkInDate = ?, totalPayment = ?, statuss = ? where reservationId = ?',
      [dateTime, newGuestBalance, 'checkedIn', reservationId],
      (err, res) => {
        if (err) throw err;

        updateRoom();
      }
    );
  };

  const updateCheckInOut = (billingId, checkInId) => {
    db.query(
      'update checkin_out set billingId = ? where checkInId = ?',
      [billingId, checkInId],
      (err6, res6) => {
        if (err6) throw err6;
        updateReservation();
      }
    );
  };

  const insertIntoRegisterActivities = (billingId) => {
    db.query(
      'insert into register_activities (registerId, billingId) values (?, ?)',
      [registerId, billingId],
      (err, res) => {
        if (err) throw err;
      }
    );
  };

  const insertBillings = (checkInId) => {
    const { paymentDetails } = request.body;

    let billingId;
    let multipleBillingId;
    let passedBillingId;

    const billingCount = paymentDetails.length;
    if (billingCount === 1) {
      multipleBillingId = null;
    } else if (billingCount > 1) {
      multipleBillingId = helperFunction.getMultipleBillingsId();
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const payment of paymentDetails) {
      if (payment.paymentType === 'cash') {
        db.query(
          `insert into billings (billedFor, billedForId, guestId, paymentDate, paymentType, amount, 
            multipleBillingsId, hotelId) values (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'reservation checkin',
            checkInId,
            payingGuestId,
            dateTime,
            payment.paymentType,
            payment.amount,
            multipleBillingId,
            hotelId,
          ],
          // eslint-disable-next-line no-loop-func
          (err5, res5) => {
            if (err5) throw err5;
            billingId = res5.insertId;

            insertIntoRegisterActivities(billingId);

            if (billingCount === 1) {
              updateCheckInOut(billingId, checkInId);
            }
          }
        );
      } else if (payment.paymentType === 'Manager Credit') {
        db.query(
          `insert into billings (billedFor, billedForId, guestId, paymentDate, paymentType, amount, 
            multipleBillingsId, managerId, referenceNumber, hotelId) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'reservation checkin',
            checkInId,
            payingGuestId,
            dateTime,
            payment.paymentType,
            payment.amount,
            multipleBillingId,
            payment.managerName,
            payment.referenceNumber,
            hotelId,
          ],
          // eslint-disable-next-line no-loop-func
          (err5, res5) => {
            if (err5) throw err5;
            billingId = res5.insertId;

            insertIntoRegisterActivities(billingId);

            if (billingCount === 1) {
              updateCheckInOut(billingId, checkInId);
            }
          }
        );
      } else if (
        payment.paymentType === 'transfer' ||
        payment.paymentType === 'card'
      ) {
        const accountId = payment.bankName;
        db.query(
          `insert into billings (billedFor, billedForId, guestId, paymentDate, paymentType,
              accountId, transactionId, amount, multipleBillingsId, hotelId) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'reservation checkin',
            checkInId,
            payingGuestId,
            currentDateTime,
            payment.paymentType,
            accountId,
            payment.transactionId,
            payment.amount,
            multipleBillingId,
            hotelId,
          ],
          // eslint-disable-next-line no-loop-func
          (err5, res5) => {
            if (err5) throw err5;
            billingId = res5.insertId;

            insertIntoRegisterActivities(billingId);

            if (billingCount === 1) {
              updateCheckInOut(billingId, checkInId);
            }
          }
        );
      }
    }

    if (billingCount > 1) {
      passedBillingId = multipleBillingId;
      updateCheckInOut(passedBillingId, checkInId);
    }
  };

  const insertMultipleStayingGuest = (checkInId) => {
    stayingGuestId = helperFunction.getMultipleGuestId();
    for (const guest of guestInfo) {
      db.query(
        'select * from guests where phoneNumber = ?',
        [guest.phoneNumber],
        (err, res) => {
          if (err) throw err;

          if (res.length === 1) {
            const guestId = res[0].guestId;
            const sql = `insert into multiple_staying_guest_table (checkInId, tempGuestId, guestType, guestId)
                values (?, ?, ?, ?)`;
            db.query(
              sql,
              [checkInId, stayingGuestId, 2, guestId],
              (err2, res2) => {
                if (err2) throw err2;
              }
            );
          }
        }
      );
    }
    if (balanceInfo === 'payment') {
      insertBillings(checkInId);
    } else {
      updateReservation();
    }
  };

  const executeCheckIn = () => {
    db.query(
      `insert into checkin_out(guestId, roomId, checkInDate, checkOutDate, numOfGuests, statuss, 
        reservationId, createdBy) values(?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        stayingGuestId,
        chosenRoom.roomId,
        dateTime,
        reservationEndDateTime,
        numOfGuests,
        'active',
        reservationId,
        createdBy,
      ],
      (err4, res4) => {
        if (err4) throw err4;
        const checkInId = res4.insertId;

        if (numOfGuests === 1) {
          if (balanceInfo === 'payment') {
            insertBillings(checkInId);
          } else {
            updateReservation();
          }
        } else if (numOfGuests > 1) {
          insertMultipleStayingGuest(checkInId);
        }
      }
    );
  };

  if (numOfGuests === 1) {
    db.query(
      'select guestId from guests where phoneNumber = ?',
      [guestInfo[0].phoneNumber],
      // eslint-disable-next-line consistent-return
      (err1, res1) => {
        if (err1) throw err1;

        if (res1.length === 0) {
          db.query(
            `insert into guests (guestTitle, firstName, lastName, otherName, address, phoneNumber, email,
              country, gender) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              guestInfo[0].guestTitle,
              guestInfo[0].firstName,
              guestInfo[0].lastName,
              guestInfo[0].otherName,
              guestInfo[0].address,
              guestInfo[0].phoneNumber,
              guestInfo[0].email,
              guestInfo[0].country,
              guestInfo[0].gender,
            ],
            (err2, res2) => {
              if (err2) throw err2;
              stayingGuestId = res2.insertId;
              executeCheckIn(payingGuestId);
            }
          );
        } else {
          stayingGuestId = res1[0].guestId;
          executeCheckIn(payingGuestId);
        }
      }
    );
  } else if (numOfGuests > 1) {
    stayingGuestId = helperFunction.getMultipleGuestId();
    let count = 0;
    for (const i in guestInfo) {
      db.query(
        'select guestId from guests where phoneNumber = ?',
        [guestInfo[i].phoneNumber],
        (err1, res1) => {
          if (err1) throw err1;

          if (res1.length === 0) {
            db.query(
              `insert into guests (guestTitle, firstName, lastName, otherName, address, phoneNumber, email,
                country, gender) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                guestInfo[i].guestTitle,
                guestInfo[i].firstName,
                guestInfo[i].lastName,
                guestInfo[i].otherName,
                guestInfo[i].address,
                guestInfo[i].phoneNumber,
                guestInfo[i].email,
                guestInfo[i].country,
                guestInfo[i].gender,
              ],
              (err2, res2) => {
                if (err2) throw err2;
              }
            );
          }
        }
      );
      count += 1;
    }
    if (count === numOfGuests) {
      executeCheckIn();
    }
  }
};

exports.guestEmailsList = (request, response) => {
  db.query('select email from guests', (err, res) => {
    if (err) throw err;

    const emailsList = res.map((obj) => obj.email);
    response.status(200).send({ emailsList });
  });
};

// original guest name lists
exports.guestNamesList = (request, response) => {
  const { name } = request.query;

  if (name) {
    const formattedName = `%${name}%`;
    const sql = `SELECT guestId, CONCAT(guestTitle, ' ', lastName, ' ', firstName) AS guestName, c.checkInId
        FROM guests a INNER JOIN rooms b ON a.guestId = b.currentOccupant
        INNER JOIN checkin_out c ON b.roomId = c.roomId
        WHERE b.roomStatus = 'occupied' AND (firstName LIKE ? OR lastName LIKE ?)`;

    db.query(sql, [formattedName, formattedName], (err, res) => {
      if (err) throw err;

      response.status(200).send(res);
    });
  } else {
    const sql = `SELECT guestId, CONCAT(guestTitle, ' ', lastName, ' ', firstName) AS guestName 
        FROM guests`;
    db.query(sql, (err, res) => {
      if (err) throw err;

      response.status(200).send(res);
    });
  }
};

exports.guestPhoneNumbersList = (request, response) => {
  const { phoneNumber } = request.query;
  const formattedNumber = `%${phoneNumber}%`;
  db.query(
    `SELECT CONCAT(guestTitle, ' ', lastName, ' ', firstName) AS guestName, phoneNumber 
      FROM guests WHERE phoneNumber LIKE ? LIMIT 10`,
    [formattedNumber],
    (err, res) => {
      if (err) throw err;
      response.status(200).send(res);
    }
  );
};

// Extend Guest stay
exports.extendStay = (request, response) => {
  const {
    checkInId,
    guestId,
    createdBy,
    extendOption,
    extendLength,
    rate,
    cost,
    newFreeDate,
    extensionDateTime,
  } = request.body;

  const extendsStay = () => {
    if (extendOption === 'day') {
      db.query(
        `update checkin_out set checkOutDate = ?, extended = ?
        where checkInId = ?`,
        [newFreeDate, 'true', checkInId],
        (err, res) => {
          if (err) throw err;
          response
            .status(200)
            .send({ message: 'Checkout date successfully extended' });
        }
      );
    } else if (extendOption === 'hour') {
      const extendHourParse = `${extendLength}:0:0`;
      db.query(
        `UPDATE checkin_out SET checkInDate = ADDTIME(checkInDate, ?), extended = ?
        WHERE checkInId = ?`,
        [extendHourParse, 'true', checkInId],
        (err, res) => {
          if (err) throw err;
          response
            .status(200)
            .send({ message: 'Checkout date successfully extended' });
        }
      );
    }
  };

  // insert in to extens stay tb
  db.query(
    `insert into extend_stay(
      checkInId, guestId, createdBy, extensionDateTime, extensionOption, extensionLength, rate, cost)
      values (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      checkInId,
      guestId,
      createdBy,
      extensionDateTime,
      extendOption,
      extendLength,
      rate,
      cost,
    ],
    (err, res) => {
      if (err) throw err;
      extendsStay();
    }
  );
};

exports.checkOutBalanceBills = (request, response) => {
  const { checkInId, roomId } = request.params;
  let guestBillsDeposits;
  const bills = [];

  const getExtendStayBills = () => {
    db.query(
      `SELECT extensionLength, rate, cost FROM extend_stay WHERE 
      checkInId = ? AND extensionOption = ?`,
      [checkInId, 'hour'],
      (err, res) => {
        if (err) throw err;
        guestBillsDeposits.extendStay = res;
        response.status(200).send(guestBillsDeposits);
      }
    );
  };

  const getChangedRoomBills = () => {
    db.query(
      `SELECT a.oldRoomStayDays, b.adjustedPrice AS amount, b.roomNumber,
      (a.oldRoomStayDays * b.adjustedPrice) AS calculatedAmount
      FROM changed_rooms a INNER JOIN rooms b ON a.oldRoomId = b.roomId
      INNER JOIN checkin_out c ON a.checkInId = c.checkInId WHERE a.checkInId = ?`,
      [checkInId],
      (err, res) => {
        if (err) throw err;
        guestBillsDeposits.otherRoomsStay = res;
        getExtendStayBills();
      }
    );
  };

  const getHouseKeepingBills = () => {
    db.query(
      `SELECT houseKeepingId, amount FROM housekeeping WHERE checkInId = ? AND
      statuss = ? AND paymentStatus=?`,
      [checkInId, 'completed', 'unpaid'],
      (err, res) => {
        if (err) throw err;
        const houseKeepingBills = res.map((e) => {
          e.service = 'Housekeeping';
          return e;
        });
        bills.push(...houseKeepingBills);
        guestBillsDeposits.debits = bills;
        getChangedRoomBills();
      }
    );
  };

  const getLaundryBills = () => {
    db.query(
      'SELECT laundryId, amount FROM laundry_services WHERE checkInId=? AND statuss = ? AND paymentStatus=?',
      [checkInId, 'completed', 'unpaid'],
      (err, res) => {
        if (err) throw err;
        const laundryBills = res.map((e) => {
          e.service = 'Laundry';
          return e;
        });
        bills.push(...laundryBills);
        getHouseKeepingBills();
      }
    );
  };

  const getRoomServiceBills = () => {
    db.query(
      'SELECT roomServiceId, amount FROM room_services WHERE checkInId=? AND statuss=? and paymentStatus=?',
      [checkInId, 'completed', 'unpaid'],
      (err, res) => {
        if (err) throw err;
        const roomServiceBills = res.map((e) => {
          e.service = 'Room Service';
          return e;
        });
        bills.push(...roomServiceBills);
        getLaundryBills();
      }
    );
  };

  const getDeposits = () => {
    if (guestBillsDeposits !== undefined) {
      if (guestBillsDeposits.reservationId) {
        db.query(
          `SELECT billingId, paymentType, billedFor, amount FROM billings
          WHERE billedFor = 'reservation' AND billedForId = ? UNION
          SELECT billingId, paymentType, billedFor, amount FROM billings
          WHERE billedFor = 'reservation-checkin' AND billedForId = ? UNION
          SELECT billingId, paymentType, billedFor, amount FROM billings
          WHERE billedFor = 'extra payment' AND billedForId = ?`,
          [guestBillsDeposits.reservationId, checkInId, checkInId],
          (err, res) => {
            if (err) throw err;
            guestBillsDeposits.deposits = res;
            getRoomServiceBills();
          }
        );
      } else {
        db.query(
          `SELECT billingId, paymentType, billedFor, amount FROM billings
              WHERE billedFor = 'checkin' AND billedForId = ? UNION
              SELECT billingId, paymentType, billedFor, amount FROM billings
              WHERE billedFor = 'extra payment' AND billedForId = ?`,
          [checkInId, checkInId],
          (err, res) => {
            if (err) throw err;
            guestBillsDeposits.deposits = res;
            getRoomServiceBills();
          }
        );
      }
    } else {
      response.status(200).send({ message: 'No record found' });
    }
  };

  const sql = `SELECT a.checkInId, a.guestId, a.checkInDate, a.billingId, b.phoneNumber, c.adjustedPrice AS cost,
      CONCAT(b.guestTitle, ' ', b.lastName, ' ', b.firstName) AS guestName, b.email, reservationId
      FROM checkin_out a LEFT JOIN guests b ON a.guestId = b.guestId
      LEFT JOIN rooms c ON a.roomId = c.roomId WHERE a.checkInId = ? AND c.roomId = ?`;

  db.query(sql, [checkInId, roomId], (err, res) => {
    if (err) throw err;
    guestBillsDeposits = res[0];
    if (
      guestBillsDeposits.guestName === null &&
      guestBillsDeposits.email === null &&
      guestBillsDeposits.reservationId === null
    ) {
      db.query(
        `SELECT b.guestId, CONCAT(guestTitle, ' ', lastName, ' ', firstName) AS guestName,
          email, phoneNumber FROM multiple_staying_guest_table a
          INNER JOIN guests b ON a.guestId = b.guestId
          WHERE checkinId = ? AND (guestType = 3 OR guestType = 1) LIMIT 1`,
        [checkInId],
        (err2, res2) => {
          if (err2) throw err2;
          guestBillsDeposits.guestName = res2[0].guestName;
          guestBillsDeposits.email = res2[0].email;
          guestBillsDeposits.phoneNumber = res2[0].phoneNumber;
          guestBillsDeposits.payingGuestId = res2[0].guestId;
          getDeposits();
        }
      );
    } else if (
      guestBillsDeposits.guestName === null &&
      guestBillsDeposits.email === null &&
      guestBillsDeposits.reservationId !== null
    ) {
      db.query(
        `SELECT guestId, CONCAT(guestTitle, ' ', lastName, ' ', firstName) AS guestName,
          email, phoneNumber  FROM reservations a
          INNER JOIN guests b ON a.payingGuestId = b.guestId
          WHERE reservationId = ? LIMIT 1`,
        [guestBillsDeposits.reservationId],
        (err2, res2) => {
          if (err2) throw err2;
          guestBillsDeposits.guestName = res2[0].guestName;
          guestBillsDeposits.email = res2[0].email;
          guestBillsDeposits.phoneNumber = res2[0].phoneNumber;
          guestBillsDeposits.payingGuestId = res2[0].guestId;
          getDeposits();
        }
      );
    } else {
      guestBillsDeposits.payingGuestId = res[0].guestId;
      getDeposits();
    }
  });
};

exports.checkInDetails = (request, response) => {
  const { checkInId } = request.params;
  const sql = `SELECT a.checkInId, a.guestId, a.checkInDate, a.billingId, b.phoneNumber, c.adjustedPrice AS cost,
    CONCAT(b.guestTitle, ' ', b.lastName, ' ', b.firstName) AS guestName, b.email, reservationId,
    c.roomId, c.roomNumber FROM checkin_out a LEFT JOIN guests b ON a.guestId = b.guestId
    LEFT JOIN rooms c ON a.roomId = c.roomId WHERE a.checkInId = ?`;
  db.query(sql, [checkInId], (err, res) => {
    if (err) throw err;
    response.status(200).send(res[0]);
  });
};

exports.insertExtraPayment = (request, response) => {
  const {
    checkInId,
    guestId,
    currentDateTime,
    paymentDetails,
    registerId,
    hotelId,
  } = request.body;

  const billingCount = paymentDetails.length;
  const insertIntoRegisterActivities = (billingId) => {
    db.query(
      'insert into register_activities (registerId, billingId) values (?, ?)',
      [registerId, billingId],
      (err, res) => {
        if (err) throw err;
      }
    );
  };

  let count = 0;
  for (const payment of paymentDetails) {
    if (payment.paymentType === 'cash') {
      db.query(
        `insert into billings (billedFor, billedForId, guestId,
          paymentDate, paymentType, amount, hotelId) values (?, ?, ?, ?, ?, ?, ?)`,
        [
          'extra payment',
          checkInId,
          guestId,
          currentDateTime,
          payment.paymentType,
          payment.amount,
          hotelId,
        ],
        // eslint-disable-next-line no-loop-func
        (err, res) => {
          if (err) throw err;
          const billingId = res.insertId;
          insertIntoRegisterActivities(billingId);

          count += 1;

          if (count === billingCount) {
            response.status(200).send({ message: 'Billing has been inserted' });
          }
        }
      );
    } else if (payment.paymentType === 'Manager Credit') {
      db.query(
        `insert into billings (billedFor, billedForId, guestId, paymentDate, paymentType, 
          amount, managerId, referenceNumber, hotelId) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'extra payment',
          checkInId,
          guestId,
          currentDateTime,
          payment.paymentType,
          payment.amount,
          payment.managerName,
          payment.referenceNumber,
          hotelId,
        ],
        // eslint-disable-next-line no-loop-func
        (err, res) => {
          if (err) throw err;
          const billingId = res.insertId;
          insertIntoRegisterActivities(billingId);

          count += 1;

          if (count === billingCount) {
            response.status(200).send({ message: 'Billing has been inserted' });
          }
        }
      );
    } else if (
      payment.paymentType === 'transfer' ||
      payment.paymentType === 'card'
    ) {
      const accountId = payment.bankName;
      db.query(
        `insert into billings (billedFor, billedForId, guestId, paymentDate, paymentType,
          accountId, transactionId, amount, hotelId) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'extra payment',
          checkInId,
          guestId,
          currentDateTime,
          payment.paymentType,
          accountId,
          payment.transactionId,
          payment.amount,
          hotelId,
        ],
        // eslint-disable-next-line no-loop-func
        (err, res) => {
          if (err) throw err;
          const billingId = res.insertId;
          insertIntoRegisterActivities(billingId);

          count += 1;

          if (count === billingCount) {
            response.status(200).send({ message: 'Billing has been inserted' });
          }
        }
      );
    }
  }
};

// update reservation date
exports.editReservation = (request, response) => {
  const { startDate, endDate, reservationId } = request.body;

  if (startDate !== undefined && endDate !== undefined) {
    db.query(
      `update reservations set reservationStartDateTime = ?, reservationEndDateTime = ?
      where reservationId = ?`,
      [startDate, endDate, reservationId],
      (err, res) => {
        if (err) throw err;
        response
          .status(200)
          .send({ message: ' Reservation updated successfuly ' });
      }
    );
  } else if (startDate !== undefined) {
    db.query(
      `update reservations set reservationStartDateTime = ?
      where reservationId = ?`,
      [startDate, reservationId],
      (err, res) => {
        if (err) throw err;
        response
          .status(200)
          .send({ message: ' Reservation updated successfuly ' });
      }
    );
  } else if (endDate !== undefined) {
    db.query(
      `update reservations set reservationEndDateTime = ?
      where reservationId = ?`,
      [endDate, reservationId],
      (err, res) => {
        if (err) throw err;
        response
          .status(200)
          .send({ message: ' Reservation updated successfuly ' });
      }
    );
  }
};

exports.guestEmailList = (request, response) => {
  db.query('select email from guests', (err, res) => {
    if (err) throw err;

    const emailsList = res.map((obj) => obj.email);
    response.status(200).send({ emailsList });
  });
};

// change rooms
exports.changeRoom = (request, response) => {
  const {
    oldRoomId,
    newRoomId,
    changedDateTime,
    reason,
    createdBy,
    oldRoomStayDays,
    checkInId,
  } = request.body;

  let guestId;

  // update checkin guestId in checkin_out table
  const updateCheckInGuest = () => {
    db.query(
      'update checkin_out set roomId = ?, changed_room = ? where guestId = ? and roomId = ?',
      [newRoomId, 'true', guestId, oldRoomId],
      (err, res) => {
        if (err) throw err;
        response.status(200).send({ message: 'Room Changed Successfully' });
      }
    );
  };

  const updateOldRoom = () => {
    db.query(
      'update rooms set roomStatus = ?, currentOccupant = ?  where roomId = ?',
      ['available', 0, oldRoomId],
      (err, res) => {
        if (err) throw err;
        updateCheckInGuest();
      }
    );
  };

  const updateGuestRooms = () => {
    db.query(
      'update rooms set currentOccupant = ?, roomStatus=? where roomId = ?',
      [guestId, 'occupied', newRoomId],
      (err, res) => {
        if (err) throw err;
        updateOldRoom();
      }
    );
  };

  const insertIntoChangedRoom = () => {
    db.query(
      `insert into changed_rooms (checkInId, oldRoomId, newRoomId, oldRoomStayDays, guestId, createdBy,
      changedDateTime, reason) values(?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        checkInId,
        oldRoomId,
        newRoomId,
        oldRoomStayDays,
        guestId,
        createdBy,
        changedDateTime,
        reason,
      ],
      (err, res) => {
        if (err) throw err;
        updateGuestRooms();
      }
    );
  };

  db.query(
    'select currentOccupant from rooms where roomId = ?',
    [oldRoomId],
    (err, res) => {
      if (err) throw err;
      guestId = res[0].currentOccupant;
      insertIntoChangedRoom();
    }
  );
};

// drop off key
exports.dropOffKey = (request, response) => {
  const { roomId, dropOffDateTime, dropOffNote, createdBy } = request.body;

  const updateRoom = (currentDropOffKeyId) => {
    db.query(
      'update rooms set dropOffKey = ?, currentDropOffKeyId = ? where roomId = ?',
      ['true', currentDropOffKeyId, roomId],
      (err, res) => {
        if (err) throw err;
        response.status(200).send({ message: 'Key Droped Successfully' });
      }
    );
  };

  db.query(
    `insert into dropoff_key (roomId, dropOffDateTime, dropOffNote, createdBy)
    values(?, ?, ?, ?)`,
    [roomId, dropOffDateTime, dropOffNote, createdBy],

    (err, res) => {
      if (err) throw err;
      updateRoom(res.insertId);
    }
  );
};

// pick up key
exports.pickUpKey = (request, response) => {
  const { roomId, pickupKeyDateTime, pickedUpBy } = request.body;

  const updateRoom = () => {
    db.query(
      'update rooms set dropOffKey = ?, currentDropOffKeyId = ? where roomId = ?',
      ['false', 0, roomId],
      (err, res) => {
        if (err) throw err;
        response.status(200).send({ message: 'Key is Pick Up Successfully' });
      }
    );
  };

  const insertDropOffKey = (dropOffKeyId) => {
    db.query(
      'update dropoff_key set pickupKeyDateTime =?, pickedUpBy =? where dropOffKeyId = ?',
      [pickupKeyDateTime, pickedUpBy, dropOffKeyId],
      (err, res) => {
        if (err) throw err;
        updateRoom();
      }
    );
  };

  db.query(
    'SELECT currentDropOffKeyId FROM rooms WHERE roomId = ?',
    [roomId],
    (err, res) => {
      if (err) throw err;
      insertDropOffKey(res[0].currentDropOffKeyId);
    }
  );
};

// lost of key
exports.lostKey = (request, response) => {
  const { roomId, createdBy, lostKeyDateTime, lostKeyNote } = request.body;

  const updateRoom = (currentlostKeyId) => {
    db.query(
      'update rooms set lostKey = ?, currentlostKeyId = ? where roomId = ?',
      ['true', currentlostKeyId, roomId],
      (err, res) => {
        if (err) throw err;
        response.status(200).send({ message: 'Key lost excuted' });
      }
    );
  };

  db.query(
    `insert into lost_key (roomId, createdBy, lostKeyDateTime, lostKeyNote)
    values(?, ?, ?, ?)`,
    [roomId, createdBy, lostKeyDateTime, lostKeyNote],
    (err, res) => {
      if (err) throw err;
      updateRoom(res.insertId);
    }
  );
};

// clean room
exports.cleanRoom = (request, response) => {
  const { roomId, createdBy, createdDateTime, statuss } = request.body;

  const updateRoom = (cleanRoomId) => {
    db.query(
      'update rooms set cleanRoom = ?, cleanRoomId = ? where roomId = ?',
      ['true', cleanRoomId, roomId],
      (err, res) => {
        if (err) throw err;
        response.status(200).send({ message: 'room is clean' });
      }
    );
  };

  db.query(
    `insert into clean_room (roomId, createdBy, createdDateTime, statuss)
    values(?, ?, ?, ?)`,
    [roomId, createdBy, createdDateTime, statuss],

    (err, res) => {
      if (err) throw err;
      updateRoom(res.insertId);
    }
  );
};

// change key
exports.changekey = (request, response) => {
  const { roomId, changedBy, changeKeyDateTime } = request.body;

  const updateRoom = () => {
    db.query(
      'update rooms set lostKey = ?, currentLostKeyId = ? where roomId = ?',
      ['false', 0, roomId],
      (err, res) => {
        if (err) throw err;
        response.status(200).send({ message: 'key changed' });
      }
    );
  };

  const insertIntoLostKey = (lostKeyId) => {
    db.query(
      'update lost_key set changedBy = ?,  changeKeyDateTime= ? where lostKeyId = ?',
      [changedBy, changeKeyDateTime, lostKeyId],
      (err, res) => {
        if (err) throw err;
        updateRoom();
      }
    );
  };
  db.query(
    'select currentLostKeyId from rooms where roomId = ?',
    [roomId],
    (err, res) => {
      if (err) throw err;
      insertIntoLostKey(res[0].currentLostKeyId);
    }
  );
};
