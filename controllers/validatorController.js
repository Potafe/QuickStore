const { body, validationResult } = require("express-validator");

export const signUpValidator = [
  body("first_name").notEmpty().withMessage("First name is required"),
  body("last_name").notEmpty().withMessage("Last name is required"),
  body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Email is invalid"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

export const signUpValidate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};
