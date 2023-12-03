//Constants and Variables
const canvas = document.querySelector(".myCanvas");
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight - document.getElementById("file-selector").offsetHeight;
const ctx = canvas.getContext('2d');

let scale = 1;

// Classes

class Plotter {
    constructor(ctx, w, h) {
        this.ctx = ctx;
        this.width = w;
        this.height = h;
    }

    background() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    plot(x, y) {
        let newCoord = this.convCoord(x, y);
        x = newCoord[0];
        y = newCoord[1];
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(x - 5, y - 5, 10, 10);
    }

    plotLine(x1, y1, x2, y2) {
        let coord1 = this.convCoord(x1, y1);
        let coord2 = this.convCoord(x2, y2);
        this.ctx.strokeStyle = "white";
        this.ctx.beginPath();
        this.ctx.moveTo(coord1[0], coord1[1]);
        this.ctx.lineTo(coord2[0], coord2[1]);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    plotTri(x1, y1, x2, y2, x3, y3, color) {
        let coord1 = this.convCoord(x1, y1);
        let coord2 = this.convCoord(x2, y2);
        let coord3 = this.convCoord(x3, y3);
        this.ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        this.ctx.lineWidth = 0.1;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(coord1[0], coord1[1]);
        this.ctx.lineTo(coord2[0], coord2[1]);
        this.ctx.lineTo(coord3[0], coord3[1]);
        this.ctx.lineTo(coord1[0], coord1[1]);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.fill();
    }

    //Helper method
    convCoord(x, y) {
        return [x + this.width/2, this.height/2 - y];
    }
}

class Vector3 {
    constructor(i, j, k) {
        this.i = i;
        this.j = j;
        this.k = k;
    }

    mag() {
        return Math.sqrt(Vector.dot(this, this));
    }

    toString() {
        return `<${this.i}, ${this.j}, ${this.k}>`;
    }
}

class Vector {
    static mul(scalar, vector) {
        return new Vector3(scalar*vector.i, scalar*vector.j, scalar*vector.k);
    }

    static add(v1, v2) {
        return new Vector3(v1.i + v2.i, v1.j + v2.j, v1.k + v2.k);
    }

    static dot(v1, v2) {
        return v1.i * v2.i + v1.j * v2.j + v1.k * v2.k;
    }

    static cross(v1, v2) {
        return new Vector3(v1.j * v2.k - v2.j * v1.k , v2.i * v1.k - v1.i * v2.k , v1.i * v2.j - v2.i * v1.j);
    }

