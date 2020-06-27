const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join(__dirname, '/images')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, x-access-token'
  );
  res.header('Access-Control-Expose-Headers', 'x-access-token');
  next();
});

app.use('/api/v1/employees', require('./routes/employees'));
app.use('/api/v1/guests', require('./routes/guests'));
app.use('/api/v1/hotels', require('./routes/hotels'));
app.use('/api/v1/customer-service', require('./routes/customer-service'));
app.use('/api/v1/reports', require('./routes/reports'));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
