# fbtk

Userscript til at til at ændre folks navne på Facebok til hvad de er kendt som på TÅGEKAMMERET.

Original version lavet af [Mathias Rav](https://github.com/Mortal).

## Installation

### Google Chrome:

* Installer [Violentmonkey][vm]
* Installer [fbtk][install] i Violentmonkey

### FireFox:

* Installer [Violentmonkey][vm]
* Installer [fbtk][install] i Violentmonkey

[vm]: https://violentmonkey.github.io/get-it/
[install]: https://raw.githubusercontent.com/Tyilo/fbtk/master/build/fbtk.user.js

## Indstillinger

Tryk på disse taster inde på Facebook for at ændre indstillingerne til fbtk:

Slå fbtk til eller fra: `*` (asterisk)  
Slå FU-præfiks til eller fra: `!` (udråbstegn)  
Ændr TK-året: `+` / `-` (plus / minus)

## Opdatéring efter GF
* Opdater gf-året i `script.js`
* Tilføj BEST/FU-titler og -navne i `navne.js`
* Udkommentér eventuelle ældre titler for BEST/FU i `navne.js`
* Bump versionen i toppen af `script.js`
