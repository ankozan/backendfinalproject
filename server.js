const express = require('express')
const app = express()
const mongoose = require('mongoose');
const fs = require('fs');
const States = require('./models/States');
const bodyParser = require('body-parser');
const path = require('path');

// Use the body-parser middleware to parse incoming request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
const stateAbbreviations = {
    "AL": "ALABAMA",
    "AK": "ALASKA",
    "AZ": "ARIZONA",
    "AR": "ARKANSAS",
    "CA": "CALIFORNIA",
    "CO": "COLORADO",
    "CT": "CONNECTICUT",
    "DE": "DELAWARE",
    "FL": "FLORIDA",
    "GA": "GEORGIA",
    "HI": "HAWAII",
    "ID": "IDAHO",
    "IL": "ILLINOIS",
    "IN": "INDIANA",
    "IA": "IOWA",
    "KANSAS": "KS",
    "KY": "KENTUCKY",
    "LA": "LOUISIANA",
    "ME": "MAINE",
    "MD": "MARYLAND",
    "MA": "MASSACHUSETTS",
    "MI": "MICHIGAN",
    "MN": "MINNESOTA",
    "MS": "MISSISSIPPI",
    "MO": "MISSOURI",
    "MT": "MONTANA",
    "NE": "NEBRASKA",
    "NV": "NEVADA",
    "NH": "NEW HAMPSHIRE",
    "NJ": "NEW JERSEY",
    "NM": "NEW MEXICO",
    "NY": "NEW YORK",
    "NC": "NORTH CAROLINA",
    "ND": "NORTH DAKOTA",
    "OH": "OHIO",
    "OK": "OKLAHOMA",
    "OR": "OREGON",
    "PA": "PENNSYLVANIA",
    "RI": "RHODE ISLAND",
    "SC": "SOUTH CAROLINA",
    "SD": "SOUTH DAKOTA",
    "TN": "TENNESSEE",
    "TX": "TEXAS",
    "UT": "UTAH",
    "VT": "VERMONT",
    "VA": "VIRGINIA",
    "WA": "WASHINGTON",
    "WV": "WEST VIRGINIA",
    "WI": "WISCONSIN",
    "WY": "WYOMING"
};


let statesWithFunFacts;
let states;
async function getStatesWithFunFacts() {
    connectToDB();
    const statesData = require('./statesData.json');
    const stateCodes = statesData.map((state) => state.code);

    const dbStates = await Promise.all(
        stateCodes.map((stateCode) => States.findOne({ stateCode }))
    );

    statesWithFunFacts = statesData.map((state, index) => {
        const dbState = dbStates[index];
        const funFacts = dbState ? dbState.funfacts : [];
        return { ...state, funfacts: funFacts };
    });
}

async function run() {
    await getStatesWithFunFacts();
}
run().catch(console.dir);


