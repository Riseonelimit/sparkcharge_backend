const express = require("express"); // Require express module
const bodyParser = require("body-parser"); // Require body-parser module
require("dotenv").config(); // Require dotenv file
const app = express(); // Create express app
const port = process.env.PORT || 80; // Server port

/*app.use(express.static(__dirname)); // Serve static files from the current directory

app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser middleware

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.post("/signup", (req, res) => {
    const formData = req.body;
    console.log("Form data:", formData);
    res.send("Form submitted successfully!");
});

app.post("/login", (req, res) => {
    const formData = req.body;
    console.log("Form data:", formData);
    res.send("Form submitted successfully!");
});
*/
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});