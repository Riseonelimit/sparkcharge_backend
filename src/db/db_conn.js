const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const dbconninstance = await mongoose.connect(`${process.env.MONGO_URL}/${process.env.DB_NAME}`);
        console.log(`Database Connection has been Established! DBHOST: ${dbconninstance.connection.host }`);
    } catch (error) {
        console.error("Failed to connect to Database! :",error);
        process.exit(1);
    }
}

module.exports= connectDB;