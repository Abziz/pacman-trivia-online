const express = require('express');
const bcrypt = require('bcrypt');

/**
 * we export a function that takes a list of users and returns 
 * an api router that manages users
 * example usage:
 * const authApi = require("/api/auth");
 * app.use("api",authApi(users))
 */
module.exports = (users) => {
	const router = express.Router();
	router.post('/auth/register', (req, res) => {
		const { username, password } = req.body;
		//check if username is valid
		if (!username || username.length < 4) {
			res.status(400).json({ message: 'username should be more than 4 characters' });
			return;
		}
		//check if password is valid
		if (!password || password.length < 4) {
			res.status(400).json({ message: 'password should be more than 4 characters' });
			return;
		}
		//check if username already exists
		if (users.find(u => u.username === username)) {
			res.status(400).json({ message: 'a user with this username already exists' });
			return;
		}
		//generate hash from password (never store plain text passwords anywhere)
		//also hash algorithm is simple, we need to add salt ( random string to mix with the hashing)
		const salt = bcrypt.genSaltSync();
		const hashedPassword = bcrypt.hashSync(password, salt);
		//store the username hashed password and salt so we can compare login hashes
		users.push({ username, password: hashedPassword, salt });
		res.status(201).end();
	});

	router.post('/auth/login', (req, res) => {
		const { username, password } = req.body;
		//check if credentials are valid
		if (!username || username.length < 4 || !password || password.length < 4) {
			res.status(400).json({ message: 'invalid username or password' });
			return;
		}
		//find the user in the list of users by his username
		const user = users.find(u => u.username === username);
		if (!user) {
			//good practice to not give details about failed authentication
			res.status(400).json({ message: 'invalid username or password' });
			return;
		}
		// create hash from the password given in the request and use found user's salt
		const hashedPassword = bcrypt.hashSync(password, user.salt);
		if (hashedPassword !== user.password) {
			res.status(400).json({ message: 'invalid username or password' });
			return;
		}
		// user authenticated successfully 
		// in a real life scenario we would:
		// 1.create a token and store it 
		// 2.send the token back to the client so that the client could send it in future requests 
		// 3.when we recieve a future request we will check if the client's token is in our store
		res.status(200).end();
		return;
	});
	return router;
};



