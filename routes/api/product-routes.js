const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag, through: ProductTag, as: 'tags' }
      ],
    });
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products', error: err });
  }
});

// Get one product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Tag, through: ProductTag, as: 'tags' }
      ],
    });
    if (!product) {
      res.status(404).json({ message: 'Product with this id was not found' });
      return;
    }
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch product', error: err });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    if (req.body.tagIds?.length) {
      const productTagIdArr = req.body.tagIds.map(tag_id => ({
        product_id: product.id,
        tag_id,
      }));
      await ProductTag.bulkCreate(productTagIdArr);
    }
    const result = await Product.findByPk(product.id, {
      include: [{ model: Tag, through: ProductTag, as: 'tags' }]
    });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create product', error: err });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const [updateCount] = await Product.update(req.body, {
      where: { id: req.params.id },
    });

    if (updateCount === 0) {
      res.status(404).json({ message: 'No product found with this id' });
      return;
    }

    const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });
    const productTagIds = productTags.map(({ tag_id }) => tag_id);

    const newProductTags = req.body.tagIds
      .filter(tag_id => !productTagIds.includes(tag_id))
      .map(tag_id => ({ product_id: req.params.id, tag_id }));

    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);

    const updatedProduct = await Product.findByPk(req.params.id, {
      include: [{ model: Tag, through: ProductTag, as: 'tags' }]
    });
    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update product', error: err });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const productDeleted = await Product.destroy({
      where: { id: req.params.id },
    });
    if (productDeleted === 0) {
      res.status(404).json({ message: 'Product with this id was not found' });
      return;
    }
    res.status(200).json({ message: 'Product was successfully deleted!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete product', error: err });
  }
});

module.exports = router;