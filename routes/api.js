/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const { ObjectId } = require("mongodb");

module.exports = function (app, db) {
  app
    .route("/api/books")
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const books = (await db.collection("books").find({}).toArray()).map(
          (book) => ({ ...book, commentcount: book.comments.length }),
        );
        return res.json(books);
      } catch (e) {
        console.log(e);
        return res.status(500).json(e);
      }
    })

    .post(async function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) return res.send("missing required field title");
      try {
        const result = await db
          .collection("books")
          .insertOne({ title: title, comments: [] });

        return res.json(
          await db.collection("books").findOne({ _id: result.insertedId }),
        );
      } catch (e) {
        console.log(e);
        return res.status(500).json(e);
      }
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      try {
        db.collection("books").deleteMany({});
        return res.send("complete delete successful");
      } catch (e) {
        console.log(e);
        return res.status(500).json(e);
      }
    });

  app
    .route("/api/books/:id")
    .get(async function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        const book = await db
          .collection("books")
          .findOne({ _id: new ObjectId(bookid) });
        if (book) return res.json(book);
        else return res.send("no book exists");
      } catch (e) {
        //console.log(e);
        return res.send("no book exists");
      }
    })

    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      if (!comment) return res.send("missing required field comment");

      try {
        const result = await db
          .collection("books")
          .updateOne(
            { _id: new ObjectId(bookid) },
            { $push: { comments: comment } },
          );
        if (result.modifiedCount === 0) return res.send("no book exists");
        return res.json(
          await db.collection("books").findOne({ _id: new ObjectId(bookid) }),
        );
      } catch (e) {
        //console.log(e);
        return res.send("no book exists");
      }
    })

    .delete(async function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      try {
        const result = await db
          .collection("books")
          .deleteOne({ _id: new ObjectId(bookid) });
        if (result.deletedCount > 0) {
          return res.send("delete successful");
        } else {
          return res.send("no book exists");
        }
      } catch (e) {
        //console.log(e);
        return res.send("no book exists");
      }
    });
};
