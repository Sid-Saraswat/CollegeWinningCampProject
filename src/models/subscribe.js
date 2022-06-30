const mongoose = require("mongoose");

const newSubscriber = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    }
})



const Subscriber = new mongoose.model("Subscriber", newSubscriber);


module.exports = Subscriber;