# Vistas de Flask para manejar las rutas
from app import app
from werkzeug.security import check_password_hash
from flask import *
from .forms import *
from .models import *
from ml_models import *
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
    skills_matching = TareaModel.skills_matching(fabrica_id)
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
    print("valores mejor individuo:",evaluate_individual(mejor_individuo,beneficios,costes, fatigas,dependencias))
    print("El mejor individuo encontrado es:", mejor_individuo)

    #soft_skills = TareaModel.get_soft_skills();
    #print(soft_skills)
    return mejor_individuo

############################################################################################
# Pagina inicio sesion
############################################################################################
@app.route('/register', methods = ['POST'])
def register():
    data = request.json

    if not data:
        return jsonify({'error': 'No se proporcionaron datos'}), 400

    username = data.get('username')
    name = data.get('name')
    surname = data.get('surname')
    password = data.get('password')

    if not all([username, name, surname, password]):
        return jsonify({'error': 'Faltan datos necesarios para el registro'}), 400

    existing_user = UserModel.get(username)
    if existing_user:
        return jsonify({'error': 'El nombre de usuario ya existe'}), 409

    user = UserModel(
        username=username,
        name=name,
        surname=surname,
        password=password  
    )

    reg = UserModel.register_user(user)
    if reg:
       return jsonify({'mensaje': 'Registro exitoso'}), 201
    else:
        return jsonify({'mensaje': 'El usuario no se pudo registrar correctamente'}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json  
    if data:
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Faltan datos de usuario o contraseña'}), 400        
        user = UserModel.get(username)
        if user and check_password_hash(user.password, password):      
            session['usuario'] = user.username  # Guarda el username en el session
            return jsonify({'message': 'Inicio de sesión exitoso', 'user': username}), 200
        else:
            return jsonify({'error': 'Datos de inicio de sesión incorrectos'}), 401   
    else:
        return jsonify({'error': 'Solicitud incorrecta, datos no proporcionados'}), 400
    
@app.route('/usuarios')
def listar_usuarios():
    users = UserModel.load_users()
    return jsonify({'users': users, 'mensaje': "Usuarios Listados"}), 200

############################################################################################
# Pagina principal
############################################################################################
@app.route('/fabricas', methods=['GET'])
def obtener_fabricas():
    usuario = session.get('usuario')
    if not usuario:
        return jsonify({'error': 'Usuario no autenticado'}), 401
    
    user = UserModel.get(usuario)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    fabricas_data = FabricaModel.get_fabricas_by_user(user['id'])
    fabricas = [{
        'nombre': fabrica[0],
        'costes': fabrica[1],
        'beneficios': fabrica[2]
    } for fabrica in fabricas_data]

    return jsonify(fabricas), 200

#Se crea la fabrica, los costes y beneficios se calculan a posteriori, estos estan por default a 0
@app.route('/fabricas', methods=['POST'])
def añadir_fabrica():
    usuario = session.get('usuario')
    if not usuario:
        return jsonify({'error': 'Usuario no autenticado'}), 401

    data = request.json
    nombre_fabrica = data.get('nombre_fabrica')
    user = UserModel.get(usuario)
    resultado = FabricaModel.add_fabrica(nombre_fabrica, user['id'])
    if resultado:
        return jsonify({'mensaje': 'Fábrica añadida correctamente'}), 201
    else:
        return jsonify({'error': 'No se pudo añadir la fábrica'}), 500
    
@app.route('/select_fabrica', methods=['POST'])
def seleccionar_fabrica():
    usuario = session.get('usuario')
    if not usuario:
        return jsonify({'error': 'Usuario no autenticado'}), 401
    
    data = request.json
    if not data or 'fabrica_id' not in data:
        return jsonify({'error': 'No se proporcionó fabrica_id'}), 400
    
    user = UserModel.get(usuario)
    fabrica_id = data.get('fabrica_id')
    fabrica = FabricaModel.get_fabrica_by_id(user['id'], fabrica_id)
    
    if not fabrica:
        return jsonify({'mensaje': 'Fábrica no encontrada correctamente'}), 404


    session['fabrica'] = fabrica_id

    return jsonify({'mensaje': 'Fábrica seleccionada exitosamente', 'fabrica_id': fabrica_id}), 200



############################################################################################
# Simulador
############################################################################################
@app.route('/add_trabajador', methods = ['POST'])
def add_trabajador():
    fabrica_id = session.get('fabrica')
    data = request.json
    if not fabrica_id:
        return jsonify({'error': 'Fabrica no encontrada'}), 404
    if not data or not all(key in data for key in ['nombre', 'apellidos', 'fecha_nacimiento', 'fatiga', 'coste_h', 'preferencias', 'skills']):
        return jsonify({'error': 'Datos incompletos'}), 400
    nombre = data.get('nombre')
    apellidos = data.get('apellidos')
    fecha_nacimiento = data.get('fecha_nacimiento')
    fatiga = data.get('fatiga')
    coste_h = data.get('coste_h')
    preferencias = data.get('preferencias')
    skills = data.get('skills')
    trabajador_id = RecursosModel.add_trabajador(fabrica_id, nombre, apellidos, fecha_nacimiento, fatiga, coste_h, preferencias, skills)
    if trabajador_id:
        return jsonify({'mensaje': 'Trabajador añadido con exitoso'}), 201
    else:
        return jsonify({'mensaje': 'El trabajador no se pudo añadir correctamente'}), 500
    
@app.route('/add_maquina', methods = ['POST'])
def add_maquina():
    fabrica_id = session.get('fabrica')
    data = request.json
    if not fabrica_id:
        return jsonify({'error': 'Fabrica no encontrada'}), 404
    if not data or not all(key in data for key in ['nombre', 'fatiga', 'coste_h', 'skills']):
        return jsonify({'error': 'Datos incompletos'}), 400
    nombre = data.get('nombre')
    fatiga = data.get('fatiga')
    coste_h = data.get('coste_h')
    skills = data.get('skills')
    print(nombre, fatiga, coste_h, skills)
    maquina_id = RecursosModel.add_maquina(fabrica_id, nombre, fatiga, coste_h, skills)
    if maquina_id:
        return jsonify({'mensaje': 'Maquina añadida con exitoso'}), 201
    else:
        return jsonify({'mensaje': 'La maquina no se pudo añadir correctamente'}), 500


@app.route('/add_subtask', methods = ['POST'])
def add_subtask():
    fabrica_id = session.get('fabrica')
    data = request.json
    if not fabrica_id:
        return jsonify({'error': 'Fabrica no encontrada'}), 404
    if not data or not all(key in data for key in ['nombre','duracion', 'beneficio', 'descripcion','sector']):
        return jsonify({'error': 'Datos incompletos'}), 400
    sector = data.get('sector')
    nombre = data.get('nombre')
    duracion = data.get('duracion')
    beneficio = data.get('beneficio')
    descripcion = data.get('descripcion')
    subtask_id = TareaModel.add_subtask(nombre, duracion, beneficio, descripcion, fabrica_id, sector)
    if subtask_id:
        return jsonify({'mensaje': 'Subtask añadida con exitoso'}), 201
    else:
        return jsonify({'mensaje': 'Subtask no se pudo añadir correctamente'}), 500


@app.route('/alg_genetico', methods = ['GET'])
def algoritmo_genetico():
    fabrica_id = session.get('fabrica')
    if not fabrica_id:
        return jsonify({'error': 'Fabrica no encontrada'}), 404
    
    skills_matching = TareaModel.skills_matching(fabrica_id)
    fatigas = RecursosModel.fatiga_recursos(fabrica_id)
    costes = RecursosModel.coste_recursos(fabrica_id)
    beneficios = TareaModel.beneficio_subtasks(fabrica_id)
    dependencias = TareaModel.dependencias_subtasks(skills_matching)
    
    # Parámetros para el algoritmo genético
    num_individuos_seleccion= 50
    num_generations = 2000
    num_individuals = 50

    # Ejecutar el algoritmo genético
    mejor_individuo = run_genetic_algorithm(skills_matching,dependencias, num_generations, 
                                            num_individuals,num_individuos_seleccion,beneficios, costes, fatigas)
    puntuacion = evaluate_individual(mejor_individuo,beneficios,costes, fatigas,dependencias)

    print("valores mejor individuo:",puntuacion)
    print("El mejor individuo encontrado es:", mejor_individuo)

    asignaciones = {subtask: recurso for subtask, recurso in mejor_individuo}

    resultado = {
        "puntuacion": puntuacion,
        "mejor_individuo": asignaciones
    }
 
    return jsonify(resultado), 200

############################################################################################
# En proceso
############################################################################################
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


@app.route('/<usuario>/<fabrica>',)
def ver_fabrica(usuario, fabrica):
    print(usuario, fabrica)
    # Aquí va la lógica para manejar la solicitud para una fábrica específica
    return render_template('pagina_fabrica.html', usuario=usuario, fabrica=fabrica)





@app.route('/<usuario>/<fabrica>/skill_matching')
def obtener_habilidades(fabrica_id):
    habilidades_maquinas = RecursosModel.obtener_habilidades_maquinas(fabrica_id)
    habilidades_trabajadores = RecursosModel.obtener_habilidades_trabajadores(fabrica_id)
    
    # Combinar los diccionarios de habilidades de máquinas y trabajadores en uno solo
    habilidades_totales = habilidades_maquinas.copy()
    habilidades_totales.update(habilidades_trabajadores)
    
    return habilidades_totales
