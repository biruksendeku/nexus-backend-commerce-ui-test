

// defining options
const sortOptions = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
};

// to use the request's sortBy arg
const buildSort = (sortBy) => {
  return sortOptions[sortBy] || sortOptions.newest;
};


// export the function
module.exports = buildSort;
