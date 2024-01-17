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

// validator setup
const {
    body,
    param,
    validationResult
} = require("express-validator");

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

// create record data
app.post(
    "/api/records",

    // https://github.com/validatorjs/validator.js#validators
    [
        body("name").not().isEmpty(),
        body("from").not().isEmpty(),
        body("to").not().isEmpty(),
    ],
    async function (req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        try {
            const result = await db
                .collection("records")
                .insertOne(req.body);

            const _id = result.insertedId;

            res.append("Location", "/api/records" + _id);

            res.status(201).json({
                meta: { _id },
                data: result,
            });
        } catch {
            res.sendStatus(500);
        }
    }
);

// find one and replace data
app.put("/api/records/:id", async function (req, res) {
    try {
        const _id = new ObjectId(req.params.id);

        const result = await db
            .collection("records")
            .findOneAndReplace(
                { _id },
                req.body,
                { returnDocument: "after" }
            );

        res.json({
            meta: { _id },
            data: result.value,
        });

    } catch {
        res.sendStatus(500);
    }
});

// find one and update data
app.patch("/api/records/:id", async function (req, res) {
    try {
        const _id = new ObjectId(req.params.id);

        const result = await db
            .collection("records")
            .findOneAndUpdate(
                { _id },
                { $set: req.body },
                { returnDocument: "after" }
            );

        res.json({
            meta: { _id },
            data: result.value,
        });
    } catch {
        res.sendStatus(500);
    }
});

// delete one
app.delete("/api/records/:id", async function (req, res) {
    try {
        const _id = new ObjectId(req.params.id);
        await db.collection("records").deleteOne({ _id });
        res.sendStatus(204);
    } catch {
        res.sendStatus(500);
    }
});

// test api url
// http://localhost:8000/api/test?filter[to]=Yangon&sort[name]=1&page=1
app.get("/api/test", function (req, res) {
    return res.json(req.query);
})

//
app.listen(8000, function () {
    console.log("Server running at port 8000...");
});

