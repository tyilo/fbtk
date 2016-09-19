// vim:set fileencoding=utf-8 sw=2 ts=2 sts=2:
// encoding test: rød grød med fløde æ ø å
// ==UserScript==
// @name         TK-navne på Facebook
// @author       Mathias Rav
// @namespace    http://tyilo.com/
// @description  Ændrer folks navne til hvad de er kendt som på TÅGEKAMMERET
// @include      https://www.facebook.com/*
// @version      0.3.2
// @downloadURL  https://raw.githubusercontent.com/Tyilo/fbtk/master/build/fbtk.user.js
// @updateURL    https://raw.githubusercontent.com/Tyilo/fbtk/master/build/fbtk.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-end
// ==/UserScript==

var C = ('<span style="font-family: &quot;lucida grande&quot;,tahoma,verdana,arial,sans-serif;">'
+'\u2102</span>');
window['TKconfig'] = ({
	// We don't write RemToR anywhere
	//'epsilon': 'e',
	// Dollar sign used to write KA$$
	'dollar': '$',
	// C used to write CERM
	'cermC': C,
	// C used to write VC
	'vcC': C,
	// Whether exponents should be written as superscripts
	'eksponent': true,
	// From which year prefixes are computed
	'gf': 2015,
	// True if we should write a prefix in front of a FU title
	'FUprefix': false
});

function TK(key) {
	return window['TKconfig'][key];
}

function year_prefix(year) {
	year = TK('gf') - year;
	var prefixes = ['', 'G', 'B', 'O', 'TO'];
	if (0 <= year && year < prefixes.length) {
		return prefixes[year];
	}
	if (year == -1) return 'K';
	var negative = false;
	var exponent = year - 3;
	if (year < 0) { exponent = -year; negative = true; }
	exponent = exponent+'';
	var exponentString = '';
	if (TK('eksponent')) {
		var s = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹']
		for (var i = 0; i < exponent.length; ++i)
			exponentString += s[exponent.charCodeAt(i) - 48];
	} else {
		exponentString = exponent;
	}
	return negative ? 'K'+exponentString : 'T'+exponentString+'O';
}

function title_bling(title) {
	if (title == "KASS") return "KA" + TK('dollar') + TK('dollar');
	if (title == 'CERM') return TK('cermC') + "ERM";
	if (title == 'VC') return "V" + TK('vcC');

	return title;
}

var svg = {};

var html_TK = (
'<span '+
'style="vertical-align: -0.4pt">T</span><span '+
'style="font-weight: bold">&Aring;</span>G<span '+
'style="display: inline-block; transform: rotate(8deg); -webkit-transform: '+
'rotate(8deg)">E</span><span '+
'style="vertical-align: -0.6pt">K</span><span '+
'style="vertical-align: 0.2pt; font-weight: bold">A</span><span '+
'style="vertical-align: -0.6pt">M</span><span '+
'style="display: inline-block; transform: rotate(-8deg); -webkit-transform: '+
'rotate(-8deg); font-weight: bold">M</span>ER');
var html_TKET = html_TK + '<span style="vertical-align: 0.6pt">ET</span>';

///////////////////////////////////////////////////////////////////////////////
// Callback generator for add_alias.
///////////////////////////////////////////////////////////////////////////////
function insert_TK_html(h) {
	return function (n, orig_string) {
		var replaced = document.createElement('span');
		replaced.style.fontFamily = 'monospace';
		replaced.style.fontWeight = 'normal';
		replaced.style.display = 'inline-block';
		replaced.style.whiteSpace = 'nowrap';
		replaced.className = 'tket';
		replaced.innerHTML = h;
		n.parentNode.insertBefore(replaced, n);
	};
}

var aliases = {'replacements': {}, 'targets': []};

