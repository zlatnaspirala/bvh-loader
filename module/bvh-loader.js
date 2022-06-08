/**
 * @description Manual convert python script BVH
 * from https://github.com/dabeschte/npybvh to the JS.
 * @author Nikola Lukic
 */

 function arraySum3(a, b) {
  var rez1 = a[0] + b[0];
  var rez2 = a[1] + b[1];
  var rez3 = a[2] + b[2];
  return [rez1, rez2, rez3];
}

function deg2rad(degrees) {
  return degrees * (Math.PI / 180);
}

function npdeg2rad(degrees) {
  return [degrees[0] * (Math.PI / 180),
  degrees[1] * (Math.PI / 180),
  degrees[2] * (Math.PI / 180)];
}

function rad2deg(radians) {
  return radians * (180 / Math.PI);
}

function byId(id) {
  return document.getElementById(id);
}

// fix for .dot N-dim vs 1D-dim Array
function dot3vs1(a, b) {
  var aNumRows = a.length, aNumCols = a[0].length,
    bNumRows = b.length;
  var REZ1 = 0, REZ2 = 0, REZ3 = 0;
  if(aNumRows == 3 && aNumCols == 3 &&
    bNumRows == 3) {
    for(var j = 0;j < a.length;j++) {
      // First root of 3x3 a.
      REZ1 += a[j][0] * b[j];
      REZ2 += a[j][1] * b[j];
      REZ3 += a[j][2] * b[j];
    }
    var finalRez = [REZ1, REZ2, REZ3];
    return finalRez;
  } else {
    console.error("Bad arguments for dot3vs1");
  }
}

