const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const db = require('../db/index');
const helperFunction = require('../utility/helper_functions');

const secret = 'intellPMSSecRet373838';

exports.getAllEmployees = (request, response) => {
  db.query('select * from employees', (err, res) => {
    response.status(200).send(res);
  });
};

exports.login = (request, response) => {
  const { email, reqPassword } = request.body;

  db.query(
    `SELECT a.employeeId, numOfHotels, hotelId, employeeRole, password, statuss FROM employees a
    INNER JOIN employees_hotels b ON a.employeeId = b.employeeId
    WHERE emailAddress = ?`,
    [email],
    (err, res) => {
      if (err) throw err;
      if (res.length >= 1) {
        // eslint-disable-next-line no-shadow
        const {
          employeeId,
          password,
          employeeRole,
          numOfHotels,
          hotelId,
          statuss,
        } = res[0];
        if (statuss === 'disabled') {
          response
            .status(401)
            .send({ message: 'Login Access has been revoked' });
        } else {
          bcrypt.compare(reqPassword, password, (err2, res2) => {
            if (res2) {
              const payload = { subject: employeeId };
              const token = jwt.sign(payload, secret);
              const employee = {
                employeeId,
                token,
                employeeRole,
                numOfHotels,
                hotelId,
              };
              response.status(200).send(employee);
            } else {
              response.status(401).send({ message: 'User does not exist!' });
            }
          });
        }
      } else {
        response.status(401).json({ message: 'User does not exist' });
      }
    }
  );
};

