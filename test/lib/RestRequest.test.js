const chai = require('chai');
const Sequelize = require('sequelize');
const { stub, spy } = require('sinon');
const sinonChai = require('sinon-chai');
const logger = require('../../lib/logger');
const NotFoundError = require('../../lib/NotFoundError');
const RestRequest = require('../../lib/RestRequest');

const { expect } = chai;

chai.use(sinonChai);

describe('The RestRequest module', () => {
  const req = {};
  const options = {};
  let res;

  let restRequest;

  beforeEach(async () => {
    res = { status: spy(), json: spy(), send: spy() };
    stub(logger, 'error');
    restRequest = new RestRequest(req, res, options);
  });

  afterEach(async () => {
    logger.error.restore();
  });

  describe('handling of successful responses with no data', () => {
    beforeEach(async () => {
      restRequest.respond();
    });

    it('calls res.status() with 200', () => expect(res.status).to.have.been.calledWith(200));

    it('calls res.send()', async () => expect(res.send).to.have.been.called);
  });

  describe('handling of successful responses with data', () => {
    beforeEach(async () => {
      restRequest.withData({ foo: 'foo' }).respond();
    });

    it('calls res.status() with 200', () => expect(res.status).to.have.been.calledWith(200));

    it('calls res.json() with the data object', () =>
      expect(res.json).to.have.been.calledWith({ foo: 'foo' }));
  });

  describe('with a non-default status code', () => {
    beforeEach(async () => {
      restRequest.withStatus(201).respond();
    });

    it('calls res.status() with 201', () => expect(res.status).to.have.been.calledWith(201));
  });

  describe('with an error', () => {
    beforeEach(async () => {
      restRequest.withError(new Error('something bad happened')).respond();
    });

    it('calls res.status() with 500', () => expect(res.status).to.have.been.calledWith(500));

    it('calls res.json() with the expected error message', () =>
      expect(res.json).to.have.been.calledWith({ message: 'server error' }));

    it('logs the error message', () =>
      expect(logger.error).to.have.been.calledWith('something bad happened'));
  });

  describe('with a NotFoundError', () => {
    beforeEach(async () => {
      restRequest.withError(new NotFoundError('not found')).respond();
    });

    it('calls res.status() with 404', () => expect(res.status).to.have.been.calledWith(404));

    it('calls res.json() with the expected error message', () =>
      expect(res.json).to.have.been.calledWith({ message: 'not found' }));
  });

  describe('with a Sequelize.UniqueConstraintError', () => {
    const error = new Sequelize.UniqueConstraintError();

    beforeEach(async () => {
      restRequest.withError(error).respond();
    });

    it('calls res.status() with 409', () => expect(res.status).to.have.been.calledWith(409));

    it('calls res.json() with the error object', () =>
      expect(res.json).to.have.been.calledWith(error));
  });

  describe('with a Sequelize.ValidationError', () => {
    const error = new Sequelize.ValidationError();

    beforeEach(async () => {
      restRequest.withError(error).respond();
    });

    it('calls res.status() with 400', () => expect(res.status).to.have.been.calledWith(400));

    it('calls res.json() with the error object', () =>
      expect(res.json).to.have.been.calledWith(error));
  });

  describe('with a responseDataFilter', () => {
    beforeEach(async () => {
      options.responseDataFilter = (request, response, data) => ({ foo: data.foo.toUpperCase() });
      restRequest.withData({ foo: 'foo' }).respond();
    });

    it('calls res.json() with the filtered data object', () =>
      expect(res.json).to.have.been.calledWith({ foo: 'FOO' }));
  });

  describe('with a responseDataFilter that throws an error', () => {
    beforeEach(async () => {
      options.responseDataFilter = () => {
        throw new Error('whoops');
      };
      restRequest.withData({ foo: 'foo' }).respond();
    });

    it('calls res.status() with 500', () => expect(res.status).to.have.been.calledWith(500));

    it('calls res.json() with the expected error message', () =>
      expect(res.json).to.have.been.calledWith({ message: 'server error' }));

    it('logs the error message', () => expect(logger.error).to.have.been.calledWith('whoops'));
  });
});
