// Example server 
const express = require('express')
const app = express()
const cors = require("cors");
const bodyParser = require('body-parser')
app.use(cors());
app.use(bodyParser.text());

// Replace items map with database
const items = new Map();

// Get item
app.get('/', (req, res) => {
	const key = req.query.key
	console.log(new Date().toLocaleTimeString(), "<", key, items.get(key));
	res.status(200).send(items.get(key));
})

// Update item
app.post('/', (req, res) => {
	const key = req.query.key
	items.set(key, req.body)
	console.log(new Date().toLocaleTimeString(), ">", key, req.body);
	res.status(200).end();
})

// Delete item value
app.delete('/', (req, res) => {
	const key = req.query.key
	items.delete(key);
	console.log(new Date().toLocaleTimeString(), "x", key);
	res.status(200).end();
})

// Start sderver
const port = 4000
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})