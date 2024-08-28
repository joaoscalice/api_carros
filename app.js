var express = require('express');
var path = require('path');

var rotaIndex = require('./routes/index')
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', rotaIndex)

module.exports = app;