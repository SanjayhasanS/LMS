const jwt = require('jsonwebtoken')
const users = require('../models/usermodel')

const authmiddleware = async (req, res, next) => {
  const authheader = req.headers.authorization
  if (!authheader || !authheader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'authorization token required' })
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ msg: 'JWT_SECRET is not configured' })
  }

  const token = authheader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const existinguser = await users
      .findById(decoded.id)
      .select('_id name email role')

    if (!existinguser) {
      return res.status(401).json({ msg: 'user not found for token' })
    }

    req.user = {
      id: existinguser._id.toString(),
      name: existinguser.name,
      email: existinguser.email,
      role: existinguser.role
    }
    next()
  } catch (error) {
    return res.status(401).json({ msg: 'invalid or expired token' })
  }
}

module.exports = authmiddleware