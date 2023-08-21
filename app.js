require('./db/database')
const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path');
const router = require('./router/index')
const bodyParser = require('body-parser')
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const app = express()
dotenv.config()
const HOST = process.env.HOST || '0.0.0.0'
const PORT = process.env.PORT || '8081'

app.use(morgan('dev'))
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: "Library API",
        version: '1.0.0',
      },
    },
    apis: ["app.js","./router/user.js"],
  };
  
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api/v1/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

/**
 * @swagger
 * /api/v1/status:
 *   get:
 *     description: Helath Check!
 *     responses:
 *       200:
 *         description: Success
 * 
 */
app.use('/api/v1/status', (req, res) => {
    res.json({ Hello: "World!" })
})

app.use('/api/v1', router)
app.use('/api/v1/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, (err) => {
    if (err) { console.log(`Error:${err}`) }
    console.log(`Running on port http://localhost:${PORT}/api-docs, SUCCESSFULLY!`)
})
