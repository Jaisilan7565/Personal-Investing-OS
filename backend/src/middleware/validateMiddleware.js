const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return res.status(400).json({
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
  req.body = result.data;
  next();
};

module.exports = { validateBody };