///////////////////////////////////////////////////////////////////////////////
// Add a text replacement.
//
// `source` is a string to watch for in DOM text nodes.
// Whenever `source` is found, the function `destination` is invoked with two
// parameters: the insertion point of the replacement text, and the original
// replaced text.
///////////////////////////////////////////////////////////////////////////////
function add_alias(source, destination) {
	// June 12, 2013:
	// On latin1 pages, the utf8 strings in this script do not match with
	// non-ascii characters. I don't know how to do this for all
	// characters, so give special treatment to those special letters.
	// This appears to fix it for both Firefox 24 and Chromium 27.
	source = (source
		  .replace(/æ/g, '\xe6')
		  .replace(/ø/g, '\xf8')
		  .replace(/å/g, '\xe5')
		  .replace(/Æ/g, '\xc6')
		  .replace(/Ø/g, '\xd8')
		  .replace(/Å/g, '\xc5'));

	aliases.targets.push(source);
	aliases.replacements[source] = destination;
}

function like_button(s) {
	return function like_button_cb(ip, txt) {
		if (ip.parentNode.classList.contains('UFILikeLink')) {
			ip.parentNode.insertBefore(document.createTextNode(s), ip);
		} else {
			return false;
		}
	};
}

function like_verb(s) {
	return function like_verb_cb(ip, txt) {
		if (ip.parentNode.parentNode.parentNode.classList.contains('UFILikeSentenceText')) {
			ip.parentNode.insertBefore(document.createTextNode(s), ip);
		} else {
			return false;
		}
	};
}

add_alias('TÅGEKAMMERET', insert_TK_html(html_TKET));
add_alias('TÅGEKAMMER', insert_TK_html(html_TK));
//add_alias('Like', like_button('Find this strange'));
//add_alias('Unlike', like_button('No longer find this strange'));
//add_alias('likes this', like_verb('finds this strange'));
//add_alias('like this', like_verb('find this strange'));
//add_alias('Synes godt om', like_button('Finder det unaturligt'));
//add_alias('Synes ikke længere godt om', like_button('Finder det ikke længere unaturligt'));
//add_alias('synes godt om dette', like_verb('finder dette unaturligt'));

var alias_regexp;
function compute_alias_regexp() {
	alias_regexp = new RegExp(aliases.targets.join('|'));
}
compute_alias_regexp();

///////////////////////////////////////////////////////////////////////////////
// Parse input line to an object.
///////////////////////////////////////////////////////////////////////////////
function parse_alias(line) {
	var prefixed = /^(\d+) +([^ ]+) +(.*)/.exec(line);
	if (prefixed) {
		return {'name': prefixed[3],
			'year': parseInt(prefixed[1]),
			'title': prefixed[2]};
	}
	var hangaround = /^"([^"]*)" +(.*)/.exec(line);
	if (hangaround) {
		return {'name': hangaround[2],
			'nickname': hangaround[1]};
	}
	return null;
}

///////////////////////////////////////////////////////////////////////////////
// Parse input lines, sending objects to a callback function.
///////////////////////////////////////////////////////////////////////////////
function parse_aliases(input, cb) {
	var lineMatch;
	var re = /^.+$/mg;
	while (lineMatch = re.exec(input)) {
		var line = lineMatch[0];
		var parsed = parse_alias(line);
		cb(parsed, line);
	}
}

///////////////////////////////////////////////////////////////////////////////
// Given a parsed input line object, produce the fancy unicode text to insert.
///////////////////////////////////////////////////////////////////////////////
function make_title(o) {
	if (o['nickname']) return o['nickname'];
	var title = o['title'];
	var fancy = title_bling(o['title']);
	if ('year' in o) {
		var year = o['year'];
		var addPrefix = false;
		if (title == 'FUAN') {
			addPrefix = true;
		} else if (title == 'FU') {
			// Unnamed FU (e.g. KFU); always show prefix
			addPrefix = true;
		} else if (title.substring(0, 2) != 'FU') {
			// BEST title
			addPrefix = true;
		} else {
			// Ordinary FU
			addPrefix = TK('FUprefix');
		}
		if (addPrefix) {
			fancy = year_prefix(year) + fancy;
		}
	}
	return fancy;
}

