const mongoose = require("mongoose");
const User = require("../models/users");

const newOrder = new mongoose.Schema({
  order: [
    {
      itemIds: {
        type: Array,
      },
    },
  ],
  total: {
    type: Number,
  },
  date: {
    type: String,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipcode: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  payment: [
    {
      name: {
        type: String,
      },
      cardnumber: {
        type: String,
      },
      expire: {
        type: String,
      },
      cvv: {
        type: String,
      },
    },
  ],
  totalprice: {
    type: String,
  },
  status: {
    type: String,
  },
});

const Order = new mongoose.model("Order", newOrder);

module.exports = Order;
