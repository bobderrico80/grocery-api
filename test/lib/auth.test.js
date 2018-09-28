const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { stub, spy } = require('sinon');
const { copyPropertyValues } = require('../utils');
const auth = require('../../lib/auth');
const logger = require('../../lib/logger');

describe('The auth module', () => {
  describe('jwtVerify() function', () => {
    const user = { id: 1 };

    let User;
    let jwtVerify;
    let done;

    beforeEach(async () => {
      User = { findById: stub() };
      User.findById.withArgs(user.id).resolves(user);
      done = spy();
      jwtVerify = auth.jwtVerify(User);
    });

    it('calls done() with user found from JWT payload', async () => {
      await jwtVerify({ id: user.id }, done);
      expect(done).to.have.been.calledWith(null, user);
    });

    it('calls done() with `false` if user could not be found', async () => {
      await jwtVerify({ id: 2 }, done);
      expect(done).to.have.been.calledWith(null, false);
    });

    it('calls done() with `false` the token does not contain an ID property (as in an error condition)', async () => {
      await jwtVerify({ error: 'invalid signature' }, done);
      expect(done).to.have.been.calledWith(null, false);
    });

    it('calls done() with an error if an error occurs during verification', async () => {
      const error = new Error();
      User.findById.withArgs(user.id).rejects(error);

      await jwtVerify({ id: user.id }, done);

      expect(done).to.have.been.calledWith(error);
    });
  });

  describe('The authenticate() function', () => {
    const req = {};
    const res = { status: spy(), json: spy() };

    let next;
    let error;
    let user;
    let info;

    beforeEach(async () => {
      stub(passport, 'authenticate').callsFake((strategy, options, callback) => () =>
        callback(error, user, info));
      stub(logger, 'info');
      user = {};
      next = spy();
    });

    it('calls next() if a user is provided', async () => {
      auth.authenticate(req, res, next);
      return expect(next).to.be.called;
    });

    it('responds with 401 if user is not provided', async () => {
      user = false;
      auth.authenticate(req, res, next);
      expect(res.status).to.be.calledWith(401);
    });

    it('calls next() with an error if an error is provided', async () => {
      error = new Error();
      auth.authenticate(req, res, next);
      expect(next).to.be.calledWith(error);
    });

    it('logs the info object if it is provided', async () => {
      info = 'info';
      auth.authenticate(req, res, next);
      expect(logger.info).to.be.calledWith('info');
    });

    afterEach(async () => {
      passport.authenticate.restore();
      logger.info.restore();
    });
  });

  describe('createJwt() function', () => {
    const originalJwtOptions = { ...auth.jwtOptions };
    const user = { id: 1 };

    beforeEach(async () => {
      auth.jwtOptions.secretOrKey = 'secret';
      auth.jwtOptions.issuer = 'issuer';
      auth.jwtOptions.audience = 'audience';
      auth.jwtOptions.expiresIn = 1;
      stub(jwt, 'sign');
      jwt.sign.returns('the token');
    });

    it('returns the generated token', () => expect(auth.createJwt(user)).to.equal('the token'));

    it('correctly configures jwt.sign()', async () => {
      auth.createJwt(user);
      expect(jwt.sign).to.be.calledWith({ id: 1 }, 'secret', {
        expiresIn: 1,
        audience: 'audience',
        issuer: 'issuer',
      });
    });

    afterEach(async () => {
      jwt.sign.restore();

      // Reset the origin JWT options
      copyPropertyValues(originalJwtOptions, auth.jwtOptions);
    });
  });
});