///////////////////////////////////////////////////////////////////////////////
// Callback generator for add_alias.
///////////////////////////////////////////////////////////////////////////////
function insert_alias(o) {
	var cb = function (n, orig_string) {
		var str = make_title(o);
		var prefixSVG = o['title'] ? (/^FU/.exec(o['title']) ? 'FU' : o['title']) : (/^(T[0-9]*O|[GBO]?)EFUIT/.exec(o['nickname']) ? 'EFUIT' : '');
		if (o['title'] == 'KASS' && o['year'] < 2014) {
			prefixSVG = 'INKA';
		}
		if (o['title'] == 'KASS') {
			// Until we get the new KASS logo.
			prefixSVG = 'INKA';
		}

		// TODO make sure the svg is not separated by a line break from the title.
		if (svg[prefixSVG]) {
			var before = document.createElement('span');
			before.innerHTML = svg[prefixSVG];
			n.parentNode.insertBefore(before, n);
		}
		var replaced = document.createElement('span');
		replaced.title = orig_string;
		replaced.className = 'tk_title';
		replaced.innerHTML = str;
		n.parentNode.insertBefore(replaced, n);
	};
	return cb;
}

///////////////////////////////////////////////////////////////////////////////
// Given a parsed input line object, add the appropriate alias.
///////////////////////////////////////////////////////////////////////////////
function add_parsed_alias(o, origLine) {
	if (!o) {
		// parse error
		console.log("Failed to parse input line: ["+origLine+"]");
		return;
	}
	add_alias(o['name'], insert_alias(o));
}

///////////////////////////////////////////////////////////////////////////////
// Recursively apply transformation to all text nodes in a DOM subtree.
///////////////////////////////////////////////////////////////////////////////
function search_for_names(n) {
	var to_visit = [n];
	var l = 1;
	var first = true;
	while (l > 0) {
		var n = to_visit[--l];
		if (n.nodeType == 1) {
			// Recurse through all child nodes of this DOM element.
			var c = n.lastChild;
			while (c) {
				var n = c.previousSibling;
				to_visit[l++] = c;
				c = n;
			}
		} else if (n.nodeType == 3) {
			// We are in a DOM text node.
			// Replace every occurrence of a real name with an alias.
			// If the node contains x substrings,
			// we split this text node into 2x+1 parts.
			var o = alias_regexp.exec(n.nodeValue);
			while (o) {
				// We currently have n.nodeValue == a+b+c,
				// and b needs to be replaced with f(b).
				// f(b) is not necessarily just a text string;
				// it could be an arbitrary sequence of DOM nodes.
				// Therefore, we split `n` into three parts:
				// A text node containing `a`, the dom nodes `f(b)`,
				// and a text node containing `c`.
				// We have to recurse on `c` (the rest of the text),
				// so in reality we just insert `a` and `f(b)`
				// before `n` and replace `n` with `c`.

				// Insert (possibly empty) text node `a` before `n`:
				var prev = n.previousSibling;
				var before = document.createTextNode(n.nodeValue.substring(0, o.index));
				if (!first) n.parentNode.insertBefore(before, n);
				var next = n;

				// Insert nodes `f(b)` before n (might be a no-op if f(b) is empty):
				if (aliases.replacements[o[0]](n, o[0]) === false) {
					if (first) {
						// Nothing was inserted and nothing has been done yet.
					} else {
						// Nothing was inserted, but we previously changed something.
						n.parentNode.insertBefore(document.createTextNode(o[0]), n);
					}
				} else {
					if (first) {
						// The replacement inserted something but we didn't insert `before`.
						var afterprev = ((prev === null)
							? n.parentNode.firstChild
							: prev = prev.nextSibling);
						if (afterprev === null) {
							n.parentNode.appendChild(before);
						} else {
							n.parentNode.insertBefore(before, afterprev);
						}
						first = false;
					} else {
						// The replacement inserted something and we already inserted `before`.
					}
				}

				var i = before.nextSibling;
				var oldText = o[0];
				while (i && i != next) {
					if (i.setAttribute)
						i.setAttribute('data-tk-prev', oldText);
					oldText = '';
					i = i.nextSibling;
				}

				// Set the text of the `n` node to the remaining (maybe empty) text `c`:
				if (!first) {
					n.nodeValue =
						n.nodeValue.substring(o.index + o[0].length, n.nodeValue.length);
				}

				// Find the next occurrence:
				o = alias_regexp.exec(n.nodeValue);
			}
		}
	}
	if (first) {
		console.log("Nothing was changed");
	} else {
		console.log("Something was changed");
	}
}

