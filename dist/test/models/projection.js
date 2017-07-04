"use strict";
var mongoose = require('mongoose');
var testServer = require('../testServer');
describe('Document projection (GET ?project=[key])', function () {
    var personSchema;
    var storySchema;
    var publisherSchema;
    var Person;
    var Story;
    var Publisher;
    var aaron;
    var publisher1;
    var story1;
    var server;
    before(function (done) {
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
        aaron.save(function (err) {
            if (err) {
                done(err);
            }
            publisher1.save(function (err) {
                if (err) {
                    done(err);
                }
                story1 = new Story({
                    title: 'Once upon a time.',
                    creator: aaron._id,
                    publisher: publisher1._id
                });
                story1.save(function (err) {
                    if (err) {
                        done(err);
                    }
                    testServer
                        .create({ resources: [Person, Story, Publisher] })
                        .then(function (createdServer) {
                        server = createdServer;
                        done();
                    })
                        .catch(done);
                });
            });
        });
    });
    after(function (done) {
        Person.remove({}, function (err) {
            if (err) {
                done(err);
            }
            Publisher.remove({}, function (err) {
                if (err) {
                    done(err);
                }
                Story.remove({}, function (err) {
                    if (err) {
                        done(err);
                    }
                    server.stop(done);
                });
            });
        });
    });
    it('should return the projected items on get list', function (done) {
        server.createRequest()
            .get('/storys?project=creator')
            .then(function (res, done) {
            var result = JSON.parse(res.result);
            result.creator.should.be.a.Array();
            result.creator[0].should.be.a.Object();
            result.creator[0].should.have.keys('id', 'name', 'age', 'stories');
            result.creator[0].name.should.equal('Aaron');
            result.creator[0].age.should.equal(100);
            done();
        })
            .end(done);
    });
    it('should return the projected items on get item', function (done) {
        server.createRequest()
            .get('/storys/' + story1._id + '?project=creator')
            .then(function (res, done) {
            var result = JSON.parse(res.result);
            result.creator.should.be.a.Array();
            result.creator[0].should.be.a.Object();
            result.creator[0].should.have.keys('id', 'name', 'age', 'stories');
            result.creator[0].name.should.equal('Aaron');
            result.creator[0].age.should.equal(100);
            done();
        })
            .end(done);
    });
    it('should return multiple projected items on get list', function (done) {
        server.createRequest()
            .get('/storys?project=creator,publisher')
            .then(function (res, done) {
            var result = JSON.parse(res.result);
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
    it('should return multiple projected items on get item', function (done) {
        server.createRequest()
            .get('/storys/' + story1._id + '?project=creator,publisher')
            .then(function (res, done) {
            var result = JSON.parse(res.result);
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
    it('should return 400 for invalid projection on list', function (done) {
        server.createRequest()
            .get('/storys?project=invalid')
            .thenStatusCodeShouldEqual(400)
            .end(done);
    });
    it('should return 400  for invalid projection on item', function (done) {
        server.createRequest()
            .get('/storys/' + story1._id + '?project=invalid')
            .thenStatusCodeShouldEqual(400)
            .end(done);
    });
});
//# sourceMappingURL=projection.js.map