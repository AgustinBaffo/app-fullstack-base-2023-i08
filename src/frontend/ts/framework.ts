class Framework {

	public ejecutarBackEnd(method: string, url: string, callback: HttpResponse, data?: any, customCallback?: (res: string) => void) {
		
		var xmlReq = new XMLHttpRequest();
		
		xmlReq.onreadystatechange = () => {
			if (xmlReq.readyState == 4) {
				if (xmlReq.status == 200) {
					callback.manejarRespuesta(xmlReq.responseText, customCallback);
				} else {
					alert("Error al buscar los datos!");
				}
			}
		}

		xmlReq.open(method, url, true);
		
		if (data != undefined) {
			xmlReq.setRequestHeader("Content-Type", "application/json");
			xmlReq.send(JSON.stringify(data));

		} else {
			xmlReq.send();
		}
	}
}