# ThreeCameraVJ

* Using PostProcessing
https://threejs.org/docs/#manual/en/introduction/How-to-use-post-processing
* Using mic and camera

## Requires

* yarn
* python3(to use `python3 -m http.server`)

## How to build

1. `yarn`  
install packages
2. `yarn build`  
build project
3. `cd dist/`
4. `python3 -m http.server 8888`  
create local server
5. open browser with "localhost:8888"  
6. Tap a window on browser to start audio  
Start to access mic when you tapped a window

![output](./output.gif)