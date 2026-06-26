

// import custom function
const buildSearchQuery = require('./buildSearchQuery');

// a reusable function to filter products
const buildFilter = (query) => {
  const { search, category, minPrice, maxPrice } = query;
  const filter = {};

  // Search by name (using the correct parameter name)
  if (search && search.trim() !== '') {
    Object.assign(filter, buildSearchQuery(search));
  }

  // Filter by category
  if (category && category.trim() !== '') {
    filter.category = category.trim();
  }

  // Filter by price range (using the real field name)
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Only show in-stock items by default (using the real field name)
  filter.quantity = { $gt: 0 };

  return filter;
};


// export the function
module.exports = buildFilter;
