// sw.js
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activado');
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SEND_NOTIFICATION') {
        const { title, body } = event.data.payload;
        self.registration.showNotification(title, {
            body,
            icon: 'https://via.placeholder.com/32?text=T', // Icono placeholder, cámbialo
            badge: 'https://via.placeholder.com/32?text=T',
            vibrate: [200, 100, 200],
            tag: 'tiger-notification'
        });
    }
});

// Simulación de notificaciones periódicas
setInterval(() => {
    self.clients.matchAll().then(clients => {
        if (clients.length === 0) { // Si no hay clientes activos
            self.registration.showNotification('¡Tu tigre te extraña!', {
                body: 'Vuelve a cuidar a tu tigre pronto.',
                icon: 'https://via.placeholder.com/32?text=T',
                vibrate: [200, 100, 200],
                tag: 'tiger-miss'
            });
        }
    });
}, 60000); // Cada minuto (ajústalo según necesites)
