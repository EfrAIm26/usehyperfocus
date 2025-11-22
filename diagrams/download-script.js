// Script universal de descarga PNG que SÍ FUNCIONA
function downloadDiagram() {
    const svgElement = document.getElementById('diagramCanvas');
    if (!svgElement) {
        alert('Error: No se encontró el elemento SVG');
        return;
    }
    
    const btn = document.querySelector('.download-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Generando PNG...';
    btn.disabled = true;
    
    try {
        // Obtener SVG como string
        const svgData = new XMLSerializer().serializeToString(svgElement);
        
        // Obtener dimensiones del viewBox
        const viewBox = svgElement.getAttribute('viewBox');
        if (!viewBox) {
            throw new Error('SVG no tiene viewBox');
        }
        
        const [x, y, width, height] = viewBox.split(' ').map(Number);
        
        // Agregar width y height explícitos al SVG para que funcione
        const svgWithSize = svgData
            .replace('<svg', `<svg width="${width}" height="${height}"`)
            .replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, '')
            .replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        
        // Crear canvas con alta resolución
        const scale = 3;
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        
        // Fondo blanco
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Crear blob del SVG
        const svgBlob = new Blob([svgWithSize], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        // Cargar imagen
        const img = new Image();
        
        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            
            // Convertir a PNG y descargar
            canvas.toBlob(function(blob) {
                if (!blob) {
                    throw new Error('No se pudo crear el blob PNG');
                }
                
                const link = document.createElement('a');
                const filename = svgElement.closest('.diagram-container')?.id === 'diagramContainer' 
                    ? document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.png'
                    : 'hyperfocus-ai-diagrama.png';
                
                link.download = filename;
                link.href = URL.createObjectURL(blob);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Limpiar URL después de un momento
                setTimeout(() => URL.revokeObjectURL(link.href), 100);
                
                btn.innerHTML = '✅ ¡Descargado!';
                btn.disabled = false;
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2500);
            }, 'image/png', 1.0);
        };
        
        img.onerror = function(err) {
            console.error('Error cargando SVG:', err);
            URL.revokeObjectURL(url);
            btn.innerHTML = '❌ Error';
            btn.disabled = false;
            alert('Error al generar PNG. Intenta hacer click derecho en el diagrama y "Guardar imagen como..."');
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





