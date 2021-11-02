
const EMPTY = {};

export function assign(obj, props) {
	// eslint-disable-next-line guard-for-in
	for (let i in props) {
		obj[i] = props[i];
	}
	return obj;
}

export function exec(url, route, opts) {
	let reg = /(?:\?([^#]*))?(#.*)?$/,
		c = url.match(reg),
		matches = {},
		ret;
	if (c && c[1]) {
		let p = c[1].split('&');
		for (let i=0; i<p.length; i++) {
			let r = p[i].split('=');
			matches[decodeURIComponent(r[0])] = decodeURIComponent(r.slice(1).join('='));
		}
	}
	url = segmentize(url.replace(reg, ''));
	route = segmentize(route || '');
	let max = Math.max(url.length, route.length);
	for (let i=0; i<max; i++) {
		if (route[i] && route[i].charAt(0)===':') {
			let param = route[i].replace(/(^:|[+*?]+$)/g, ''),
				flags = (route[i].match(/[+*?]+$/) || EMPTY)[0] || '',
				plus = ~flags.indexOf('+'),
				star = ~flags.indexOf('*'),
				val = url[i] || '';
			if (!val && !star && (flags.indexOf('?')<0 || plus)) {
				ret = false;
				break;
			}
			matches[param] = decodeURIComponent(val);
			if (plus || star) {
				matches[param] = url.slice(i).map(decodeURIComponent).join('/');
				break;
			}
		}
		else if (route[i]!==url[i]) {
			ret = false;
			break;
		}
	}
	if (opts.default!==true && ret===false) return false;
	return matches;
}

export function pathRankSort(a, b) {
	return (
		(a[1].rank < b[1].rank) ? 1 :
			(a[1].rank > b[1].rank) ? -1 :
				(a[1].index - b[1].index)
	);
}

// filter out VNodes without attributes (which are unrankeable), and add `index`/`rank` properties to be used in sorting.
// reactor vnode的组成['type', {props}, [kids]]， 因此这里面用vnode[1]代表是props
export function prepareVNodeForRanking(vnode, index) {
	vnode[1].index = index;
	vnode[1].rank = rankChild(vnode);
	return vnode[1] || vnode[2];
}
//去掉开头和结尾的/,然后用/作为分隔符，将url字符串分割成数组
export function segmentize(url) {
	return url.replace(/(^\/+|\/+$)/g, '').split('/');
}

export function rankSegment(segment) {
	return segment.charAt(0)==':' ? (1 + '*+?'.indexOf(segment.charAt(segment.length-1))) || 4 : 5;
}

export function rank(path) {
	return segmentize(path).map(rankSegment).join('');
}

function rankChild(vnode) {
	return vnode[1].default ? 0 : rank(vnode[1].path);
}
