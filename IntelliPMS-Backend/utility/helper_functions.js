/* eslint-disable no-plusplus */
const db = require('../db/index');

exports.generateEmployeeId = () => {
  const alphabets = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ];
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  let part1 = '';
  let part2 = '';
  let employeeId = '';

  for (let i = 0; i < 3; i++) {
    part1 += alphabets[Math.floor(Math.random() * alphabets.length)];
  }

  for (let i = 0; i < 5; i++) {
    part2 += numbers[Math.floor(Math.random() * numbers.length)];
  }
  employeeId = part1 + part2;
  return employeeId;
};

exports.getMultipleBillingsId = () => {
  let multipleBillingId = '';
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  for (let i = 0; i < 8; i++) {
    multipleBillingId += numbers[Math.floor(Math.random() * numbers.length)];
  }
  return multipleBillingId;
};

exports.generateCheckOutId = () => {
  let checkOutId = 'CO';
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  for (let i = 0; i < 8; i++) {
    checkOutId += numbers[Math.floor(Math.random() * numbers.length)];
  }
  return checkOutId;
};

exports.getMultipleGuestId = () => {
  let multipleGuestId = 'MCG';
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  for (let i = 0; i < 6; i++) {
    multipleGuestId += numbers[Math.floor(Math.random() * numbers.length)];
  }
  return multipleGuestId;
};
