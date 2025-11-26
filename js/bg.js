 // 1. Define tus imágenes aquí (rutas relativas a tu HTML)
        const images = [
            'images/bg1.jpg',
            'images/bg2.jpg',
            'images/bg3.jpg',
            'images/bg4.jpg',
            'images/bg5.jpg',
            'images/bg6.jpg',
            'images/bg7.jpg',
            'images/bg8.jpg',
            'images/bg9.jpg',
            'images/bg11.jpeg',
            'images/bg10.jpg'
        ];

        // 2. Función para cambiar la imagen de fondo
        function changeBackground() {
            // Selecciona un índice aleatorio del array de imágenes
            const randomIndex = Math.floor(Math.random() * images.length);
            const selectedImage = images[randomIndex];
            
            // Aplica la imagen al body como background-image
            document.body.style.backgroundImage = `url('${selectedImage}')`;
        }

        // 3. Llama a la función una vez al cargar la página
        changeBackground();

        // 4. Llama a la función cada 5 segundos (5000 milisegundos)
        // Puedes cambiar 5000 por el tiempo que desees
        setInterval(changeBackground, 50000); 
