# spaceDevices
 
The spacegate frontend + backend for [status](https://github.com/ktt-ol/spacestatus).

# Build

    npm install
    bower install
    grunt build

Copy ```dist``` to your server.

# Run

    # only on first time
    npm install --production 
    node server/app.js
    
Or use the ```run.sh``` script. 

# Tip

To run this as non root, use this to allow arping usage:

    setcap cap_net_raw=eip /usr/sbin/arping

