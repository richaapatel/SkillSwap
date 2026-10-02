const User = require('../models/User');
const Skill = require('../models/Skill');
const mongoose = require('mongoose');

// @desc    Get skill matches for the authenticated user
// @route   GET /api/matches
const getMatches = async (req, res) => {
  try {
    // Get current user with skill arrays
    const currentUser = await User.findById(req.user._id);

    if (!currentUser.skillsWanted || currentUser.skillsWanted.length === 0) {
      return res.status(200).json({
        matches: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });
    }

    // Convert current user's skill IDs to strings for comparison
    const wantedIds = currentUser.skillsWanted.map((id) => id.toString());
    const offeredIds = currentUser.skillsOffered.map((id) => id.toString());

    // Optional skill filter
    let filterSkillIds = wantedIds;

    if (req.query.skillId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.skillId)) {
        return res.status(400).json({ message: 'Invalid skill ID.' });
      }

      const skill = await Skill.findById(req.query.skillId);
      if (!skill) {
        return res.status(404).json({ message: 'Skill not found.' });
      }

      // Only filter if the current user actually wants this skill
      if (!wantedIds.includes(req.query.skillId)) {
        return res.status(200).json({
          matches: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        });
      }

      filterSkillIds = [req.query.skillId];
    }

    // Find candidates who offer at least one skill the current user wants
    const candidates = await User.find({
      _id: { $ne: currentUser._id },
      skillsOffered: { $in: filterSkillIds },
    })
      .select('-password -email')
      .populate('skillsOffered', 'name description category')
      .populate('skillsWanted', 'name description category');

    // Calculate match info for each candidate
    const matchResults = candidates.map((candidate) => {
      // Skills the candidate offers that the current user wants
      const skillsYouWant = candidate.skillsOffered.filter((skill) =>
        wantedIds.includes(skill._id.toString())
      );

      // Skills the current user offers that the candidate wants
      const skillsTheyWant = candidate.skillsWanted.filter((skill) =>
        offeredIds.includes(skill._id.toString())
      );

      const score = skillsYouWant.length + skillsTheyWant.length;
      const isTwoWayMatch = skillsYouWant.length > 0 && skillsTheyWant.length > 0;

      return {
        user: candidate,
        skillsYouWant: skillsYouWant.map((s) => ({ _id: s._id, name: s.name })),
        skillsTheyWant: skillsTheyWant.map((s) => ({ _id: s._id, name: s.name })),
        isTwoWayMatch,
        score,
      };
    });

    // Sort by score descending, then name ascending as tie-breaker
    matchResults.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.user.name.localeCompare(b.user.name);
    });

    // Pagination
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (page < 1) page = 1;
    if (limit < 1) limit = 1;
    if (limit > 50) limit = 50;

    const total = matchResults.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedResults = matchResults.slice(start, start + limit);

    res.status(200).json({
      matches: paginatedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getMatches };
