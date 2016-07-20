/*
  fileServer.js
  Andrew Trefethen 2016
  fileServer is a duplex stream designed to inject data into an html page before it sent to the web browser.
*/


var Transform = require('stream').Transform; //we are inheriting from the node js internal Transform stream
var util = require('util'); //we require util to "inherit" from Transform stream

/*
  The constructor for a fileServer stream.
    the fileServer accepts a context variable that houses all the variables for this particular request
*/
var fileServer = function(context) { 
	this.context = context;
  Transform.call(this, {objectMode: true});
};
util.inherits(fileServer, Transform); //fileServer inherits from Transform

/*
  The internal transformation function for fileServer
    the transform function actually performs the data injection process
*/
fileServer.prototype._transform = function(chunk, encoding, callback) {

  	var pChunk = chunk.toString(); //we need the contents of the chunk in string form
    pChunk = preProcess(pChunk,this.context,0);

    pChunk = pChunk.replace(/[{][{] [^}]+ [}][}]/g,"");
  	this.push(pChunk); //push the altered chunk into the next stream
  	callback(); //call the callback
};

function preProcess(content,context,depth){
  if(typeof context !== 'object') return content;
  var l = content.length;
  for(var i = 0; i < l; i++){
    if(content[i] == "{" && content.indexOf("{@{",i) == i){
      var open = 1;
      var ind = i + 1;
      var end = i + 1;
      while(open > 0){
        if(content[ind] == "{" && content.indexOf("{@{",ind) === ind) open++;
        else if(content[ind] == "}" && content.indexOf("}@}",ind) === ind) open--;
        ind++;
      }
      end = ind + 2;
      var variable = content.substring(i+3,content.indexOf(":",i)).trim().split('.');
      var ext = variable.length;
      var slider = context;
      for(var x = 0; x < ext; x++){
        if(typeof slider[variable[x]] === "undefined"){
          slider = undefined;
          break;
        }
        else{
          slider = slider[variable[x]];
        }
      }
      if(Array.isArray(slider)){
        var template = content.substring(content.indexOf(":",i)+1,end - 3);
        var subIn = "";
        var ext = slider.length;
        for(var x = 0; x < ext; x++){
          subIn += preProcess(template,slider[x],depth + 1);
        }
        content = content.substring(0,i)+subIn+content.substring(end);
        l = content.length;
      }
      else{
        content = content.substring(0,i)+content.substring(end);
        l = content.length;
      }
    }
    else if(content[i] == "{" && content.indexOf("{!{",i) == i){
      var variable = content.substring(i+3,content.indexOf(":",i)).trim().split(".");
      var ext = variable.length;
      var slider = context;
      for(var x = 0; x < ext; x++){
        if(typeof slider[variable[x]] === "undefined"){
          slider = undefined;
          break;
        }
        else{
          slider = slider[variable[x]];
        }
      }
      var open = 1;
      var ind = i + 1;
      while(open > 0){
        if(content[ind] == "{" && content.indexOf("{!{",ind) == ind) open++;
        else if(content[ind] == "}" && content.indexOf("}!}",ind) == ind) open--;
        ind++;
      }
      ind = ind + 2;
      if(typeof slider === "undefined"){
        content = content.substring(0,i)+content.substring(ind);
      }
      else{
        var subIn = content.substring(content.indexOf(":",i)+1,ind - 3);
        content = content.substring(0,i)+subIn+content.substring(ind);
      }
      l = content.length;
    }
    else if(content[i] == "{" && content.indexOf("{{ ",i) == i){
      var sub = content.substring(i).match(/[{][{] [^ ]+ [}][}]/);
      if(Array.isArray(sub)){
        var subIn = sub[0];
        variable = subIn.replace("{{ ","").replace(" }}","").trim().split(".");
        var ext = variable.length;
        var slider = context;
        for(var x = 0; x < ext; x++){
          if(typeof slider[variable[x]] === "undefined"){
            slider = undefined;
            break;
          }
          else{
            slider = slider[variable[x]];
          }
        }
        if(typeof slider !== 'undefined'){
          subIn = slider; //if the variable exist, put the variable contents into subIn
        }
        else if(depth == 0){
          subIn = "";
        }
        content = content.substring(0,i)+subIn+content.substring(i+sub[0].length); //replace the substitution with the contents of subIn
        if(subIn.length == 0) i--;
        l = content.length;
      }
    }
  }
  return content;
}

module.exports = fileServer; //export the constructor