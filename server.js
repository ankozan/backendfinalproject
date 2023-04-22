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
        } else {
            res.status(404).send('Page not found');
            return;
        }

        const formattedData = JSON.stringify(filteredArray, null, 2);
        res.set('Content-Type', 'application/json');
        res.send(formattedData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
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