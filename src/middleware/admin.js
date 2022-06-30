const jwt = require("jsonwebtoken");
const User = require("../models/users");

const admin = async (req, res, next) => {
    try {
        const token = req.cookies.user;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({ _id: verifyUser._id });
        if (user.email === "siddharthsaraswat73@gmail.com" || user.email === "admin@gmail.com") {
            next();
        } else {
            res.status(400).send("You Are Not Admin");
        }
    } catch (error) {
        res.status(400).send("You Are Not Admin");
    }
}

module.exports = admin;