@echo off
call login.bat
call config.bat
p4 -u %p4username% -c %p4workspace% sync