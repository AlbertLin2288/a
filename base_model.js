var scene;

function main(){
    const canvas = document.getElementById("my_canvas");
    const gl = canvas.getContext("webgl")
    scene = new Scene(gl, [], [0.3, 0.3, 0.3, 1], 30);
    scene.reset();
    scene.start();
}