    static rREF(m, v) {
        let a = [m.vi.i, m.vi.i, m.vi.j, m.vi.j, m.vi.k, m.vi.k];
        let b = [m.vj.i, m.vj.i, m.vj.j, m.vj.j, m.vj.k, m.vj.k];
        let c = [m.vk.i, m.vk.i, m.vk.j, m.vk.j, m.vk.k, m.vk.k];
        let d = [m.vi.j, m.vi.k, m.vi.i, m.vi.k, m.vi.i, m.vi.j];
        let e = [m.vj.j, m.vj.k, m.vj.i, m.vj.k, m.vj.i, m.vj.j];
        let f = [m.vk.j, m.vk.k, m.vk.i, m.vk.k, m.vk.i, m.vk.j];
        let g = [m.vi.k, m.vi.j, m.vi.k, m.vi.i, m.vi.j, m.vi.i];
        let h = [m.vj.k, m.vj.j, m.vj.k, m.vj.i, m.vj.j, m.vj.i];
        let i = [m.vk.k, m.vk.j, m.vk.k, m.vk.i, m.vk.j, m.vk.i];

        let x = [v.i, v.i, v.j, v.j, v.k, v.k];
        let y = [v.j, v.k, v.i, v.k, v.i, v.j];
        let z = [v.k, v.j, v.k, v.i, v.j, v.i];

        let idx = 0;
        while(idx < 7) {
            if(idx >= 6) {
                // rREF cannot be done
                return -1;
            }
            let big = (i[idx]-(c[idx]*g[idx]/a[idx]))-((f[idx]-(c[idx]*d[idx]/a[idx]))*(h[idx]-(b[idx]*g[idx]/a[idx]))/(e[idx]-(b[idx]*d[idx]/a[idx])))
            if(a[idx] != 0 && e[idx]-(b[idx]*d[idx]/a[idx]) != 0 && big != 0) {
                let zcomp = ((z[idx] - (x[idx]*g[idx]/a[idx])) - ((y[idx] - (x[idx]*d[idx]/a[idx]))*(h[idx] - (b[idx]*g[idx]/a[idx]))/(e[idx] - (b[idx]*d[idx]/a[idx]))))/big;
                let ycomp = ((y[idx] - (x[idx]*d[idx]/a[idx]))/(e[idx] - (b[idx]*d[idx]/a[idx]))) - ((f[idx] - (c[idx]*d[idx]/a[idx]))/(e[idx] - (b[idx]*d[idx]/a[idx])))*zcomp;
                let xcomp = x[idx]/a[idx] - c[idx]*zcomp/a[idx] - b[idx]*ycomp/a[idx];
                return new Vector3(xcomp, ycomp, zcomp);
            }
            idx++;
        }
    }
}

class Triangle {
    constructor(v1, v2, v3, r, g, b, a) {
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
        this.centroid = Vector.mul(1/3, Vector.add(Vector.add(v1, v2), v3));
        this.normal = Vector.cross(Vector.add(v2, Vector.mul(-1, v1)) , Vector.add(v3, Vector.mul(-1, v1)));
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    rgba() {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }
}

class Matrix {
    constructor(vi, vj, vk) {
        this.vi = vi;
        this.vj = vj;
        this.vk = vk;
    }

    transform(vector) {
        return new Vector3(this.vi.i * vector.i + this.vj.i * vector.j + this.vk.i * vector.k , this.vi.j * vector.i + this.vj.j * vector.j + this.vk.j * vector.k, this.vi.k * vector.i + this.vj.k * vector.j + this.vk.k * vector.k);
    }

    static mul(m1, m2) {
        return new Matrix(m1.transform(m2.vi), m1.transform(m2.vj), m1.transform(m2.vk));
    }

