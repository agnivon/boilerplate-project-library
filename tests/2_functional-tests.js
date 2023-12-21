/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const myDB = require("../connection");
const server = require("../server");
const { ObjectId } = require("mongodb");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test("#example Test GET /api/books", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/books")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        assert.property(
          res.body[0],
          "commentcount",
          "Books in array should contain commentcount",
        );
        assert.property(
          res.body[0],
          "title",
          "Books in array should contain title",
        );
        assert.property(
          res.body[0],
          "_id",
          "Books in array should contain _id",
        );
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function () {
    const ids = [];

    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("Test POST /api/books with title", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post("/api/books")
            .send({ title: "Test_Book_1" })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.isObject(res.body, "response should be an object");
              assert.property(res.body, "title", "Book should contain title");
              assert.property(res.body, "_id", "Book should contain _id");

              ids.push(res.body._id);
              done();
            });
        });

        test("Test POST /api/books with no title given", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post("/api/books")
            .send({})
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field title");
              done();
            });
        });
      },
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get("/api/books")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, "response should be an array");
            assert.property(
              res.body[0],
              "commentcount",
              "Books in array should contain commentcount",
            );
            assert.property(
              res.body[0],
              "title",
              "Books in array should contain title",
            );
            assert.property(
              res.body[0],
              "_id",
              "Books in array should contain _id",
            );
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get("/api/books/invalid_id")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get("/api/books/" + ids[0])
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, "response should be an object");
            assert.isArray(
              res.body.comments,
              "comments",
              "comments should be an array",
            );
            assert.equal(
              res.body.title,
              "Test_Book_1",
              "Book should be of title 'Test_Book_1'",
            );
            assert.property(res.body, "_id", "Book should contain _id");
            done();
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("Test POST /api/books/[id] with comment", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post("/api/books/" + ids[0])
            .send({ comment: "Test_Comment_1" })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.isObject(res.body, "response should be an object");
              assert.property(res.body, "title", "Book should contain title");
              assert.property(res.body, "_id", "Book should contain _id");
              assert.isArray(res.body.comments, "comments should be an array");
              assert.include(res.body.comments, "Test_Comment_1");
              done();
            });
        });

        test("Test POST /api/books/[id] without comment field", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post("/api/books/" + ids[0])
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field comment");
              done();
            });
        });

        test("Test POST /api/books/[id] with comment, id not in db", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post("/api/books/invalid_id")
            .send({ comment: "Test_Comment_1" })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "no book exists");
              done();
            });
        });
      },
    );

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .delete("/api/books/" + ids[0])
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "delete successful");
            done();
          });
      });

      test("Test DELETE /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .delete("/api/books/invalid_id")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });
    });

    after(async function () {
      myDB(async function (client) {
        const myDataBase = await client.db("fcc-library").collection("books");
        await myDataBase.deleteMany({
          _id: { $in: ids.map((id) => new ObjectId(id)) },
        });
      });
    });
  });
});
