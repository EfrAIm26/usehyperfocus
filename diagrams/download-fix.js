// Script de descarga mejorado que SÍ FUNCIONA
function downloadDiagram() {
    const svgElement = document.getElementById('diagramCanvas');
    const btn = document.querySelector('.download-btn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '⏳ Generando PNG...';
    btn.disabled = true;
    
    try {
        // Método directo: Convertir SVG a imagen
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const viewBox = svgElement.getAttribute('viewBox').split(' ');
        const width = parseFloat(viewBox[2]);
        const height = parseFloat(viewBox[3]);
        
        // Crear canvas con dimensiones correctas
        const scale = 3; // Alta calidad
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        
        // Fondo blanco
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Crear blob del SVG con namespace correcto
        const svgBlob = new Blob([
            svgData.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
        ], { type: 'image/svg+xml;charset=utf-8' });
        
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        
        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            
            // Crear descarga
            canvas.toBlob(function(blob) {
                const link = document.createElement('a');
                const filename = document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.png';
                link.download = filename;
                link.href = URL.createObjectURL(blob);
                link.click();
                
                btn.innerHTML = '✅ ¡Descargado!';
                btn.disabled = false;
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2500);
            }, 'image/png', 1.0);
        };
        
        img.onerror = function(err) {
            console.error('Error cargando imagen:', err);
            btn.innerHTML = '❌ Error al descargar';
            btn.disabled = false;
            alert('Error al generar PNG. Intenta con click derecho → Guardar imagen como...');
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2500);
        };
        
        img.src = url;
        
    } catch (error) {
        console.error('Error en downloadDiagram:', error);
        btn.innerHTML = '❌ Error';
        btn.disabled = false;
        alert('Error: ' + error.message);
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2500);
    }
}





