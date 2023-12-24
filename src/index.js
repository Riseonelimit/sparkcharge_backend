require('dotenv').config();
const db_conn = require("./db/db_conn.js");

const app = require("./app.js");

db_conn()
.then(() => {
    app.listen(process.env.PORT || 8081, () => {
        console.log(`Server listening at PORT ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log("Database Connection Failed!");
    console.log(err);
    process.exit(1);
});