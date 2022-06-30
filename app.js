require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const sendMail = require("@sendgrid/mail");
const port = process.env.PORT || 8080;

// DATABASE RELATED STUFF
require("./src/db/connection");
const Book = require("./src/models/books");
const User = require("./src/models/users");
const Subscriber = require("./src/models/subscribe");
const Contact = require("./src/models/contact");
const Order = require("./src/models/orders");

// FOR EXPRESS SPECIFIC STUFF
app.use("/static", express.static("static")); // for serving static files
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie Parser Middleware
app.use(cookieParser());

// FOR hbs SPECIFIC STUFF
app.set("view engine", "hbs"); // set the template engine
app.set("views", path.join(__dirname, "views")); // set the views directory

// User Authentication Stuff
const auth = require("./src/middleware/auth");
const admin = require("./src/middleware/admin");

// GET REQUESTS
// Home Page
app.get("/", (req, res) => {
  res.status(200).render("index.hbs");
});

// About Page
app.get("/about", (req, res) => {
  res.status(200).render("about.hbs");
});

// Books Page
app.get("/books", async (req, res) => {
  try {
    const data = await Book.find({});
    if (data.length > 0) {
      res.status(200).render("books.hbs", { bookData: data });
    } else {
      res.status(200).render("books.hbs", { Nothing: "No books Found....!" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//Contact Page
app.get("/contact", (req, res) => {
  res.status(200).render("contact.hbs");
});

// Add Book Page
app.get("/addbook", auth, admin, (req, res) => {
  res.status(200).render("addbook.hbs");
});

// User Orders Page
app.get("/orders", auth, async (req, res) => {
  try {
    const UserId = req.id;
    const Userdata = await User.findOne({ _id: UserId });
    const OrderData = Userdata.orders;
    let arr = [];
    OrderData.forEach((e) => {
      arr.push(e.orderid);
    });
    const orderData = await Order.find({ _id: arr });
    if (orderData.length > 0) {
      res.status(200).render("orders.hbs", { OD: orderData });
    } else {
      res.status(200).render("orders.hbs", { Nothing: "No Orders Found....!" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// All Users Page
app.get("/allusers", auth, admin, (req, res) => {
  res.status(200).render("allusers.hbs");
});

// Delete User From DataBase
app.get("/deleteuser/:userid", auth, admin, async (req, res) => {
  try {
    await User;
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete Book Page
app.get("/deletebook", auth, admin, async (req, res) => {
  const BookData = await Book.find({});
  res.status(200).render("deletebook.hbs", { BD: BookData });
});

// Delete Book From DataBase
app.get("/deletebook/:bookid", auth, admin, async (req, res) => {
  try {
    const bookid = req.params.bookid;
    const UserId = req.id;
    const Userdata = await User.findOne({ _id: UserId });
    await Book.deleteOne({ _id: bookid });
    res.status(200).redirect("/deletebook");
  } catch (error) {
    res.status(400).send(error);
  }
});

// User Cart Page
app.get("/cart", auth, async (req, res) => {
  try {
    const UserId = req.id;
    const Userdata = await User.findOne({ _id: UserId });
    const CartData = Userdata.cart;
    let arr = [];
    let sum = 0;
    CartData.forEach((e) => {
      arr.push(e.item);
    });
    const Bookdata = await Book.find({ _id: arr });
    await Bookdata.forEach((e) => {
      sum = sum + e.price;
    });
    let total = sum + 15;
    const token = jwt.sign({ total, Bookdata }, process.env.SECRET_KEY);
    res.cookie("cart", token, {
      expires: new Date(Date.now() + 900000),
    });
    res.status(200).render("cart.hbs", { BD: Bookdata, sum, total });
  } catch (error) {
    res.status(400).send(error);
  }
});

// User Wishlist Page
app.get("/wishlist", auth, async (req, res) => {
  try {
    const UserId = req.id;
    const Userdata = await User.findOne({ _id: UserId });
    const CartData = Userdata.wishlist;
    let arr = [];
    let sum = 0;
    CartData.forEach(async (e) => {
      arr.push(e.item);
    });
    const Bookdata = await Book.find({ _id: arr });
    res.status(200).render("wishlist.hbs", { BD: Bookdata });
  } catch (error) {
    res.status(400).send(error);
  }
});

// User Register Page
app.get("/register", (req, res) => {
  res.status(200).render("register.hbs");
});

// User Sigin Page
app.get("/signin", (req, res) => {
  res.status(200).render("signin.hbs");
});

// User Dashbord
app.get("/user", auth, async (req, res) => {
  const UserId = req.id;
  const Userdata = await User.findOne({ _id: UserId });
  res.status(200).render("user.hbs", { user: Userdata });
});

// Add To Cart
app.get("/cart/:bookid", auth, async (req, res) => {
  try {
    const bookid = req.params.bookid;
    const UserId = req.id;
    const Userdata = await User.findOne({ _id: UserId });
    const ok = Userdata.cart;
    let flag = 0;
    await ok.forEach((e) => {
      if (e.item == bookid) {
        flag = 1;
      }
    });
    if (flag == 0) {
      Userdata.cart = Userdata.cart.concat({ item: bookid });
      await Userdata.save();
      res.status(200).redirect("/books");
    } else {
      res.send("Item Already In The Cart");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Add to Wishlist
app.get("/wishlist/:bookid", auth, async (req, res) => {
  try {
    const bookid = req.params.bookid;
    const UserId = req.id;
    const Userdata = await User.findOne({ _id: UserId });
    const ok = Userdata.wishlist;
    let flag = 0;
    await ok.forEach((e) => {
      if (e.item == bookid) {
        flag = 1;
      }
    });
    if (flag == 0) {
      Userdata.wishlist = Userdata.wishlist.concat({ item: bookid });
      await Userdata.save();
      res.status(200).redirect("/books");
    } else {
      res.send("Item Already In The Wishlist");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete Book From Cart
app.get("/deletecartbook/:bookid", auth, async (req, res) => {
  try {
    const bookid = req.params.bookid;
    const UserId = req.id;
    const Userdata = await User.updateOne(
      { _id: UserId },
      { $pull: { cart: { item: bookid } } }
    );
    res.status(200).redirect("/cart");
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete Book From Wishlist
app.get("/deletewishlistbook/:bookid", auth, async (req, res) => {
  try {
    const bookid = req.params.bookid;
    const UserId = req.id;
    const Userdata = await User.updateOne(
      { _id: UserId },
      { $pull: { wishlist: { item: bookid } } }
    );
    res.status(200).redirect("/wishlist");
  } catch (error) {
    res.status(400).send(error);
  }
});

// User Checkout Page
app.get("/checkout", auth, async (req, res) => {
  const token = req.cookies.cart;
  const data = await jwt.verify(token, process.env.SECRET_KEY);
  const total = data.total;
  res.status(200).render("checkout.hbs", { total });
});

// User LogOut
app.get("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((element) => {
      return element.token !== req.token;
    });
    res.clearCookie("user");
    await req.user.save();
    res.status(200).redirect("/Signin");
  } catch (error) {
    res.status(500).send(error);
  }
});

// POST REQUESTS
// Add Books To DataBase
app.post("/AddBooks", admin, async (req, res) => {
  try {
    const AddBook = new Book({
      title: req.body.title,
      isbn: req.body.isbn,
      pageCount: req.body.pageCount,
      publishedDate: req.body.publishedDate,
      thumbnailUrl: req.body.thumbnailUrl,
      shortDescription: req.body.shortDescription,
      longDescription: req.body.longDescription,
      status: req.body.status,
      authors: req.body.authors,
      categories: req.body.categories,
      price: req.body.price,
    });
    const SaveBook = await AddBook.save();
    res.status(200).redirect("/addbook");
  } catch (error) {
    res.status(400).send(error);
  }
});

// User Contact Details To DataBase
app.post("/Contact", async (req, res) => {
  try {
    const AddContact = new Contact({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      subject: req.body.subject,
      message: req.body.message,
    });
    const SaveContact = await AddContact.save();
    res.status(200).render("index.hbs");
  } catch (error) {
    res.status(400).send(error);
  }
});

// User Email To DataBase
app.post("/Subscribe", async (req, res) => {
  try {
    const AddSubscriber = new Subscriber({
      email: req.body.email,
    });
    const SaveSubscriber = await AddSubscriber.save();
    res.status(200).render("index.hbs");
  } catch (error) {
    res.status(400).send(error);
  }
});

// User Orders Booking
app.post("/Order", auth, async (req, res) => {
  try {
    const token = req.cookies.cart;
    const data = jwt.verify(token, process.env.SECRET_KEY);
    const total = data.total;
    const bookData = data.Bookdata
    let arr = [];
    await data.Bookdata.forEach((e) => {
      arr.push(e);
    });
    const date = new Date(Date.now());
    const AddOrder = new Order({
      order: { itemIds: arr },
      date: date,
      total: total,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      address: req.body.address,
      country: req.body.country,
      state: req.body.state,
      zipcode: req.body.zip,
      phone: req.body.phone,
      status: "Order Conformed",
      payment: {
        name: req.body.nameoncard,
        cardnumber: req.body.cardnumber,
        expire: req.body.cardexpiration,
      },
    });
    const SaveOrder = await AddOrder.save();
    const user = await User.findOne({ _id: req.id });
    user.orders = user.orders.concat({ orderid: SaveOrder._id });
    user.cart = [];
    await user.save();
    sendMail.setApiKey(process.env.API_Key);
    const message = await {
      to: req.body.email,
      from: {
        name: "Book Shop",
        email: "shopingbookshop@gmail.com"
      },
      subject: "Order Placed Successfully",
      text: "Hello",
      html: `<h1> Your Order Has Been Placed Successfully !!!</h1>`
    }
    await sendMail.send(message).then(response => console.log("Mail Sent")).catch(err => console.log(err));

    res.status(200).render("index.hbs");
  } catch (error) {
    res.status(400).send(error);
  }
});

// New User Can Register
app.post("/Register", async (req, res) => {
  try {
    const AddUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    const token = await AddUser.generateToken();
    const SaveUser = await AddUser.save();
    res.cookie("user", token, {
      expires: new Date(Date.now() + 9999999999)
    });
    res.status(200).render("index.hbs");
  } catch (error) {
    res.status(400).send(error);
  }
});

// Existing User Signin
app.post("/Signin", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const UserEmail = await User.findOne({ email: email });
    const isMatch = await bcrypt.compare(password, UserEmail.password);
    if (isMatch) {
      const token = await UserEmail.generateToken();
      res.cookie("user", token, {
        expires: new Date(Date.now() + 9999999999),
        httpOnly: true,
      });
      res.status(200).render("index.hbs");
    } else {
      res.status(404).render("signin.hbs");
    }
  } catch (error) {
    res.status(400).send(error).message("User not found");
  }
});

// START THE SERVER
app.listen(port, () => {
  console.log(`Our website has successfully started on port ${port}`);
});
