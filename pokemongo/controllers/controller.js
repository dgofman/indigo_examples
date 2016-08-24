'use strict';

var indigo = require('indigojs'),
	proxy_lib = require('proxy-orchestrator');

module.exports = function(router) {

	var bounds = [
		'bounds=37.69374,-122.624478,37.823348,-122.297806', //all
		'bounds=37.825013,-122.426885,37.828805,-122.419964', //Alcatraz
		'bounds=37.806291,-122.395313,37.836632,-122.340682', //treasure
		'bounds=37.770000,-122.530000,37.820000,-122.38000', //North SF
		'bounds=37.720000,-122.530000,37.770000,-122.38000', //Central SF
		'bounds=37.670000,-122.530000,37.720000,-122.38000', //South SF,
		'bounds=37.620000,-122.530000,37.670000,-122.38000' //Souther SF
	];

	var excludePoke = [];

	
	router.post('/exclude', function(req, res) {
		excludePoke.push({
			pokemon_id: Number(req.body.pid),
			expires: Number(req.body.expires)
		});
		res.json({status:'OK'});
	});

	router.get('/:locale/index', function(req, res) {

		var now = Date.now() / 1000,
			rest = proxy_lib({
			host: 'skiplagged.com',
			port: 80,
			secure: false
		}, req);

		var pokemonsName = [],
			pokemonMap = {},
			index = 0;

		bounds.forEach(function(bound) {
			rest.request(function(err, result, rest_req) {
				index++;
				if (!result || !result.pokemons) {
					console.log(rest_req.path, err, result);
					if (index === bounds.length) {
						res.redirect('/');
					}
					return;
				}
				var pokemons = result.pokemons;

				pokemons.sort(function(a, b) {
					return b.expires - a.expires;
				});

				for (var i in pokemons) {
					var item = pokemons[i],
						location = item.latitude + ',' + item.longitude,
						exit = false;

					if (location === '37.807001,-122.391727') {
						continue;
					}

					for (var i in excludePoke) {
						var exclude = excludePoke[i];
						if (exclude.pokemon_id === item.pokemon_id &&
							exclude.expires === item.expires) {
							exit = true;
							break;
						}
					}
					if (exit) {
						continue;
					}

					if (req.query.filter) {
						var filter = req.query.filter.split(',');
						if (filter.indexOf(item.pokemon_name) === -1) {
							continue;
						}
					}
					var time = (item.expires - now),
						min = Math.floor(time / 60);

					if (pokemonsName.indexOf(item.pokemon_name) === -1) {
						pokemonsName.push(item.pokemon_name);
					}

					var poke = pokemonMap[item.pokemon_name];
					if (!poke) {
						poke = pokemonMap[item.pokemon_name] = {items: []};
					}

					exit = false;
					poke.items.forEach(function(exist) {
						if (exist.expires === item.expires && exist.location === location) {
							exit = true;
						}
					});
					if (exit) {
						continue;
					}
					poke.items.push({
						pokemon_name: item.pokemon_name,
						pokemon_id: item.pokemon_id,
						expires: item.expires,
						time:  min + ' min ' + (time - min * 60).toFixed(0) + ' sec', 
						location: location
					});

					if (req.query.filter) {
						console.log('https://skiplagged.com' + rest_req.path);
						console.log(item);
					}
				}

				if (index === bounds.length) {
					pokemonsName.sort(function(a, b) {
						return a.localeCompare(b);
					});
					req.model.pokemonsName = pokemonsName;
					req.model.pokemonMap = pokemonMap;
					indigo.render(req, res, '/index');
				}
			}, 'GET', '/api/pokemon.php?' + bound);
		});
	});
};