all:
	@cat script.js grafik.js navne.js init.js > fbtk.user.js

clean:
	@rm -f fbtk.user.js
