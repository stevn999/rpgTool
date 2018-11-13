function urlP(parameter, defaultvalue){
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1){
        urlparameter = getUrlVars()[parameter];
        }
    return urlparameter;
}
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
let seed = urlP('seed',Date.now())
let rng = new prandom(seed)
let peeps = []
let factions = []
let locations = []
let grids = []
let drops = []
let subs = 3
let size = (subs * 128)
let itt = 0
let noiseScale = 0.04
let rs = size / subs
let loaded = 0

function setup() {
  createCanvas(size, size)
  noiseDetail(10, 0.50)
  background(200)
  text("loading", width / 2, height / 2)
  noiseSeed(seed)
  show()
  setTimeout(function() {
    for (var i = 0; i < size / subs; i++) {
      for (var j = 0; j < size / subs; j++) {
        grids.push(new grid(i, j))
      }
    }
     for (g of grids) {
       if (srandom(0,1000,true)==0) {
         drops.push(new drop(g.x,g.y))

       }
     }
  }, 0)
}

function mouseClicked() {
  noiseScale /= 1.2
  for (g of grids) {
    //g.height = ((((g.height / 255) * 10) + (noise(g.x * noiseScale, g.y * noiseScale))) / 11) * 255
  }
}

function mouseDragged() {

}

function adjacent(x, y) {
  temp = []
  let s = size / subs
  temp.push(grids.find(obj => obj.x == ((x - 1 + s) % s) && obj.y == ((y + 1 + s) % s)));
  temp.push(grids.find(obj => obj.x == x && obj.y == ((y + 1 + s) % s)));
  temp.push(grids.find(obj => obj.x == ((x + 1 + s) % s) && obj.y == ((y + 1 + s) % s)));

  temp.push(grids.find(obj => obj.x == ((x - 1 + s) % s) && obj.y == ((y + 0 + s) % s)));
  temp.push(grids.find(obj => obj.x == ((x + 1 + s) % s) && obj.y == ((y + 0 + s) % s)));

  temp.push(grids.find(obj => obj.x == ((x - 1 + s) % s) && obj.y == ((y - 1 + s) % s)));
  temp.push(grids.find(obj => obj.x == x && obj.y == ((y - 1 + s) % s)));
  temp.push(grids.find(obj => obj.x == ((x + 1 + s) % s) && obj.y == ((y - 1 + s) % s)));
  return temp
  //console.log(temp);
}



function draw() {
  info.html(`${((loaded/grids.length)*100).toFixed(1)}% loaded: ${frameRate().toFixed(2)}fps`);
  //background(20)
  noStroke()
  for (g of grids) {
    if ((frameCount+g.x)%2==0) {
      if (g.neighbors == [] || !g.neighbors) {
        //g.set()
      }
      if ((g.height) > (125)) {
        fill(0)
      } else {
        fill(map(255 - g.height, 255 - 125, 255, 0, 255, true))
      }
      rect(g.x * subs, g.y * subs, subs, subs)
    }
  }
  fill(0, 200, 0)
  for (d of drops) {
    //ellipse(d.x * subs+subs/2, d.y * subs+subs/2, 2)
    for (var i = 0; i < 5; i++) {
    d.step()
  }
  }
}
class grid {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.tempHeight = 0
    //this.height = (dist(this.x,this.y,(size/subs)/2,(size/subs)/2))
    this.height = (noise(this.x * noiseScale, this.y * noiseScale)) * 255
    //this.height = ((this.x - (rs / 2)) / rs) * 255
    //console.log(noise(this.x,this.y));

  }
  set() {
    this.neighbors = adjacent(this.x, this.y)
  }
  average() {
    let sum = this.height

    for (var i = 0; i < this.neighbors.length; i++) {
      sum += this.neighbors[i].height
    }
    this.tavg = (sum) / 9
  }
}
class drop {
  constructor(x = srandom(0, rs - 1, true),y = srandom(0, rs - 1, true)) {
    this.life = 5
    this.holding = 0
    this.x = x
    this.vx = 0
    this.vy = 0
    this.y = y
    this.in = grids.find(obj => obj.x == this.x && obj.y == this.y)
    //console.log(this.x,this.y,"h");
  }
  step() {
    this.life -= srandom(1, 5, true)
    if (this.life <= 0) {
      this.life = 21
      this.x = srandom(0, rs - 1, true)
      this.y = srandom(0, rs - 1, true)
      this.in = grids.find(obj => obj.x == this.x && obj.y == this.y)
    }
    if (this.in) {
      if (!this.in.neighbors) {
        this.in.set()
        loaded+=1
      }
      let th = this.in
      for (var i = 0; i < this.in.neighbors.length; i++) {
        let g = this.in.neighbors[i]
        if (g.height > th.height) {
          th = g
        }
      }
      if (th == this.in) {
        th = srandom(this.in.neighbors)
      }
      let next = th
      if (!next) {
        this.life = 0
        return
      }
      if (next.height >= 125) {
        this.life = 0
      }
      this.in.height += 1
      this.hold += 1


      if (next) {
        this.in = next
        this.in.height -= this.hold
        this.hold = 0
        this.x = next.x;
        this.y = next.y;
      }
    }
  }
}
