# ledController
this is a personal project to controll my leds over the web and do fancy stuff (not seeking for help :) )

## How is this going to work?

Everything is going to live on a raspberry pi. And if possible, startup at boot. (so I can easily turn it on or off)
There are two parts to this:

### Backend

The backend controlls the Leds (with some library that can talk to the serials pins on the Rapsberry pi)
The backend also provides routes over a Express.js server to controll the leds and add new Presets / light effects and stuff.
The backend also serves the Frontend:

### Frontend

The Frontend is gonna be a ReactJs project hosted by the backend. On the Dashboard I can controll the leds from another machine through the web browser. I want to be able to add new presets for my different led strips, add effects and all that stuff. Idealy this app recieves a high google lighthouse scores and i can install it as a PWA. But that part is optional and probably won't archive that with react. 