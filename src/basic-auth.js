const bcrypt = require('bcrypt-nodejs');

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';
  let basicToken;

  if (!authToken.toLowerCase().startsWith('basic ')) {
    return res.status(401).json({ error: 'Missing basic token' });
  } else {
    basicToken = authToken.slice('basic '.length, authToken.length);
  }
  const [tokenEmail, tokenPassword] = Buffer.from(basicToken, 'base64')
    .toString()
    .split(':');

  if (!tokenEmail || !tokenPassword) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  req.app
    .get('db')('login')
    .where({ email: tokenEmail })
    .first()
    .then(userLog => {
      if (!userLog) {
        return res.status(401).json({ error: 'No user' });
      }

      return  bcrypt.compare(tokenPassword, userLog.hash, function(err, result) {
        if (err) {
          throw err;
        }
      
        req.app
          .get('db')('users')
          .where({ email: userLog.email })
          .first()
          .then(user => {
            req.user = user
          next()
          });
     })
      next();
    })
    .catch(next);
}

module.exports = {
  requireAuth
};
