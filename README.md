# httpwrapper4ftp
HTTP wrapper for FTP server

## Why need this

Imaging this situation that we have three machines A, B and C. A has access to B,
and B has access to C, but A can not access C. And our ftp server runs on machine
C. Now we can run `httpwrapper4ftp` on machine B and let machine A can access 
files on C.

I know you can accomplish that goal via installing a ftp proxy on machine B, but I can
not find an easy way to get a ftp proxy works for me, so I developed this
`httpwrapper4ftp`. Any way enjoy it if you need it.

## How to use it
  - `npm install` or `yarn install` to init project
  - config your ftp server option in [ftpconfig.js][ftpconfig.js]
  - `npm start` or `yarn start` to run express server
  - open browser to navigate `http://locahost:3000`, replace `localhost` with your http server's hostname
  
[ftpconfig.js]: ./config/ftpconfig.js
