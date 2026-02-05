// src/controllers/category.controller.js
import * as CategoryService from '../services/category.service.js'

export const findAll = async (req, res, next) => {
  try {
    const categories = await CategoryService.getCategories()
    res.json(categories)
  } catch (err) {
    next(err)
  }
}

export const create = async (req, res, next) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Category name required' })
    }

    const category = await CategoryService.createCategory(name)
    res.status(201).json({
      message: 'Category created',
      category,
    })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Category already exists' })
    }
    next(err)
  }
}

export const update = async (req, res, next) => {
  try {
    const category = await CategoryService.updateCategory(
      req.params.id,
      req.body.name
    )

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    res.json({
      message: 'Category updated',
      category,
    })
  } catch (err) {
    next(err)
  }
}

export const remove = async (req, res, next) => {
  try {
    await CategoryService.deleteCategory(req.params.id)
    res.json({ message: 'Category deleted' })
  } catch (err) {
    next(err)
  }
}
