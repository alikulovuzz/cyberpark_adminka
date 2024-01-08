require('./db/database')
const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path');
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser')
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const router = require('./router/index')
dotenv.config()

const HOST = process.env.HOST || '0.0.0.0'
const PORT = process.env.PORT || '8081'

const corsOptions = {
  origin:
    ['http://localhost:3000/',
      'https://my.cyberpark.uz/',
      'https://89.249.63.233/',
      'https://213.230.91.132/'],
  credentials: true,
  optionSuccessStatus: 200
}

app.use(morgan('dev'))
app.use(cors(corsOptions))
app.use(bodyParser.json({ limit: '100mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Cyber park Adminka API",
      version: '1.0.0',
    },
  },
  apis: ["app.js", "./router/*.js"],
  securityDefinitions: {
    auth: {
      type: 'basic'
    }
  }
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api/v1/api-docs', basicAuth({
  users: { 'admin': '8723' },
  challenge: true,
}), swaggerUI.serve, swaggerUI.setup(swaggerDocs));

/**
 * @swagger
 * /api/v1/status:
 *   get:
 *     description: Health Check!
 *     tags:
 *       - Check server
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
  console.log(`Running on port http://${HOST}:${PORT}/api/v1/api-docs, SUCCESSFULLY!`)
})
