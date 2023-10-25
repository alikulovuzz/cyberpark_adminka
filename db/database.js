const mongoose = require('mongoose');
const dotenv=require('dotenv')
dotenv.config()
//mongodb://localhost:27017/test_db
//mongodb://myuser:mypassword@localhost:27017/mydatabase
const dbConnection ="mongodb://myuser:mypassword@0.0.0.0:27017/mydatabase"
// console.log(dbConnection)
mongoose.connect(dbConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    directConnection:true
}, (err) => {
    if (!err) { console.log('MongoDB Connection Succeeded.') }
    else { console.log('Error in DB connection : ' + err) }
});