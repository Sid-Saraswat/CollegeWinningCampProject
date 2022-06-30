const jwt = require("jsonwebtoken");
const User = require("../models/users");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.user;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({ _id: verifyUser._id })
        const id = user._id;
        req.user = user;
        req.token = token;
        req.id = id;
        next();
    } catch (error) {
        res.status(401).redirect('/signin');
    }
}

module.exports = auth;