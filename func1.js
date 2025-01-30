window.pressedKeys = {};
window.onkeyup = (e) => {window.pressedKeys[e.code] = false;};
window.onkeydown = (e) => {window.pressedKeys[e.code] = true;};

class obj_3d {
    /**
     * faces are list of triangle  
     * colors are for faces  
     * @param {Array} vertex 
     * @param {Array} faces 
     * @param {Array} colors
     */
    constructor(vertex, faces, colors) {
        this.vertex = vertex;
        this.faces = faces;
        this.color = colors
    }
}

class Scene {
    constructor(canvas){
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl");

        this.reset();
    }

    reset(){
        const fieldOfView = (45 * Math.PI) / 180; // in radians
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;

        this.projectionMatrix = mat4.create();
        mat4.perspective(this.projectionMatrix, fieldOfView, aspect, zNear, zFar);
        this.rotMatrix = mat4.create();
        this.transMatrix = mat4.create();
        mat4.translate(
            this.transMatrix, // destination matrix
            this.transMatrix, // matrix to translate
            [-0.0, 0.0, -6.0]
        );
        this.mul = 0.0;
        document.addEventListener("keydown", (e) => {
            if (e.code == "Equal"){
                // +
                this.mul = Math.min(this.mul+0.3,3);
            }
            if (e.code == "Minus"){
                // -
                this.mul = Math.max(this.mul-0.3,-3);
            }
        });
    }

    drawScene(programInfo, buffers, delta_t){
        let gl = this.gl;
        delta_t = Math.max(0.2, delta_t / 1000);

        gl.clearColor(1.0, 1.0, 1.0, 1.0); // Clear to white, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
    
        // Clear the canvas before we start drawing on it.
    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



        let rot_vel = 0.2, tran_vel = 0.2
        rot_vel *= Math.exp(this.mul);
        tran_vel *= Math.exp(this.mul);
        // Move the view matrix base on key
        let temp_mat = mat4.create();
        if (window.pressedKeys["ShiftLeft"] || window.pressedKeys["ShiftRight"]){
            // rotating
            if (window.pressedKeys["KeyW"]){
                mat4.rotate(
                    temp_mat,
                    temp_mat,
                    -Math.PI * rot_vel * delta_t,
                    [1,0,0]
                )
            }
            if (window.pressedKeys["KeyS"]){
                mat4.rotate(
                    temp_mat,
                    temp_mat,
                    Math.PI * rot_vel * delta_t,
                    [1,0,0]
                )
            }
            if (window.pressedKeys["KeyA"]){
                mat4.rotate(
                    temp_mat,
                    temp_mat,
                    -Math.PI * rot_vel * delta_t,
                    [0,1,0]
                )
            }
            if (window.pressedKeys["KeyD"]){
                mat4.rotate(
                    temp_mat,
                    temp_mat,
                    Math.PI * rot_vel * delta_t,
                    [0,1,0]
                )
            }
        } else {
            // moving
            if (window.pressedKeys["KeyW"]){
                mat4.translate(
                    this.transMatrix,
                    this.transMatrix,
                    [0,tran_vel * delta_t,0]
                )
            }
            if (window.pressedKeys["KeyS"]){
                mat4.translate(
                    this.transMatrix,
                    this.transMatrix,
                    [0,-tran_vel * delta_t,0]
                )
            }
            if (window.pressedKeys["KeyA"]){
                mat4.translate(
                    this.transMatrix,
                    this.transMatrix,
                    [-tran_vel * delta_t,0,0]
                )
            }
            if (window.pressedKeys["KeyD"]){
                mat4.translate(
                    this.transMatrix,
                    this.transMatrix,
                    [tran_vel * delta_t,0,0]
                )
            }
        }
        mat4.mul(this.rotMatrix, temp_mat, this.rotMatrix);
        let modelViewMatrix = mat4.create();
        mat4.mul(modelViewMatrix, this.transMatrix, this.rotMatrix);
        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        setPositionAttribute(gl, buffers, programInfo);
    
        setColorAttribute(gl, buffers, programInfo);
    
        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    
        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);
    
        // Set the shader uniforms
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            this.projectionMatrix
        );
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix
        );
    
        {
            const vertexCount = 36;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }
    }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initBuffers(gl) {
    const positionBuffer = initPositionBuffer(gl);

    const colorBuffer = initColorBuffer(gl);

    const indexBuffer = initIndexBuffer(gl);

    return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
    };
}

function initIndexBuffer(gl) {
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    const indices = [
        0,
        1,
        2,
        0,
        2,
        3, // front
        4,
        5,
        6,
        4,
        6,
        7, // back
        8,
        9,
        10,
        8,
        10,
        11, // top
        12,
        13,
        14,
        12,
        14,
        15, // bottom
        16,
        17,
        18,
        16,
        18,
        19, // right
        20,
        21,
        22,
        20,
        22,
        23, // left
    ];

    // Now send the element array to GL

    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
    );

    return indexBuffer;
}

function setPositionAttribute(gl, buffers, programInfo) {
    const numComponents = 3;
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

// Tell WebGL how to pull out the colors from the color buffer
// into the vertexColor attribute.
function setColorAttribute(gl, buffers, programInfo) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}
