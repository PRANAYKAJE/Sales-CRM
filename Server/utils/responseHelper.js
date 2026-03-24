const successResponse = (res, data, message = 'Success', pagination = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    data,
  };
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

const errorResponse = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = { successResponse, errorResponse };
