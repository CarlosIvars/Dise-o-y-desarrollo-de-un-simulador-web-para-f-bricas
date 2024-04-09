# Vistas de Flask para manejar las rutas
from app import app
from werkzeug.security import check_password_hash
from flask import *
from .forms import *
from .models import *
from ml_models import *
import cv2
import numpy as np
import json
from config import config
#from ml_models.AG.genetic_algorithm import run_genetic_algorithm
from ml_models.AG.genetic_algorithm import *
#from ml_models.AG.problem_definition import evaluate_individual
#'Bearer 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'
@app.route('/')
def init():
    skills_matching = {
    'Tarea1': ['Humano1', 'Humano2', 'Humano3', 'Humano4'],
    'Tarea2': ['Humano1', 'Humano4', 'Humano5', 'Humano6'],
    'Tarea3': ['Humano2', 'Humano3', 'Humano5', 'Humano7'],
    'Tarea4': ['Humano8', 'Humano9', 'Humano10', 'Humano11'],
    'Tarea5': ['Humano12', 'Humano13', 'Humano14', 'Humano3'],
    'Tarea6': ['Humano1', 'Humano15', 'Humano16', 'Humano17'],
    'Tarea7': ['Humano18', 'Humano19', 'Humano20', 'Humano21'],
    'Tarea8': ['Humano22', 'Humano23', 'Humano24', 'Humano25'],
    'Tarea9': ['Humano26', 'Humano27', 'Humano28', 'Humano29'],
    'Tarea10': ['Humano30'],
    'Tarea11': ['Humano30'],

    # Puedes seguir expandiendo según sea necesario
    }
    beneficios= {
        'Tarea1': 100,
        'Tarea2': 150,
        'Tarea3': 120,
        'Tarea4': 130,
        'Tarea5': 80,
        'Tarea6': 200,
        'Tarea7': 110,
        'Tarea8': 90,
        'Tarea9': 160,
        'Tarea10': 140,
        'Tarea11' : 5000,
    }
    costes = {
        'Humano1': 50, 'Humano2': 45, 'Humano3': 55, 'Humano4': 40, 'Humano5': 60,
        'Humano6': 50, 'Humano7': 65, 'Humano8': 40, 'Humano9': 55, 'Humano10': 45,
        'Humano11': 60, 'Humano12': 50, 'Humano13': 55, 'Humano14': 65, 'Humano15': 40,
        'Humano16': 45, 'Humano17': 50, 'Humano18': 60, 'Humano19': 40, 'Humano20': 55,
        'Humano21': 65, 'Humano22': 45, 'Humano23': 50, 'Humano24': 55, 'Humano25': 40,
        'Humano26': 60, 'Humano27': 65, 'Humano28': 45, 'Humano29': 55, 'Humano30': 50,
        'Humano31': 40, 'Humano32': 60, 'Humano33': 65
    }
    fatigas = {
        'Humano1': 10, 'Humano2': 15, 'Humano3': 20, 'Humano4': 10, 'Humano5': 25,
        'Humano6': 5, 'Humano7': 30, 'Humano8': 10, 'Humano9': 20, 'Humano10': 15,
        'Humano11': 5, 'Humano12': 10, 'Humano13': 25, 'Humano14': 30, 'Humano15': 20,
        'Humano16': 15, 'Humano17': 10, 'Humano18': 5, 'Humano19': 25, 'Humano20': 20,
        'Humano21': 15, 'Humano22': 30, 'Humano23': 5, 'Humano24': 10, 'Humano25': 25,
        'Humano26': 20, 'Humano27': 15, 'Humano28': 10, 'Humano29': 5, 'Humano30': 30,
        'Humano31': 25, 'Humano32': 20, 'Humano33': 15
    }

    dependencias = {
        'Tarea11' : 'Tarea10',
    }
    '''
    skills_matching = 
    fatigas = RecursosModel.fatiga_recursos(fabrica_id)
    costes = RecursosModel.coste_recursos(fabrica_id)
    beneficios = TareaModel.beneficio_subtasks(fabrica_id)
    dependencias = TareaModel.dependencias_subtasks(skills_matching)

    '''
    k= 50

    # Parámetros para el algoritmo genético
    num_generations = 2000
    num_individuals = 50

    # Ejecutar el algoritmo genético
    mejor_individuo = run_genetic_algorithm(skills_matching,dependencias, num_generations, num_individuals,k,beneficios, costes, fatigas)
   # print("valores mejor individuo:",evaluate_individual(mejor_individuo))
    print("El mejor individuo encontrado es:", mejor_individuo)

    #soft_skills = TareaModel.get_soft_skills();
    #print(soft_skills)
    return mejor_individuo


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
            
            session['usuario'] = user
            return redirect(url_for('index'))  # Redirige al index o donde sea necesario
        else:
            return 'Datos de inicio de sesión incorrectos.'
    return render_template('login.html', form=form)

@app.route('/pagina_principal', methods=['GET', 'POST'])
def gestionar_fabricas():
    usuario = session.get('usuario')
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
