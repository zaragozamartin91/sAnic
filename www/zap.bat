@echo off

echo COMPILANDO
call webpack --config webpack.config.js

echo CORRIENDO
call cordova run browser --live-reload
