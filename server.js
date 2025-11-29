const express = require("express");
const authRouter = require('./routes/Authentication/auth');
const userManagementRouter = require('./routes/User_Management/userManagement');
const { default: mongoose } = require("mongoose");

const server = express();
const PORT = process.env.PORT || 3000;

const MONGO_URL = process.env.MONGO_URI || 'mongodb://localhost:27017/leave-scheduler-server'

// serves as a middleware function that enables the parsing of incoming request bodies with JSON payloads.
server.use(express.json());

//connect to MongoDB
mongoose.connect(MONGO_URL)
.then(() => console.log('Connect to MongoDB!'))
.catch((error) => {
    console.log('MongoDB connection error:', error);
    process.exit(1);
});


// Simple root route
server.get('/', (req, res) => {
    res.status(200);
    res.send("Welcome to the root Url of the Server!");
});


//Athentication Routes
server.use('/auth', authRouter);

//User Management Routes
server.use('/user-management', userManagementRouter);



server.listen(PORT, (error) => {
    if (!error) {
        console.log("Server is Successfully Running, open http://localhost:" + PORT)
    } else {
        console.log("Error occurred, server can't start.", error);
    }
})