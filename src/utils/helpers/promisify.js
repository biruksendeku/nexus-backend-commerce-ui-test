

// a helper function to create async function 
// unlike callback ones, for the purpose of 
// express-async-errors to catch async errors
const promisify = (fn) => {
  return new Promise((resolve, reject) => {
    fn((err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};


// export it
module.exports = promisify;
