const fs = require('fs');
const path = require('path');
const { animals } = require('./data/animals');
const express = require('express');
const { allowedNodeEnvironmentFlags } = require('process');
const PORT = process.env.PORT || 3001;
const app = express();

//parse incoming string or array data 11.2.5
app.use(express.urlencoded({ extended: true}));

//parse incoming JSON data 11.2.5
app.use(express.json());

// 11.1.5
// filterByQuery()
function filterByQuery(query, animalsArray) {
  let personalityTraitsArray = [];
  //Note that we save the animlasArray as filteredResults here:
  let filteredResults = animalsArray;
  if (query.personalityTraits) {
      // Save personalityTraits as a dedicated array.
      // If personanalityTraits is a strin, place it inot a new array and save
      if (typeof query.personalityTraits === 'string') {
          personalityTraitsArray = [query.personalityTraits];
      } else {
          personalityTraitsArray = query.personalityTraits;
      }
      // Loop through each trait in the personalityTraits array:
      personalityTraitsArray.forEach(trait => {
          // Check the trait against each animal in the filteredResults array.
          // Remeber, it is intitially a copy of the animalsArray,
          // but here we're updating it for each trait in the .forEach() loop.
          // For each trait being targeted by the filter, the filteredResults
          // array will then contain only the entries that contain the trait,
          // so at the end we'll have an array of animals that have every one
          // of the traits when the .forEach() loop is finished.
          filteredResults = filteredResults.filter(
              animal => animal.personalityTraits.indexOf(trait) !== -1
            );
          });
        }
        if (query.diet) {
          filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
        }
        if (query.species) {
          filteredResults = filteredResults.filter(animal => animal.species === query.species);
        }
        if (query.name) {
          filteredResults = filteredResults.filter(animal => animal.name === query.name);
        }
        // return the filtered results:
        return filteredResults;
      }

//get() & json

function findById(id, animalsArray) {
  const result = animalsArray.filter(animal => animal.id === id)[0];
  return result;
}

app.get('/api/animals', (req, res) => {
  let results = animals;
  if (req.query) {
      results = filterByQuery(req.query, results);
  }
  res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
  const result = findById(req.params.id, animals);
    if (result){
      res.json(result);
    } else {
      res.send(404);
    }
});

function createNewAnimal(body, animalsArray) {
  const animal = body;
  animalsArray.push(animal);
  // our function's main code will go here
  fs.writeFileSync(
    path.join(__dirname, './data/animals.json'),
    JSON.stringify({ animals: animalsArray }, null, 2)
  );
  // finished code to post route for response
  return body;
}

function validateAninmal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false;
  }
  if (!animal.species || typeof animal.species !== 'string') {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
    return false;
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true;
}


// defined a route that listens for POST requests - accpet data from client 11.2.3
app.post('/api/animals', (req, res) => {
  // set id based on what the next index of the array will be
  req.body.id = animals.length.toString();

  // if any data in req.data is incorrect, send 400 error back
  if (!validateAninmal(req.body)) {
    res.status(400).send('The animal is not properly formatted.');
  } else {

  // add animal to json file and animals array in this function
  const animal = createNewAnimal(req.body, animals);

  res.json(animal);
  }
});

app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}!`);
});

