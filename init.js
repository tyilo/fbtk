var enabled = true;
if (window.GM_getValue) {
  window['TKconfig']['FUprefix'] = GM_getValue('FUprefix', window['TKconfig']['FUprefix']);
  window['TKconfig']['gf'] = GM_getValue('gf', window['TKconfig']['gf']);
  enabled = GM_getValue('enabled', true);
}

activate_fbtk();
if (!enabled) {
	deactivate_fbtk();
}
