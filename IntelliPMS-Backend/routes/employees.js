const { Router } = require('express');

const db = require('../db/index');
const employeeController = require('../controllers/employees');
const handleEmployeePix = require('../middlewares/employee_pix_handler');
const auth = require('../middlewares/auth');

const router = Router();

db.connect((err) => {
  if (err) throw err;

  console.log('MySQL is connected...');
});

router.get('/', auth, employeeController.getAllEmployees);

// login
router.post('/login', employeeController.login);

// add employee
router.post(
  '/addEmployee',
  auth,
  handleEmployeePix,
  employeeController.addEmployee
);

router.put(
  '/:employeeId/updateLoginAccess',
  auth,
  employeeController.updateLoginAccess
);

// update user
router.put(
  '/:employeeId/updateEmployee',
  auth,
  employeeController.updateEmployee
);

// delete user
router.delete(
  '/:employeeId/deleteEmployee',
  auth,
  employeeController.deleteEmployee
);

// get particular user details
router.get('/:employeeId', auth, employeeController.getEmployeeDetails);

router.post('/openCashRegister', auth, employeeController.openCashRegister);

router.get(
  '/:employeeId/getOpenedRegister',
  auth,
  employeeController.getOpenedCashRegister
);

router.get(
  '/:registerId/cashRegisterSummary',
  auth,
  employeeController.cashRegisterSummary
);

router.put('/closeCashRegister', auth, employeeController.closeCashRegister);

// insert login details
router.post('/insertLogin', auth, employeeController.insertLoginDetails);

// insert logout details
router.put('/insertLogout', auth, employeeController.insertLogoutDetails);

// reset password
router.put('/resetPassword', auth, employeeController.resetPassword);

module.exports = router;
