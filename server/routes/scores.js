const router = require('express').Router();
const Score = require('../models/Score');
const authMiddleware = require('../middleware/auth');

// Submit score (requires auth)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { score, kills, timeAlive } = req.body;
    await Score.create({ userId: req.user.id, username: req.user.username, score, kills, timeAlive });
    res.json({ message: 'Score saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top scores - one per player (their best), all players shown
router.get('/', async (req, res) => {
  try {
    const scores = await Score.aggregate([
      { $sort: { score: -1, timeAlive: -1 } },
      { $group: {
        _id: '$username',
        doc: { $first: '$$ROOT' },
      }},
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { score: -1, timeAlive: -1 } },
      { $project: { _id: 1, username: 1, score: 1, kills: 1, timeAlive: 1, createdAt: 1 } }
    ]);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
