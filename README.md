
# bvh-loader.js
# 

### Objective 1 [90% DONE] ☕

bvh.py to bvh.js 

Prepare BVH Loader only data aspect for matrix-engine.

Prepare npm package.



### Objective 2
Implement loader intro matrix-engine. 🤞


## Project structure

<pre>

├── javascript-bvh/  [Vanila JS]
|   ├── bvh-loader.js
|   ├── example.bvh
|   ├── index.html   [test page]
├── module/          [module JS - npm]
|   ├── bvh-loader.js
├── index.js
├── test.js
├── module.html      [test module local or public]
├── package.json
├── LINCENCE
├── README.md

</pre>


### NPM Service

Navigate to module.html it is local test for npm package.

```js
import MEBvh from "./index";

var anim = new MEBvh();

anim.parse_file().then(() => {

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
