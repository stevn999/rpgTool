let seed = 1
let rng = new prandom(seed)
let peeps = []
let factions = []
let locations = []
let grids = []
let subs = 1
let size = (subs*800)
let itt = 0
let noiseScale = 0.02

function setup() {
  createCanvas(size, size)
  noiseDetail(10, 0.50)
  noiseSeed(seed)
  show()
  setTimeout(function() {
      for (var i = 0; i < size / subs; i++) {
        for (var j = 0; j < size / subs; j++) {
          grids.push(new grid(i, j))
        }
      }
    },20)

}

function mouseClicked() {
  noiseScale /= 1.2
  for (g of grids) {
    g.height = ((((g.height/255)*10)+(noise(g.x * noiseScale,g.y * noiseScale)))/11)*255
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
  //background(20)
  noStroke()
  for (g of grids) {
    if (frameCount % (size / subs) == g.x) {
      if ((g.height) > (125)) {
        fill(0)
      }else{
        fill(map(255-g.height,255-125,255,0,255,true))
      }
      rect(g.x * subs, g.y * subs, subs, subs)
    }
  }
}
class grid {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.tavg = 0
    //this.height = (dist(this.x,this.y,(size/subs)/2,(size/subs)/2))
    this.height = (noise(this.x * noiseScale,this.y * noiseScale))*255
    //console.log(noise(this.x,this.y));
    if (srandom(0,2)==0) {
      this.height += 20
    }
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
