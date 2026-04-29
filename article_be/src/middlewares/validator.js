// src/middlewares/validator.js
import { body, validationResult } from 'express-validator';

/**
 * Middleware that checks the result of express-validator chains.
 * If validation errors exist, responds with 422 and a structured error list.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      details: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

/* ========================
   ARTICLE VALIDATION RULES
======================== */
export const articleCreateRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required'),
  body('category_id')
    .notEmpty().withMessage('Category is required')
    .isInt({ gt: 0 }).withMessage('Category must be a valid ID'),
];

export const articleUpdateRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required'),
  body('category_id')
    .notEmpty().withMessage('Category is required')
    .isInt({ gt: 0 }).withMessage('Category must be a valid ID'),
];

export const rejectRules = [
  body('reason')
    .trim()
    .notEmpty().withMessage('Rejection reason is required')
    .isLength({ min: 5 }).withMessage('Reason must be at least 5 characters'),
];
