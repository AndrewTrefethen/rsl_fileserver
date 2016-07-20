rsl_fileserver
=========

This Node Module allows you to substitute data into templates via a context variable

## Installation

  npm install rsl_fileserver --save

## Usage

      var fileserver = require('rsl_fileserver');
      var fs = require('fs');

	  var fileStream = fs.createReadStream("template path");

	  var context = {name:val, name:val};	  
	  var fServe = new fileServer(context);
	  
	  fileStream.pipe(fServe).pipe("destination stream");

##templates

	  context: 
		  {sub:"val1"}

	  template:
		  "The value of sub is {{ sub }}."

	  output:
		  "the value of sub is val1."


----------
	  context: 
		  {admin:true}

	  template:
		  "{!{admin: This string will only show when context.admin is true}!}"

	  output:
		   "This string will only show when context.admin is true"


----------

	  context:
		  {subs:[
				  {val:"val1"},
				  {val:"val2"},
				  {val:"val3"}
			  ]
		  }

	  template:
		  "There are multiple values:{@{subs: {{ val }}}@}."

	  output:
		  "There are multiple values: val1 val2 val3."

## Tests

  npm test

## Release History

* 0.1.0 Initial release