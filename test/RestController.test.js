const chai = require('chai');
const { stub, spy } = require('sinon');
const sinonChai = require('sinon-chai');
const logger = require('../lib/logger');
const RestController = require('../lib/RestController');

chai.use(sinonChai);
const { expect } = chai;

describe('The RestController module', () => {
  let restController;
  let Model;

  beforeEach(async () => {
    Model = {};
    restController = RestController(Model);
  });

  describe('getAll function', () => {
    let res;

    beforeEach(async () => {
      Model.findAll = stub();
      res = { status: spy(), json: spy() };
    });

    describe('success state', () => {
      beforeEach(async () => {
        Model.findAll.resolves([{ foo: 'foo' }]);
        await restController.getAll({}, res);
      });

      it('responds with an array of resources', () =>
        expect(res.json).to.have.been.calledWith([{ foo: 'foo' }]));

      it('responds with a status code of 200', () =>
        expect(res.status).to.have.been.calledWith(200));
    });

    describe('failure state', () => {
      beforeEach(async () => {
        Model.findAll.rejects(new Error('something bad happened'));
        stub(logger, 'error');
        await restController.getAll({}, res);
      });

      afterEach(async () => {
        logger.error.restore();
      });

      it('responds with a "server error" message', () =>
        expect(res.json).to.have.been.calledWith({ message: 'server error' }));

      it('logs the actual error message', () =>
        expect(logger.error).to.have.been.calledWith('something bad happened'));

      it('responds with a status code of 500', () =>
        expect(res.status).to.have.been.calledWith(500));
    });
  });
});
