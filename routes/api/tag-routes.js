const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      include: [{ model: Product, through: ProductTag, as: 'products' }],
    });
    res.status(200).json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving tags', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag, as: 'products' }],
    });
    if (!tag) {
      res.status(404).json({ message: 'No tag found with this id' });
      return;
    }
    res.status(200).json(tag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving tag', error: err.message });
  }
});

// Create a new tag
router.post('/', async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(201).json(tag);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error creating tag', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updateCount] = await Tag.update(req.body, {
      where: { id: req.params.id },
    });
    if (updateCount === 0) {
      res.status(404).json({ message: 'No tag found with this id' });
      return;
    }
    const updatedTag = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag, as: 'products' }],
    });
    res.status(200).json(updatedTag);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error updating tag', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleteCount = await Tag.destroy({
      where: { id: req.params.id },
    });
    if (deleteCount === 0) {
      res.status(404).json({ message: 'No tag found with this id' });
      return;
    }
    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting tag', error: err.message });
  }
});

module.exports = router;