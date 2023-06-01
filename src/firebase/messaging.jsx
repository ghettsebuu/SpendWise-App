import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase'; // Importa la instancia de Firebase de tu archivo de configuración

const Messaging = () => {
  useEffect(() => {
    // Obtener la instancia del servicio de mensajería
    const messaging = getMessaging(app);

    const handleTokenRefresh = () => {
      // Obtener el token de registro de la instancia de mensajería
      getToken(messaging)
        .then((currentToken) => {
          if (currentToken) {
            // Envía el token al servidor para registrar el dispositivo y enviar notificaciones
            console.log('Token:', currentToken);

            // Registrar el token en el Service Worker para que pueda recibir notificaciones en segundo plano
            navigator.serviceWorker.ready
              .then((registration) => {
                registration.pushManager
                  .subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: 'BMCok6yksLsYVIzc8ZGvQ0Um2B-nHBgFmlnrfPT74rNLHyoeUBRYZw54q83_n2uN1K7Yu7rrdEsan5PNAkVPHnw',
                  })
                  .then((subscription) => {
                    // Envía la suscripción al servidor para almacenarla y enviar notificaciones
                    console.log('Suscripción:', subscription);
                  })
                  .catch((error) => {
                    console.error('Error al suscribirse al Service Worker:', error);
                  });
              })
              .catch((error) => {
                console.error('Error al obtener el Service Worker:', error);
              });
          } else {
            console.log('No se pudo obtener el token de registro.');
          }
        })
        .catch((error) => {
          console.error('Error al obtener el token de registro:', error);
        });
    };

    // Solicitar permiso para recibir notificaciones
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        handleTokenRefresh(); // Obtener el token de registro cuando se concede el permiso
      } else {
        console.log('El usuario denegó el permiso para recibir notificaciones.');
      }
    });

    // Escuchar las notificaciones entrantes mientras la aplicación está abierta
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Notificación recibida:', payload);
      // Aquí puedes mostrar una notificación en la aplicación o realizar alguna acción
    });

    return () => unsubscribe();
  }, []);

  return null;
};

export default Messaging;
