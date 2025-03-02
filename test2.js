var scene;
function main(){
    const canvas = document.getElementById("my_canvas");
    const gl = canvas.getContext("webgl")
    scene = new Scene(gl);
    scene.add_obj(new obj_sphere(1, [0,0,1,1], 40, 30, gl, (t) => {
        let tm1 = mat4.create();
        mat4.translate(tm1, tm1, [0, 0, 3]);
        return tm1;
    }));
    scene.add_obj(new obj_cylinder(0.1, 4, 30, [1,0,0,1], gl, (t)=>{
        let tm1 = mat4.create();
        return tm1;
    }));
    scene.add_obj(new obj_rect(3, 3, 2.5, [1,1,0,1], gl, (t)=>{
        let tm1 = mat4.create();
        mat4.translate(tm1, tm1, [0, 0, -3.25]);
        return tm1;
    }));
    scene.reset();
    scene.start();
}
