# Vistas de Flask para manejar las rutas
from app import app
from werkzeug.security import check_password_hash
from flask import Blueprint, render_template, redirect, url_for, request, jsonify, flash
from .forms import *
from .models import *
from flask_mysqldb import MySQL
import cv2
import numpy as np
import json
from ..ml_models import *
from config import config


#'Bearer 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'
@app.route('/')
def init():
    soft_skills = TareaModel.get_soft_skills();
    print(soft_skills)
    return soft_skills


@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            print("No file part")
            return 'No file part'
        file = request.files['file']
        if file.filename == '':
            print("No selected file")
            return 'No selected file'
        if file:
            print("File received:", file.filename)
            # Procesamiento adicional aquí
            return 'File uploaded successfully'
    return render_template('upload.html')

@app.route('/usuarios')
def listar_usuarios():
    users = UserModel.load_users()
    return jsonify({'users': users, 'mensaje': "Usuarios Listados"})

@app.route('/register', methods = ['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        username = form.username.data
        existing_user = UserModel.get(username)
        if existing_user:
            print('Username already exists!')
            return render_template('register.html', form=form)
        else: 
            user = UserModel(
                    username=form.username.data,
                    name=form.name.data,
                    surname=form.surname.data,
                    password=form.password.data
                )  
            print(user)     
            reg = UserModel.register_user(user)
            if reg != None:
                # Pasar el contenido JSON a la plantilla para mostrarlo
                return jsonify({'mensaje' : "Registration successful!"})
            else:
                return jsonify({'mensaje' : "Usuario no se pudo registrar correctamente"})
    else:
        return render_template('register.html', form=form)

@app.route('/login', methods=['GET','POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        # Verifica que el usuario exista y que la contraseña sea correcta
        user = UserModel.get(form.username.data)
        if user and check_password_hash(user.password, form.password.data):
            # Inicia sesión del usuario
            login_user(user)
            return redirect(url_for('index'))  # Redirige al index o donde sea necesario
        else:
            return 'Datos de inicio de sesión incorrectos.'
    return render_template('login.html', form=form)

@app.route('/<usuario>', methods=['GET', 'POST'])
def gestionar_fabricas(usuario):
    user = UserModel.get(usuario)
    if not user:
        flash('Usuario no encontrado', 'error')
        return redirect(url_for('register'))

    if request.method == 'POST':
        nombre_fabrica = request.form['nombre_fabrica']
        resultado = FabricaModel.add_fabrica(nombre_fabrica, user['id'])
        if resultado:
            flash('Fábrica añadida correctamente', 'success')
        else:
            flash('No se pudo añadir la fábrica', 'error')

        return redirect(url_for('gestionar_fabricas', usuario=usuario))

    fabricas = FabricaModel.get_fabricas_by_user(user['id'])
    return render_template('fabricas.html', fabricas=fabricas, usuario=user)

@app.route('/<usuario>/<fabrica>',)
def ver_fabrica(usuario, fabrica):
    print(usuario, fabrica)
    # Aquí va la lógica para manejar la solicitud para una fábrica específica
    return render_template('pagina_fabrica.html', usuario=usuario, fabrica=fabrica)

@app.route('/<usuario>/<fabrica>/añadir_trabajador')
def añadir_trabajador():
    form = TrabajadorRegistrationForm()
    if form.validate_on_submit():
        # Lógica para procesar el formulario
        ...
        return redirect(url_for('/'))  # Redirigir tras el procesamiento exitoso
    else:
        # Si no es POST o el formulario no es válido, se pasa el formulario a la plantilla
        return render_template('pagina_fabrica.html', form=form)


@app.route('/<usuario>/<fabrica>/añadir_maquina')
def añadir_maquina(usuario, fabrica):
    # Lógica para añadir máquina
    return render_template('añadir_maquina.html', usuario=usuario, fabrica=fabrica)

@app.route('/<usuario>/<fabrica>/añadir_tarea')
def añadir_tarea(usuario, fabrica):
    # Lógica para añadir tarea
        
    return render_template('añadir_tarea.html', usuario=usuario, fabrica=fabrica)

@app.route('/<usuario>/<fabrica>/skill_matching')
def obtener_habilidades(fabrica_id):
    habilidades_maquinas = RecursosModel.obtener_habilidades_maquinas(fabrica_id)
    habilidades_trabajadores = RecursosModel.obtener_habilidades_trabajadores(fabrica_id)
    
    # Combinar los diccionarios de habilidades de máquinas y trabajadores en uno solo
    habilidades_totales = habilidades_maquinas.copy()
    habilidades_totales.update(habilidades_trabajadores)
    
    return habilidades_totales
