const PI = Math.PI;

class obj_3d {
    /**
     * faces are list of triangle  
     * colors are for faces  
     * @param {Array<Array<Number>>} vertex list of vertex as array of 3 number
     * @param {Array<Array<Number>>} faces list of faces as array of 3 vertex (index)
     * @param {Array<Number>} color [r, g, b, a]
     * @param {WebGLRenderingContext} gl gl
     * @param {(Number)=>Float32Array} get_trans function for translation
     */
    constructor(vertex, faces, color, gl, get_trans) {
        this.vertex = vertex;
        this.faces = faces;
        this.color = color
        this.gl = gl;
        this.get_trans = get_trans;
        this.make_buffer();
    }

    /**
     * get the transformation as a function of time  
     * placeholder
     * @param {Number} t 
     */
    static _get_trans(t){
        let tm = mat4.create();
        return tm;
    }

    /**
     * only need to be called once, don't know why I added this
     */
    make_buffer(){
        let position = [];
        let color = [];
        for (let i of this.vertex){
            position.push(...i);
            color.push(...this.color);
        }
        let indices = [];
        for (let i of this.faces){
            indices.push(...i);
        }
        let gl = this.gl;
        let pos_bf = gl.createBuffer(),
            col_bf = gl.createBuffer(),
            ind_bf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pos_bf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, col_bf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ind_bf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        this.buffers = {
            position: pos_bf,
            color: col_bf,
            indices: ind_bf
        };
    }
}

class obj_sphere extends obj_3d {
    /**
     * Sphere
     * @param {Number} r radius
     * @param {Array<Number>} color color
     * @param {WebGLRenderingContext} gl gl
     * @param {Number} h layers
     * @param {Number} c slices
     * @param {(Number) => Float32Array} [get_trans=null] trans function
     */
    constructor(r, color, gl, h, c, get_trans){
        let vertex = [[0,0,r]], faces = [];
        for (let i=1;i<h;i++){
            let z = r * Math.cos(PI*i/h);
            let rl = r * Math.sin(PI*i/h);
            for (let j=0;j<c;j++){
                let x = rl * Math.cos(PI*(j*2+i)/c);
                let y = rl * Math.sin(PI*(j*2+i)/c);
                vertex.push([x, y, z]);
            }
        }
        vertex.push([0,0,-r]);
        for (let i=1;i<h;i++){
            for (let j=0;j<c;j++){
                let p1 = (i-1) * c + j + 1;
                let p2 = p1 + 1;
                if (j == c-1) p2 -= c;
                let p3 = p1 + c;
                if (i == h-1) p3 -= j;
                faces.push([p1, p2, p3]);
                let p4 = p2 - c;
                if (i == 1) p4 = 0;
                faces.push([p1, p2, p4]);
            }
        }
        super(vertex, faces, color, gl, get_trans);
    }
}

class obj_rect extends obj_3d {
    /**
     * Origin at mid
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     * @param {Array<Number>} color 
     * @param {WebGLRenderingContext} gl 
     * @param {(Number)=>Float32Array} get_trans 
     */
    constructor(x, y, z, color, gl, get_trans) {
        super(
            [
                [+x/2, +y/2, +z/2],
                [+x/2, +y/2, -z/2],
                [+x/2, -y/2, +z/2],
                [+x/2, -y/2, -z/2],
                [-x/2, +y/2, +z/2],
                [-x/2, +y/2, -z/2],
                [-x/2, -y/2, +z/2],
                [-x/2, -y/2, -z/2]
            ],
            [
                [0, 1, 2],
                [3, 1, 2],
                [4, 5, 6],
                [7, 5, 6],
                [0, 1, 4],
                [5, 1, 4],
                [2, 3, 6],
                [7, 3, 6],
                [0, 2, 4],
                [6, 2, 4],
                [1, 3, 5],
                [7, 3, 5]
            ],
            color, gl, get_trans
        );
    }
}

class obj_cylinder extends obj_3d {
    /**
     * along z axis, origin in middle
     * @param {Number} r 
     * @param {Number} h 
     * @param {Number} c number of slice
     * @param {Array<Number>} color 
     * @param {WebGLRenderingContext} gl 
     * @param {(Number)=>Float32Array} get_trans 
     */
    constructor(r, h, c, color, gl, get_trans){
        let vertex = [], faces = [];
        for (let i=0;i<c;i++){
            vertex.push([r*Math.sin(PI*2*i/c), r*Math.cos(PI*2*i/c), -h/2]);
            vertex.push([r*Math.sin(PI*(2*i+1)/c), r*Math.cos(PI*(2*i+1)/c), h/2]);
            let p1 = i*2;
            let p2 = p1 + 1;
            let p3 = p1 + 2;
            if (p3 >= c*2){
                p3 -= c*2;
            }
            let p4 = p1 - 1;
            if (p4 < 0){
                p4 += c*2;
            }
            faces.push([p1, p2, p3]);
            faces.push([p1, p2, p4]);
            if (i>1){
                faces.push([0, i*2-2, i*2]);
                faces.push([1, i*2-1, i*2+1]);
            }
        }
        super(vertex, faces, color, gl, get_trans);
    }
}