exports.addEmployee = (request, response) => {
  const {
    employeeRole,
    firstName,
    lastName,
    otherName,
    emailAddress,
    employeeHotels,
    phoneNumber,
    address,
    password,
    createdBy,
    operateRegister,
    gender,
  } = request.body;

  let imagePath = null;
  if (request.file !== undefined) {
    const url = `${request.protocol}://${request.get('host')}`;
    imagePath = `${url}/images/employees/${request.file.filename}`;
  }
  const employeeId = helperFunction.generateEmployeeId();
  const hotels = JSON.parse(employeeHotels);
  const numOfHotels = hotels.length;

  const mapEmployeeHotel = () => {
    for (const i in hotels) {
      db.query(
        'insert into employees_hotels (hotelId, employeeId) values (?, ?)',
        [hotels[i].hotel, employeeId],
        (err, res) => {
          if (err) throw err;

          if (+i === numOfHotels - 1) {
            response
              .status(200)
              .send({ message: 'Employee Created successfully' });
          }
        }
      );
    }
  };

  if (password) {
    bcrypt.hash(password, 10, (error, hash) => {
      if (hash) {
        db.query(
          `insert into employees
          (employeeId, employeeRole, firstName, lastName, otherName, emailAddress, password, phoneNumber, address,
            picture, numOfHotels, createdBy, operateRegister, gender, statuss) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            employeeId,
            employeeRole,
            firstName,
            lastName,
            otherName,
            emailAddress,
            hash,
            phoneNumber,
            address,
            imagePath,
            numOfHotels,
            createdBy,
            operateRegister,
            gender,
            'enabled',
          ],
          (err, res) => {
            if (err) throw err;
            mapEmployeeHotel();
          }
        );
      }
    });
  } else {
    db.query(
      `insert into employees
      (employeeId, employeeRole, firstName, lastName, otherName, emailAddress, phoneNumber, address,
        picture, numOfHotels, createdBy, operateRegister, gender) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        employeeRole,
        firstName,
        lastName,
        otherName,
        emailAddress,
        phoneNumber,
        address,
        imagePath,
        numOfHotels,
        createdBy,
        operateRegister,
        gender,
      ],
      (err, res) => {
        if (err) throw err;
        mapEmployeeHotel();
      }
    );
  }
};

exports.updateLoginAccess = (request, response) => {
  const { status } = request.body;
  const { employeeId } = request.params;

  db.query(
    'update employees set statuss = ? where employeeId = ?',
    [status, employeeId],
    (err, res) => {
      if (err) throw err;
      response.status(200).send({ message: 'Access updated' });
    }
  );
};

// update employee
exports.updateEmployee = (request, response) => {
  const {
    employeeRole,
    firstName,
    lastName,
    otherName,
    emailAddress,
    password,
    phoneNumber,
    address,
    pictures,
  } = request.body;
  const { employeeId } = request.params;

  db.query(
    `update employees set  employeeRole=?, firstName=?, lastName=?, otherName=?, emailAddress=?, password=?, phoneNumber=?, address=?, pictures= ? 
     where employeeId= ?`,
    [
      employeeRole,
      firstName,
      lastName,
      otherName,
      emailAddress,
      password,
      phoneNumber,
      address,
      pictures,
      employeeId,
    ],
    (err, res) => {
      if (err) throw err;
      response.status(200).send({ message: 'Employee is Update' });
    }
  );
};

// delete Employee
exports.deleteEmployee = (request, response) => {
  const { employeeId } = request.params;

  db.query(
    'delete from employees where employeeId= ?',
    [employeeId],
    (err, res) => {
      if (err) throw err;
      response.status(200).send({ message: 'Successfuly Delete Employee' });
    }
  );
};

// get employee details
exports.getEmployeeDetails = (request, response) => {
  const { employeeId } = request.params;
  db.query(
    `SELECT employeeId, employeeRole, CONCAT(lastName, ' ', firstName) AS employeeName,
    emailAddress, phoneNumber, address, picture, operateRegister
    FROM employees WHERE employeeId = ?`,
    [employeeId],
    (err, res) => {
      if (err) throw err;
      response.status(200).send(res[0]);
    }
  );
};

exports.openCashRegister = (request, response) => {
  const { employeeId, dateTimeOpened, cashOnHand, hotelId } = request.body;
  db.query(
    `INSERT INTO register (employeeId, dateTimeOpened, cashOnHand, statuss, hotelId) VALUES
    (?, ?, ?, ?, ?)`,
    [employeeId, dateTimeOpened, cashOnHand, 'active', hotelId],
    (err, res) => {
      if (err) throw err;
      response.status(200).send({ message: 'Register successfully opened' });
    }
  );
};

exports.getOpenedCashRegister = (request, response) => {
  const { employeeId } = request.params;
  let cashRegister;

  const getRegisterActivities = (registerId) => {
    db.query(
      `SELECT activityId, a.billingId, billedFor, paymentDate, paymentType, amount  
        FROM register_activities a
        INNER JOIN billings b ON a.billingId = b.billingId
        WHERE registerId = ?`,
      [registerId],
      (err, res) => {
        if (err) throw err;

        cashRegister.registerDetails = res;
        response.status(200).send(cashRegister);
      }
    );
  };

  db.query(
    'SELECT * FROM register WHERE employeeId = ? AND statuss = ?',
    [employeeId, 'active'],
    (err, res) => {
      if (err) throw err;
      // eslint-disable-next-line prefer-destructuring
      cashRegister = res[0];
      getRegisterActivities(cashRegister.registerId);
    }
  );
};

exports.cashRegisterSummary = (request, response) => {
  const { registerId } = request.params;
  let register1;

  const getOpeningCash = () => {
    db.query(
      `SELECT cashOnHand AS totalAmount, 'cashOnHand' AS paymentType 
       FROM register WHERE registerId = ?`,
      [registerId],
      (err, res) => {
        if (err) throw err;
        const registerSummary = [...res, ...register1];
        response.status(200).send(registerSummary);
      }
    );
  };

  db.query(
    `SELECT paymentType, SUM(amount) AS totalAmount, COUNT(paymentType) AS num
      FROM register_activities a INNER JOIN billings b ON a.billingId = b.billingId
      WHERE registerId = ? GROUP BY paymentType`,
    [registerId],
    (err, res) => {
      if (err) throw err;
      register1 = res;
      getOpeningCash();
    }
  );
};

exports.closeCashRegister = (request, response) => {
  const {
    registerId,
    employeeId,
    closingSummary,
    totalAmountOnClose,
    dateTimeClosed,
  } = request.body;

  const updateLoginDetails = () => {
    db.query(
      'update login_activities set registerId = ? where employeeId = ? and loginStatus = ?',
      [registerId, employeeId, 'loggedIn'],
      (err, res) => {
        if (err) throw err;
        response.status(200).send({ message: 'Register closed successfully' });
      }
    );
  };

  db.query(
    `UPDATE register SET dateTimeClosed = ?, totalAmountOnClose = ?, statuss = ?,
    closingSummary = ? where registerId = ?`,
    [dateTimeClosed, totalAmountOnClose, 'closed', closingSummary, registerId],
    (err, res) => {
      if (err) throw err;
      updateLoginDetails();
    }
  );
};

// insert login details
exports.insertLoginDetails = (request, response) => {
  const { employeeId, loginDateTime } = request.body;

  db.query(
    `insert into login_activities(employeeId, loginDateTime, loginStatus)
    value(?, ?, ?)`,
    [employeeId, loginDateTime, 'loggedIn'],
    (err, res) => {
      if (err) throw err;
      response.status(200).send({ message: 'login track success' });
    }
  );
};

// insert logout details
exports.insertLogoutDetails = (request, response) => {
  const { employeeId, logoutDateTime } = request.body;
  db.query(
    'update login_activities set logoutDateTime = ?, loginStatus = ? where employeeId = ?',
    [logoutDateTime, 'loggedOut', employeeId],
    (err, res) => {
      if (err) throw err;
      response.status(200).send({ message: 'login out successful' });
    }
  );
};

// recover  password
exports.resetPassword = (request, response) => {
  const { employeeId, newPassword } = request.body;
  bcrypt.hash(newPassword, 10, (error, hash) => {
    db.query(
      'update employees set password = ? where employeeId = ?',
      [hash, employeeId],
      (err, res) => {
        if (err) throw err;
        response.status(200).send({ message: 'Password Reset' });
      }
    );
  });
};
