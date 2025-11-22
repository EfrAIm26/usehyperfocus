# Script para actualizar todos los archivos HTML con el script de descarga corregido

$scriptContent = @'
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
                const svgData = new XMLSerializer().serializeToString(svgElement);
                const viewBox = svgElement.getAttribute('viewBox');
                if (!viewBox) {
                    throw new Error('SVG no tiene viewBox');
                }
                
                const [x, y, width, height] = viewBox.split(' ').map(Number);
                const svgWithSize = svgData
                    .replace('<svg', `<svg width="${width}" height="${height}"`)
                    .replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, '')
                    .replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
                
                const scale = 3;
                const canvas = document.createElement('canvas');
                canvas.width = width * scale;
                canvas.height = height * scale;
                const ctx = canvas.getContext('2d');
                
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const svgBlob = new Blob([svgWithSize], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                const img = new Image();
                
                img.onload = function() {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    URL.revokeObjectURL(url);
                    
                    canvas.toBlob(function(blob) {
                        if (!blob) {
                            throw new Error('No se pudo crear el blob PNG');
                        }
                        
                        const link = document.createElement('a');
                        link.download = 'hyperfocus-ai-diagrama-' + document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.png';
                        link.href = URL.createObjectURL(blob);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setTimeout(() => URL.revokeObjectURL(link.href), 100);
                        
                        btn.innerHTML = '✅ ¡Descargado!';
                        btn.disabled = false;
                        setTimeout(() => { btn.innerHTML = originalText; }, 2500);
                    }, 'image/png', 1.0);
                };
                
                img.onerror = function(err) {
                    console.error('Error cargando SVG:', err);
                    URL.revokeObjectURL(url);
                    btn.innerHTML = '❌ Error';
                    btn.disabled = false;
                    alert('Error al generar PNG');
                    setTimeout(() => { btn.innerHTML = originalText; }, 2500);
                };
                
                img.src = url;
                
            } catch (error) {
                console.error('Error:', error);
                btn.innerHTML = '❌ Error';
                btn.disabled = false;
                alert('Error: ' + error.message);
                setTimeout(() => { btn.innerHTML = originalText; }, 2500);
            }
        }
'@

$files = @(
    'registro-autenticacion-final.html',
    'inicio-cierre-sesion.html',
    'semantic-chunks.html',
    'visual-diagrams.html',
    'stripe-payment.html'
)

foreach ($file in $files) {
    Write-Host "Actualizando $file..."
    $content = Get-Content $file -Raw -Encoding UTF8
    
    # Reemplazar desde <script> hasta </script> que contiene downloadDiagram
    $content = $content -replace '(?s)<script>\s*function downloadDiagram\(\)\{.*?\}</script>', "<script>$scriptContent`n    </script>"
    
    Set-Content $file -Value $content -Encoding UTF8 -NoNewline
    Write-Host "✅ $file actualizado"
}

Write-Host "`n✅ Todos los archivos actualizados!"





