import os
from flask import Flask, flash, request, Response, redirect, render_template
import requests
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
        resp = requests.request(
        method=request.method,
        url=request.url.replace('0.0.0.0:5001', '0.0.0.0:5000'),
        headers={key: value for (key, value) in request.headers if key != 'Host'},
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False)

        excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
        headers = [(name, value) for (name, value) in resp.raw.headers.items()
            if name.lower() not in excluded_headers]
        response = Response(resp.content, resp.status_code, headers)
        return response
    return app.send_static_file('upload.html')

if __name__=="__main__":
    app.secret_key = 'supersecretkey'
    app.run(debug=True, host='0.0.0.0', port=5001)
