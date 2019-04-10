const core = require('../');
const expect = require('chai').expect;

describe('#basic', function() {
  let app = null;

  beforeEach(function() {
    if(!app) {
      app = core();
      app.run();
    }
  })

  afterEach(function() {
    if (app) {
      app.close();
    }
    app = null;
  });

  it('base event', function(done) {
    let flag = false;
    app.on('test', function() {
      // flag = true;
      // expect(flag).to.be.ok;
      done()
    });

    app.emit('test');
  });

  it('base object', function() {
    expect(app.io).to.be.an('object');
    expect(app.settings).to.be.an('object');
    expect(app.storage).to.be.an('object');
    expect(app.components).to.be.an('array');
  });

  it('base function', function() {
    expect(app.run).to.be.a('function')
    expect(app.close).to.be.a('function');
    expect(app.set).to.be.a('function');
    expect(app.get).to.be.a('function');
    expect(app.enabled).to.be.a('function');
    expect(app.disabled).to.be.a('function');
    expect(app.enable).to.be.a('function');
    expect(app.disable).to.be.a('function');
    expect(app.load).to.be.a('function');
    expect(app.reset).to.be.a('function');
    expect(app.on).to.be.a('function');
    expect(app.emit).to.be.a('function');
  });

  it('base settings', function() {
    expect(app.settings).to.be.deep.equal({
      env: 'development',
      port: '23256',
      verbose: false,
      webserviceHomepage: "",
    });
  })
});

// TODO
