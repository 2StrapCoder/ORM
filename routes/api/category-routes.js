const router = require('express').Router();
const { Category, Product } = require('../../models');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    if (!category) {
      res.status(404).json({ message: 'No category with this id was found.' });
      return;
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updateResult = await Category.update(req.body, {
      where: { id: req.params.id },
    });
    if (updateResult[0] === 0) {
      res.status(404).json({ message: 'Category with this id was not found' });
      return;
    }
    const updatedCategory = await Category.findByPk(req.params.id);
    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const categoryDeleted = await Category.destroy({
      where: { id: req.params.id },
    });
    if (categoryDeleted === 0) {
      res.status(404).json({ message: 'Category with this id was not found' });
      return;
    }
    res.status(200).json({ message: 'Category was deleted!' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;