require('dotenv').config();
//Import Environment Variables from .env file
const db_conn = require("./db/db_conn.js");
//Import Database Connection Function
const app = require("./app.js");
//Import Express App
const https = require('https');
const fs = require('fs');
const options = {
  key: fs.readFileSync(`${__dirname}/cert/privkey.pem`),
  cert: fs.readFileSync(`${__dirname}/cert/cert.pem`),
};
const server = https.createServer(options, app);
db_conn()
//Establish Database Connection
.then(() => {
    server.listen(process.env.PORT || 8081, () => {
    //Start Express Server
        console.log(`Server listening at PORT ${process.env.PORT}`);
    });
})
.catch((err) => {
//Catch Database Connection Error
    console.log("Database Connection Failed!");
    console.log(err);
    process.exit(1);
});