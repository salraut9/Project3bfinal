class Quaternion {
  constructor(w = 1, i = 0, j = 0, k = 0) {
    this.w = w;
    this.i = i;
    this.j = j;
    this.k = k;
  }

  
  static fromAxisAngle([x, y, z], angle) {
    const h = angle/2;
    const s = Math.sin(h);
    return new Quaternion(Math.cos(h), x*s, y*s, z*s);
  }


  //hamiltonian product
  static mult(q1, q2) {
    const {w: a1, i: b1, j: c1, k: d1} = q1;
    const {w: a2, i: b2, j: c2, k: d2} = q2;

    let w = a1*a2 - b1*b2 - c1*c2 - d1*d2;

    //bit of floating point rounding
    const r = Math.round(w);
    const d = w - r;
    if (Math.abs(d) < 1e-15) {
      w -= d;
    }

    return new Quaternion(
      w,
      a1*b2 + b1*a2 + c1*d2 - d1*c2,
      a1*c2 - b1*d2 + c1*a2 + d1*b2,
      a1*d2 + b1*c2 - c1*b2 + d1*a2
    );
  }


  axisAngle() {
    const angle = 2 * Math.acos(this.w);
    const s = Math.sin(angle/2);
    const axis = createVector(1, 0, 0);
    // console.log(Math.abs(s));

    //s != 0 but accounting for floating point error
    if (Math.abs(s) >= 1e-15) {
      // console.log("float")
      axis.x = this.i / s;
      axis.y = this.j / s;
      axis.z = this.k / s;
    }

    return {axis, angle: isNaN(angle) ? 0 : angle};
  }
}