function multiply(a, b) {
  var aNumRows = a.length, aNumCols = a[0].length,
    bNumRows = b.length, bNumCols = b[0].length,
    m = new Array(aNumRows);
  for(var r = 0;r < aNumRows;++r) {
    m[r] = new Array(bNumCols);
    for(var c = 0;c < bNumCols;++c) {
      m[r][c] = 0;
      for(var i = 0;i < aNumCols;++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return m;
}

/**
 * @description
 * Euler's rotation theorem tells us that any rotation in 3D can be described by 3
 * angles.  Let's call the 3 angles the *Euler angle vector* and call the angles
 * in the vector :Math:`alpha`, :Math:`beta` and :Math:`gamma`.  The vector is [
 * :Math:`alpha`, :Math:`beta`. :Math:`gamma` ] and, in this description, the
 * order of the parameters specifies the order in which the rotations occur (so
 * the rotation corresponding to :Math:`alpha` is applied first).
 * @source https://github.com/matthew-brett/transforms3d/blob/master/transforms3d/euler.py
 */

// map axes strings to/from tuples of inner axis, parity, repetition, frame
var _AXES2TUPLE = {
  'sxyz': [0, 0, 0, 0], 'sxyx': [0, 0, 1, 0], 'sxzy': [0, 1, 0, 0],
  'sxzx': [0, 1, 1, 0], 'syzx': [1, 0, 0, 0], 'syzy': [1, 0, 1, 0],
  'syxz': [1, 1, 0, 0], 'syxy': [1, 1, 1, 0], 'szxy': [2, 0, 0, 0],
  'szxz': [2, 0, 1, 0], 'szyx': [2, 1, 0, 0], 'szyz': [2, 1, 1, 0],
  'rzyx': [0, 0, 0, 1], 'rxyx': [0, 0, 1, 1], 'ryzx': [0, 1, 0, 1],
  'rxzx': [0, 1, 1, 1], 'rxzy': [1, 0, 0, 1], 'ryzy': [1, 0, 1, 1],
  'rzxy': [1, 1, 0, 1], 'ryxy': [1, 1, 1, 1], 'ryxz': [2, 0, 0, 1],
  'rzxz': [2, 0, 1, 1], 'rxyz': [2, 1, 0, 1], 'rzyz': [2, 1, 1, 1]
};

// axis sequences for Euler angles
var _NEXT_AXIS = [1, 2, 0, 1];

function euler2mat(ai, aj, ak, axes) {
  if(typeof axes === 'undefined') var axes = 'sxyz';
  // Return rotation matrix from Euler angles and axis sequence.
  // Parameters
  /*
  ai : float
      First rotation angle (according to `axes`).
  aj : float
      Second rotation angle (according to `axes`).
  ak : float
      Third rotation angle (according to `axes`).
  axes : str, optional
      Axis specification; one of 24 axis sequences as string or encoded
      tuple - e.g. ``sxyz`` (the default).
  Returns
  -------
  mat : array (3, 3)
      Rotation matrix or affine.
  Examples
  --------
  >>> R = euler2mat(1, 2, 3, 'syxz')
  >>> np.allclose(np.sum(R[0]), -1.34786452)
  True
  >>> R = euler2mat(1, 2, 3, (0, 1, 0, 1))
  >>> np.allclose(np.sum(R[0]), -0.383436184)
  True */
  try {
    var firstaxis = _AXES2TUPLE[axes][0],
      parity = _AXES2TUPLE[axes][1],
      repetition = _AXES2TUPLE[axes][2],
      frame = _AXES2TUPLE[axes][3];
  }
  catch(AttributeError) {
    // _TUPLE2AXES[axes]  # validation
    // firstaxis, parity, repetition, frame = axes
    console.error("AttributeError: ", AttributeError);
  }

  var i = firstaxis;
  var j = _NEXT_AXIS[i + parity];
  var k = _NEXT_AXIS[i - parity + 1];

  if(frame) {
    ai = ak;
    ak = ai;
  }
  if(parity) {
    ai = -ai;
    aj = -aj;
    ak = -ak;
  }

  var si = Math.sin(ai);
  var sj = Math.sin(aj);
  var sk = Math.sin(ak);
  var ci = Math.cos(ai);
  var cj = Math.cos(aj);
  var ck = Math.cos(ak);
  var cc = ci * ck;
  var cs = ci * sk;
  var sc = si * ck;
  var ss = si * sk;

  // M = np.eye(3)
  var M = [
    [1., 0., 0],
    [0., 1., 0],
    [0., 0., 1]
  ];

  if(repetition) {
    M[i][i] = cj;
    M[i][j] = sj * si;
    M[i][k] = sj * ci;
    M[j][i] = sj * sk;
    M[j][j] = -cj * ss + cc;
    M[j][k] = -cj * cs - sc;
    M[k][i] = -sj * ck;
    M[k][j] = cj * sc + cs;
    M[k][k] = cj * cc - ss;
  } else {
    M[i][i] = cj * ck;
    M[i][j] = sj * sc - cs;
    M[i][k] = sj * cc + ss;
    M[j][i] = cj * sk;
    M[j][j] = sj * ss + cc;
    M[j][k] = sj * cs - sc;
    M[k][i] = -sj;
    M[k][j] = cj * si;
    M[k][k] = cj * ci;
  }
  return M;
}

/**
 * @description
 * How to calculate the angle from rotation matrix.
 */
function mat2euler(M, rad2deg_flag) {
  var pitch_1, pitch_2,
    roll_1, roll_2,
    yaw_1, yaw_2,
    pitch, roll, yaw;

  if(M[2][0] != 1 & M[2][0] != -1) {
    pitch_1 = -1 * Math.asin(M[2][0]);
    pitch_2 = Math.PI - pitch_1;
    roll_1 = Math.atan2(M[2][1] / Math.cos(pitch_1), M[2][2] / Math.cos(pitch_1));
    roll_2 = Math.atan2(M[2][1] / Math.cos(pitch_2), M[2][2] / Math.cos(pitch_2));
    yaw_1 = Math.atan2(M[1][0] / Math.cos(pitch_1), M[0][0] / Math.cos(pitch_1));
    yaw_2 = Math.atan2(M[1][0] / Math.cos(pitch_2), M[0][0] / Math.cos(pitch_2));
    pitch = pitch_1;
    roll = roll_1;
    yaw = yaw_1;
  } else {
    yaw = 0;
    if(M[2][0] == -1) {
      pitch = Math.PI / 2;
      roll = yaw + atan2(M[0][1], M[0][2]);
    } else {
      pitch = -Math.PI / 2;
      roll = -1 * yaw + atan2(-1 * M[0][1], -1 * M[0][2]);
    }
  }

  if(typeof rad2deg_flag !== undefined) {
    // convert from radians to degrees
    roll = roll * 180 / Math.PI;
    pitch = pitch * 180 / Math.PI;
    yaw = yaw * 180 / Math.PI;
  }

  var rez = [roll, pitch, yaw];
  return rez;
}

class MEBvhJoint {

  constructor(name, parent) {
    this.name = name;
    this.parent = parent;

    this.offset = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    this.channels = [];
    this.children = [];
  }

  add_child(child) {
    this.children.push(child);
  }

  __repr__() {
    return this.name;
  }

  position_animated() {
    // true or false
    var detFlag = false;
    for(const item in this.channels) {
      // console.log(this.channels[item].endsWith("position"), "  position " )
      if(this.channels[item].endsWith("position") == true) {
        detFlag = true;
      }
    }
    return detFlag;
  }

  rotation_animated() {
    var detFlag = false;
    for(const item in this.channels) {
      // console.log(this.channels[item].endsWith("rotation"), "  rotation " )
      if(this.channels[item].endsWith("rotation") == true) {
        detFlag = true;
      }
    }
    return detFlag;
  }
}

export class MEBvh {
  constructor() {
    this.joints = {};
    this.root = null;
    this.keyframes = null;
    this.frames = 0;
    this.fps = 0;

    this.myName = "MATRIX-ENGINE-BVH";
  }

  async parse_file(link) {

    // var link ="example.bvh";
    // var link = "https://raw.githubusercontent.com/zlatnaspirala/Matrix-Engine-BVH-test/main/javascript-bvh/example.bvh";

    return new Promise((resolve, reject) => {
      fetch(link).then(event => {
        event.text().then(text => {
          var hierarchy = text.split("MOTION")[0];
          var motion = text.split("MOTION")[1];
          // console.log("Test split MOTION hierarchy part-> ", hierarchy);
          // console.log("Test split MOTION motion part -> ", motion);
          // console.log("Test scope -> ", this.myName);
          var newLog = document.createElement("div");
          newLog.innerHTML += '<h2>Hierarchy</h2>';
          newLog.innerHTML += '<p>' + hierarchy + '</p>';
          byId('log').appendChild(newLog);

          var newLog2 = document.createElement("span");
          newLog2.innerHTML += '<h2>Motion</h2>';
          newLog2.innerHTML += '<p class="paragraf" >' + motion + '</p>';
          byId('log').appendChild(newLog2);

          this._parse_hierarchy(hierarchy);
          this.parse_motion(motion);

          setTimeout( resolve, 2000 )
        });
      });
    });
  }

  _parse_hierarchy(text) {
    var lines = text.split(/\s*\n+\s*/);
    var joint_stack = [];

    for(var key in lines) {
      var line = lines[key];
      var words = line.split(/\s+/);
      var instruction = words[0];
      var parent = null;

      if(instruction == "JOINT" || instruction == "ROOT") {
        if(instruction == "JOINT") {
          // -1 py -> last item
          parent = joint_stack[joint_stack.length - 1];
        } else {
          parent = null;
        }

        var joint = new MEBvhJoint(words[1], parent);

        this.joints[joint.name] = joint;
        if(parent != null) {
          parent.add_child(joint);
        }
        joint_stack.push(joint);
        if(instruction == "ROOT") {
          this.root = joint;
        }
      } else if(instruction == "CHANNELS") {
        for(var j = 2;j < words.length;j++) {
          joint_stack[joint_stack.length - 1].channels.push(words[j]);
        }
      } else if(instruction == "OFFSET") {
        for(var j = 1;j < words.length;j++) {
          joint_stack[joint_stack.length - 1].offset[j - 1] = parseFloat(
            words[j]
          );
        }
      } else if(instruction == "End") {
        var joint = new MEBvhJoint(
          joint_stack[joint_stack.length - 1].name + "_end",
          joint_stack[joint_stack.length - 1]
        );
        joint_stack[joint_stack.length - 1].add_child(joint);
        joint_stack.push(joint);
        this.joints[joint.name] = joint;
      } else if(instruction == "}") {
        joint_stack.pop();
      }
    }
  }

  _add_pose_recursive(joint, offset, poses) {

    var newLog1 = document.createElement("span");
    newLog1.innerHTML += '<h2>add_pose_recursive</h2>';
    newLog1.innerHTML += '<p class="paragraf" >' + joint + '</p>';
    newLog1.innerHTML += '<p>joint.offset    : ' + joint.offset + '</p>';
    newLog1.innerHTML += '<p>joint.children  : ' + joint.children + '</p>';

    for(var lKey in joint.children[0]) {
      newLog1.innerHTML += '<p>joint.children[0] ' + lKey + ' -> ' + joint.children[0][lKey] + '</p>';
    }

    newLog1.innerHTML += '<p>Argument offset : ' + offset + '</p>';
    byId('log').appendChild(newLog1);
    console.log("_add_pose_recursive : ", joint);

    console.log("_add_pose_recursive : ", joint.offset);

    var pose = joint.offset + offset;
    poses.push(pose);

    for(var c in joint.children) {
      this._add_pose_recursive(joint.children[c], pose, poses);
    }
  }

  plot_hierarchy() {
    // import matplotlib.pyplot as plt
    // from mpl_toolkits.mplot3d import axes3d, Axes3D

    var poses = [];
    this._add_pose_recursive(this.root, [0, 0, 0], poses);

    // pos = np.array(poses);

    /* Draw staff DISABLED
        fig = plt.figure()
        ax = fig.add_subplot(111, projection='3d')
        ax.scatter(pos[:, 0], pos[:, 2], pos[:, 1])
        ax.set_xlim(-30, 30)
        ax.set_ylim(-30, 30)
        ax.set_zlim(-30, 30)
        plt.show() */
  }

  parse_motion(text) {

    var lines = text.split(/\s*\n+\s*/);
    var frame = 0;
    for(var key in lines) {
      var line = lines[key];
      // console.log("Test parse_motion LINE  -> ", line);
      if(line == "") {continue;}
      var words = line.split(/\s+/);
      if(line.startsWith("Frame Time:")) {
        this.fps = Math.round(1 / parseFloat(words[2]));
        continue;
      }
      if(line.startsWith("Frames:")) {
        this.frames = parseInt(words[1]);
        continue;
      }
      if(this.keyframes == null) {
        // OK this is just costruction (define) with random values.
        var localArr = Array.from(Array(this.frames), () => new Array(words.length));
        this.keyframes = localArr;
      }

      for(var angle_index = 0;angle_index < words.length;angle_index++) {
        this.keyframes[frame][angle_index] = parseFloat(words[angle_index]);
        // console.log(" localArr >>>>>>>>>>>>>", this.keyframes[0]);
      }

      frame += 1;
    }
  }

  _extract_rotation(frame_pose, index_offset, joint) {
    var local_rotation = [0, 0, 0],
      M_rotation;

    for(var key in joint.channels) {
      var channel = joint.channels[key];

      if(channel.endsWith("position")) {
        continue;
      }
      if(channel == "Xrotation") {
        local_rotation[0] = frame_pose[index_offset];
      } else if(channel == "Yrotation") {
        local_rotation[1] = frame_pose[index_offset];
      } else if(channel == "Zrotation") {
        local_rotation[2] = frame_pose[index_offset];
      } else {
        console.warn("Unknown channel {channel}");
        // raise Exception(f"Unknown channel {channel}");
      }
      index_offset += 1;
    }

    local_rotation = npdeg2rad(local_rotation);

    M_rotation = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];

    // np.eye(3);
    /*
            [[1. 0. 0.]
            [0. 1. 0.]
            [0. 0. 1.]]
        */

    for(key in joint.channels) {
      var channel = joint.channels[key];

      if(channel.endsWith("position")) {
        continue;
      }

      var euler_rot;
      if(channel == "Xrotation") {
        console.warn("local_rotation " + local_rotation);
        euler_rot = [local_rotation[0], 0., 0.];
      } else if(channel == "Yrotation") {
        euler_rot = [0., local_rotation[1], 0.];
      } else if(channel == "Zrotation") {
        euler_rot = [0., 0., local_rotation[2]];
      } else {
        console.warn("Unknown channel {channel}");
      }

      //   console.log(">>>>>>euler_rot>>>>>>>", euler_rot);
      // ?????????????????
      var M_channel = euler2mat(euler_rot[0], euler_rot[1], euler_rot[2], euler_rot[3])

      var M_rotation = multiply(M_rotation, M_channel);

      // console.log(">>>>>>M_rotation>>>>>>>", M_rotation);
      // console.log(">>>>>>M_channel>>>>>>>", M_channel[2]);


      // return M_rotation, index_offset
      return [M_rotation, index_offset];
    }
  }

  _extract_position(joint, frame_pose, index_offset) {
    var offset_position = [0, 0, 0];
    for(var key in joint.channels) {
      var channel = joint.channels[key];

      if(channel.endsWith("rotation")) {
        continue;
      }

      if(channel == "Xposition") {
        offset_position[0] = frame_pose[index_offset];
      } else if(channel == "Yposition") {
        offset_position[1] = frame_pose[index_offset];
      } else if(channel == "Zposition") {
        offset_position[2] = frame_pose[index_offset];
      } else {
        console.warn("Unknown channel {channel}");
        // raise Exception(f"Unknown channel {channel}")
      }
      index_offset += 1;
    }
    return [offset_position, index_offset];
  }

  _recursive_apply_frame(
    joint,
    frame_pose,
    index_offset,
    p,
    r,
    M_parent,
    p_parent
  ) {
    var joint_index;
    if(joint.position_animated()) {
      var local = this._extract_position(joint, frame_pose, index_offset);
      var offset_position = local[0],
        index_offset = local[1];

    } else {
      var offset_position = [0, 0, 0];
    }

    if(joint.channels.length == 0) {

      var local2 = 0;
      for(var item in this.joints) {

        if(joint.name == item) {
          // console.log(">>>>(joint.channels.length == 0) >GOOD>>", item, " local2 .>>>>>", local2)
          joint_index = local2;
        }
        local2++;
      }

      // joint_index = list(this.joints.values()).index(joint); ORI
      // console.log(p_parent + " p_parent")
      // dot3vs1
      p[joint_index] = arraySum3(p_parent, dot3vs1(M_parent, joint.offset));
      // console.log(" TEST TEST p[joint_index]  ", p[joint_index] )

      r[joint_index] = mat2euler(M_parent);
      return index_offset;
    }

    if(joint.rotation_animated()) {
      var local2 = this._extract_rotation(frame_pose, index_offset, joint);
      var M_rotation = local2[0];
      index_offset = local2[1];
    } else {
      var M_rotation = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ];
    }

    // multiply
    /* Normal flow
    joint.offset -> [-0.01683  1.81591  0.07903]
    M_parent -> [[ 1.          0.          0.        ]
                [ 0.          0.9612617   0.27563736]
                [ 0.         -0.27563736  0.9612617 ]]
    M_parent.dot(M_rotation) -> [[ 1.          0.          0.        ]
                                [ 0.          0.9961947  -0.08715574]
                                [ 0.          0.08715574  0.9961947 ]]
     offset_position -> [0. 0. 0.]
   */

    var M = multiply(M_parent, M_rotation);

    // https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:matrices/x9e81a4f98389efdf:adding-and-subtracting-matrices/e/matrix_addition_and_subtraction

    //console.log( joint.offset + "<<<<<<<<<<<<<joint_index<<<<<<<<<<<<<" , Array.isArray(joint.offset))
    //console.log(M_parent+ "<<<<<<<<<<<<<M_parent<<<<<<<<<<<< M_parent.length  is ARRAY" ,  Array.isArray(M_parent))
    //console.log(p_parent + "<<<<<<<<<<<<<p_parent<<<<<<<<<<<<<",  Array.isArray(p_parent))
    //console.log(offset_position + "<<<<<<<<<<<<<offset_position<<<<<<<<<<<<<",  Array.isArray(offset_position))

    var position = arraySum3(p_parent, dot3vs1(M_parent, joint.offset));
    position = arraySum3(position, offset_position);

    // console.log(position + "<<<<<<<<<<<<<position<<<<<<<<<<<<<")
    // rotation = rad2deg(mat2euler(M));
    var rotation = mat2euler(M, "rad2deg");

    //////////////
    // just find by id
    // joint_index = list(this.joints.values()).index(joint); ORIGINAL
    var local = 0;
    for(const item in this.joints) {
      if(joint.name == item) {
        // console.log(item, "  index => ", local);
        joint_index = local;
      }
      local++;
    }
    // console.log(joint_index + "<<<<<<<<<<<<<joint_index<<<<<<<<<<<<<")
    /////////////
    p[joint_index] = position;
    r[joint_index] = rotation;

    for(var c in joint.children) {
      index_offset = this._recursive_apply_frame(
        joint.children[c],
        frame_pose,
        index_offset,
        p,
        r,
        M,
        position
      );
    }

    return index_offset;
  }

  frame_pose(frame) {

    var jointLength = 0;
    for(var x in this.joints) {jointLength++}
    var p = Array.from(Array(jointLength), () => [0, 0, 0]);
    var r = Array.from(Array(jointLength), () => [0, 0, 0]);
    // var p = np.empty((this.joints.length, 3));
    // var r = np.empty((this.joints.length, 3));
    var frame_pose = this.keyframes[frame];
    var M_parent = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    M_parent[0][0] = 1;
    M_parent[1][1] = 1;
    M_parent[2][2] = 1;

    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>> p ", p);

    this._recursive_apply_frame(
      this.root,
      frame_pose,
      0,
      p,
      r,
      M_parent,
      [0, 0, 0]
    );

    // console.log(">>>>>>>>>>>>>>>>>AFTER>>>>>>>> p ", p);

    return [p, r];
  }

  all_frame_poses() {
    //  Array.from(Array(this.joints.length), () => new Array(3));
    // what is -> p len ,  >>>>>>> 75
    // what is -> p len of [o] ,  >>>>>>> 38
    // what is -> p len of [o][0] ,  >>>>>>> 3
    var jointLength = 0;
    for(var x in this.joints) {jointLength++}
    console.log("ALL FRAME POSES -. jointLength ", jointLength)
    // p = np.empty((this.frames, this.joints.length, 3));
    var p = Array.from({length: this.frames}, () => Array.from({length: jointLength}, () => [0, 0, 0]));
    // r = np.empty((this.frames, this.joints.length, 3));
    var r = Array.from({length: this.frames}, () => Array.from({length: jointLength}, () => [0, 0, 0]));

    for(var frame = 0;frame < this.keyframes.length;frame++) {

      var local3 = this.frame_pose(frame);
      // console.log(local3[0] + "<<<<<<<<<<this.frame_pose(frame)  <<")
      p[frame] = local3[0];
      r[frame] = local3[1];
    }

    return [p, r];
  }

  _plot_pose(p, r, fig, ax) {
    /* 
        _plot_pose(p, r, fig=None, ax=None) {
          import matplotlib.pyplot as plt
          from mpl_toolkits.mplot3d import axes3d, Axes3D
        if fig is None:
            fig = plt.figure()
        if ax is None:
            ax = fig.add_subplot(111, projection='3d')
    
        ax.cla()
        ax.scatter(p[:, 0], p[:, 2], p[:, 1])
        ax.set_xlim(-30, 30)
        ax.set_ylim(-30, 30)
        ax.set_zlim(-1, 59)
    
        plt.draw()
        plt.pause(0.001)
        */
  }

  // plot_frame(frame, fig=None, ax=None) {
  plot_frame(frame, fig, ax) {
    // ????
    p, (r = this.frame_pose(frame));
    this._plot_pose(p, r, fig, ax);
  }

  joint_names() {
    var keys = [];
    for(var key in this.joints) {
      keys.push(key);
    }
    return keys;
  }

  plot_all_frames() {
    /*
        import matplotlib.pyplot as plt
        from mpl_toolkits.mplot3d import axes3d, Axes3D
        fig = plt.figure()
        ax = fig.add_subplot(111, projection='3d')
        for i in range(self.frames) {
            self.plot_frame(i, fig, ax);
        } 
        */
  }

  __repr__() {
    // return f"BVH {len(self.joints.keys())} joints, {self.frames} frames";
    return `BVH ${this.joints.keys().length} joints, ${this.frames} frames`;
  }
}
