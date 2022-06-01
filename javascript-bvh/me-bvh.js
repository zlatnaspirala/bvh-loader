/**
 * @description Manual convert python script BVH
 * from https://github.com/dabeschte/npybvh to the JS.
 * @author Nikola Lukic
 */

function deg2rad(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

class MEBvhJoint {

  constructor(name, parent) {
    this.name = name;
    this.parent = parent;

    // replace analog
    /*
        [[0. 0. 0.]
        [0. 0. 0.]
        [0. 0. 0.]]
    */
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
    // ???????????
    // return any([x.endswith('position') for x in self.channels])
  }

  rotation_animated() {
    // ???????????
    // return any([x.endswith('rotation') for x in self.channels])
  }
}

class MEBvh {
  constructor() {
    this.joints = {};
    this.root = null; // python None -> JS null
    this.keyframes = null;
    this.frames = 0;
    this.fps = 0;

    this.myName = "MATRIX-ENGINE-BVH";
  }

  async parse_file() {

    var link = "https://raw.githubusercontent.com/zlatnaspirala/Matrix-Engine-BVH-test/main/javascript-bvh/example.bvh";
    var test = fetch(link).then(event => {
    // var test = fetch("example.bvh").then(event => {
      event.text().then(text => {
        // console.log("Test parse file func -> ", text);
        var hierarchy = text.split("MOTION")[0];
        var motion = text.split("MOTION")[1];
        // console.log("Test split MOTION hierarchy part-> ", hierarchy);
        // console.log("Test split MOTION motion part -> ", motion);
        // console.log("Test scope -> ", this.myName);
        this._parse_hierarchy(hierarchy);
        this.parse_motion(motion);
      });
    });
  }

  _parse_hierarchy(text) {
    // var lines = text.split(/[\n]+/g);
    var lines = text.split(/\s*\n+\s*/);

    console.log("Test _parse_hierarchy  -> ", lines);

    var joint_stack = [];

    for (var key in lines) {
      var line = lines[key];
      console.log("Test _parse_hierarchy FIRST WORD  -> ", line);

      var words = line.split(/\s+/);
      var instruction = words[0];

      var parent = null;

      if (instruction == "JOINT" || instruction == "ROOT") {
        if (instruction == "JOINT") {
          // -1 py -> last item
          parent = joint_stack[joint_stack.length - 1];
        } else {
          parent = null;
        }

        var joint = new MEBvhJoint(words[1], parent);

        this.joints[joint.name] = joint;
        if (parent != null) {
          parent.add_child(joint);
        }
        joint_stack.push(joint);
        if (instruction == "ROOT") {
          this.root = joint;
        }
      } else if (instruction == "CHANNELS") {
        for (var j = 2; j < words.length; j++) {
          joint_stack[joint_stack.length - 1].channels.push(words[j]);
        }
      } else if (instruction == "OFFSET") {
        for (var j = 1; j < words.length; j++) {
          joint_stack[joint_stack.length - 1].offset[j - 1] = parseFloat(
            words[j]
          );
        }
      } else if (instruction == "End") {
        console.log("End ................");
        var joint = new MEBvhJoint(
          joint_stack[joint_stack.length - 1].name + "_end",
          joint_stack[joint_stack.length - 1]
        );
        joint_stack[joint_stack.length - 1].add_child(joint);
        joint_stack.push(joint);
        this.joints[joint.name] = joint;
      } else if (instruction == "}") {
        // array.pop() is equal
        joint_stack.pop();
      }
    }
  }

  _add_pose_recursive(joint, offset, poses) {
    var pose = joint.offset + offset;

    poses.push(pose);

    for (var c in joint.children) {
      // ?????????? check

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
    for (var key in lines) {
      var line = lines[key];
      console.log("Test parse_motion LINE  -> ", line);
      if (line == "") { // equal to py
        continue;
      }

      var words = line.split(/\s+/);

      if (line.startsWith("Frame Time:")) {
        console.log(">>>>>>>>Frame Time:>>>>>", words);
        this.fps =  Math.round(1 / parseFloat(words[2]));
        continue;
      }
      if (line.startsWith("Frames:")) {
        this.frames = parseInt(words[1]);
        continue;
      }

      if (this.keyframes == null) {
        console.log(">>>>>>>>words>>>>>", words);
        console.log(">>>>>>>>this.frames>>>>>", this.frames);
        // this.keyframes = np.empty((this.frames, len(words)), dtype=np.float32);
      }

      for (var angle_index = 0; angle_index < words.length ;angle_index++) {
        console.log(">>>>>>>>angle_index>>>>>", angle_index);
        //  self.keyframes[frame, angle_index] = float(words[angle_index])
        // ???????????????????????
        // this.keyframes[frame, angle_index] = parseFloat(words[angle_index]);
      }

      frame += 1;
    }
  }

  _extract_rotation(frame_pose, index_offset, joint) {
    local_rotation = [0, 0, 0];

    for (key in joint.channels) {
      var channel = joint.channels[key];

      if (channel.endswith("position")) {
        continue;
      }
      if (channel == "Xrotation") {
        local_rotation[0] = frame_pose[index_offset];
      } else if (channel == "Yrotation") {
        local_rotation[1] = frame_pose[index_offset];
      } else if (channel == "Zrotation") {
        local_rotation[2] = frame_pose[index_offset];
      } else {
        console.warn("Unknown channel {channel}");
        // raise Exception(f"Unknown channel {channel}");
      }
      index_offset += 1;
    }

    local_rotation = deg2rad(local_rotation);

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

    for (key in joint.channels) {
      var channel = joint.channels[key];

      if (channel.endswith("position")) {
        continue;
      }

      if (channel == "Xrotation") {
        // ?????????????????
        // euler_rot = np.array([local_rotation[0], 0., 0.]);
      } else if (channel == "Yrotation") {
        // ?????????????????
        // euler_rot = np.array([0., local_rotation[1], 0.]);
      } else if (channel == "Zrotation") {
        // ?????????????????
        // euler_rot = np.array([0., 0., local_rotation[2]]);
      } else {
        console.warn("Unknown channel {channel}");
      }

      // ?????????????????
      // var M_channel = euler2mat(*euler_rot)
      // ?????????????????
      // M_rotation = M_rotation.dot(M_channel)

      // return M_rotation, index_offset
      // return [M_rotation, index_offset]
    }
  }

  _extract_position(joint, frame_pose, index_offset) {
    offset_position = [0, 0, 0];
    for (var key in joint.channels) {
      var channel = joint.channels[key];

      if (channel.endswith("rotation")) {
        continue;
      }

      if (channel == "Xposition") {
        offset_position[0] = frame_pose[index_offset];
      } else if (channel == "Yposition") {
        offset_position[1] = frame_pose[index_offset];
      } else if (channel == "Zposition") {
        offset_position[2] = frame_pose[index_offset];
      } else {
        console.warn("Unknown channel {channel}");
        // raise Exception(f"Unknown channel {channel}")
      }
      index_offset += 1;
    }
    return offset_position, index_offset;
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
    if (joint.position_animated()) {
      offset_position,
        (index_offset = this._extract_position(
          joint,
          frame_pose,
          index_offset
        ));
    } else {
      offset_position = [0, 0, 0];
    }

    if (joint.channels.length == 0) {
      joint_index = list(this.joints.values()).index(joint);
      p[joint_index] = p_parent + M_parent.dot(joint.offset);
      r[joint_index] = mat2euler(M_parent);
      return index_offset;
    }

    if (joint.rotation_animated()) {
      M_rotation,
        (index_offset = this._extract_rotation(
          frame_pose,
          index_offset,
          joint
        ));
    } else {
      M_rotation = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ];
    }

    var M = M_parent.dot(M_rotation);
    position = p_parent + M_parent.dot(joint.offset) + offset_position;

    rotation = rad2deg(mat2euler(M));
    joint_index = list(this.joints.values()).index(joint);
    p[joint_index] = position;
    r[joint_index] = rotation;

    for (var c in joint.children) {
      index_offset = this._recursive_apply_frame(
        c,
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
    var p = np.empty((this.joints.length, 3));
    var r = np.empty((this.joint.length, 3));
    frame_pose = this.keyframes[frame];

    var M_parent = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    // np.zeros((3, 3));

    M_parent[(0, 0)] = 1;
    M_parent[(1, 1)] = 1;
    M_parent[(2, 2)] = 1;
    this._recursive_apply_frame(
      this.root,
      frame_pose,
      0,
      p,
      r,
      M_parent,
      [0, 0, 0]
    );

    return p, r;
  }

  all_frame_poses() {
    p = np.empty((this.frames, this.joints.length, 3));
    r = np.empty((this.frames, this.joints.length, 3));

    for (frame in range(len(this.keyframes))) {
      p[frame], (r[frame] = this.frame_pose(frame));
    }

    return p, r;
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
    return this.joints.keys();
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

// INSTANCVE OF PROGRAM

var anim = new MEBvh();

anim.parse_file();

anim.plot_hierarchy()

// extract single frame pose: axis0=joint, axis1=positionXYZ/rotationXYZ
p, r = anim.frame_pose(0);
