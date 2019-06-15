const express = require('express');
const router = express.Router();
let nextItemId = 5;
const items = [
	{ id: 1, name: 'item 1' },
	{ id: 2, name: 'item 2' },
	{ id: 3, name: 'item 3' },
	{ id: 4, name: 'item 4' }
];
router.get('/items', (req, res) => {
	res.json(items);
});
router.get('/items/:id', (req, res) => {
	const { id } = req.params;
	const item = items.find(item => item.id == id);
	if (!item) {
		res.status(404).end();
		return;
	}
	res.json(item);
});
router.post('/items', (req, res) => {
	const { name } = req.body;
	const item = { id: nextItemId++, name };
	items.push(item);
	res.json(item);
});
router.put('/items/:id', (req, res) => {
	const { id } = req.params;
	const { name } = req.body;
	const item = items.find(item => item.id == id);
	console.log(item);
	if (!item) {
		res.status(404).end();
		return;
	}
	item.name = name;
	res.json(item);
});
router.delete('/items/:id', (req, res) => {
	const { id } = req.params;
	const index = items.findIndex(item => item.id == id);
	if (index === -1) {
		res.status(404).end();
		return;
	}
	const [deleted] = items.splice(index, 1);
	res.json(deleted);
});

module.exports = router;