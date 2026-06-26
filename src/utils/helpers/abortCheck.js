

// to check abortef connections before every irreversible actions 
// like charging and other expensive operations
const withAbortCheck = (req) => {
  return {
    check: () => {
      if (req.signal?.aborted) {
        throw new Error('ABORTED');
      }
    },
    wrap: async (fn) => {
      if (req.signal?.aborted) return null;
      return await fn();
    }
  };
};


// export it
module.exports = withAbortCheck;



/**
 *  the wrap function example use case

await guard.wrap( async () => {
	return await Product.find();
});

*/
