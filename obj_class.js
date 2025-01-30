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
        this.buffers = this.make_buffer();
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
        return {
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
