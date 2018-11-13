function urlP(parameter, defaultvalue) {
  var urlparameter = defaultvalue;
  if (window.location.href.indexOf(parameter) > -1) {
    urlparameter = getUrlVars()[parameter];
  }
  return urlparameter;
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}
let seed = urlP('seed', Date.now())
let rng = new prandom(seed)
let peeps = []
let factions = []
let locations = []
let grids = []
let bias = urlP('bias', 3)
let debug = false
let lt = Date.now()
let comp = 0
let drops = []
let subs = 3
let size = (subs * urlP('res', 100))
let itt = 0
let lastpredict = 0
let noiseScale = 0.03
let rs = size / subs
let loaded = 0

function setup() {
  noiseSeed(rng._seed)
  createCanvas(size, size)
  noiseDetail(20, 0.40)
  background(200)
  text("click to generate map\nmay take a long time", width / 2, height / 2)
  show()
  setTimeout(function() {
    for (var i = 0; i < size / subs; i++) {
      for (var j = 0; j < size / subs; j++) {
        grids.push(new grid(i, j))
      }
    }
    for (g of grids) {
      if (srandom(0, 5000, true) == 0) {
        drops.push(new drop(g.x, g.y))

      }
    }
  }, 0)
  noLoop()
}

function mouseClicked() {
  loop()
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
  if (frameRate() >= 10) {
    drops.push(new drop())
  }
  let p = predict(lt,1000000-comp)
  info.html(`${((loaded/grids.length)*100).toFixed(3)}% loaded: ${frameRate().toFixed(2)}fps: ${((comp/1000000)*100).toFixed(2)}% done with generating ${((p+lastpredict)/2).toFixed(0)}`);
  //background(20)
  lastpredict = ((p+lastpredict)/2)
  if (comp >= 1000000) {
    noLoop()
  }
  noStroke()
  for (g of grids) {
    if ((frameCount + g.x) % 2 == 0) {
      if (g.neighbors == [] || !g.neighbors) {
        //g.set()
      }
      if ((g.height) > (125)) {
        fill(0)
      } else {
        if (debug) {
          fill((map(255 - g.height, 255 - 125, 255, 0, 255, true) % 30) * 20)

        } else {
          fill(map(255 - g.height, 255 - 125, 255, 0, 255, true))
        }
      }
      rect(g.x * subs, g.y * subs, subs, subs)
    }
  }
  for (d of drops) {
    if (debug) {
      fill(0, 200, 0)
      ellipse(d.x * subs + subs / 2, d.y * subs + subs / 2, 2)
    }
    for (var i = 0; i < 50; i++) {
      d.step()
    }
  }
  lt = Date.now()
}
function predict(time,remaining) {
  let per = Date.now()-time
  return +(((remaining*per)/1000)/60).toFixed(0)

}
class grid {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.tempHeight = 0
    //this.height = (dist(this.x,this.y,(size/subs)/2,(size/subs)/2))
    this.height = ((noise(this.x * noiseScale, this.y * noiseScale)) * 255-bias)
    if (this.x == rs-1) {
      this.height = 580
    }
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
  constructor(x = srandom(0, rs - 1, true), y = srandom(0, rs - 1, true)) {
    this.life = 50
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
      comp++
      this.life = 6
      this.x = srandom(0, rs - 1, true)
      this.y = srandom(0, rs - 1, true)
      // this.x = Math.round(mouseX/subs)+srandom(-1,1,true)
      // this.y = Math.round(mouseY/subs)+srandom(-1,1,true)
      this.vx = srandom(-1,1,true)
      this.vy = srandom(-1,1,true)
      this.in = grids.find(obj => obj.x == this.x && obj.y == this.y)
    }
    if (this.in) {
      if (!this.in.neighbors) {
        this.in.set()
        loaded += 1
      }
      if (this.vx != 0 && this.vy != 0) {
        if ([this.vx,this.vy] == [-1,1]) {
          this.vnext = this.in.neighbors[0]
        }else if ([this.vx,this.vy] == [0,1]) {
          this.vnext = this.in.neighbors[1]
        }else if ([this.vx,this.vy] == [1,1]) {
          this.vnext = this.in.neighbors[2]

        }else if ([this.vx,this.vy] == [-1,0]) {
          this.vnext = this.in.neighbors[3]
        }else if ([this.vx,this.vy] == [1,0]) {
          this.vnext = this.in.neighbors[4]

        }else if ([this.vx,this.vy] == [-1,-1]) {
          this.vnext = this.in.neighbors[5]
        }else if ([this.vx,this.vy] == [0,-1]) {
          this.vnext = this.in.neighbors[6]
        }else if ([this.vx,this.vy] == [1,-1]) {
          this.vnext = this.in.neighbors[7]
        }
      }else {
        this.vnext = srandom(this.in.neighbors)
      }
      let th = this.in
      for (var i = 0; i < this.in.neighbors.length; i++) {
        let g = this.in.neighbors[i]
        if (g.height > th.height) {
          th = g
        }
      }
      if (srandom(0,5,true)<1) {
        th = this.vnext
      }
      let next = th
      if (!next) {
        this.life = 0
        return
      }
      if (next.height >= 135) {
        this.life = 0
      }
      this.in.height += 0.2
      this.hold += 0.2



      if (next) {
        if (debug) {
          fill(0,200,0,20)
          ellipse(this.x * subs + subs / 2, this.y * subs + subs / 2, random(1,5))
        }
        this.life -= 1
        this.vx = this.x - next.x
        this.vy = this.y - next.y
        this.in = next
        this.in.height -= this.hold
        this.hold = 0
        this.x = next.x;
        this.y = next.y;
      }
    }
  }
}
