// Connection management
// Connection manager library
#require "ConnectionManager.lib.nut:3.1.1"

// Message manager library
#require "MessageManager.lib.nut:2.4.0"

// Import Electric Imp’s WS2812 library to address the LED
#require "WS2812.class.nut:3.0.0"

// Connection manager info
local cm = ConnectionManager({ "blinkupBehavior": CM_BLINK_ALWAYS,
                          "stayConnected"  : true,
                          "startBehavior"  : CM_START_CONNECTED
});

// MessageManager options
local options = {
    "connectionManager": cm
};

local mm = MessageManager(options);

// Let's set up some global variables we can use later
spi <- null;
led <- null;

// turning on hardware power gate with pin 1
hardware.pin1.configure(DIGITAL_OUT, 1);

//led config
spi = hardware.spi257;
spi.configure(MSB_FIRST, 7500);
led = WS2812(spi, 1);

//i2c pin config
sig1 <- hardware.pin8;
sig2 <- hardware.pin9;

sig1.configure(DIGITAL_OUT, 0);
sig2.configure(DIGITAL_OUT, 0);

// the following function sets pins 8 and 9 according to what is required for
// extension and retraction of the linear actuator, based on the relay circuit
// we built. 
function pushPull(seconds) {
    
        // write pin 9 to turn on relay circuit 1, causing it to extend
        sig2.write(1);
        
        // extend for number of seconds passed in
        imp.sleep(seconds);
        
        // write pin 9 to turn off relay circuit 1, stopping extension
        sig2.write(0);
        
        // write pin 8 to turn on relay circuit 2, causing it to retract
        sig1.write(1);
        server.log("Retracting...");
        
        //retract for number of seconds passed in
        imp.sleep(seconds);
        
        //write pin 8 to turn off relay circuit 2, stopping retraction
        sig1.write(0);
        
        //turn LED off
        led.set(0, [0,0,0]).draw();
        server.log("Done!");
}

// This function determines whether the user has passed in a trick or a treat, 
// and calls the pushPull function to complete the desired behavior. The test variable
// is passed in but not used.
function setPinState(var, test) {
    
    if (var.data == "trick") {
        // this means that the user has requested trick, and the pin should switch states after 2 sec
        server.log("You've been tricked!");
        server.log("Extending...");
        
        // set LED red for "trick"
        led.set(0, [255,0,0]).draw();
        
        //call pushPull function, provide it an input of 2 seconds
        pushPull(2);
        
    } else {
        // user has requested treat, pin should switch states after 4 sec
        server.log("Time for a treat!");
        server.log("Extending...");
        
        // set LED green for "treat"
        led.set(0, [0,255,0]).draw();
        
        //call pushPull function, provide it an input of 4 seconds
        pushPull(4);
        
    }
    
}

// When the agent sends us "get.var", trigger the setPinState function
mm.on("get.var",setPinState);
