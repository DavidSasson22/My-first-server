const Joi = require('joi');
const express = require('express');
const generateUniqueId = require('generate-unique-id');
const fs = require('fs');
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors());


let users;


  fs.readFile('./users.json', async (err, data) => {
    if (err) throw err;
    users =  JSON.parse(data);
    console.log(1);
  });



const writeUsersToJason = (data) => {
  fs.writeFile('./users.json', data, (err) => {
    if (err) throw err;
    console.log('Data written to file');
  })
};


const validateUser = () => {
  const schema =  Joi.object({
    cash: Joi.number(),
    credit: Joi.number(),
  });
  return schema.validate({});
}


app.get('/api/bankUsers', (req, res) => {
  res.send(users);
});


app.post('/api/bankUsers', (req, res) => {
  const { error } = validateUser(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let myCash = req.body.cash ? req.body.cash : 0;
  let myCredit = req.body.credit ? req.body.credit : 0; 

  const user = {
    id: generateUniqueId(),
    cash: myCash,
    credit: myCredit,
  };

  users.push(user);
  res.send(user);
  console.log(users);
  writeUsersToJason(JSON.stringify(users, null, 2));
});


app.put('/api/bankUsers/:id', (req, res) => {
  const bankUser = users.find(u => u.id === req.params.id);
  if (!bankUser) return res.status(404).send('The user with the given ID was not found.');

  const { error } = validateUser(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  
  let myCash = req.body.cash >= (bankUser.credit * -1) ?  req.body.cash : bankUser.cash ;
  let myCredit = req.body.credit > 0 ? req.body.credit : bankUser.credit;
  
  req.body.cash < (bankUser.credit * -1) && res.send("user does not have enough credit")
  
  bankUser.credit = myCredit;
  bankUser.cash = myCash; 
  res.send(bankUser);
  writeUsersToJason(JSON.stringify(users));
});


app.get('/api/bankUsers/:id', (req, res) => {
  const bankUser = users.find(u => u.id === req.params.id);
  if (!bankUser) return res.status(404).send('The user with the given ID was not found.');

  res.send(bankUser);
});


const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}...`));