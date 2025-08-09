# Wiz lights!

## Local Build
The frontend is hosted by React and run through vite.
The backend is hosted by Express.ts.

To run locally:

First create a `.env` file in the top level folder with the following variables set:
```
VITE_EXPRESS_HOST (i.e. =localhost)
VITE_EXPRESS_PORT (i.e. =3000)
```

Then, `cd` into the `express_server` folder and run the following lines:
```
npm i
npm run build
npm run start
```

Then, `cd` into the `react_client` folder and run the following lines:
```
npm i
npm run dev
```

## Light Programs from the server [<img src="./info_icon_white.png" width="15px"/>](## "Needs updating when final switch from python to express is deployed")
Run `./start_server.sh` to start a localhost server

### Testing the server is up
In another terminal, run the following to test the server:
```
curl http://localhost:8000/greet/
```
You should receive a nice message. 

### Updating the code on the raspberry pi
ssh into it using the `Raspberry Pi LIGHT-SERVER` credentials
```
ssh shay@192.168.1.123
```

Then git pull the code directory to the latest master
and restart the systemctl light service.
```
cd lights
git pull
sudo systemctl restart light-server.service
```

#### Systemctl
`systemctl` ensures that services (background programs without UIs)
start up when the raspberry pi boots and can be configured to restart 
if the service crashes. 

So in the above case `systemctl restart light-server.service` restarts
our server to include the code update. 

### Raspberry pi vs localhost

The raspberry pi has a static ip address of `192.168.1.123`. 
So replace `localhost` in examples below to control the raspberry pi server instead. 

You can run a localhost server while the raspberry pi is up as long as the pi is not
running a program. So first turn off the orbs on the pi and then start your localhost server. 

```
curl http://192.168.1.123:8000/turn_off_orbs/
./start_server.sh
```



