var expect = require('chai').expect;

var stream = require('stream');

var fileServer = require('./../index.js');

var StreamTest = require('streamtest');
 
describe('fileServer', function() {
 
  // Iterating through versions 
  StreamTest.versions.forEach(function(version) {
 
    describe('for ' + version + ' streams', function() {

      it('should work for a defined substitute', function(done) {
 
        StreamTest[version].fromChunks(['{"main":"mainVal"{{ sub }}}'])
          .pipe(new fileServer({sub:',"test":"testVal"'}))
          .pipe(StreamTest[version].toText(function(err, text) {
            if(err) {
              done(err);
            }
            var obj = "";
            console.log("Text: "+text);
            try{
              obj = JSON.parse(text);
            }
            catch(e){
              expect(obj).to.be.a("object");
            }
            expect(JSON.stringify(obj)).to.equal(JSON.stringify({main:"mainVal",test:"testVal"}));
            done();
          }));
 
      });
 
      // here goes your code 
      it('should work for a true conditional', function(done) {
 
        StreamTest[version].fromChunks(['{"main":"mainVal"{!{one:,"test":"testVal"}!}}'])
          .pipe(new fileServer({one:true}))
          .pipe(StreamTest[version].toText(function(err, text) {
            if(err) {
              done(err);
            }
            var obj = "";
            console.log("Text: "+text);
            try{
              obj = JSON.parse(text);
            }
            catch(e){
              expect(obj).to.be.a("object");
            }
            expect(JSON.stringify(obj)).to.equal(JSON.stringify({main:"mainVal",test:"testVal"}));
            done();
          }));
 
      });

      it('should work for a false conditional', function(done) {
 
        StreamTest[version].fromChunks(['{"main":"mainVal"{!{one:,"test":"testVal"}!}}'])
          .pipe(new fileServer({}))
          .pipe(StreamTest[version].toText(function(err, text) {
            if(err) {
              done(err);
            }
            var obj = "";
            console.log("Text: "+text);
            try{
              obj = JSON.parse(text);
            }
            catch(e){
              expect(obj).to.be.a("object");
            }
            expect(JSON.stringify(obj)).to.equal(JSON.stringify({main:"mainVal"}));
            done();
          }));
 
      });

      it('should work for a repitition', function(done) {
 
        StreamTest[version].fromChunks(['{"main":"mainVal"{@{subs:,"{{ name }}":"{{ val }}"}@}}'])
          .pipe(new fileServer({subs:[{name:"test",val:"testVal"},{name:"test2",val:"testVal"}]}))
          .pipe(StreamTest[version].toText(function(err, text) {
            if(err) {
              done(err);
            }
            var obj = "";
            console.log("Text: "+text);
            try{
              obj = JSON.parse(text);
            }
            catch(e){
              expect(obj).to.be.a("object");
            }
            expect(JSON.stringify(obj)).to.equal(JSON.stringify({main:"mainVal",test:"testVal",test2:"testVal"}));
            done();
          }));
 
      });
 
    });
 
  });
 
});