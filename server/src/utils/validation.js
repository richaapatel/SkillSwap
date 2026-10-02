const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const isValidEmail = (value) => typeof value === 'string' && emailPattern.test(value.trim());

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePagination = (query, defaults = {}) => {
  const defaultPage = defaults.page || 1;
  const defaultLimit = defaults.limit || 10;
  const maxLimit = defaults.maxLimit || 50;
  const rawPage = query.page;
  const rawLimit = query.limit;

  if (rawPage !== undefined && !/^\d+$/.test(String(rawPage))) {
    return { error: 'Page must be a positive integer.' };
  }

  if (rawLimit !== undefined && !/^\d+$/.test(String(rawLimit))) {
    return { error: 'Limit must be a positive integer.' };
  }

  const page = rawPage === undefined ? defaultPage : Number(rawPage);
  const limit = rawLimit === undefined ? defaultLimit : Number(rawLimit);

  if (!Number.isSafeInteger(page) || page < 1) {
    return { error: 'Page must be a positive integer.' };
  }

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > maxLimit) {
    return { error: `Limit must be between 1 and ${maxLimit}.` };
  }

  return { page, limit };
};

const getDatabaseError = (error, fallback = 'Server error.') => {
  if (error?.code === 11000) {
    return { status: 409, message: 'A record with those details already exists.' };
  }

  if (error?.name === 'ValidationError') {
    return { status: 400, message: 'The submitted data is invalid.' };
  }

  if (error?.name === 'CastError') {
    return { status: 400, message: 'One or more provided IDs are invalid.' };
  }

  return { status: 500, message: fallback };
};

module.exports = {
  escapeRegex,
  getDatabaseError,
  isNonEmptyString,
  isValidEmail,
  parsePagination,
};
