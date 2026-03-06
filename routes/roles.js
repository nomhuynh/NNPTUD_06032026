var express = require('express');
var router = express.Router();
let dataStore = require('../utils/data');
let IncrementalIdHandler = require('../utils/IncrementalIdHandler');

// GET all roles
router.get('/', async function (req, res, next) {
  try {
    let data = dataStore.roles.filter(role => !role.isDeleted);
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// GET role by id
router.get('/:id', async function (req, res, next) {
  try {
    let result = dataStore.roles.find(
      role => role.id == req.params.id && !role.isDeleted
    );
    if (result) {
      res.status(200).send(result)
    } else {
      res.status(404).send({
        message: "ID NOT FOUND"
      })
    }
  } catch (error) {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
});

// CREATE role
router.post('/', async function (req, res, next) {
  try {
    let newObj = {
      id: dataStore.roles.length > 0 ? IncrementalIdHandler.IncrementalId(dataStore.roles) : 1,
      name: req.body.name,
      description: req.body.description || "",
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    dataStore.roles.push(newObj);
    res.status(201).send(newObj);
  } catch (error) {
    res.status(400).send(error.message);
  }
})

// UPDATE role
router.put('/:id', async function (req, res, next) {
  try {
    let roleIndex = dataStore.roles.findIndex(role => role.id == req.params.id);
    if (roleIndex !== -1) {
      let role = dataStore.roles[roleIndex];
      if (req.body.name) role.name = req.body.name;
      if (req.body.description !== undefined) role.description = req.body.description;
      role.updatedAt = new Date();
      res.status(200).send(role)
    } else {
      res.status(404).send({
        message: "ID NOT FOUND"
      })
    }
  } catch (error) {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
})

// DELETE role (soft delete)
router.delete('/:id', async function (req, res, next) {
  try {
    let roleIndex = dataStore.roles.findIndex(role => role.id == req.params.id);
    if (roleIndex !== -1) {
      dataStore.roles[roleIndex].isDeleted = true;
      dataStore.roles[roleIndex].updatedAt = new Date();
      res.status(200).send(dataStore.roles[roleIndex])
    } else {
      res.status(404).send({
        message: "ID NOT FOUND"
      })
    }
  } catch (error) {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
})

module.exports = router;
