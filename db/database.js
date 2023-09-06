const mongoose = require('mongoose');
const dotenv=require('dotenv')
dotenv.config()

const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME,
  } = process.env;

mongoose.connect(`mongodb://myuser:mypassword@localhost:27017/mydatabase`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    directConnection:true
}, (err) => {
    if (!err) { console.log('MongoDB Connection Succeeded.') }
    else { console.log('Error in DB connection : ' + err) }
});