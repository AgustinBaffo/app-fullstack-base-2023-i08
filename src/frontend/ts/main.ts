var M;

class Main implements EventListenerObject, HttpResponse {
    users: Array<Usuario> = new Array();
    framework: Framework = new Framework();

    constructor() {
        var usr1 = new Usuario("mramos", "Matias");
        var usr2 = new Usuario("jlopez", "Juan");

        this.users.push(usr1);
        this.users.push(usr2);

        var obj = { "nombre": "Matias", "edad": 35, "masculino": true };
    }

    manejarRespueta(respueta: string) {

        console.log("respuesta: \n\n" + respueta);
        var lista: Array<Device> = JSON.parse(respueta);
        var ulDisp = document.getElementById("listaDisp");
        ulDisp.innerHTML = "";

        for (var disp of lista) {
            var item: string = `<li class="collection-item avatar">`;
            if (disp.type == 1) {
                item += '<img src="static/images/lightbulb.png" alt = "" class="circle" >'
            } else {
                item += '<img src="static/images/window.png" alt = "" class="circle" >'
            }

            item += `<span class="titulo">${disp.name}</span>
                          <p>
                          ${disp.description}
                          </p>
                          <a href="#!" class="secondary-content">
                          <div class="switch">
                          <label>
                            Off
                            `;
            if (disp.state) {
                item += `<input type="checkbox" checked id="ck_${disp.id}">`;
            } else {
                item += `<input type="checkbox" id="ck_${disp.id}" >`;
            }
            item += `
                            <span class="lever"></span>
                            On
                          </label>
                        </div>
                          </a>
                        </li>`;

            ulDisp.innerHTML += item;
        }

        for (var disp of lista) {
            var checkPrender = document.getElementById("ck_" + disp.id);
            checkPrender.addEventListener("click", this);
        }
    }

    obtenerDispositivo() {
        this.framework.ejecutarBackEnd("GET", "http://localhost:8000/devices", this);
    }

    handleEvent(event) {
        var elemento = <HTMLInputElement>event.target;
        console.log(elemento)
        if (event.target.id == "btnListar") {
            this.obtenerDispositivo();
            for (var user of this.users) {

                //TODO cambiar ESTO por mostrar estos datos separados por "-" 
                //en un parrafo "etiqueta de tipo <p>"

            }
        }
        else if (event.target.id == "btnAgregar") {
            //TODO cambiar esto, recuperadon de un input de tipo text
            //el nombre  de usuario y el nombre de la persona
            // validando que no sean vacios
            var device: Device = new Device();
            device.description = "descripcion de prueba";
            device.name = "nombre de prueba";
            device.state = false;
            device.type = 1;
            this.framework.ejecutarBackEnd("POST", "http://localhost:8000/device", this, device);

        }
        else if (event.target.id == "btnEliminar") {
            //TODO cambiar recuperando input y enviar el elemento seleccionado
            var device: Device = new Device();
            device.id = 1;
            this.framework.ejecutarBackEnd("DELETE", "http://localhost:8000/device", this, device);
        }
        else if (event.target.id == "btnEditar") {
            //TODO cambiar recuperando input y enviar el elemento seleccionado
            var device: Device = new Device();
            device.description = "nueva descripcion";
            device.name = "nuevo nombre";
            device.state = false;
            device.type = 1;
            device.id = 7;
            this.framework.ejecutarBackEnd("PUT", "http://localhost:8000/device", this, device);
        }
        else if (event.target.id == "btnLogin") {

            var iUser = <HTMLInputElement>document.getElementById("iUser");
            var iPass = <HTMLInputElement>document.getElementById("iPass");
            var username: string = iUser.value;
            var password: string = iPass.value;

            if (username.length > 3 && password.length > 3) {
                //iriamos al servidor a consultar si el usuario y la cotraseña son correctas
                var parrafo = document.getElementById("parrafo");
                parrafo.innerHTML = "Espere...";
            } else {
                alert("el nombre de usuario es invalido");
            }

        }
        else if (elemento.id.startsWith("ck_")) {

            var device: Device = new Device();
            device.id = parseInt(elemento.id.slice(elemento.id.indexOf('_') + 1));
            device.state = elemento.checked;

            if (device.id !== null && device.id >= 0 && device.state !== null) {
                this.framework.ejecutarBackEnd("POST", "http://localhost:8000/state", this, device);
            }
            else {
                alert("Error al cambiar de estado el elemento " + elemento.id + ".");
            }

        }
        else {
            console.log("Evento desconocido");
        }
    }
}


window.addEventListener("load", () => {

    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems, {});
    var elemsC = document.querySelectorAll('.datepicker');
    var instances = M.Datepicker.init(elemsC, { autoClose: true });

    var main: Main = new Main();
    var btnListar: HTMLElement = document.getElementById("btnListar");
    btnListar.addEventListener("click", main);


    var btnAgregar: HTMLElement = document.getElementById("btnAgregar");
    btnAgregar.addEventListener("click", main);

    var btnLogin = document.getElementById("btnLogin");
    btnLogin.addEventListener("click", main);

    var btnEliminar: HTMLElement = document.getElementById("btnEliminar");
    btnEliminar.addEventListener("click", main);

    var btnEditar: HTMLElement = document.getElementById("btnEditar");
    btnEditar.addEventListener("click", main);
});
