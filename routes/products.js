var express = require('express');
var router = express.Router();
let slugify = require('slugify')
let productSchema = require('../schemas/products')
//mongoose --- mongoDB

/* GET users listing. */
///api/v1/products
router.get('/', async function (req, res, next) {
  try {
    let queries = { isDeleted: false };

    if (req.query.title) {
      queries.title = new RegExp(req.query.title, 'i');
    }

    if (req.query.minPrice || req.query.maxPrice) {
      queries.price = {};
      if (req.query.minPrice) queries.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) queries.price.$lte = Number(req.query.maxPrice);
    }

    let data = await productSchema.find(queries).populate({ path: 'category', select: 'name images' });
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
router.get('/slug/:slug', async function (req, res, next) {
  let slug = req.params.slug;
  let result = await productSchema.findOne({
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
    let result = await productSchema.findOne(
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
router.post('/', async function (req, res, next) {
  try {
    let newObj = new productSchema({
      title: req.body.title,
      slug: slugify(req.body.title, {
        replacement: '-', lower: true, locale: 'vi',
      }),
      price: req.body.price,
      description: req.body.description,
      category: req.body.categoryId,
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
    // let result = await productSchema.findOne(
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


    let result = await productSchema.findByIdAndUpdate(req.params.id,
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
    let result = await productSchema.findByIdAndUpdate(req.params.id,
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
