var scene;
const /** radius of carbon atom */CR = 1;
const /** length of bond (include 2R) */BL = 4;
const /** radius of cylinder */BR = 0.1;
const /** color of bond */BC = [0.7, 0.7, 0.7, 1];
const /** radius of hydrogen atom */HR = 0.7;
const /** radius of leaving group */LR = 1;
const /** radius of nucleophile */NR = 1;
const /** length of phase */P0 = 0, P1 = 500, P2 = 1500, P3 = 2500, P4 = 3500, P5 = 4000;


const BA = PI/2-Math.acos(1/3);
function get_ang(t){
    if (t <= P1){
        ang = BA;
    } else if (t <= P2){
        ang = BA*(1-(t-P1)/(P2-P1));
    } else if (t<=P3){
        ang = 0;
    } else if (t<=P4){
        ang = -BA*(t-P3)/(P4-P3);
    } else {
        ang = -BA;
    }
    return ang;
}

function ang_mat(t){
    let mt = mat4.create();
    mat4.fromRotation(mt, get_ang(t), [0, 1, 0]);
    return mt;
}

function main(){
    const canvas = document.getElementById("my_canvas");
    const gl = canvas.getContext("webgl")
    scene = new Scene(gl, [], [0.3, 0.3, 0.3, 1], 30);
    // center carbon
    scene.add_obj(new obj_sphere(CR, [0,0,0,1], gl, 40, 30, (t) => {
        let tm1 = mat4.create();
        return tm1;
    }));
    // hydrogen
    scene.add_obj(new obj_sphere(HR, [1,1,1,1], gl, 40, 30, (t) => {
        let tm1 = mat4.create();
        mat4.fromTranslation(tm1, [BL, 0, 0]);
        let tm2 = mat4.create();
        mat4.fromRotation(tm2, 1*PI*2/3, [0, 0, 1]);
        mat4.mul(tm1, ang_mat(t), tm1);
        mat4.mul(tm2, tm2, tm1);
        return tm2;
    }));
    scene.add_obj(new obj_sphere(HR, [1,1,1,1], gl, 40, 30, (t) => {
        let tm1 = mat4.create();
        mat4.fromTranslation(tm1, [BL, 0, 0]);
        let tm2 = mat4.create();
        mat4.fromRotation(tm2, 2*PI*2/3, [0, 0, 1]);
        mat4.mul(tm1, ang_mat(t), tm1);
        mat4.mul(tm2, tm2, tm1);
        return tm2;
    }));
    scene.add_obj(new obj_sphere(HR, [1,1,1,1], gl, 40, 30, (t) => {
        let tm1 = mat4.create();
        mat4.fromTranslation(tm1, [BL, 0, 0]);
        let tm2 = mat4.create();
        mat4.fromRotation(tm2, 3*PI*2/3, [0, 0, 1]);
        mat4.mul(tm1, ang_mat(t), tm1);
        mat4.mul(tm2, tm2, tm1);
        return tm2;
    }));
    // bond
    scene.add_obj(new obj_cylinder(BR, BL, 30, BC, gl, (t) => {
        let tm1 = mat4.create();
        mat4.fromTranslation(tm1, [BL/2, 0, 0]);
        mat4.rotate(tm1, tm1, PI/2, [0, 1, 0]);
        let tm2 = mat4.create();
        mat4.fromRotation(tm2, 1*PI*2/3, [0, 0, 1]);
        mat4.mul(tm1, ang_mat(t), tm1);
        mat4.mul(tm2, tm2, tm1);
        return tm2;
    }));
    scene.add_obj(new obj_cylinder(BR, BL, 30, BC, gl, (t) => {
        let tm1 = mat4.create();
        mat4.fromTranslation(tm1, [BL/2, 0, 0]);
        mat4.rotate(tm1, tm1, PI/2, [0, 1, 0]);
        let tm2 = mat4.create();
        mat4.fromRotation(tm2, 2*PI*2/3, [0, 0, 1]);
        mat4.mul(tm1, ang_mat(t), tm1);
        mat4.mul(tm2, tm2, tm1);
        return tm2;
    }));
    scene.add_obj(new obj_cylinder(BR, BL, 30, BC, gl, (t) => {
        let tm1 = mat4.create();
        mat4.fromTranslation(tm1, [BL/2, 0, 0]);
        mat4.rotate(tm1, tm1, PI/2, [0, 1, 0]);
        let tm2 = mat4.create();
        mat4.fromRotation(tm2, 3*PI*2/3, [0, 0, 1]);
        mat4.mul(tm1, ang_mat(t), tm1);
        mat4.mul(tm2, tm2, tm1);
        return tm2;
    }));
    // leaving group
    scene.add_obj(new obj_sphere(LR, [1,0,0,1], gl, 40, 30, (t) => {
        let tm1 = mat4.create();
        let prog = (t-P1)/(P5-P1);
        if (prog < 0)prog = 0;
        if (prog > 1)prog = 1;
        mat4.fromTranslation(tm1, [0, 3*BL*prog, BL+3*BL*prog]);
        return tm1;
    }));
    // bond
    scene.add_obj(new obj_cylinder(BR, BL, 30, BC, gl, (t) => {
        let tm1 = mat4.create();
        if (t <= P1){
            mat4.fromTranslation(tm1, [0, 0, BL/2]);
        } else {
            mat4.fromTranslation(tm1, [0, 0, BL*Infinity]);
        }
        return tm1;
    }));
    // nuclophile
    scene.add_obj(new obj_sphere(NR, [1,0,0,1], gl, 40, 30, (t) => {
        let tm1 = mat4.create();
        let prog = (t-P2)/(P4-P2);
        if (prog < 0)prog = 0;
        if (prog > 1)prog = 1;
        mat4.fromTranslation(tm1, [0, 0, -BL*4+3*BL*prog]);
        return tm1;
    }));
    // bond
    scene.add_obj(new obj_cylinder(BR, BL, 30, BC, gl, (t) => {
        let tm1 = mat4.create();
        if (t <= P4){
            mat4.fromTranslation(tm1, [0, 0, -Infinity]);
        } else {
            mat4.fromTranslation(tm1, [0, 0, -BL/2]);
        }
        return tm1;
    }));
    scene.reset();
    scene.start();
}
