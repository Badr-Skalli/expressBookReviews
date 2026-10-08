const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    if (! username || ! password) {
        // Return error if username or password is missing
        return res.status(404).json({message: "Unable to register user."});
    }

    if (!isValid(username)) {
        users.push({"username": username, "password": password});
        return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
        return res.status(404).json({message: "User already exists!"});
    }
});

// Get the book list available in the shop

// Old implementation from Task 1
/*
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});
*/
// New implementation for Task 10
public_users.get('/', function (req, res) {
    Promise.resolve(books)
        .then((data) => {
            res.send(JSON.stringify(data, null, 4));
        })
        .catch((error) => {
            res.status(500).json({ message: "Error retrieving books" });
        });
});

// Get book details based on ISBN
// Old implementation from Task 2
/*
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn]);
 });
*/
// New implementation for Task 11
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        const book = await Promise.resolve(books[isbn]);
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving book" });
    }
});

// Get book details based on author
// Old implementation from Task 3
/*
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const isbns = Object.keys(books);
    const booksByAuthor = [];
    isbns.forEach((isbn) => {
        if (books[isbn].author === author) {
            booksByAuthor.push(books[isbn]);
        }
    });
    res.send(booksByAuthor);
});
*/
// New implementation for Task 12
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        const data = await Promise.resolve(books);

        const booksByAuthor = Object.keys(data)
            .filter(isbn => data[isbn].author === author)
            .map(isbn => data[isbn]);

        res.json(booksByAuthor);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books" });
    }
});

// Get all books based on title
// Old implementation from Task 4
/*
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const isbns = Object.keys(books);
    const booksByAuthor = [];
    isbns.forEach((isbn) => {
        if (books[isbn].title === title) {
            booksByAuthor.push(books[isbn]);
        }
    });
    res.send(booksByAuthor);
});
*/
// New implementation for Task 13
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    try {
        const response = await axios.get('http://localhost:5000/');
        const books = response.data;

        const booksByTitle = Object.keys(books)
            .filter(isbn => books[isbn].title === title)
            .map(isbn => books[isbn]);

        res.send(booksByTitle);
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving books",
            error: error.message
        });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const reviews = books[isbn].reviews;
    res.send(reviews);
});

module.exports.general = public_users;
