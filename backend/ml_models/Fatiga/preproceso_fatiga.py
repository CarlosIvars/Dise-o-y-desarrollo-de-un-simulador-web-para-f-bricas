import pandas as pd
import json
import  numpy as np
def afinidad_trabajadores(trabajadores, subtasks, asignaciones):
    afinidad = 0
    n = 0
    for a in asignaciones:
        t = a['asignable_id'] 
        s = a['tarea_id']
        if(t.startswith('H')):
            n += 1
            t_skills = next((trabajador['skills'] for trabajador in trabajadores if trabajador['id'] == t), None)
            s_skills = next((subtask['skills'] for subtask in subtasks if subtask['id'] == s), None)
            afinidad += (len(set(t_skills) & set(s_skills))) / len(s_skills) if len(s_skills)>1 else 0   
    return afinidad / n if n > 0 else 0

def afinidad_maquinas(maquinas, subtasks, asignaciones):
    afinidad = 0
    n = 0
    for a in asignaciones:
        m = a['asignable_id'] 
        s = a['tarea_id']
        if(m.startswith('M')):
            n += 1
            m_skills = next((maquina['skills'] for maquina in maquinas if maquina['id'] == m), None)
            s_skills = next((subtask['skills'] for subtask in subtasks if subtask['id'] == s), None)
            afinidad += (len(set(m_skills) & set(s_skills))) / len(s_skills) if len(s_skills)>1 else 0
    return afinidad / n if n > 0 else 0

def t_minimo(subtasks, asignaciones):
    duraciones = []
    for a in asignaciones:
        s = a['tarea_id']
        s_tiempo = next((subtask['tiempoBase'] for subtask in subtasks if subtask['id'] == s), None)
        if s_tiempo is not None:
            duraciones.append(s_tiempo)
    return min(duraciones)
    
def t_maximo(subtasks, asignaciones):
    duraciones = []
    for a in asignaciones:
        s = a['tarea_id']
        s_tiempo = next((subtask['tiempoBase'] for subtask in subtasks if subtask['id'] == s), None)
        if s_tiempo is not None:
            duraciones.append(s_tiempo)
    return max(duraciones)

def avg_tiempo(subtasks, asignaciones):
    duraciones = []
    for a in asignaciones:
        s = a['tarea_id']
        s_tiempo = next((subtask['tiempoBase'] for subtask in subtasks if subtask['id'] == s), None)
        if s_tiempo is not None:
            duraciones.append(s_tiempo)
    return sum(duraciones) / len(duraciones)


def n_subtareas(asignaciones):
     return len(set(a['tarea_id'] for a in asignaciones))

def sector_fabrica(sector):
    sectores = ['robotica colaborativa', 'fabricacion aditiva', 'mecatronica', 'interaccion Humano-Maquina', 'analisis de datos', 'Arquitectura e Ingeniería', 'Arte, diseño, entretenimiento, deportes y medios', 'Limpieza y mantenimiento de edificios y terrenos', 'Operaciones comerciales y financieras', 'Servicio comunitario y social', 'Informática y Matemáticas', 'Construcción y Extracción', 'Instrucción educativa y biblioteca', 'Agricultura, pesca y silvicultura', 'Relacionados con la preparación y el servicio de alimentos', 'Profesionales y Técnicos de la Salud', 'Apoyo sanitario', 'Instalación, mantenimiento y reparación', 'Legal', 'Ciencias de la vida, físicas y sociales', 'Gestión', 'Soporte administrativo y de oficina', 'Atención y servicio personal', 'Producción', 'Servicio de protección', 'Ventas y Afines', 'Transporte y movimiento de materiales']
    return sectores.index(sector)

def trabajadores_skills(trabajadores, asignaciones):
    skills = [0] * 20
    for a in asignaciones:
        t = a['asignable_id'] 
        if(t.startswith('H')):
            t_skills = next((trabajador['skills'] for trabajador in trabajadores if trabajador['id'] == t), None)
            for skill in t_skills:
                if 1 <= skill <= 10:
                    index = skill - 1  # Para índices de 0 a 9
                else:
                    index = (skill % 10) + 10  # Para índices de 10 a 19
                skills[index] += 1   
    return skills

def  maquinas_skills(maquinas, asignaciones):
    skills = [0] * 20
    for a in asignaciones:
        m = a['asignable_id'] 
        s = a['tarea_id']
        if(m.startswith('M')):
             m_skills = next((maquina['skills'] for maquina in maquinas if maquina['id'] == m), None)
             for skill in m_skills:
                if 1 <= skill <= 10:
                    index = skill - 1  # Para índices de 0 a 9
                else:
                    index = (skill % 10) + 10  # Para índices de 10 a 19
                skills[index] += 1   
    return skills

def  subtareas_skills(subtasks, asignaciones):
    skills = [0] * 20
    for a in asignaciones:
        m = a['asignable_id'] 
        s = a['tarea_id']
        s_skills = next((subtask['skills'] for subtask in subtasks if subtask['id'] == s), None)
        for skill in s_skills:
            if 1 <= skill <= 10:
                index = skill - 1  # Para índices de 0 a 9
            else:
                index = (skill % 10) + 10  # Para índices de 10 a 19
            skills[index] += 1   
    return skills

def avg_fatiga(trabajadores):
       # Asegurarse de que trabajadores es una lista de diccionarios
    if isinstance(trabajadores, str):
        trabajadores = json.loads(trabajadores.replace("'", "\""))
    fatigas = [trabajador['fatiga'] for trabajador in trabajadores if trabajador.get('fatiga') is not None]
    return sum(fatigas) / len([fatiga for fatiga in fatigas if fatiga != 0]) 

