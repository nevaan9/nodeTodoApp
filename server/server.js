require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');

let {mongoose} = require('./db/mongoose'); // Need this to save mongoose models to DB

let app = express();
const port = process.env.PORT;

// Define the routes
let userRoute = require('./routes/userRoutes')
let todoRoute = require('./routes/todoRoutes')

// Middleware
app.use(bodyParser.json());
app.use('/users', userRoute);
app.use('/todos', todoRoute);

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
