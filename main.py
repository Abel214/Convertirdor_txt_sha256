import hashlib
from flask import Flask, render_template, request, jsonify, send_file
from io import BytesIO

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/sha256')
def sha256_converter():
    return render_template('sha256_converter.html')

@app.route('/calculate_hash', methods=['POST'])
def calculate_hash():
    if 'file' not in request.files:
        return jsonify({'error': 'No se encontró el archivo'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
    
    if not file.filename.endswith('.txt'):
        return jsonify({'error': 'Solo se permiten archivos .txt'}), 400
    
    try:
        # Leer el contenido del archivo
        content = file.read()
        
        # Calcular SHA256
        sha256_hash = hashlib.sha256(content).hexdigest()
        
        return jsonify({
            'hash': sha256_hash,
            'filename': file.filename
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download_hash', methods=['POST'])
def download_hash():
    data = request.get_json()
    hash_value = data.get('hash')
    original_filename = data.get('filename', 'archivo.txt')
    
    if not hash_value:
        return jsonify({'error': 'No se proporcionó el hash'}), 400
    
    try:
        # Crear el contenido del archivo .sha256
        content = f"{hash_value}  {original_filename}\n"
        
        # Crear un objeto BytesIO con el contenido
        buffer = BytesIO()
        buffer.write(content.encode('utf-8'))
        buffer.seek(0)
        
        # Nombre del archivo de salida
        output_filename = original_filename.replace('.txt', '.sha256')
        
        return send_file(
            buffer,
            as_attachment=True,
            download_name=output_filename,
            mimetype='text/plain'
        )
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Servidor iniciado en http://localhost:5000")
    print("📝 Abre tu navegador y accede a la URL para usar el convertidor")

    app.run(debug=True, host='0.0.0.0', port=5000)