///////////////////////////////////////////////////////////////////////////////
// Add aliases from input alias specification.
///////////////////////////////////////////////////////////////////////////////
function add_aliases(input) {
	parse_aliases(input, add_parsed_alias);
}

function node_depth(v) {
	var d = 0;
	while (v) { ++d; v = v.parentNode; }
	return d;
}

function lowest_common_ancestor(u, v) {
	var du = node_depth(u), dv = node_depth(v);
	while (du > dv) { u = u.parentNode; --du; }
	while (dv > du) { v = v.parentNode; --dv; }
	while (u != v && du > 0 && dv > 0) {
		u = u.parentNode; --du;
		v = v.parentNode; --dv;
	}
	return u;
}

function activate_fbtk() {
	compute_alias_regexp();
	search_for_names(document.body);

	if (window.theTKTitleObserver) {
		window.theTKTitleObserver.disconnect();
	}

	window.theTKTitleObserver = new MutationObserver(function (mutations) {
		if (mutations.length == 0) return;
		var p = mutations[0].target;
		//var depths = [node_depth(p)];
		for (var i = 1, l = mutations.length; i < l; ++i) {
			p = lowest_common_ancestor(p, mutations[i].target);
			//depths.push(node_depth(mutations[i].target));
		}
		//depths.sort();
		//console.log("Node depths ("+depths.join(', ')+") combined to depth "+node_depth(p));
		search_for_names(p);
	});

	window.theTKTitleObserver.observe(document.body, {
		'childList': true,
		'characterData': true,
		'subtree': true
	});
}

function deactivate_fbtk() {
	if (window.theTKTitleObserver) {
		window.theTKTitleObserver.disconnect();
		window.theTKTitleObserver = null;
	}
	var q = [document.body];
	var l = 1;
	while (l > 0) {
		var el = q[--l];
		if (!el) continue;
		q[l++] = el.nextSibling;
		if (el.nodeType != 1) continue;
		q[l++] = el.firstChild;
		if (el.hasAttribute('data-tk-prev')) {
			var txt = document.createTextNode(el.getAttribute('data-tk-prev'));
			el.parentNode.insertBefore(txt, el);
			el.parentNode.removeChild(el);
		}
	}
}

function toggle_fbtk() {
	if (window.theTKTitleObserver) deactivate_fbtk();
	else activate_fbtk();
}

function toggle_fu_prefix() {
	window['TKconfig']['FUprefix'] = !TK('FUprefix');
	deactivate_fbtk(); activate_fbtk();
}

window.TKsetgf = function TKsetgf(year) {
	window['TKconfig']['gf'] = year;
	deactivate_fbtk(); activate_fbtk();
}

window.TKsetup = function TKsetup(config) {
	for (var k in config) {
		if (!(k in window['TKconfig'])) throw('Unknown key '+k);
	}
	for (var k in config) {
		window['TKconfig'][k] = config[k];
	}
	deactivate_fbtk(); activate_fbtk();
}

function save_prefs() {
	if(!window.GM_setValue) {
		return;
	}
	GM_setValue('FUprefix', window['TKconfig']['FUprefix']);
	GM_setValue('gf', window['TKconfig']['gf']);
	GM_setValue('enabled', !!window.theTKTitleObserver);
}

function tk_keypress(e) {
	if (!e.target || e.target.nodeType != 1) return true;
	var tgt = e.target;
	var tag = tgt.tagName.toLowerCase();
	if (tag == 'textarea' || tag == 'input' || tgt.isContentEditable) return true;
	var cc = e.charCode;
	var gf = TK('gf');
	if (cc == 45) // minus
		window.TKsetgf(gf-1);
	else if (cc == 43) // plus
		window.TKsetgf(gf+1);
	else if (cc == 42) // asterisk
		toggle_fbtk();
	else if (cc == 33) // exclamation mark
		toggle_fu_prefix();
	else
		return true;

	save_prefs();

	e.stopPropagation();
	e.preventDefault();
	return false;
}

window.addEventListener('keypress', tk_keypress, false);
