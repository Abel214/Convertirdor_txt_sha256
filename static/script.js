const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const loader = document.getElementById('loader');
const hashResult = document.getElementById('hashResult');
const hashValue = document.getElementById('hashValue');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const successMessage = document.getElementById('successMessage');

let currentHash = '';
let currentFilename = '';

// Click en el área de carga
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// Selección de archivo
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Procesar archivo
async function handleFile(file) {
    if (!file.name.endsWith('.txt')) {
        alert('Por favor selecciona un archivo .txt');
        return;
    }

    // Mostrar información del archivo
    fileName.textContent = file.name;
    fileInfo.classList.add('show');
    hashResult.classList.remove('show');
    successMessage.classList.remove('show');
    loader.classList.add('show');

    // Enviar archivo al servidor
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/calculate_hash', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        loader.classList.remove('show');

        if (data.hash) {
            currentHash = data.hash;
            currentFilename = data.filename;
            hashValue.textContent = data.hash;
            hashResult.classList.add('show');
        } else {
            alert('Error al calcular el hash');
        }
    } catch (error) {
        loader.classList.remove('show');
        alert('Error al procesar el archivo');
        console.error(error);
    }
}

// Copiar al portapapeles
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(hashValue.textContent).then(() => {
        successMessage.classList.add('show');
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 2000);
    });
});

// Descargar archivo .sha256
downloadBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/download_hash', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hash: currentHash,
                filename: currentFilename
            })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = currentFilename.replace('.txt', '.sha256');
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            alert('Error al descargar el archivo');
        }
    } catch (error) {
        alert('Error al descargar el archivo');
        console.error(error);
    }
});