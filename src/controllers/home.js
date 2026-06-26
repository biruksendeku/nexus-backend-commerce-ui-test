

exports.getHomepage = (req, res) => {

	res.status(200).json({
		success: true,
		message: "Welcome to the Homepage!"
	});
};
