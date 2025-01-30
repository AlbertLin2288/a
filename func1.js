window.pressedKeys = {};
window.onkeyup = (e) => {window.pressedKeys[e.code] = false;};
window.onkeydown = (e) => {window.pressedKeys[e.code] = true;};


class Scene {
    /**
     * @param {WebGLRenderingContext} gl gl
     * @param {Array<obj_3d>} objs objects to draw
     */
    constructor(gl, objs = [], background = [1, 1, 1, 1], init_z = 6){
        this.gl = gl;
        this.objs = objs;
        this.background  = background;
        this.init_z = init_z;
        this.init_gl();

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

        this.total_t = 0;
        this.reset();
    }

    /**
     * add an obj to the scene
     * @param {obj_3d} obj 
     */
    add_obj(obj){
        this.objs.push(obj);
    }

    /**
     * init gl related stuff
     */
    init_gl(){
        // Only continue if WebGL is available and working
        if (this.gl === null) {
            alert(
                "Unable to initialize WebGL. Your browser or machine may not support it."
            );
            return;
        }
        let gl = this.gl

        // Set clear color to white
        gl.clearColor(...this.background);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        
        // Vertex shader program
        
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;

            uniform mat4 uObjectMatrix;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            varying lowp vec4 vColor;

            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix *\
                    uObjectMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `;

        // Fragment shader program

        const fsSource = `
            varying lowp vec4 vColor;
        
            void main(void) {
            gl_FragColor = vColor;
            }
        `;

        // Initialize a shader program; this is where all the lighting
        // for the vertices and so forth is established.
        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

        // Collect all the info needed to use the shader program.
        // Look up which attributes our shader program is using
        // for aVertexPosition, aVertexColor and also
        // look up uniform locations.
        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(
                    shaderProgram,
                    "aVertexPosition"
                ),
                vertexColor: gl.getAttribLocation(
                    shaderProgram,
                    "aVertexColor"
                )
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(
                    shaderProgram,
                    "uProjectionMatrix"
                ),
                modelViewMatrix: gl.getUniformLocation(
                    shaderProgram,
                    "uModelViewMatrix"
                ),
                objectMatrix: gl.getUniformLocation(
                    shaderProgram,
                    "uObjectMatrix"
                )
            }
        };
    }

    start_loop(){
        this.stoped = false;
        requestAnimationFrame((t) => {
            this.last_t = t;
            requestAnimationFrame(this.loop);
        });
    }

    loop = (now) => {
        if (this.stoped){
            return;
        }
        this.delta_t = now - this.last_t;
        if (!this.paused){
            this.total_t += this.delta_t;
        }
        this.last_t = now;
        this.drawScene();
        requestAnimationFrame(this.loop);
    }

    /**
     * pause
     */
    stop() {
        this.stoped = true;
    }

    /**
     * unpause
     */
    start() {
        this.start_loop();
    }

    /**
     * toggle pause
     */
    toggle_pause() {
        this.paused = !(this.paused);
    }

    /**
     * init/reset animation
     */
    restart(){
        this.total_t = 0;
        this.paused = true;
    }

    /**
     * init/reset viewpoint
     */
    reset(){
        const fieldOfView = (45 * Math.PI) / 180; // in radians
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = Infinity;

        this.projectionMatrix = mat4.create();
        mat4.perspective(this.projectionMatrix, fieldOfView, aspect, zNear, zFar);
        this.rotMatrix = mat4.create();
        this.transMatrix = mat4.create();
        this.modelViewMatrix = mat4.create();
        mat4.translate(
            this.transMatrix, // destination matrix
            this.transMatrix, // matrix to translate
            [-0.0, 0.0, -this.init_z]
        );
        this.mul = 0.0;
        this.paused = true;
    }

    /**
     * update viewpoint
     * @param {Number} delta_t time since last check
     * @returns Translation matrix
     */
    update_viewpoint(delta_t) {
        // viewing
        let rot_vel = 0.05, tran_vel = 0.2
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
                    Math.PI * rot_vel * delta_t,
                    [1,0,0]
                )
            }
            if (window.pressedKeys["KeyS"]){
                mat4.rotate(
                    temp_mat,
                    temp_mat,
                    -Math.PI * rot_vel * delta_t,
                    [1,0,0]
                )
            }
            if (window.pressedKeys["KeyZ"]){
                mat4.rotate(
                    temp_mat,
                    temp_mat,
                    -Math.PI * rot_vel * delta_t,
                    [0,1,0]
                )
            }
            if (window.pressedKeys["KeyC"]){
                mat4.rotate(
                    temp_mat,
                    temp_mat,
                    Math.PI * rot_vel * delta_t,
                    [0,1,0]
                )
            }
            if (window.pressedKeys["KeyD"]){
                mat4.rotate(
                    temp_mat,
                    temp_mat,
                    -Math.PI * rot_vel * delta_t,
                    [0,0,1]
                )
            }
            if (window.pressedKeys["KeyA"]){
                mat4.rotate(
                    temp_mat,
                    temp_mat,
                    Math.PI * rot_vel * delta_t,
                    [0,0,1]
                )
            }
        } else {
            // moving
            if (window.pressedKeys["ArrowDown"]){
                mat4.translate(
                    this.transMatrix,
                    this.transMatrix,
                    [0,tran_vel * delta_t,0]
                )
            }
            if (window.pressedKeys["ArrowUp"]){
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
            if (window.pressedKeys["KeyW"]){
                mat4.translate(
                    this.transMatrix,
                    this.transMatrix,
                    [0,0,tran_vel * delta_t]
                )
            }
            if (window.pressedKeys["KeyS"]){
                mat4.translate(
                    this.transMatrix,
                    this.transMatrix,
                    [0,0,-tran_vel * delta_t]
                )
            }
        }
        mat4.mul(this.rotMatrix, temp_mat, this.rotMatrix);
        mat4.mul(this.modelViewMatrix, this.transMatrix, this.rotMatrix);
    }

    drawScene(){
        let gl = this.gl;
        let delta_t = Math.max(0.2, this.delta_t / 1000);
        this.update_viewpoint(delta_t);

        gl.clearColor(...this.background); // Clear to white, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (let obj of this.objs){
            // Tell WebGL how to pull out the positions from the position
            // buffer into the vertexPosition attribute.
            setPositionAttribute(gl, obj.buffers, this.programInfo);
    
            setColorAttribute(gl, obj.buffers, this.programInfo);
        
            // Tell WebGL which indices to use to index the vertices
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffers.indices);
        
            // Tell WebGL to use our program when drawing
            gl.useProgram(this.programInfo.program);
        
            // Set the shader uniforms
            gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.projectionMatrix,
                false,
                this.projectionMatrix
            );
            gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.modelViewMatrix,
                false,
                this.modelViewMatrix
            );
            gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.objectMatrix,
                false,
                obj.get_trans(this.total_t)
            );
        
            gl.drawElements(
                gl.TRIANGLES,
                obj.faces.length * 3,
                gl.UNSIGNED_SHORT,
                0
            );
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