app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Final Project</title>
        <style>
            body {
                background-color: black;
                color: white;
                text-align: center;
                font-size: 36px;
                font-weight: bold;
                padding-top: 20%;
            }
        </style>
    </head>
    <body>
        Final Project 3
    </body>
    </html>
  `;
    res.send(html);
});

app.get('/states', async (req, res) => {
    try {
        const path = req.path;
        let filteredArray;

        if (path === '/states') {
            filteredArray = statesWithFunFacts;
            if (path === '/states' && req.query.contig === 'true') {
                filteredArray = statesWithFunFacts.filter(state => state.code !== 'AK' && state.code !== 'HI');
            } else if (path === '/states' && req.query.contig === 'false') {
                filteredArray = statesWithFunFacts.filter(state => state.code === 'AK' || state.code === 'HI');
            }
        }

        const formattedData = JSON.stringify(filteredArray, null, 2);
        res.set('Content-Type', 'application/json');
        res.send(formattedData);
    } catch (err) {
        console.error(err);
    } finally {
        disconnectToDB();
    }
});


app.get('/states/:state', async (req, res) => {
    await getStatesWithFunFacts();
    let filteredArray
    const stateCode = req.params.state.toUpperCase();
    if (!(stateCode in stateAbbreviations)) {

        console.log(stateCode)
        filteredArray = statesWithFunFacts.find(state => state.code === stateCode);

        if (filteredArray) {
            const formattedData = JSON.stringify(filteredArray, null, 2);
            res.set('Content-Type', 'application/json');
            res.send(formattedData);
        } else {
            res.status(404).send('State not found');
        }
    } else {
        res.status(404).json({ "message": "Invalid state abbreviation parameter" });

    }
});



app.get('/states/:state/funfact', async (req, res) => {
    connectToDB();
    await getStatesWithFunFacts();

    const stateCode = req.params.state.toUpperCase();
    const stateData = statesWithFunFacts.find(state => state.code === stateCode);
    if (stateData) {
        if (stateData.funfacts.length > 0) {
            const formattedData = JSON.stringify(stateData.funfacts[Math.floor(Math.random() * stateData.funfacts.length)], null, 2);
            res.set('Content-Type', 'application/json');
            res.send(formattedData);
        }
        else {
            res.status(404).send('No Fun Facts found for ' + stateData.state);

        }

    } else {
        res.status(404).send('State not found');
    }

    disconnectToDB();
});

//POSTs
app.post('/states/:state/funfact', async (req, res) => {
    try {
        connectToDB();
        console.log(req.body.funfacts);
        const stateCode = req.params.state.toUpperCase();
        const newFunFacts = req.body.funfacts;

        // Find the state in the database
        let stateData = await States.findOne({ stateCode });

        if (!stateData) {
            stateData = new States({ stateCode: stateCode, funfacts: newFunFacts });
        }

        // Add the new fun facts to the existing array
        stateData.funfacts.push(...newFunFacts);

        // Save the updated state document to the database
        stateData = await stateData.save();

        // Return the updated or new state document as the response
        res.status(201).send(stateData);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
    disconnectToDB();
});

app.patch('/states/:state/funfact', async (req, res) => {
    try {
        const stateCode = req.params.state.toUpperCase();
        const { index, funfact } = req.body;

        // Check if the required properties are present in the request body
        if (!index || !funfact) {
            return res.status(400).send('Index and funfact are required');
        }

        // Convert the index to zero-based by subtracting 1
        const zeroBasedIndex = index - 1;

        // Find the state in the database
        const stateData = await States.findOne({ stateCode });

        // If state is not found, return a 404 error
        if (!stateData) {
            return res.status(404).send('State not found');
        }

        // Replace the existing fun fact with the new one at the specified index
        const funfacts = stateData.funfacts;
        if (zeroBasedIndex >= 0 && zeroBasedIndex < funfacts.length) {
            funfacts[zeroBasedIndex] = funfact;
        } else {
            return res.status(400).send('Invalid index');
        }

        // Save the updated state document to the database
        const updatedState = await stateData.save();

        // Return the updated state document as the response
        res.send(updatedState);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/states/:state/funfact', async (req, res) => {
    const stateCode = req.params.state.toUpperCase();
    const index = req.body.index;

    const stateData = await States.findOne({ stateCode });
    if (!stateData) {
        return res.status(404).send('State not found');
    }
    if (!index || index <= 0 || index > stateData.funfacts.length) {
        return res.status(400).send('Invalid index');
    }

    stateData.funfacts.splice(index - 1, 1);
    const updatedState = await stateData.save();

    res.status(200).send(updatedState);
});

app.get('/states/:state/capital', async (req, res) => {
    await getStatesWithFunFacts();

    let filteredArray
    const stateCode = req.params.state.toUpperCase();
    console.log(stateCode);
    let state = statesWithFunFacts.find(state => state.code === stateCode);

    if (state) {
        const formattedData = JSON.stringify({
            state: state.state,
            capital: state.capital_city
        }, null);
        res.set('Content-Type', 'application/json');
        res.send(formattedData);
    } else {
        res.status(404).send('State not found');
    }
});

app.get('/states/:state/nickname', async (req, res) => {
    await getStatesWithFunFacts();

    let filteredArray
    const stateCode = req.params.state.toUpperCase();
    console.log(stateCode);
    let state = statesWithFunFacts.find(state => state.code === stateCode);

    if (state) {
        const formattedData = JSON.stringify({
            state: state.state,
            nickname: state.nickname
        }, null);
        res.set('Content-Type', 'application/json');
        res.send(formattedData);
    } else {
        res.status(404).send('State not found');
    }
});

app.get('/states/:state/population', async (req, res) => {
    await getStatesWithFunFacts();

    let filteredArray
    const stateCode = req.params.state.toUpperCase();
    console.log(stateCode);
    let state = statesWithFunFacts.find(state => state.code === stateCode);

    if (state) {
        const formattedData = JSON.stringify({
            state: state.state,
            population: state.population
        }, null);
        res.set('Content-Type', 'application/json');
        res.send(formattedData);
    } else {
        res.status(404).send('State not found');
    }
});

app.get('/states/:state/admission', async (req, res) => {
    await getStatesWithFunFacts();

    let filteredArray
    const stateCode = req.params.state.toUpperCase();
    console.log(stateCode);
    let state = statesWithFunFacts.find(state => state.code === stateCode);

    if (state) {
        const formattedData = JSON.stringify({
            state: state.state,
            admitted: state.admission_date
        }, null);
        res.set('Content-Type', 'application/json');
        res.send(formattedData);
    } else {
        res.status(404).send('State not found');
    }
});

app.get('*', (req, res) => {
    res.status(404).send('<h1>404<h1>');
});



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

async function connectToDB() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
    } catch (err) {
        console.error(err);
    }
}
async function disconnectToDB() {
    try {
        await client.close();
        console.info('Disconnected from MongoDB');

    }
    catch (err) {
        console.error(err);
    }
}



app.listen(3000);