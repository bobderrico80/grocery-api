const chai = require('chai');
const Sequelize = require('sequelize');
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
    stub(logger, 'error');
  });

  afterEach(async () => {
    logger.error.restore();
  });

  describe('getAll function', () => {
    let res;

    beforeEach(async () => {
      Model.findAll = stub();
      res = { status: spy(), json: spy() };
    });

    describe('on success', () => {
      beforeEach(async () => {
        Model.findAll.resolves([{ foo: 'foo' }]);
        await restController.getAll({}, res);
      });

      it('responds with an array of resources', () =>
        expect(res.json).to.have.been.calledWith([{ foo: 'foo' }]));

      it('responds with a status code of 200', () =>
        expect(res.status).to.have.been.calledWith(200));
    });

    describe('on failure', () => {
      beforeEach(async () => {
        Model.findAll.rejects(new Error('something bad happened'));
        await restController.getAll({}, res);
      });

      it('responds with a "server error" message', () =>
        expect(res.json).to.have.been.calledWith({ message: 'server error' }));

      it('logs the actual error message', () =>
        expect(logger.error).to.have.been.calledWith('something bad happened'));

      it('responds with a status code of 500', () =>
        expect(res.status).to.have.been.calledWith(500));
    });
  });

  describe('getOne function', () => {
    let res;

    beforeEach(async () => {
      Model.findById = stub();
      res = { status: spy(), json: spy() };
    });

    describe('on success', () => {
      beforeEach(async () => {
        Model.findById.withArgs(42).resolves({ foo: 'foo' });
        await restController.getOne({ params: { id: 42 } }, res);
      });

      it('responds with the resource', () =>
        expect(res.json).to.have.been.calledWith({ foo: 'foo' }));

      it('responds with a status code of 200', () =>
        expect(res.status).to.have.been.calledWith(200));
    });

    describe('on a missing resource', () => {
      beforeEach(async () => {
        Model.findById.withArgs(42).resolves(null);
        await restController.getOne({ params: { id: 42 } }, res);
      });

      it('responds with a "not found" message', () =>
        expect(res.json).to.have.been.calledWith({ message: 'not found' }));

      it('responds with a status code of 404', () =>
        expect(res.status).to.have.been.calledWith(404));
    });

    describe('on failure', () => {
      beforeEach(async () => {
        Model.findById.withArgs(42).rejects(new Error('something bad happened'));
        await restController.getOne({ params: { id: 42 } }, res);
      });

      it('responds with a "server error" message', () =>
        expect(res.json).to.have.been.calledWith({ message: 'server error' }));

      it('logs the actual error message', () =>
        expect(logger.error).to.have.been.calledWith('something bad happened'));

      it('responds with a status code of 500', () =>
        expect(res.status).to.have.been.calledWith(500));
    });
  });

  describe('create function', () => {
    const newResource = { foo: 'foo' };
    let res;

    beforeEach(async () => {
      Model.create = stub();
      res = { status: spy(), json: spy() };
    });

    describe('on success', () => {
      beforeEach(async () => {
        Model.create.withArgs(newResource).resolves(newResource);
        await restController.create({ body: newResource }, res);
      });

      it('responds with the newly-created resource', () =>
        expect(res.json).to.have.been.calledWith({ foo: 'foo' }));

      it('responds with a status code of 201', () =>
        expect(res.status).to.have.been.calledWith(201));
    });

    describe('on a UniqueConstraintError', () => {
      let error;

      beforeEach(async () => {
        error = new Sequelize.UniqueConstraintError();
        Model.create.withArgs(newResource).rejects(error);
        await restController.create({ body: newResource }, res);
      });

      it('responds with the error', () => expect(res.json).to.have.been.calledWith(error));

      it('responds with a status code of 409', () =>
        expect(res.status).to.have.been.calledWith(409));
    });

    describe('on a ValidationError', () => {
      let error;

      beforeEach(async () => {
        error = new Sequelize.ValidationError();
        Model.create.withArgs(newResource).rejects(error);
        await restController.create({ body: newResource }, res);
      });

      it('responds with the error', () => expect(res.json).to.have.been.calledWith(error));

      it('responds with a status code of 400', () =>
        expect(res.status).to.have.been.calledWith(400));
    });

    describe('on other failures', () => {
      beforeEach(async () => {
        Model.create.withArgs(newResource).rejects(new Error('something bad happened'));
        await restController.create({ body: newResource }, res);
      });

      it('responds with a "server error" message', () =>
        expect(res.json).to.have.been.calledWith({ message: 'server error' }));

      it('logs the actual error message', () =>
        expect(logger.error).to.have.been.calledWith('something bad happened'));

      it('responds with a status code of 500', () =>
        expect(res.status).to.have.been.calledWith(500));
    });
  });

  describe('update function', () => {
    const existingResource = { toJSON: () => ({ foo: 'foo' }) };
    const updatedResource = { foo: 'foo', bar: 'bar' };
    let res;

    beforeEach(async () => {
      Model.findById = stub();
      existingResource.update = stub();
      res = { status: spy(), json: spy() };
    });

    describe('on success', () => {
      beforeEach(async () => {
        Model.findById.withArgs(42).resolves(existingResource);
        existingResource.update.withArgs(updatedResource).resolves(updatedResource);
        await restController.update({ body: { bar: 'bar' }, params: { id: 42 } }, res);
      });

      it('responds with the updated resource', () =>
        expect(res.json).to.have.been.calledWith(updatedResource));

      it('responds with a status code of 200', () =>
        expect(res.status).to.have.been.calledWith(200));
    });

    describe('on a missing resource', () => {
      beforeEach(async () => {
        Model.findById.withArgs(42).resolves(null);
        await restController.update({ body: { bar: 'bar' }, params: { id: 42 } }, res);
      });

      it('responds with a "not found" message', () =>
        expect(res.json).to.have.been.calledWith({ message: 'not found' }));

      it('responds with a status code of 404', () =>
        expect(res.status).to.have.been.calledWith(404));
    });

    describe('on a UniqueConstraintError', () => {
      let error;

      beforeEach(async () => {
        error = new Sequelize.UniqueConstraintError();
        Model.findById.withArgs(42).resolves(existingResource);
        existingResource.update.withArgs(updatedResource).rejects(error);
        await restController.update({ body: { bar: 'bar' }, params: { id: 42 } }, res);
      });

      it('responds with the error', () => expect(res.json).to.have.been.calledWith(error));

      it('responds with a status code of 409', () =>
        expect(res.status).to.have.been.calledWith(409));
    });

    describe('on a ValidationError', () => {
      let error;

      beforeEach(async () => {
        error = new Sequelize.ValidationError();
        Model.findById.withArgs(42).resolves(existingResource);
        existingResource.update.withArgs(updatedResource).rejects(error);
        await restController.update({ body: { bar: 'bar' }, params: { id: 42 } }, res);
      });

      it('responds with the error', () => expect(res.json).to.have.been.calledWith(error));

      it('responds with a status code of 400', () =>
        expect(res.status).to.have.been.calledWith(400));
    });

    describe('on other failures', () => {
      beforeEach(async () => {
        Model.findById.withArgs(42).resolves(existingResource);
        existingResource.update
          .withArgs(updatedResource)
          .rejects(new Error('something bad happened'));
        await restController.update({ body: { bar: 'bar' }, params: { id: 42 } }, res);
      });

      it('responds with a "server error" message', () =>
        expect(res.json).to.have.been.calledWith({ message: 'server error' }));

      it('logs the actual error message', () =>
        expect(logger.error).to.have.been.calledWith('something bad happened'));

      it('responds with a status code of 500', () =>
        expect(res.status).to.have.been.calledWith(500));
    });
  });

  describe('destroy function', () => {
    const existingResource = { foo: 'foo' };
    let res;

    beforeEach(async () => {
      Model.findById = stub();
      existingResource.destroy = stub();
      res = { status: spy(), send: spy(), json: spy() };
    });

    describe('on success', () => {
      beforeEach(async () => {
        Model.findById.withArgs(42).resolves(existingResource);
        existingResource.destroy.withArgs().resolves();
        await restController.destroy({ params: { id: 42 } }, res);
      });

      it('responds with an empty body', async () => expect(res.send).to.have.been.called);

      it('responds with a status code of 204', () =>
        expect(res.status).to.have.been.calledWith(204));
    });

    describe('on a missing resource', () => {
      beforeEach(async () => {
        Model.findById.withArgs(42).resolves(null);
        await restController.destroy({ params: { id: 42 } }, res);
      });

      it('responds with a "not found" message', () =>
        expect(res.json).to.have.been.calledWith({ message: 'not found' }));

      it('responds with a status code of 404', () =>
        expect(res.status).to.have.been.calledWith(404));
    });

    describe('on other failures', () => {
      beforeEach(async () => {
        Model.findById.withArgs(42).resolves(existingResource);
        existingResource.destroy.withArgs().rejects(new Error('something bad happened'));
        await restController.destroy({ params: { id: 42 } }, res);
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
