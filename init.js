var enabled = true;
if (window.GM_getValue) {
  window['TKconfig']['FUprefix'] = GM_getValue('FUprefix', false);
  window['TKconfig']['gf'] = GM_getValue('gf', 2016);
  enabled = GM_getValue('enabled', true);
}

activate_fbtk();
if (!enabled) {
	deactivate_fbtk();
}
