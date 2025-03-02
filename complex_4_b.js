var scene;
const /** radius of atom */AR = 1;
const /** length of bond (include 2R) */BL = 4;
const /** radius of cylinder */BR = 0.1;
const /** color of bond */BC = [0.7, 0.7, 0.7, 1];
const /** radius of hydrogen atom */HR = 0.7;

function main(){
    const canvas = document.getElementById("my_canvas");
    const gl = canvas.getContext("webgl")
    scene = new Scene(gl, [], [0.3, 0.3, 0.3, 1], 30);
    // metal
    scene.add_obj(new obj_sphere(AR, [0.6,0.6,0.6,1], 40, 30, gl, []));
    // ligands
    let l1 = new obj_group(gl, [
        [obj_cylinder, [BR, BL, 30, BC], [
            [1, [0, 0, BL*0.5]]
        ]],
        [obj_sphere, [AR, [0,0.31,0,1], 40, 30], [
            [1, [0, 0, BL]]
        ]]
    ]);
    scene.add_obj(l1.make([]));
    scene.add_obj(l1.make([
        [0, 1.885, [0, 1, 0]],
        [0, 0*PI*2/3, [0, 0, 1]],
    ]));
    scene.add_obj(l1.make([
        [0, 1.885, [0, 1, 0]],
        [0, 1*PI*2/3, [0, 0, 1]],
    ]));
    scene.add_obj(l1.make([
        [0, 1.885, [0, 1, 0]],
        [0, 2*PI*2/3, [0, 0, 1]],
    ]));
    scene.reset();
    scene.start();
}
