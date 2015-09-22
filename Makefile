all:
	@mkdir -p build
	@cat script.js grafik.js navne.js init.js > build/fbtk.user.js

clean:
	@rm -rf build
