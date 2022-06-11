
/**
 * @description
 * Test npm service - local or public
 */
import MEBvh from "./index";

var anim = new MEBvh();

anim.parse_file("https://raw.githubusercontent.com/zlatnaspirala/Matrix-Engine-BVH-test/main/javascript-bvh/example.bvh").then(() => {

  console.info("plot_hierarchy no function")
  anim.plot_hierarchy();

  var r = anim.frame_pose(0);

  var newLog = document.createElement("div");
  newLog.innerHTML += '<h2>PRINT POSITION AND ROTATION </h2>';

  var KEYS = anim.joint_names();
  for(var x = 0;x < r[0].length;x++) {
    newLog.innerHTML += '<p>' + "->" + KEYS[x] + "-> position: " + r[0][x] + " rotation: " + r[1][x] + '</p>';
    byId('log').appendChild(newLog);
    console.info(KEYS[x] + " -> position: " + r[0][x] + " rotation: " + r[1][x]);
  }

  // var all = anim.all_frame_poses();
  // console.log("Final All -> ", all);

});
