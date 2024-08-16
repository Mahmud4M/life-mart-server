const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const {
    MongoClient,
    ServerApiVersion
} = require('mongodb');
const cors = require("cors");


app.use(cors({
    origin: [
        "http://localhost:5173",
    ]
}))

const uri = `mongodb+srv://lifeMart:MZu0eOgaZm21JJs0@cluster0.05txn1y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {


        const db = client.db('lifeMart');
        const usersCollection = db.collection('usersData');
        const productCollection = db.collection('productsData');


        // To get productsData in url
        app.get('/products-data', async (req, res) => {
            const page = parseInt(req.query.page) - 1;
            const size = parseInt(req.query.size);
            // Sort
            const filter = req.query.filter;
            const sort = req.query.sort;
            const price = req.query.sortPrice;
            const search = req.query.search;
            const category = req.query.category;

            // Build query object
            let query = {
                productName: {
                    $regex: `${search}`,
                    $options: 'i'
                }
            };
            if (filter) query.brand = filter
            if (category) query.category = category

            // Build sort options
            let options = {};
            let optionsPrice = {};
            if (sort) options = { sort: { productCreationDate: sort === 'asc' ? 1 : -1 } }
            if(price) optionsPrice = { sortPrice: { price: price === 'low' ? 1 : -1 } }


            try {
                const result = await productCollection.find(query, options).skip(page * size).limit(size).toArray();

                res.send(result)
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).send([]);
            }
        })


        // Get products count
        // app.get('/products', async (req, res) => {
        //     try {
        //         const result = await productCollection.find().toArray();

        //         res.send(result)
        //     } catch (error) {
        //         console.error('Error fetching products:', error);
        //         res.status(500).send([]);
        //     }
        // })



        // Get products count
        app.get('/product-count', async (req, res) => {
            const filter = req.query.filter;
            const search = req.query.search;

            let query = {
                productName: {
                    $regex: `${search}`,
                    $options: 'i'
                }
            };
            if (filter) query.brand = filter
            const count = await productCollection.countDocuments(query);

            res.send({
                count
            })
        })



        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({
            ping: 1
        });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Hlw express")
})

app.listen(port, () => {
    console.log(`mart is busy on ${port}`);
})