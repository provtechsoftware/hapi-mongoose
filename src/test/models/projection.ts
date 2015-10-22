/// ts:ref=mocha
/// <reference path="../../../typings/mocha/mocha.d.ts"/> ///ts:ref:generated
/// ts:ref=should
/// <reference path="../../../typings/should/should.d.ts"/> ///ts:ref:generated
/// ts:ref=hapi
/// <reference path="../../../typings/hapi/hapi.d.ts"/> ///ts:ref:generated
/// ts:ref=mongoose
/// <reference path="../../../typings/mongoose/mongoose.d.ts"/> ///ts:ref:generated
/* tslint:disable:no-unused-variable */

import * as should from 'should';
import * as mongoose from 'mongoose';
import * as testServer from '../testServer';

describe('Document projection (GET ?project=[key])', () => {
  let personSchema: mongoose.Schema;
  let storySchema: mongoose.Schema;
  let publisherSchema: mongoose.Schema;
  let Person: mongoose.Model<mongoose.Document>;
  let Story: mongoose.Model<mongoose.Document>;
  let Publisher: mongoose.Model<mongoose.Document>;
  let aaron: any;
  let publisher1: any;
  let story1: any;

  let server: testServer.Server;

  before((done: MochaDone) => {
    personSchema = new mongoose.Schema({
      name: String,
      age: Number,
      stories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }]
    });

    publisherSchema = new mongoose.Schema({
      name: String
    });

    storySchema = new mongoose.Schema({
      creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
      publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' },
     	title: String,
      fans: [{ type: Number, ref: 'Person' }]
    });

    Story = mongoose.model('Story', storySchema);
    Person = mongoose.model('Person', personSchema);
    Publisher = mongoose.model('Publisher', publisherSchema);

    aaron = new Person({ name: 'Aaron', age: 100 });
    publisher1 = new Publisher({ name: 'publisher1' });

    aaron.save((err: any) => {
      if (err) {
        done(err);
      }

      publisher1.save((err: any) => {
        if (err) {
          done(err);
        }

        story1 = new Story({
          title: 'Once upon a time.',
          creator: aaron._id,
          publisher: publisher1._id
        });

        story1.save((err: any) => {
          if (err) {
            done(err);
          }

          testServer
            .create({ resources: [Person, Story, Publisher] })
            .then((createdServer: testServer.Server) => {
              server = createdServer;
              done();
            })
            .catch(done);
        });
      });
    });
  });

  after((done: MochaDone) => {
    Person.remove({}, (err: any) => {
      if (err) {
        done(err);
      }

      Publisher.remove({}, (err: any) => {
        if (err) {
          done(err);
        }

        Story.remove({}, (err: any) => {
          if (err) {
            done(err);
          }
          server.stop(done);
        });
      });
    });
  });

  it('should return the projected items on get list', (done: MochaDone) => {
    server.createRequest()
      .get('/storys?project=creator')
      .then((res: any, done: MochaDone) => {
        let result = JSON.parse(res.result);
        result.creator.should.be.a.Array();
        result.creator[0].should.be.a.Object();
        result.creator[0].should.have.keys('id', 'name', 'age', 'stories');
        result.creator[0].name.should.equal('Aaron');
        result.creator[0].age.should.equal(100);
        done();
      })
      .end(done);
  });

  it('should return the projected items on get item', (done: MochaDone) => {
    server.createRequest()
      .get('/storys/' + story1._id + '?project=creator')
      .then((res: any, done: MochaDone) => {
        let result = JSON.parse(res.result);
        result.creator.should.be.a.Array();
        result.creator[0].should.be.a.Object();
        result.creator[0].should.have.keys('id', 'name', 'age', 'stories');
        result.creator[0].name.should.equal('Aaron');
        result.creator[0].age.should.equal(100);
        done();
      })
      .end(done);
  });

  it('should return multiple projected items on get list', (done: MochaDone) => {
    server.createRequest()
      .get('/storys?project=creator,publisher')
      .then((res: any, done: MochaDone) => {
        let result = JSON.parse(res.result);

        result.creator.should.be.a.Array();
        result.creator[0].should.be.a.Object();
        result.creator[0].should.have.keys('id', 'name', 'age', 'stories');
        result.creator[0].name.should.equal('Aaron');
        result.creator[0].age.should.equal(100);
        result.publisher[0].should.be.a.Object();
        result.publisher[0].should.have.keys('id', 'name');
        result.publisher[0].name.should.equal('publisher1');
        done();
      })
      .end(done);
  });

  it('should return multiple projected items on get item', (done: MochaDone) => {
    server.createRequest()
      .get('/storys/' + story1._id + '?project=creator,publisher')
      .then((res: any, done: MochaDone) => {
        let result = JSON.parse(res.result);

        result.creator.should.be.a.Array();
        result.creator[0].should.be.a.Object();
        result.creator[0].should.have.keys('id', 'name', 'age', 'stories');
        result.creator[0].name.should.equal('Aaron');
        result.creator[0].age.should.equal(100);
        result.publisher[0].should.be.a.Object();
        result.publisher[0].should.have.keys('id', 'name');
        result.publisher[0].name.should.equal('publisher1');
        done();
      })
      .end(done);
  });

  it('should return 400 for invalid projection on list', (done: MochaDone) => {
    server.createRequest()
      .get('/storys?project=invalid')
      .thenStatusCodeShouldEqual(400)
      .end(done);
  });

  it('should return 400  for invalid projection on item', (done: MochaDone) => {
    server.createRequest()
      .get('/storys/' + story1._id + '?project=invalid')
      .thenStatusCodeShouldEqual(400)
      .end(done);
  });
});
