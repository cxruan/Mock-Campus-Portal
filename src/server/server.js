const express = require('express');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes/api');
const jwtStrategry = require('./setup/jwtStrategy');

const app = express();
const port = process.env.PORT || 3999;

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);

app.use(express.static('public'));

app.use(express.json());

app.use(cookieParser());

passport.use(jwtStrategry);

app.use(passport.initialize());

routes(app);

app.listen(port, () => console.log(`app listening on port ${port}!`));
