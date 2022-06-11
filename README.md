
# bvh-loader.js


### Objective 1 [100% DONE]
### bvh.py to bvh.js ☕


### Npm package link:
https://www.npmjs.com/package/bvh-loader


### Objective 2
Implement loader/draws intro matrix-engine. 🤞
Make pseudo (primitives) Skeletal Mesh and adapt it to the bvh loader output data.🤞


## Project structure

<pre>

├── javascript-bvh/  [Vanila JS]
|   ├── bvh-loader.js
|   ├── example.bvh
|   ├── index.html   [test page]
├── module/          [module JS - npm]
|   ├── bvh-loader.js
├── index.js
├── test.js          [test module]
├── module.html      [test module]
├── package.json
├── LINCENCE
├── README.md

</pre>


### NPM Service

Navigate to module.html it is local test for npm package.

This link also use npm service via cdn.skypack.dev
 - https://codepen.io/zlatnaspirala/pen/vYdVxQR

#### Use great `cdn.skypack.dev` free service. No build , free hosting library.
Just put in test.js - `import MEBvh from "https://cdn.skypack.dev/bvh-loader@0.0.3";`

```
import MEBvh from "https://cdn.skypack.dev/bvh-loader@0.0.3";

var anim = new MEBvh();

anim.parse_file("https://raw.githubusercontent.com/zlatnaspirala/Matrix-Engine-BVH-test/main/javascript-bvh/example.bvh").then(() => {

  console.info("plot_hierarchy no function")
  anim.plot_hierarchy();

  var r = anim.frame_pose(0);

  console.log("FINAL P => ", r[0].length)
  console.log("FINAL R => ", r[1].length)

  var KEYS = anim.joint_names();
  for(var x = 0;x < r[0].length;x++) {
    console.log("->" + KEYS[x] + "-> position: " + r[0][x] + " rotation: " + r[1][x]);
  }

  var all = anim.all_frame_poses();
  console.log("Final All -> ", all);

});

```

#### Local test

```js
import MEBvh from "./index";

var anim = new MEBvh();

anim.parse_file("https://raw.githubusercontent.com/zlatnaspirala/Matrix-Engine-BVH-test/main/javascript-bvh/example.bvh").then(() => {

  console.info("plot_hierarchy no function")
  anim.plot_hierarchy();

  var r = anim.frame_pose(0);

  console.log("FINAL P => ", r[0].length)
  console.log("FINAL R => ", r[1].length)

  var KEYS = anim.joint_names();
  for(var x = 0;x < r[0].length;x++) {
    console.log("->" + KEYS[x] + "-> position: " + r[0][x] + " rotation: " + r[1][x]);
  }

  var all = anim.all_frame_poses();
  console.log("Final All -> ", all);

});

```

### Lincence

https://maximumroulette.com 

GNU GENERAL PUBLIC LICENSE Version 3

### Credits

Original source: https://github.com/dabeschte/npybvh
