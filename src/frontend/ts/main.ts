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

    manejarRespuesta(res: string, callback: (res: string) => void) {

        console.log("Respuesta del servidor: " + res);
        // Invocar el callback personalizado si existe. Si no existe, solo publico la respuesta.
        if (callback) {
            callback(res);
        }
    }

    updateDevicesList() {

        var listarCallback = (res: string) => {
            var lista: Array<Device> = JSON.parse(res);
            var ulDisp = document.getElementById("listaDisp");
            ulDisp.innerHTML = "";

            for (var disp of lista) {
                var item: string = `<li class="collection-item avatar">`;
                if (disp.type == 1) {
                    item += '<img src="static/images/lightbulb.png" alt = "" class="circle" >'
                } else {
                    item += '<img src="static/images/window.png" alt = "" class="circle" >'
                }

                item += `
                <div class="name"><span class="titulo">${disp.name}</span>
                        <p>${disp.description}</p></div>

                        
                            <div class="switch">
                                <label>Off`;
                if (disp.state) {
                    item += `<input type="checkbox" checked id="ck_${disp.id}">`;
                }
                else {
                    item += `<input type="checkbox" id="ck_${disp.id}" >`;
                }
                item += `<span class="lever"></span>
                                On</label>
                                </div>
                            </div>
                            
                            <a href="#!" class="secondary-content dropdown-trigger" data-target="dropdown_${disp.id}">
                                <i class="material-icons">more_vert</i>
                            </a>

                        <ul id="dropdown_${disp.id}" class="dropdown-content dropdown-content">
                            <li><a href="#!" id="editDevice_${disp.id}">Editar</a></li>
                            <li><a href="#!" class="delete-option" id="deleteDevice_${disp.id}">Eliminar</a></li>
                        </ul>`;

                ulDisp.innerHTML += item;
            }

            for (var disp of lista) {
                var checkPrender = document.getElementById("ck_" + disp.id);
                checkPrender.addEventListener("click", this);

                var editDevice = document.getElementById("editDevice_" + disp.id);
                editDevice.addEventListener("click", this);

                var deleteDevice = document.getElementById("deleteDevice_" + disp.id);
                deleteDevice.addEventListener("click", this);
            }

            // Inicializar los elementos Dropdown
            var dropdowns = document.querySelectorAll('.dropdown-trigger');
            M.Dropdown.init(dropdowns, {
                alignment: 'right'
            });
        };

        this.framework.ejecutarBackEnd("GET", "http://localhost:8000/devices", this, {}, listarCallback);
    }

    handleEvent(event) {
        var elemento = <HTMLInputElement>event.target;
        console.log(elemento)
        if (event.target.id == "btnListar") {

            this.updateDevicesList();

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

            var agregarCallback = (res: string) => {
                this.updateDevicesList();
            }

            this.framework.ejecutarBackEnd("POST", "http://localhost:8000/device", this, device, agregarCallback);
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

                var cambiarEstadoCallback = (res: string) => {
                    this.updateDevicesList();
                }

                this.framework.ejecutarBackEnd("POST", "http://localhost:8000/state", this, device, cambiarEstadoCallback);
            }
            else {
                alert("Error al cambiar de estado el elemento " + elemento.id + ".");
            }

        }
        else if (elemento.id.startsWith("ddOptions_")) {

            var id: number = parseInt(elemento.id.slice(elemento.id.indexOf('_') + 1));

            console.log("option for id: " + id);
            // if (device.id !== null && device.id >= 0 && device.state !== null) {

            //     var cambiarEstadoCallback = (res: string) => {
            //         this.updateDevicesList();
            //     }

            //     this.framework.ejecutarBackEnd("POST", "http://localhost:8000/state", this, device, cambiarEstadoCallback);
            // }
            // else {
            //     alert("Error al cambiar de estado el elemento " + elemento.id + ".");
            // }

        }
        else if (elemento.id.startsWith("deleteDevice_")) {

            var device: Device = new Device();
            device.id = parseInt(elemento.id.slice(elemento.id.indexOf('_') + 1));;
            console.log("delete  id: " + device.id);

            var eliminarCallback = (res: string) => {
                this.updateDevicesList();
            }

            this.framework.ejecutarBackEnd("DELETE", "http://localhost:8000/device", this, device, eliminarCallback);


        }
        else if (elemento.id.startsWith("editDevice_")) {

            // TODO: Get real data
            var device: Device = new Device();
            device.id = parseInt(elemento.id.slice(elemento.id.indexOf('_') + 1));
            device.name = "nuevo nombre";
            device.description = "nueva descripcion";
            device.state = true;
            device.type = 1;

            var editarCallback = (res: string) => {
                this.updateDevicesList();
            }

            this.framework.ejecutarBackEnd("PUT", "http://localhost:8000/device", this, device, editarCallback);

        }
        else {
            console.log("Evento desconocido: " + event.id);
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

    var btnLogin = document.getElementById("btnLogin");
    btnLogin.addEventListener("click", main);

    // TODO this should be called after GUARDAR from modal is pressed
    // var btnAgregar: HTMLElement = document.getElementById("btnAgregar");
    // btnAgregar.addEventListener("click", main);

    var modalEdit: HTMLElement = document.getElementById("editDevice");
    M.Modal.init(modalEdit);
    
});
