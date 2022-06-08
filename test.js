
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

  console.log("FINAL P => ", r[0].length)
  console.log("FINAL R => ", r[1].length)

  var KEYS = anim.joint_names();
  for(var x = 0;x < r[0].length;x++) {
    console.log("->" + KEYS[x] + "-> position: " + r[0][x] + " rotation: " + r[1][x]);
  }

  var all = anim.all_frame_poses();
  console.log("Final All -> ", all);

});
