

class MEBvhJoint {

  /**
   * class BvhJoint:
    def __init__(self, name, parent):
        self.name = name
        self.parent = parent
        self.offset = np.zeros(3)
        self.channels = []
        self.children = []

    def add_child(self, child):
        self.children.append(child)

    def __repr__(self):
        return self.name

    def position_animated(self):
        return any([x.endswith('position') for x in self.channels])

    def rotation_animated(self):
        return any([x.endswith('rotation') for x in self.channels])
   */
  constructor(name, parent) {
    this.name = name;
    this.parent = parent;
    this.offset = np.zeros(3);
    this.channels = [];
    this.children = [];
  }

}