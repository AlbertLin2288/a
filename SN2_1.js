let cubeRotation = 0.0;
let deltaTime = 0;

class Main {
    start() {
        this.canvas = document.getElementById("my_canvas");
        // Initialize the GL context
        const gl = this.canvas.getContext("webgl");
        this.scene = new Scene(this.canvas);

        // Only continue if WebGL is available and working
        if (gl === null) {
            alert(
            "Unable to initialize WebGL. Your browser or machine may not support it."
            );
            return;
        }
        
        // Set clear color to black, fully opaque
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Vertex shader program
        
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;
        
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
        
            varying lowp vec4 vColor;
        
            void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
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
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
            },
            uniformLocations: {
            projectionMatrix: gl.getUniformLocation(
                shaderProgram,
                "uProjectionMatrix"
            ),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            },
        };
        
        // Here's where we call the routine that builds all the
        // objects we'll be drawing.
        this.buffers = initBuffers(gl);

        // Draw the scene repeatedly
        this.paused = false;
        this.start_loop();
    }

    start_loop(){
        this.paused = false;
        requestAnimationFrame((t) => {
            this.last_t = t;
            requestAnimationFrame(this.loop);
        });
    }

    loop = (now) => {
        if (this.paused){
            return;
        }
        let delta_t = now - this.last_t;
        this.last_t = now;
        this.scene.drawScene(this.programInfo, this.buffers, delta_t);
        requestAnimationFrame(this.loop);
    }

    reset() {
        this.scene.reset();
    }
}

var main = new Main();

const positions = [
    // Front face
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
];
function initPositionBuffer(gl) {
    // Create a buffer for the square's positions.
    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);


    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);

    return positionBuffer;
}

const faceColors = [
    [1.0, 0.0, 0.0, 1.0], // Front face: red
    [0.0, 1.0, 1.0, 1.0], // Back face: cyan
    [0.0, 1.0, 0.0, 1.0], // Top face: green
    [1.0, 0.0, 1.0, 1.0], // Bottom face: magnate
    [0.0, 0.0, 1.0, 1.0], // Right face: blue
    [1.0, 1.0, 0.0, 1.0], // Left face: yellow
];
function initColorBuffer(gl) {

    // Convert the array of colors into a table for all the vertices.

    var colors = [];

    for (var j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
        // Repeat each color four times for the four vertices of the face
        colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);

    return colorBuffer;
}


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
function initIndexBuffer(gl) {
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.


    // Now send the element array to GL

    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.DYNAMIC_DRAW
    );

    return indexBuffer;
}