    toString() {
        return `[${this.vi.toString()}, ${this.vj.toString()}, ${this.vk.toString()}]`;
    }
}

function findUnitsCamera(cameraVector) {
    let i = cameraVector;
    let j = new Vector3(-1*i.j, i.i, 0);
    let k = Vector.cross(i, j);
    i = Vector.mul(1/i.mag(), i);
    j = Vector.mul(1/j.mag(), j);
    k = Vector.mul(1/k.mag(), k);
    return [i, j, k];
}

function generateTrianglesFromFile(file) {
    const reader = new FileReader();
    let triangles = [];

    reader.readAsText(file);

    reader.addEventListener("load", () => {
        let output = reader.result;
        let outputWords = output.split(/\s+/);
        for(let i = 0; i < outputWords.length; i++) {
            if(outputWords[i] === "facet") {
                triangles.push(new Triangle(new Vector3(Number(outputWords[i+8]), Number(outputWords[i+9]), Number(outputWords[i+10])), new Vector3(Number(outputWords[i+12]), Number(outputWords[i+13]), Number(outputWords[i+14])), new Vector3(Number(outputWords[i+16]), Number(outputWords[i+17]), Number(outputWords[i+18])), 0, 0, 255, 0.3));
            }
        }
        console.log(triangles);
        plotShapes(plotter, camera, triangles);
    });
    return triangles;
}

// Execution

let myVs = [new Vector3(100, 500, 300), new Vector3(100, 500, 500), new Vector3(100, 300, 300), new Vector3(100, 300, 500), new Vector3(-100, 500, 300), new Vector3(-100, 500, 500), new Vector3(-100, 300, 300), new Vector3(-100, 300, 500)];


let myTriangles = [
    new Triangle(new Vector3(100, 500, 300), new Vector3(100, 500, 500), new Vector3(100, 300, 300), 255, 0, 0, 0.75), 
    new Triangle(new Vector3(100, 300, 300), new Vector3(100, 500, 500), new Vector3(100, 300, 500), 255, 0, 0, 0.75), 
    new Triangle(new Vector3(-100, 500, 300), new Vector3(-100, 500, 500), new Vector3(-100, 300, 300), 255, 0, 0, 0.75), 
    new Triangle(new Vector3(-100, 300, 300), new Vector3(-100, 500, 500), new Vector3(-100, 300, 500), 255, 0, 0, 0.75),
    new Triangle(new Vector3(100, 300, 300), new Vector3(-100, 300, 300), new Vector3(-100, 300, 500), 255, 0, 0, 0.5), 
    new Triangle(new Vector3(100, 300, 300), new Vector3(-100, 300, 500), new Vector3(100, 300, 500), 255, 0, 0, 0.5),
    new Triangle(new Vector3(100, 500, 300), new Vector3(-100, 500, 300), new Vector3(-100, 500, 500), 255, 0, 0, 0.5), 
    new Triangle(new Vector3(100, 500, 300), new Vector3(-100, 500, 500), new Vector3(100, 500, 500), 255, 0, 0, 0.5),
    new Triangle(new Vector3(100, 300, 300), new Vector3(100, 500, 300), new Vector3(-100, 500, 300), 255, 0, 0, 0.4), 
    new Triangle(new Vector3(100, 300, 300), new Vector3(-100, 500, 300), new Vector3(-100, 300, 300), 255, 0, 0, 0.4),
    new Triangle(new Vector3(100, 300, 500), new Vector3(100, 500, 500), new Vector3(-100, 500, 500), 255, 0, 0, 0.4), 
    new Triangle(new Vector3(100, 300, 500), new Vector3(-100, 500, 500), new Vector3(-100, 300, 500), 255, 0, 0, 0.4),
]


/*
let myTriangles = [
    new Triangle(new Vector3(-3.5, 6, 2), new Vector3(-5.5, 6, 2), new Vector3(-3.5, 4, 2), 255, 0, 0, 0.75), 
    new Triangle(new Vector3(-3.5, 4, 2), new Vector3(-5.5, 6, 2), new Vector3(-5.5, 4, 2), 255, 0, 0, 0.75), 
    new Triangle(new Vector3(-3.5, 4, 0), new Vector3(-5.5, 4, 0), new Vector3(-3.5, 6, 0), 255, 0, 0, 0.75), 
    new Triangle(new Vector3(-3.5, 6, 0), new Vector3(-5.5, 4, 0), new Vector3(-5.5, 6, 0), 255, 0, 0, 0.75),
    new Triangle(new Vector3(-5.5, 4, 2), new Vector3(-5.5, 4, 0), new Vector3(-3.5, 4, 2), 255, 0, 0, 0.5), 
    new Triangle(new Vector3(-3.5, 4, 2), new Vector3(-5.5, 4, 0), new Vector3(-3.5, 4, 0), 255, 0, 0, 0.5),
    new Triangle(new Vector3(-5.5, 6, 2), new Vector3(-5.5, 6, 0), new Vector3(-5.5, 4, 2), 255, 0, 0, 0.5), 
    new Triangle(new Vector3(-5.5, 4, 2), new Vector3(-5.5, 6, 0), new Vector3(-5.5, 4, 0), 255, 0, 0, 0.5),
    new Triangle(new Vector3(-3.5, 6, 2), new Vector3(-3.5, 6, 0), new Vector3(-5.5, 6, 2), 255, 0, 0, 0.4), 
    new Triangle(new Vector3(-5.5, 6, 2), new Vector3(-3.5, 6, 0), new Vector3(-5.5, 6, 0), 255, 0, 0, 0.4),
    new Triangle(new Vector3(-3.5, 4, 2), new Vector3(-3.5, 4, 0), new Vector3(-3.5, 6, 2), 255, 0, 0, 0.4), 
    new Triangle(new Vector3(-3.5, 6, 2), new Vector3(-3.5, 4, 0), new Vector3(-3.5, 6, 0), 255, 0, 0, 0.4),
]
*/

//Vector.mul(1/Math.sqrt(13), new Vector3(3, 4, 12)), Vector.mul(1/5, new Vector3(-4, 3, 0)), Vector.mul(1/65, new Vector3(-36, -48, 25))
let cameraVector = new Vector3(5, 8, 4);
let camera = new Matrix(...findUnitsCamera(cameraVector));

let plotter = new Plotter(ctx, width, height);

function plotShapes(myPlotter, camera, triangles) {

    let newV1;
    let newV2;
    let newV3;

    myPlotter.background();
    myPlotter.plot(0,0);

    newV1 = Vector.rREF(camera, new Vector3(1000, 0, 0));
    myPlotter.plotLine(0, 0, newV1.j, newV1.k);

    newV1 = Vector.rREF(camera, new Vector3(0, 1000, 0));
    myPlotter.plotLine(0, 0, newV1.j, newV1.k);

    newV1 = Vector.rREF(camera, new Vector3(0, 0, 1000));
    myPlotter.plotLine(0, 0, newV1.j, newV1.k);

    /*
    for(let i = 0; i < triangles.length - 1; i++) {
        for(let j = i+1; j < triangles.length; j++) {
            if(Vector.add(triangles[i], Vector.mul(-1, triangles[j])).mag() == 200) {
                newV = Vector.rREF(camera, triangles[i]);
                newV2 = Vector.rREF(camera, triangles[j]);
                myPlotter.plotLine(newV.j, newV.k, newV2.j, newV2.k);
            }
        }
    }
    */

    for(let i = 0; i < triangles.length; i++) {
        newV1 = Vector.rREF(camera, Vector.mul(scale, triangles[i].v1));
        newV2 = Vector.rREF(camera, Vector.mul(scale, triangles[i].v2));
        newV3 = Vector.rREF(camera, Vector.mul(scale, triangles[i].v3));
        myPlotter.plotTri(newV1.j, newV1.k, newV2.j, newV2.k, newV3.j, newV3.k, triangles[i].rgba());
    }
}

plotShapes(plotter, camera, myTriangles); // Pass triangles in here

document.getElementById('file-selector').addEventListener('change', (event) =>  {
    const file = event.target.files[0];
    myTriangles = generateTrianglesFromFile(file);
});

document.addEventListener("keydown", (event) => {
    console.log(event.code);
    if(event.code === "ArrowRight") {
        cameraVector.j += 1;
        camera = new Matrix(...findUnitsCamera(cameraVector));
        plotShapes(plotter, camera, myTriangles);
    }
    if(event.code === "ArrowLeft") {
        cameraVector.j += -1;
        camera = new Matrix(...findUnitsCamera(cameraVector));
        plotShapes(plotter, camera, myTriangles);
    }

    if(event.code === "ArrowUp") {
        cameraVector.k += 1;
        camera = new Matrix(...findUnitsCamera(cameraVector));
        plotShapes(plotter, camera, myTriangles);
    }
    if(event.code === "ArrowDown") {
        cameraVector.k += -1;
        camera = new Matrix(...findUnitsCamera(cameraVector));
        plotShapes(plotter, camera, myTriangles);
    }
});

document.addEventListener("wheel", (event) => {
    console.log(event.deltaY);
    scale *= 1+event.deltaY*0.002;
    plotShapes(plotter, camera, myTriangles);
});