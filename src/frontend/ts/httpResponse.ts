interface HttpResponse {
  // Se aceptan custom callbacks para cada request enviada.
  manejarRespuesta(response: string, callback: (response: string) => void);
}
