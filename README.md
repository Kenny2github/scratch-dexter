# scratch-dexter
A Scratch extension to interact with Dexter.

## Loading
1. Install Node.JS: https://nodejs.org/en/download/
2. Make a folder, change into it, run `npm init` and `npm install ws`, and download the proxy file.
	```bash
	mkdir DexProxy
	cd DexProxy
	npm init
	npm install ws
	wget https://raw.githubusercontent.com/Kenny2github/scratch-dexter/master/httpd.js
	```
3. Run the proxy server: `node httpd.js <Dexter IP>` where `<Dexter IP>` is the IP of the robot.
4. Navigate to https://scratchx.org?url=https://kenny2github.github.io/scratch-dexter/ext.js#scratch
	* On Chrome, click to enable Flash
5. Accept the warning about experimental extensions.

## Using
As an example:

![script](https://user-images.githubusercontent.com/28599280/49795842-019f8580-fd76-11e8-8fe3-737214784d3e.png)

This will make the robot wave back and forth.
