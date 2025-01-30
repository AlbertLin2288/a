var scene;
function main(){
    const canvas = document.getElementById("my_canvas");
    const gl = canvas.getContext("webgl")
    scene = new Scene(gl);
    scene.add_obj(new obj_sphere(1, [0,0,1,1], gl, 40, 30, (t) => {
        let tm1 = mat4.create();
        mat4.translate(tm1, tm1, [Math.sin(t/1000)*2,Math.cos(t/1000)*2, 0]);
        return tm1;
    }));
    scene.add_obj(new obj_sphere(1, [1,0,0,1], gl, 40, 30, (t) => {
        let tm1 = mat4.create();
        mat4.translate(tm1, tm1, [Math.sin(t/1000)*-2,Math.cos(t/1000)*-2, 0]);
        return tm1;
    }));
    scene.reset();
    scene.unpause();
}
