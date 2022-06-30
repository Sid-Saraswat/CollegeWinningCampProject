const mongoose = require("mongoose");

const newBooks = new mongoose.Schema({
    title: {
        type: String
    },
    isbn: {
        type: String
    },
    pageCount: {
        type: String
    },
    publishedDate: {
        type: String
    },
    thumbnailUrl: {
        type: String
    },
    shortDescription: {
        type: String
    },
    longDescription: {
        type: String
    },
    status: {
        type: String
    },
    authors: {
        type: String
    },
    categories: {
        type: String
    },
    price: {
        type: Number
    }
})



const Book = new mongoose.model("Book", newBooks);


module.exports = Book;