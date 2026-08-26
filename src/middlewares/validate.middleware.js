const validate = (schema) => {
  try {
    return (req, res, next) => {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error.issues.map((err) => err.message),
        });
      }
      req.body = result.data;
      next();
    };
  } catch (error) {
    next(error);
  }
};

export { validate };
