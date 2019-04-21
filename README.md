# sAnic
Proyecto prototipo de sommersault trekking

## Info

Todos los fuentes del juego deben colocarse en www/.

## Instalar dependencias 

Antes de correr comandos de cordova y webpack es necesario descargar las dependencias de node.

* Correr `npm install` en / (raiz del proyecto)
* Correr `npm install` en /www

_Todos los comandos mencionados tipo 'npm run *' deben correrse desde www/_

## Agregar plataformas

* Correr `npm run add_browser` para agregar Browser.
* Correr `npm run add_android` para agregar Android.

__Nota__: Si los comandos anteriores no funcionan, probar instalar cordova y webpack de forma global mediante `npm install -g cordova` y `npm install -g webpack` y luego correr `cordova platform add browser`.

## Compilar fuentes (con webpack)

Correr `npm run compile`.

## Abrir juego en browser

Correr `npm run browser`.

## Compilar y correr el juego

Correr `npm run compile_run_win` en windows.
Correr `npm run compile_run_linux` en linux.

## Emular en android (ejecutar desde www/)

Correr `npm run android`.

__Nota__: se requiere API level >= 27. Utilizar el AVD Manager del android studio para crear AVDs con API level suficiente.
Ver: [https://developer.android.com/studio/run/managing-avds](https://developer.android.com/studio/run/managing-avds).

## Correr en un celular (El celular debe estar en modo Developer / modo debug habilitado)

__Nota__: se recomienda tener cordova instalado.

`cordova run android`
