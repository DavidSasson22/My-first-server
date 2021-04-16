const Joi = require('joi');
const express = require('express');
const generateUniqueId = require('generate-unique-id');
const fs = require('fs');

const app = express();
app.use(express.json());


const users = [];


const readUsersFromJason = () => {
  fs.readFile('./users.json', (err, data) => {
    if (err) throw err;
    let users = JSON.parse(data);
    console.log(users);
  })
};


const writeUsersToJason = (data) => {
  fs.writeFile('./users.json', data, (err) => {
    if (err) throw err;
    console.log('Data written to file');
  })
};


const validateUser = (name) => {
  const schema = {
    name: Joi.string().min(3).required(),
    cash: Joi.number(),
    credit: Joi.number(),
  };
  return Joi.validate(name, schema);
}


app.post('/api/bankUsers', (req, res) => {
  const { error } = validateUser(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let myCash = req.body.cash ? req.body.cash : 0;
  let myCredit = req.body.credit ? req.body.credit : 0; 

  const user = {
    id: generateUniqueId(),
    name: req.body.name,
    cash: myCash,
    credit: myCredit,
  };

  users.push(user);
  res.send(user);
  writeUsersToJason(users)
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));