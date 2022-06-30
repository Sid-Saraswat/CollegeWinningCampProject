const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const newUser = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    cart: [{
        item: {
            type: String,
        }
    }],
    wishlist: [{
        item: {
            type: String,
        }
    }],
    orders: [{
        orderid: {
            type: String,
        }
    }],
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]
})


// Creating Tokens
newUser.methods.generateToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        res.status(401).redirect('/LogInSignUp');
        console.log(error);
    }
}

// Hashing Password
newUser.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})


const User = new mongoose.model("User", newUser);

module.exports = User;