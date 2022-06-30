const mongoose = require("mongoose");

const book = mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log(`Connection Successful to DataBase`);
}).catch((err) => {
    console.log(`Cannot Connect to DataBase ==>> ${err}`);
})
