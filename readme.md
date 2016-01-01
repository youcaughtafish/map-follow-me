### Map Follow Me
**A simple web app that lets you share your location**

#### Build and Run
* `npm install`
* `bower install`
* `npm start` or `sudo PORT=80 forever bin/www &` (to run on a server)

#### Demo
* Demo version available at [mapfollowme.com](http://mapfollowme.com)

#### Primary Technologies Used
* [Node.js](https://nodejs.org/)
* [Mapbox](https://www.mapbox.com/)
* [React](https://facebook.github.io/react/)
* [express](http://expressjs.com/)
* [socket.io](http://socket.io/)
* [Browserify](http://browserify.org/)
* [forever](https://www.npmjs.com/package/forever)

#### App Basics
* The app consists of a map and uses the `navigator.geolocation` API to find users' locations
* Users may share their location via the 'Share Location' menu item (available in the lower right corner)
* URLs are of the form `/s/<session-name>`; users visiting the same URL can share/view their locations
* `GET` requests of the site root `/` are redirected to a generated unique `session-name`

#### Improvements Needed
* Tests! - Currently, there are no tests
* Grunt - Installation currently involves multiple commands
* Browersify the front-end packages ahead of time to improve page load speed
* Better logging (instead of `console.log` everywhere)

#### Possible Future Functionality
* Android app version (`WebView`) that can run in the background
* Ability to specify user name and icon
* Ability to show location history (some type of line following previous locations)
* 'Circle of accuracy' when GPS location is inaccurate