def clase_fatiga(fatiga_fin):
    if fatiga_fin <= 20:
        return 0
    elif fatiga_fin <= 40:
        return 1
    elif fatiga_fin <= 60:
        return 2
    elif fatiga_fin <= 80:
        return 3
    else:
        return 4

def preproceso_datos_fatiga_simulador(data):
    df = pd.DataFrame(data)
    try:    
        df['trabajadores'] = df['trabajadores'].apply(lambda x: json.loads(x.replace("'", "\"")))
        df['asignaciones'] = df['asignaciones'].apply(lambda x: json.loads(x.replace("'", "\"")))
        df['maquinas'] = df['maquinas'].apply(lambda x: json.loads(x.replace("'", "\"")))
        df['subtasks'] = df['subtasks'].apply(lambda x: json.loads(x.replace("'", "\"")))
        
        #DATOS a utilizar
        df['sector'] = df.apply(lambda x: sector_fabrica(x['sector']),axis = 1)

        #skills
        df['t_skills'] = df.apply(lambda x: trabajadores_skills(x['trabajadores'],x['asignaciones']), axis = 1)
        df['m_skills'] = df.apply(lambda x: maquinas_skills(x['maquinas'],x['asignaciones']), axis = 1)
        df['s_skills'] = df.apply(lambda x: subtareas_skills(x['subtasks'],x['asignaciones']), axis = 1)
        
        #Tareas activas
        df['s_activas'] = df.apply(lambda x: n_subtareas(x['asignaciones']), axis = 1)

        #afinidad 
        df['afinidad_t'] = df.apply(lambda x: afinidad_trabajadores(x['trabajadores'], x['subtasks'], x['asignaciones']), axis=1)
        df['afinidad_m'] = df.apply(lambda x: afinidad_maquinas(x['maquinas'], x['subtasks'], x['asignaciones']), axis=1)

        #duracion tarea
        df['t_min'] = df.apply(lambda x : t_minimo(x['subtasks'], x['asignaciones']), axis = 1)
        df['t_max'] = df.apply(lambda x : t_maximo(x['subtasks'], x['asignaciones']), axis = 1)
        df['t_avg'] = df.apply(lambda x : avg_tiempo(x['subtasks'], x['asignaciones']), axis = 1)
      

        caracteristicas = [
            'sector', 't_skills', 'm_skills', 's_skills', 's_activas',
            'afinidad_t', 'afinidad_m', 't_min', 't_max', 
            't_avg'
        ]
        df_modelo = df[caracteristicas]
        return df_modelo
    except Exception as ex:
        print(ex)

def preproceso_datos_fatiga(data, data_fin):
    df = pd.DataFrame(data)
    df_fin = pd.DataFrame(data_fin)
    try:    
        df['fecha'] = pd.to_datetime(df['fecha'])
        df['dia_semana'] = df['fecha'].dt.dayofweek
        df['hora_dia'] = df['fecha'].dt.hour
        
        df['trabajadores'] = df['trabajadores'].apply(lambda x: json.loads(x.replace("'", "\"")))
        df['asignaciones'] = df['asignaciones'].apply(lambda x: json.loads(x.replace("'", "\"")))
        df['maquinas'] = df['maquinas'].apply(lambda x: json.loads(x.replace("'", "\"")))
        df['subtasks'] = df['subtasks'].apply(lambda x: json.loads(x.replace("'", "\"")))

        #DATOS a utilizar
        df['sector'] = df.apply(lambda x: sector_fabrica(x['sector']),axis = 1)
        #skills
        df['t_skills'] = df.apply(lambda x: trabajadores_skills(x['trabajadores'],x['asignaciones']), axis = 1)
        df['m_skills'] = df.apply(lambda x: maquinas_skills(x['maquinas'],x['asignaciones']), axis = 1)
        df['s_skills'] = df.apply(lambda x: subtareas_skills(x['subtasks'],x['asignaciones']), axis = 1)
        
        #tareas activas
        df['s_activas'] = df.apply(lambda x: n_subtareas(x['asignaciones']), axis = 1)

        #afinidad 
        df['afinidad_t'] = df.apply(lambda x: afinidad_trabajadores(x['trabajadores'], x['subtasks'], x['asignaciones']), axis=1)
        df['afinidad_m'] = df.apply(lambda x: afinidad_maquinas(x['maquinas'], x['subtasks'], x['asignaciones']), axis=1)

        #duracion tarea
        df['t_min'] = df.apply(lambda x : t_minimo(x['subtasks'], x['asignaciones']), axis = 1)
        df['t_max'] = df.apply(lambda x : t_maximo(x['subtasks'], x['asignaciones']), axis = 1)
        df['t_avg'] = df.apply(lambda x : avg_tiempo(x['subtasks'], x['asignaciones']), axis = 1)
        #fatiga a predecir
  
        df_fin['fatiga_fin'] = df_fin.apply(lambda x: avg_fatiga(x['trabajadores']), axis=1)
        df_fin['clase_fatiga'] = df_fin.apply(lambda x: clase_fatiga(x['fatiga_fin']), axis=1)
        # Añadir las columnas de fatiga y clase al df_ini
        df['fatiga_fin'] = df_fin['fatiga_fin']
        df['clase_fatiga'] = df_fin['clase_fatiga']
        caracteristicas = [
            'sector', 't_skills', 'm_skills', 's_skills', 's_activas',
            'afinidad_t', 'afinidad_m', 't_min', 't_max', 
            't_avg'
        ]
        objetivos = ['clase_fatiga']
        df_modelo = df[caracteristicas + objetivos]
        pd.set_option('display.max_rows', None)
        pd.set_option('display.max_columns', None)
        return df_modelo
    except Exception as ex:
        print(ex)
