'use strict';

define([
	'jquery'
], function($){
	return {
		initialize: function() {
			var sec = 15,
				refresh = $("#refresh");
			var refreshInterval = setInterval(function() {
				refresh.text(--sec);
				if (sec <= 1) {
					clearInterval(refreshInterval);
					window.location.reload(true);
				}
			}, 1000);
			refresh.text(sec);

			$('ul a').click(function(e) {
				e.preventDefault();
				var url = location.href;
				if (location.search === '') {
					url = '?filter=';
				}
				url += $(e.currentTarget).text() + ',';
				location.href = url;
			});

			$('.poke a').click(function(e) {
				e.preventDefault();
				var poke = $(e.currentTarget);
				$.ajax({
					type: 'POST',
					url: window.contextPath + '/exclude',
					data: {
						pid: poke.attr('pid'),
						expires: poke.attr('expires')
					},
					dataType: 'json',
					success: function() {
						poke.parent().remove();
					}
				});
			});

			if (window.location.search.indexOf('?filter=') === 0) {
				var frames = $('.frames_div'),
					interval = 1;
				window.pokemonsName.forEach(function(name) {
					setTimeout(function() {
						$('<iframe src="http://www.voicerss.org/controls/speech.ashx?hl=en-us&src=' + name + '&c=mp3&rnd=0.522222075437808"></iframe>').appendTo(frames);
					}, interval);
					interval += 1000;
				});
			}
		}
	};
});