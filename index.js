var cur = 0;
var elms = [];
var models;
var inverse = {
    ws_rot: 1,
    cz_rot: 1,
    ws_tran: 1,
    ad_tran: 1,
    updown_tran: 1
};

function switch_img(i){
    i = Number(i);

    if (i == cur || i < 0 || i >= elms.length){
        return;
    }
    elms[cur].style.display = "none";
    elms[cur].contentWindow.scene.stop();
    elms[i].style.display = "block";
    elms[i].focus();
    elms[i].contentWindow.scene.start();
    cur = i;
    document.getElementById("model_name").innerHTML = models[cur];
}

function my_key_event(code){
    if (code == "ArrowRight"){
        switch_img(cur+1);
    } else if (code == "ArrowLeft"){
        switch_img(cur-1);
    } else if (code == "Space"){
        elms[cur].contentWindow.scene.toggle_pause();
    }
}

window.onload = async () => {
    // load model list
    const res = await fetch("./model_list.txt");
    if (!res.ok){
        alert("Unable to open model list");
    }
    models = (await res.text()).split("\n");

    let main_div = document.getElementById("main");
    for (let i in models){
        let model = models[i];
        let frame = document.createElement("iframe");
        frame.src = "canvas.html";
        frame.id = "elm_" + model;
        frame.classList.add("my_iframe");
        main_div.appendChild(frame);
        elms.push(frame);
        frame.contentWindow.inverse = inverse;
        frame.addEventListener("load", () => {
            frame.contentWindow.init_frame(
                window.innerWidth,
                window.innerHeight
            ).then((res) => {
                frame.width = res.w;
                frame.height = res.h;
                frame.contentWindow.set_script(model + ".js").then((res) => {
                    if (i != cur){
                        frame.style.display = "none";
                        frame.contentWindow.scene.stop();
                    } else {
                        frame.focus()
                        document.getElementById("model_name").innerHTML = models[cur];
                    }
                });
            });
        });
        
        frame.contentWindow.addEventListener("keydown", (e) => {
            my_key_event(e.code);
        })

        let btn = document.createElement("button");
        btn.innerHTML = i;
        btn.classList.add("choice_btn");
        btn.onclick = () => {switch_img(i);};
        document.getElementById("choice_div").appendChild(btn);
    }
    for (let elm of document.getElementsByTagName("button")){
        elm.addEventListener("click", (e) => {
            e.currentTarget.blur();
            elms[cur].focus();
        });
    }
    document.addEventListener("keydown", (e) => {
        e.preventDefault();
        my_key_event(e.code);
    });
};