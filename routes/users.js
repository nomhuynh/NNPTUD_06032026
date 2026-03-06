var express = require('express');
var router = express.Router();
let dataStore = require('../utils/data');
let IncrementalIdHandler = require('../utils/IncrementalIdHandler');

// GET all users
router.get('/', async function (req, res, next) {
  try {
    let data = dataStore.users.filter(user => !user.isDeleted);

    if (req.query.username) {
      data = data.filter(user => user.username.toLowerCase().includes(req.query.username.toLowerCase()));
    }

    if (req.query.email) {
      data = data.filter(user => user.email.toLowerCase().includes(req.query.email.toLowerCase()));
    }

    if (req.query.status !== undefined) {
      data = data.filter(user => user.status === (req.query.status === 'true'));
    }

    // Populate role information
    data = data.map(user => {
      let userCopy = { ...user };
      if (user.roleId) {
        let role = dataStore.roles.find(r => r.id === user.roleId && !r.isDeleted);
        if (role) {
          userCopy.role = { id: role.id, name: role.name, description: role.description };
        }
      }
      return userCopy;
    });

    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// GET user by id
router.get('/:id', async function (req, res, next) {
  try {
    let result = dataStore.users.find(
      user => user.id == req.params.id && !user.isDeleted
    );
    if (result) {
      let userCopy = { ...result };
      if (result.roleId) {
        let role = dataStore.roles.find(r => r.id === result.roleId && !r.isDeleted);
        if (role) {
          userCopy.role = { id: role.id, name: role.name, description: role.description };
        }
      }
      res.status(200).send(userCopy)
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

// CREATE user
router.post('/', async function (req, res, next) {
  try {
    // Check unique username
    if (dataStore.users.find(u => u.username === req.body.username && !u.isDeleted)) {
      return res.status(400).send({ message: "Username already exists" });
    }
    // Check unique email
    if (dataStore.users.find(u => u.email === req.body.email && !u.isDeleted)) {
      return res.status(400).send({ message: "Email already exists" });
    }

    let newObj = {
      id: dataStore.users.length > 0 ? IncrementalIdHandler.IncrementalId(dataStore.users) : 1,
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName || "",
      avatarUrl: req.body.avatarUrl || "https://i.sstatic.net/l60Hf.png",
      status: req.body.status || false,
      roleId: req.body.roleId,
      loginCount: req.body.loginCount || 0,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    dataStore.users.push(newObj);
    res.status(201).send(newObj);
  } catch (error) {
    res.status(400).send(error.message);
  }
})

// UPDATE user
router.put('/:id', async function (req, res, next) {
  try {
    let userIndex = dataStore.users.findIndex(user => user.id == req.params.id);
    if (userIndex !== -1) {
      let user = dataStore.users[userIndex];
      
      // Check unique username if changing
      if (req.body.username && req.body.username !== user.username) {
        if (dataStore.users.find(u => u.username === req.body.username && !u.isDeleted)) {
          return res.status(400).send({ message: "Username already exists" });
        }
        user.username = req.body.username;
      }
      
      // Check unique email if changing
      if (req.body.email && req.body.email !== user.email) {
        if (dataStore.users.find(u => u.email === req.body.email && !u.isDeleted)) {
          return res.status(400).send({ message: "Email already exists" });
        }
        user.email = req.body.email;
      }
      
      if (req.body.password) user.password = req.body.password;
      if (req.body.fullName !== undefined) user.fullName = req.body.fullName;
      if (req.body.avatarUrl !== undefined) user.avatarUrl = req.body.avatarUrl;
      if (req.body.status !== undefined) user.status = req.body.status;
      if (req.body.roleId !== undefined) user.roleId = req.body.roleId;
      if (req.body.loginCount !== undefined) user.loginCount = req.body.loginCount;
      
      user.updatedAt = new Date();
      res.status(200).send(user)
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

// DELETE user (soft delete)
router.delete('/:id', async function (req, res, next) {
  try {
    let userIndex = dataStore.users.findIndex(user => user.id == req.params.id);
    if (userIndex !== -1) {
      dataStore.users[userIndex].isDeleted = true;
      dataStore.users[userIndex].updatedAt = new Date();
      res.status(200).send(dataStore.users[userIndex])
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

// ENABLE user - chuyển status về true
router.post('/enable', async function (req, res, next) {
  try {
    let { email, username } = req.body;
    
    if (!email || !username) {
      return res.status(400).send({
        message: "Email and username are required"
      })
    }

    let userIndex = dataStore.users.findIndex(
      user => user.email === email && user.username === username && !user.isDeleted
    );

    if (userIndex !== -1) {
      dataStore.users[userIndex].status = true;
      dataStore.users[userIndex].updatedAt = new Date();
      res.status(200).send({
        message: "User enabled successfully",
        user: dataStore.users[userIndex]
      })
    } else {
      res.status(404).send({
        message: "User not found or information incorrect"
      })
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
})

// DISABLE user - chuyển status về false
router.post('/disable', async function (req, res, next) {
  try {
    let { email, username } = req.body;
    
    if (!email || !username) {
      return res.status(400).send({
        message: "Email and username are required"
      })
    }

    let userIndex = dataStore.users.findIndex(
      user => user.email === email && user.username === username && !user.isDeleted
    );

    if (userIndex !== -1) {
      dataStore.users[userIndex].status = false;
      dataStore.users[userIndex].updatedAt = new Date();
      res.status(200).send({
        message: "User disabled successfully",
        user: dataStore.users[userIndex]
      })
    } else {
      res.status(404).send({
        message: "User not found or information incorrect"
      })
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
})

module.exports = router;
