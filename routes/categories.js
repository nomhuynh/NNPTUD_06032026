var express = require('express');
var router = express.Router();
let slugify = require('slugify')
let categorySchema = require('../schemas/categories')
let productSchema = require('../schemas/products')
//mongoose --- mongoDB

/* GET users listing. */
///api/v1/products
router.get('/', async function (req, res, next) {
  try {
    let queries = { isDeleted: false };
    if (req.query.name) {
      queries.name = new RegExp(req.query.name, 'i');
    }
    let data = await categorySchema.find(queries);
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
router.get('/slug/:slug', async function (req, res, next) {
  let slug = req.params.slug;
  let result = await categorySchema.findOne({
    slug: slug,
    isDeleted: false
  })
  if (result) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "SLUG NOT FOUND"
    })
  }
});
///api/v1/products/1
router.get('/:id', async function (req, res, next) {
  try {
    let result = await categorySchema.findOne(
      { _id: req.params.id, isDeleted: false }
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

router.get('/:id/products', async function (req, res, next) {
  try {
    let products = await productSchema.find({
      category: req.params.id,
      isDeleted: false
    });
    res.status(200).send(products);
  } catch (error) {
    res.status(404).send({
      message: "ERROR RETRIEVING PRODUCTS"
    })
  }
});
router.post('/', async function (req, res, next) {
  try {
    let newObj = new categorySchema({
      name: req.body.name,
      slug: slugify(req.body.name, {
        replacement: '-', lower: true, locale: 'vi',
      }),
      description: req.body.description,
      images: req.body.images
    })
    await newObj.save()
    res.send(newObj);
  } catch (error) {
    res.status(404).send(error.message);
  }
})
router.put('/:id', async function (req, res, next) {
  try {
    // let result = await categorySchema.findOne(
    //   { _id: req.params.id }
    // );
    // if (result) {
    //   //res.status(200).send(result)
    //   let keys = Object.keys(req.body);
    //   for (const key of keys) {
    //     result[key] = req.body[key];
    //   }
    //   await result.save();
    //   res.status(200).send(result)
    // } else {
    //   res.status(404).send({
    //     message: "ID NOT FOUND"
    //   })
    // }


    let result = await categorySchema.findByIdAndUpdate(req.params.id,
      req.body, {
      new: true
    })
    res.status(200).send(result)
  } catch (error) {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
})
router.delete('/:id', async function (req, res, next) {
  try {
    let result = await categorySchema.findByIdAndUpdate(req.params.id,
      { isDeleted: true }, {
      new: true
    })
    res.status(200).send(result)
  } catch (error) {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
})

module.exports = router;
