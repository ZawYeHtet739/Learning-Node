const express = require("express");
const app = express();

// Db setup
const { MongoClient, ObjectId } = require("mongodb");
const mongo = new MongoClient("mongodb://127.0.0.1");
const db = mongo.db("travel");

// Request body management setup
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// get records data
app.get("/api/records", async function (req, res) {

    // get api url data with json
    // http://localhost:8000/api/records?filter[to]=Yangon&sort[name]=1&page=1
    // { filter: { to: 'Yangon' }, sort: { name: '1' }, page: '1' }
    const options = req.query;

    const filter = options.filter || {};
    const sort = options.sort || {};

    const limit = 10;
    const page = parseInt(options.page) || 1;
    const skip = (page - 1) * limit;

    for (i in sort) {
        sort[i] = parseInt(sort[i]);
    }

    try {
        const result = await db
            .collection("records")
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .toArray();

        // response data envelope
        res.json({
            meta: {
                skip,
                limit,
                sort,
                filter,
                page,
                total: result.length,
            },
            data: result,
            link: {
                self: req.originalUrl,
            }
        });
    } catch {
        res.sendStatus(500);
    }

})

// test api url
app.get("/test", function (req, res) {
    return res.json(req.query);
})

app.listen(8000, function () {
    console.log("Server running at port 8000...");
});

