const mongoose = require('mongoose');
const dotenv=require('dotenv')
dotenv.config()
//mongodb://localhost:27017/test_db
//mongodb://myuser:mypassword@localhost:27017/mydatabase
const dbConnection =process.env.NODE_ENV=="production"?"mongodb://myuser:mypassword@localhost:27017/mydatabase":"mongodb://localhost:27017/test_db";
console.log(dbConnection)
mongoose.connect(dbConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    directConnection:true
}, (err) => {
    if (!err) { console.log('MongoDB Connection Succeeded.') }
    else { console.log('Error in DB connection : ' + err) }
});