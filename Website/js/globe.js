(function() {
        var canvas = document.getElementById('planet'),
                context = canvas.getContext('2d');

        // resize the canvas to fill browser window dynamically
        window.addEventListener('resize', resizeCanvas, false);
        
        function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                //call the draw planet after resize
                drawPlanet(); 
        }
        resizeCanvas();
        
        function drawPlanet() {
          var canvas = document.getElementById('planet');
          var planet = planetaryjs.planet();
          // Loading this plugin technically happens automatically,
          // but we need to specify the path to the `world-110m.json` file.
          // and setting the colors

          planet.loadPlugin(planetaryjs.plugins.earth({
            topojson: { file: 'data/world-110m.json' },
            oceans:   { fill:   '#000' },
            land:     { fill:   '#000', stroke: '#fff', dash: '1', space: '10' },
            borders:  { stroke: '#000' }
          }));

          planet.projection
            .translate([300, 300])
            .rotate([0, -30, 0]);

          // The `pings` plugin draws animated pings on the planet.
          planet.loadPlugin(planetaryjs.plugins.pings());
          // The `dots` plugin draws dots on the planet.
          planet.loadPlugin(planetaryjs.plugins.dots());

          //makes the planet rotate automatically
          planet.loadPlugin(autorotate(1));

          // The `zoom` and `drag` plugins enable
          // manipulating the planet with the mouse.
          planet.loadPlugin(planetaryjs.plugins.zoom({
            scaleExtent: [canvas.height / 2, canvas.height * 2]
          }));

          //makes the planet dragable
          planet.loadPlugin(planetaryjs.plugins.drag({
            // Dragging the planet should pause the
            // automatic rotation until we release the mouse.
            onDragStart: function() {
              this.plugins.autorotate.pause();
              noPopUp();
            }
          }));
            //autopause and resume on mouse enter and leave 
          $( "#planet" )
            .mouseenter(function() {
              planet.plugins.autorotate.pause();
            })
            .mouseleave(function() {
              planet.plugins.autorotate.resume();
            });

          $( "#popUp" )
            .mouseenter(function() {
              planet.plugins.autorotate.pause();
            })
            .mouseleave(function() {
              planet.plugins.autorotate.resume();
              noPopUp();
            });
          
          var dotId = ["Munich", "Copenhagen", "Aarhus", "Madrid", "London", "New york", "Oslo", "Tokyo", "Barcelona", "Lima", "Medellin", "Tel aviv"];
          var lat = [48.1351, 55.676097, 56.162939, 40.416775, 51.507351, 40.712784, 59.913869, 35.689487, 41.385064, 12.046373, 6.244203, 32.085300];
          var lng = [11.5820, 12.568337, 10.203921, -3.703790, 0.127758, -74.005941, 10.752245, 139.691706, 2.173403, 77.042754, 75.581212, 34.781768];

          setInterval(function() {
            for (var i = lat.length - 1; i >= 0; i--) {
              var randomTtl = Math.floor(Math.random() * 600) + 400;
              planet.plugins.pings.add(lng[i], lat[i], { strokeColor: 'yellow', ttl: randomTtl, angle: 2 });
            }
          }, 1000);
          
        //This is not pretty but it works for only plotting the dots once
          var plotDot;
          var plotDone = false;
          (plotDot = function(){
            setInterval(function() {
            if (!plotDone) {  
              for (var i = lat.length - 1; i >= 0; i--) {
                planet.plugins.dots.add(lng[i], lat[i], dotId[i], { fillColor: 'yellow', size: 0.2});
              }
              plotDone = true;
             } 
            }, 0);  
          })();

          // Scale the planet's radius to half the canvas' size
          // and move it to the center of the canvas.
          planet.projection
            .scale(canvas.height / 2)
            .translate([canvas.width / 2, canvas.height / 2]);
          planet.draw(canvas);
          
          // This plugin will automatically rotate the planet around its vertical
          // axis a configured number of degrees every second.
          function autorotate(degPerSec) {
            // Planetary.js plugins are functions that take a `planet` instance
            // as an argument...
            return function(planet) {
              var lastTick = null;
              var paused = false;
              planet.plugins.autorotate = {
                pause:  function() { paused = true;  },
                resume: function() { paused = false; }
              };
              // ...and configure hooks into certain pieces of its lifecycle.
              planet.onDraw(function() {
                if (paused || !lastTick) {
                  lastTick = new Date();
                } else {
                  var now = new Date();
                  var delta = now - lastTick;
                  // This plugin uses the built-in projection (provided by D3)
                  // to rotate the planet each time we draw it.
                  var rotation = planet.projection.rotate();
                  rotation[0] += degPerSec * delta / 1000;
                  if (rotation[0] >= 180) rotation[0] -= 360;
                  planet.projection.rotate(rotation);
                  lastTick = now;
                }
              });
            };
          };

          //Shorten coordinates
          var fixedLng = [];
          var fixedLat = [];
          var fixingCoordinates;
          (fixingCoordinates = function(){ 
            for (var i = lat.length - 1; i >= 0; i--) {
              fixedLng[i] = lng[i].toFixed(0)
              fixedLat[i] = lat[i].toFixed(0)
              console.log("fixed lng: " + fixedLng[i] + " fixed lat: " + fixedLat[i]);
            }
          })();
          
          //Mouse events
            function getMousePos(canvas, evt) {
              return {
                x: evt.clientX,
                y: evt.clientY
              };
            }

            var canvas = document.getElementById('planet');
            var context = canvas.getContext('2d');
            var currentX;
            var currentY;
            var mousePos;
            var currentLocal;

            canvas.addEventListener('mousemove', function(evt) {
              mousePos = getMousePos(canvas, evt);
              currentX = planet.projection.invert([mousePos.x, mousePos.y])[0];
              currentY = planet.projection.invert([mousePos.x, mousePos.y])[1];
              currentX = currentX.toFixed(0);
              currentY = currentY.toFixed(0);
              if (isNaN(currentY) || isNaN(currentX)) {
                planet.plugins.autorotate.resume();
              }
              dotPosition();
            });

            //check position
            function dotPosition() {
              for (var i = lat.length - 1; i >= 0; i--) {
                if (currentX == fixedLng[i] && currentY == fixedLat[i]) {
                  currentLocal = dotId[i];
                  popUp();
                }
              }
            }

            function popUp() {
              document.getElementById("popUp").style.display = "block";
              document.getElementById("popUp").style.top = mousePos.y/2+"px";
              document.getElementById("popUp").style.left = mousePos.x+20+"px";
              console.log(currentLocal);
            }

            function noPopUp() {
              document.getElementById("popUp").style.display = "none";
            }
        }
})();