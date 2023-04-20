const express = require('express')
const app = express()
const mongoose = require('mongoose');
const fs = require('fs');
const States = require('./models/States');


// Load states data from JSON file


// Connect to MongoDB database

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://alinail13ank:Reset123@cluster0.2h2iqyk.mongodb.net/test";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const statesData = fs.readFileSync('./statesData.json');
const states = JSON.parse(statesData);
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });


    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

app.get('/states', async (req, res) => {
    try {
        const statesData = require('./statesData.json');
        const stateCodes = statesData.map((state) => state.code);

        const dbStates = await Promise.all(
            stateCodes.map((stateCode) => States.findOne({ stateCode }))
        );

        const statesWithFunFacts = statesData.map((state, index) => {
            const dbState = dbStates[index];
            const funFacts = dbState ? dbState.funfacts : [];
            return { ...state, funfacts: funFacts };
        });

        res.json(statesWithFunFacts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    } finally {
        await mongoose.connection.close();
    }
});

app.get('states/:contig', (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const stateData = states.find(state => state.code === stateCode);

    if (stateData) {
        const formattedData = JSON.stringify(stateData, null, 2);
        res.set('Content-Type', 'application/json');
        res.send(formattedData);
    } else {
        res.status(404).send('State not found');
    }
});
// Route to get data for a specific state
// app.get('/states/:state', (req, res) => {
//     const stateCode = req.params.state.toUpperCase();
//     const stateData = states.find(state => state.code === stateCode);

//     if (stateData) {
//         const formattedData = JSON.stringify(stateData, null, 2);
//         res.set('Content-Type', 'application/json');
//         res.send(formattedData);
//     } else {
//         res.status(404).send('State not found');
//     }
// });

app.get('/states/:state', (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const stateData = states.find(state => state.code === stateCode);

    if (stateData) {
        const formattedData = JSON.stringify(stateData, null, 2);
        res.set('Content-Type', 'application/json');
        res.send(formattedData);
    } else {
        res.status(404).send('State not found');
    }
});


app.get('/', async (req, res) => {
    try {
        const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        const myDatabase = client.db('backendfinal');
        const myCollection = myDatabase.collection('states');
        // Find all documents in the collection
        const documents = await myCollection.find({ stateCode: 'KS' }).toArray();
        res.send(documents);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    } finally {
        await mongoose.connection.close();
    }

})



app.get('/statefind', async (req, res) => {
    try {
        const states = await States.find({ stateCode: 'KS' });
        res.send(states);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    } finally {
        await mongoose.connection.close();
    }
})

app.listen(3000);