const express = require('express');
const packageJson = require('./package.json');

const port = process.env.PORT || 8080;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const router = express.Router();

router.get('/healthcheck', (req, res) => {
  res.status(200).send();
});

router.get('/version', (req, res) => {
  res.status(200).send({ version: packageJson.version });
});

app.use('/', router);

app.listen(port);
console.log(`Listening on port ${port}`);
