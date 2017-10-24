const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const config = require('config'); 

const serverConfig = config.get('ServerConfig'); 
const port = serverConfig.port;
const keyTranslateAPI = serverConfig.googleTranslateAPIKey;
const googleTranslate = require('google-translate')(keyTranslateAPI);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/translate', function (req, res) {

  	res.setHeader('Content-Type', 'application/json');

	let body = JSON.parse(req.body.translateFile);
	let lang = JSON.parse(req.body.lang);

	let arrayOfPromises = translateJSON(body, lang);

	Promise.all(arrayOfPromises)
	    .then(function() {	    	
	       	res.end(JSON.stringify(body, null, 2));
		});

})

app.listen(port, function () {
  	console.log('Servidor rodando na porta: ', port);
});

const translate = function(string, lang){

	return new Promise(function(resolve, reject) {

		googleTranslate.translate(string, lang, function(err, translation) {

			if(err){
				reject(err);
			}

	 		resolve(translation);
		});

	});

};

const translateJSON = function(obj, lang){

	let array = []

	for (let propriedade in obj) {
	    if (obj.hasOwnProperty(propriedade)) {
	  	    if (typeof obj[propriedade] == "object") {
	            array.push(translateJSON(obj[propriedade], lang));
	        } else {
		        array.push(translate(obj[propriedade], lang).then(function(translation){
			           	obj[propriedade] = translation.translatedText;
			        })
		        );

	        }
    	}
    }

    return array;

};





