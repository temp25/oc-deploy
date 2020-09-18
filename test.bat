@ECHO OFF

for /l %%x in (1, 1, 10) do (
    ECHO Data: %%x
    REM TIMEOUT cannot be used in background
    REM TIMEOUT /T 1 /NOBREAK > NUL
    REM PING 127.0.0.1 -n1 -w 60000 > NUL
    PING 1.1.1.1 -n 1 -w 2000 >NUL
)
