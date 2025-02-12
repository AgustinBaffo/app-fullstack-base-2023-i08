var M;

class Main implements EventListenerObject, HttpResponse {
    users: Array<Usuario> = new Array();
    framework: Framework = new Framework();

    constructor() {
        // TODO: Crear usuarios de manera dinamica y almacenarlos en una base de datos.
        var usr1 = new Usuario("user", "user");
        var usr2 = new Usuario("admin", "admin");
        this.users.push(usr1);
        this.users.push(usr2);
    }

    manejarRespuesta(res: string, callback: (res: string) => void) {

        console.log("Respuesta del servidor: " + res);

        // Invocar el custom callback si existe. Si no existe, solo mostrar la respuesta en consola.
        if (callback) {
            callback(res);
        } else {
            console.log(res);
        }
    }

    updateDevicesList() {

        // Crear callback para listar los dispositivos.
        var listarCallback = (res: string) => {
            var lista: Array<Device> = JSON.parse(res);
            var ulDisp = document.getElementById("listaDisp");

            // Crear html dinamico de la lista de dispositivos.
            ulDisp.innerHTML = "";
            for (var disp of lista) {

                console.log("Dispositivo: " + JSON.stringify(disp));

                var item: string = `<li class="collection-item avatar">
                <div id="deviceIcon_${disp.id}" device-type="${disp.type}">`;
                if (disp.type == 1) {
                    item += '<img src="static/images/lightbulb.png" alt = "lightbulb" class="circle" >'
                } else if (disp.type == 2) {
                    item += '<img src="static/images/airconditionar.png" alt = "airconditionar" class="circle" >'
                } else if (disp.type == 3) {
                    item += '<img src="static/images/window.png" alt = "window" class="circle" >'
                } else {
                    item += '<img src="static/images/other.png" alt = "other" class="circle" >'
                }

                item += `</div>
                <div class="name">
                    <span class="titulo" id="deviceName_${disp.id}">${disp.name}</span>
                    <p id="deviceDescription_${disp.id}">${disp.description}</p></div>
                    <div class="range">
                        <input type="range" min="0" max="100" value="${disp.state}" id="rangeState_${disp.id}">
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

            // Inicializar los elementos agregados.
            for (var disp of lista) {
                var rangeState = document.getElementById("rangeState_" + disp.id);
                rangeState.addEventListener("click", this);

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

        // Enviar request al servidor.
        this.framework.ejecutarBackEnd("GET", "http://localhost:8000/devices", this, {}, listarCallback);
    }

    handleEvent(event) {
        var elemento = <HTMLInputElement>event.target;

        if (event.target.id == "btnToggleListar") {
            // Mostrar u ocultar la lista de dispositivos.
            this.toggleList();
        }

        else if (event.target.id == "confirmEditDevice") {
            // Agregar o editar un dispositivo desde el formulario.

            // Recuperar datos del form.
            var name = <HTMLInputElement>document.getElementById("editNameDevice");
            var description = <HTMLInputElement>document.getElementById("editDescriptionDevice");
            var type = <HTMLSelectElement>document.getElementById("editTypeDevice");

            // Validar datos.
            if (!name.value || name.value.length <= 0) { // Max length 64 en html.
                alert("El nombre del dispositivo no puede estar vacio.");
                return;
            }
            if (!description.value || description.value.length <= 0) { // Max length 128 en html.
                alert("La descripcion del dispositivo no puede estar vacia.");
                return;
            }
            if (!type.value || type.value.length < 0) {
                alert("El tipo de dispositivo no puede estar vacio.");
                return;
            }

            // Crear dispositivos y enviar datos al servidor
            var device: Device = new Device();
            device.description = description.value;
            device.name = name.value;
            device.type = parseInt(type.value, 0);

            this.clearFormEditDevice();  // Borrar datos del form para la proxima vez que se vuelva a abrir.

            var confirmEditDeviceCallback = (res: string) => {
                this.updateDevicesList();
                this.showList();
            }

            // Verificar si se esta editando o agregando un dispositivo y enviar los datos al backend.
            var editDeviceForm: HTMLElement = document.getElementById("editDeviceFormType");

            if (editDeviceForm.classList.contains("edit-device-form")) {
                // Se esta editando el dispositivo. Enviar PUT para actualizar los datos.
                var deviceID = parseInt(editDeviceForm.getAttribute("device-id"), 0);
                if (!deviceID || deviceID <= 0) {
                    console.log("Error al procesar el formulario de edicion de dispositivo. ID de dispositivo invalido: " + deviceID);
                    return;
                }

                device.id = deviceID;
                console.log("confirmEditDevice: actualizando " + JSON.stringify(device));
                this.framework.ejecutarBackEnd("PUT", "http://localhost:8000/device", this, device, confirmEditDeviceCallback);

            } else if (editDeviceForm.classList.contains("add-device-form")) {
                // Se esta agregando el dispositivo. Enviar POST con los nuevos datos.
                device.state = 0;   // Por defecto esta apagado.
                console.log("confirmEditDevice: agregando " + JSON.stringify(device));
                this.framework.ejecutarBackEnd("POST", "http://localhost:8000/device", this, device, confirmEditDeviceCallback);

            } else {
                console.log("Error al procesar el formulario de edicion de dispositivo. Acción desconocida.")
            }
        }

        else if (event.target.id == "cancelEditDevice") {
            // Borrar datos del form para la proxima vez que se vuelva a abrir.
            this.clearFormEditDevice();
        }

        else if (elemento.id.startsWith("rangeState_")) {
            // Editar el estado de un dispositivo.

            var device: Device = new Device();
            device.id = parseInt(elemento.id.slice(elemento.id.indexOf('_') + 1));

            var rangeElement = <HTMLInputElement>document.getElementById(elemento.id);
            device.state = parseInt(rangeElement.value, 0);

            console.log("device : " + JSON.stringify(device));
            
            // Validar datos y enviar al servidor.
            if (device.id !== null && device.id >= 0 && device.state !== null && device.state >= 0 && device.state <= 100) {

                var cambiarEstadoCallback = (res: string) => {
                    this.updateDevicesList();
                }
                this.framework.ejecutarBackEnd("PUT", "http://localhost:8000/state", this, device, cambiarEstadoCallback);
            }
            else {
                console.log("Error al cambiar de estado el elemento " + elemento.id + ".");
            }
        }

        else if (elemento.id.startsWith("deleteDevice_")) {
            // Boton del dropdown para eliminar un dispositivo de la lista.

            var device: Device = new Device();
            device.id = parseInt(elemento.id.slice(elemento.id.indexOf('_') + 1));;
            console.log("delete  id: " + device.id);

            var eliminarCallback = (res: string) => {
                this.updateDevicesList();
            }

            this.framework.ejecutarBackEnd("DELETE", "http://localhost:8000/device", this, device, eliminarCallback);
        }

        else if (elemento.id.startsWith("editDevice_")) {
            // Boton del dropdown para editar dispositivo.

            // Obtener datos del dispositivo que se va a editar y crear dispositivo para actualizar
            var device: Device = new Device();
            device.id = parseInt(elemento.id.slice(elemento.id.indexOf('_') + 1));
            device.name = document.getElementById("deviceName_" + device.id).innerHTML;;
            device.description = document.getElementById("deviceDescription_" + device.id).innerHTML;

            var deviceType = document.getElementById("deviceIcon_" + device.id).getAttribute('device-type');
            if (deviceType) {
                device.type = parseInt(deviceType, 0);
            } else {
                console.log("Error: No se puede obtener el tipo de dispositivo. Usando valor por defecto.");
                device.type = 0; // Use default
            }

            console.log("Editando dispositivo: " + device.id + " | " + device.name + " | " + device.description + " | " + device.type);

            // Actualizar los elementos del form con los valores del dispositivo
            const formName = <HTMLInputElement>document.getElementById("editNameDevice");
            formName.value = device.name;
            const formDescription = <HTMLInputElement>document.getElementById("editDescriptionDevice");
            formDescription.value = device.description;
            const formType = <HTMLSelectElement>document.getElementById("editTypeDevice");
            formType.value = device.type.toString();
            const event = new Event('change', { bubbles: true });
            formType.dispatchEvent(event);

            M.updateTextFields();

            // Cambiar titulo y la clase del form modal.
            var titleElement: HTMLElement = document.getElementById("editDeviceFormTitle");
            titleElement.textContent = "Editar dispositivo";
            var editDeviceForm: HTMLElement = document.getElementById("editDeviceFormType");
            editDeviceForm.className = "edit-device-form";
            editDeviceForm.setAttribute("device-id", device.id.toString());

            // Obtener form modal y abrirlo
            var modalInstance = M.Modal.getInstance(document.getElementById('editDeviceForm'));
            modalInstance.open();
        }

        else if (event.target.id == "btnAgregar") {
            // Agregar un nuevo dispositivo.

            // Cambiar titulo y la clase del form modal.
            var titleElement: HTMLElement = document.getElementById("editDeviceFormTitle");
            titleElement.textContent = "Agregar dispositivo";
            var editDeviceForm: HTMLElement = document.getElementById("editDeviceFormType");
            editDeviceForm.className = "add-device-form";
            editDeviceForm.setAttribute("device-id", "-1"); // -1 para indicar que es un dispositivo nuevo.

            this.clearFormEditDevice();

            // Obtener form modal y abrirlo
            var modalInstance = M.Modal.getInstance(document.getElementById('editDeviceForm'));
            modalInstance.open();

        }

        else if (event.target.id == "btnLogin") {
            // Boton login desde el form de login.

            var iUser = <HTMLInputElement>document.getElementById("iUser");
            var iPass = <HTMLInputElement>document.getElementById("iPass");
            var username: string = iUser.value;
            var password: string = iPass.value;

            if (username.length < 4) {
                alert("El nombre de usuario es invalido.");
                iPass.value = "";
            }
            else if (password.length < 4) {
                alert("Contraseña invalida.");
                iPass.value = "";
            }
            else {
                // TODO: Iriamos al servidor a consultar si el usuario y la cotraseña son correctas
                alert("Gracias por intentar logearse!\nEsta función llegará pronto a Smart Home Web Client!");
                this.clearFormLogin();
            }
        }

        else if (event.target.id == "btnCancelLogin") {
            // Borrar datos del form para la proxima vez que se vuelva a abrir.
            this.clearFormLogin();
        }

        else {
            console.log("Evento desconocido: " + event.id);
        }
    }

    // Actualiza el boton para mostar y ocultar la lista.
    toggleList() {
        var listaDisp = document.getElementById('listaDisp');

        // Verificar el estado inicial de la lista y mostrar el botón adecuado.
        if (listaDisp.style.display === 'none') {
            this.showList();
        } else {
            this.hideList();
        }
    }

    // Mostrar la lista de dispositivos.
    showList() {
        var ulDisp = document.getElementById("listaDisp");
        this.updateDevicesList();   // Actualizar lista
        ulDisp.style.display = '';  // Mostrar lista

        // Actualizar boton.
        var btnToggleListarLabel = document.getElementById('btnToggleListarLabel');
        var btnToggleListarIcon = document.getElementById('btnToggleListarIcon');

        btnToggleListarLabel.textContent = 'Colapsar';
        btnToggleListarIcon.textContent = 'arrow_drop_up';
    }

    // Esconder la lista de dispositivos.
    hideList() {
        var ulDisp = document.getElementById("listaDisp");
        ulDisp.style.display = 'none';  // Ocultar la lista
        ulDisp.innerHTML = "";          // Borrar contenido html

        // Actualizar boton.
        var btnToggleListarLabel = document.getElementById('btnToggleListarLabel');
        var btnToggleListarIcon = document.getElementById('btnToggleListarIcon');
        btnToggleListarLabel.textContent = 'Listar';
        btnToggleListarIcon.textContent = 'arrow_drop_down';
    }

    // Resetea el form para actualizar dispositivos.
    clearFormEditDevice() {
        var form = <HTMLFormElement>document.getElementById("deviceForm");
        form.reset();
        M.updateTextFields();
    }

    // Resetear el form de login.
    clearFormLogin() {
        var form = <HTMLFormElement>document.getElementById("loginForm");
        form.reset();
        M.updateTextFields();
    }
}

window.addEventListener("load", () => {

    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems, {});
    var elemsC = document.querySelectorAll('.datepicker');
    M.Datepicker.init(elemsC, { autoClose: true });

    var main: Main = new Main();

    const btnToggleListar: HTMLElement = document.getElementById("btnToggleListar");
    btnToggleListar.addEventListener("click", main);

    const btnAgregar: HTMLElement = document.getElementById("btnAgregar");
    btnAgregar.addEventListener("click", main);

    const btnLogin = document.getElementById("btnLogin");
    btnLogin.addEventListener("click", main);

    const btnCancelLogin = document.getElementById("btnCancelLogin");
    btnCancelLogin.addEventListener("click", main);

    const cancelEditDevice: HTMLElement = document.getElementById("cancelEditDevice");
    cancelEditDevice.addEventListener("click", main);

    const confirmEditDevice: HTMLElement = document.getElementById("confirmEditDevice");
    confirmEditDevice.addEventListener("click", main);

    const modalEdit: HTMLElement = document.getElementById("editDeviceForm");
    M.Modal.init(modalEdit);

    const modalLogin: HTMLElement = document.getElementById("loginModal");
    M.Modal.init(modalLogin);

    var tooltips = document.querySelectorAll('.tooltipped');
    M.Tooltip.init(tooltips, { enterDelay: 200 });
});
