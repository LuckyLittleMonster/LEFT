import os
from flask import Flask, flash, request, redirect, render_template
from werkzeug.utils import secure_filename

from flask import send_from_directory

up_folder = './uploads'
allowed_extensions = set(['txt', 'png', 'jpg'])

if not os.path.exists(up_folder):
    os.makedirs(up_folder)

app = Flask(__name__, static_url_path='')
app.config['UPLOAD_FOLDER'] = up_folder

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        ufile = request.files['file']
        if ufile.filename == '':
            flash("No selected file")
            return redirect(request.url)
        if ufile and allowed_file(ufile.filename):
            filename = secure_filename(ufile.filename)
            ufile.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return redirect('/')
    return app.send_static_file('upload.html')

if __name__=="__main__":
    app.secret_key = 'supersecretkey'
    app.run(debug=True, host='0.0.0.0', port=5000)
