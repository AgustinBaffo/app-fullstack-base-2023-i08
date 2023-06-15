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
                <div class="name"><span class="titulo" id="deviceName_${disp.id}">${disp.name}</span>
                        <p id="deviceDescription_${disp.id}">${disp.description}</p></div>

                        
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
                            <li><a id="editDevice_${disp.id}">Editar</a></li>
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
    clearFormEditDevice() {
        var name = <HTMLInputElement>document.getElementById("editNameDevice");
        name.value = "";
        var description = <HTMLInputElement>document.getElementById("editDescriptionDevice");
        description.value = "";
        var type = <HTMLSelectElement>document.getElementById("editTypeDevice");

        console.log(type);
        console.log("value: " + type.value + " | selectedIndex: " + type.selectedIndex);

        // TODO fix this reset
        type.value = "";
        type.selectedIndex = 0;

        M.updateTextFields();
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
        else if (event.target.id == "confirmEditDevice") {

            var name = <HTMLInputElement>document.getElementById("editNameDevice");
            var description = <HTMLInputElement>document.getElementById("editDescriptionDevice");
            var type = <HTMLSelectElement>document.getElementById("editTypeDevice");

            // TODO: Validar nombres

            var device: Device = new Device();
            device.description = description.value;
            device.name = name.value;
            device.state = false;   // TODO use default
            device.type = parseInt(type.value, 0);

            this.clearFormEditDevice();

            var confirmEditDeviceCallback = (res: string) => {
                this.updateDevicesList();
            }
            
            // Verificar si se esta editando o agregando un dispositivo y enviar los datos al backend.
            var editDeviceForm: HTMLElement = document.getElementById("editDeviceFormType");

            if (editDeviceForm.classList.contains("edit-device-form")) {
                device.id = 2 // TODO: obtener el id del dispositivo a editar
                console.log("confirmEditDevice: updating " + JSON.stringify(device));
                this.framework.ejecutarBackEnd("PUT", "http://localhost:8000/device", this, device, confirmEditDeviceCallback);

            }else if (editDeviceForm.classList.contains("add-device-form")){
                console.log("confirmEditDevice: adding " + JSON.stringify(device));
                this.framework.ejecutarBackEnd("POST", "http://localhost:8000/device", this, device, confirmEditDeviceCallback);

            }else{
                console.log("Error al procesar el formulario de edicion de dispositivo. Acción desconocida.")
            }


        }
        else if (event.target.id == "cancelEditDevice") {

            this.clearFormEditDevice();

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
                
                // TODO deberia ser PUT no POST
                this.framework.ejecutarBackEnd("POST", "http://localhost:8000/state", this, device, cambiarEstadoCallback);
            }
            else {
                alert("Error al cambiar de estado el elemento " + elemento.id + ".");
            }

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

            // Obtener datos del dispositivo que se va a editar y crear dispositivo para actualizar
            var device: Device = new Device();
            device.id = parseInt(elemento.id.slice(elemento.id.indexOf('_') + 1));
            device.name = document.getElementById("deviceName_" + device.id).innerHTML;;
            device.description = document.getElementById("deviceDescription_" + device.id).innerHTML;
            device.type = 1; // TODO: get this data from html

            console.log("Editando dispositivo: " + device.id + " | " + device.name + " | " + device.description + " | " + device.type);

            // Actualizar los elementos del form con los valores del dispositivo
            var name = <HTMLInputElement>document.getElementById("editNameDevice");
            name.value = device.name;
            var description = <HTMLInputElement>document.getElementById("editDescriptionDevice");
            description.value = device.description;
            var type = <HTMLSelectElement>document.getElementById("editTypeDevice");
            device.type = device.type; // TODO set index??? type.selectedIndex  or type.options[type.selectedIndex].value);
            M.updateTextFields();
            
            // Cambiar titulo y la clase del form modal.
            var titleElement: HTMLElement = document.getElementById("editDeviceFormTitle");
            titleElement.textContent = "Editar dispositivo";
            var editDeviceForm: HTMLElement = document.getElementById("editDeviceFormType");
            editDeviceForm.className = "edit-device-form";

            // Obtener form modal y abrirlo
            var modalInstance = M.Modal.getInstance(document.getElementById('editDeviceForm'));
            modalInstance.open();
        }
        else if (event.target.id == "btnAgregar") {

            // Cambiar titulo y la clase del form modal.
            var titleElement: HTMLElement = document.getElementById("editDeviceFormTitle");
            titleElement.textContent = "Agregar dispositivo";
            var editDeviceForm: HTMLElement = document.getElementById("editDeviceFormType");
            editDeviceForm.className = "add-device-form";

            this.clearFormEditDevice();

            // Obtener form modal y abrirlo
            var modalInstance = M.Modal.getInstance(document.getElementById('editDeviceForm'));
            modalInstance.open();

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
    
    var btnAgregar: HTMLElement = document.getElementById("btnAgregar");
    btnAgregar.addEventListener("click", main);

    var btnLogin = document.getElementById("btnLogin");
    btnLogin.addEventListener("click", main);

    var cancelEditDevice: HTMLElement = document.getElementById("cancelEditDevice");
    cancelEditDevice.addEventListener("click", main);

    var confirmEditDevice: HTMLElement = document.getElementById("confirmEditDevice");
    confirmEditDevice.addEventListener("click", main);

    var modalEdit: HTMLElement = document.getElementById("editDeviceForm");
    M.Modal.init(modalEdit);

});
