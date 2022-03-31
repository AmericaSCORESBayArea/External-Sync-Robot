const express = require('express');
const app = express();
const path = require('path');
const bp = require('body-parser');
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, '/public')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, err => {
  if (err) console.error(err);
  console.log("%c Sync Robot React UI Server running", "color: green");
});