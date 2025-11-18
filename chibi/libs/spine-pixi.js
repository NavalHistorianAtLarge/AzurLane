(function (PIXI, loaders, spinePixi) {
	'use strict';

	function _interopNamespaceDefault(e) {
		var n = Object.create(null);
		if (e) {
			Object.keys(e).forEach(function (k) {
				if (k !== 'default') {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () { return e[k]; }
					});
				}
			});
		}
		n.default = e;
		return Object.freeze(n);
	}

	var PIXI__namespace = /*#__PURE__*/_interopNamespaceDefault(PIXI);

	PIXI__namespace.loaders = { Loader: loaders.Loader };
	PIXI__namespace.spine = { Spine: spinePixi.Spine };

	window.PIXI = PIXI__namespace;

})(PIXI, loaders, spinePixi);
