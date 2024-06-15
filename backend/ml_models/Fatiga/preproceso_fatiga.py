import pandas as pd
import json
import  numpy as np
import keras
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
            afinidad += (len(set(t_skills) & set(s_skills))) / len(s_skills)
    return afinidad / n

def afinidad_maquinas(maquinas, subtasks, asignaciones):
    print(maquinas)
    afinidad = 0
    n = 0
    for a in asignaciones:
        m = a['asignable_id'] 
        s = a['tarea_id']
        if(m.startswith('M')):
            n += 1
            m_skills = next((maquina['skills'] for maquina in maquinas if maquina['id'] == m), None)
            s_skills = next((subtask['skills'] for subtask in subtasks if subtask['id'] == s), None)
            afinidad += (len(set(m_skills) & set(s_skills))) / len(s_skills)
    return afinidad / n

def t_minimo(subtasks, asignaciones):
    duraciones = []
    for a in asignaciones:
        s = a['tarea_id']
        s_tiempo = next((subtask['tiempoBase'] for subtask in subtasks if subtask['id'] == s), None)
        if s_tiempo is not None:
            duraciones.append(s_tiempo)
    print(duraciones)
    print(min(duraciones))
    return min(duraciones)
    
def t_maximo(subtasks, asignaciones):
    duraciones = []
    for a in asignaciones:
        s = a['tarea_id']
        s_tiempo = next((subtask['tiempoBase'] for subtask in subtasks if subtask['id'] == s), None)
        if s_tiempo is not None:
            duraciones.append(s_tiempo)
    print(duraciones)
    print(max(duraciones))
    return max(duraciones)

def n_subtareas(subtareas):
    

def preproceso_datos_fatiga(data):
    df = pd.DataFrame(data)
    try:    
        print('entramos')
        df['fecha'] = pd.to_datetime(df['fecha'])
        df['dia_semana'] = df['fecha'].dt.dayofweek
        df['hora_dia'] = df['fecha'].dt.hour
        print(df[['fecha', 'dia_semana', 'hora_dia']])
        
        df['trabajadores'] = df['trabajadores'].apply(lambda x: json.loads(x.replace("'", "\"")))
        df['asignaciones'] = df['asignaciones'].apply(lambda x: json.loads(x.replace("'", "\"")))
        df['maquinas'] = df['maquinas'].apply(lambda x: json.loads(x.replace("'", "\"")))
        df['subtasks'] = df['subtasks'].apply(lambda x: json.loads(x.replace("'", "\"")))

        df['afinidad_t'] = df.apply(lambda x: afinidad_trabajadores(x['trabajadores'], x['subtasks'], x['asignaciones']), axis=1)
        #df['afinidad_m'] = df.apply(lambda x: afinidad_maquinas(x['maquinas'], x['subtasks'], x['asignaciones']), axis=1)

        df['t_min'] = df.apply(lambda x : t_minimo(x['subtasks'], x['asignaciones']), axis = 1)
        df['t_max'] = df.apply(lambda x : t_maximo(x['subtasks'], x['asignaciones']), axis = 1)


        caracteristicas = [
            'dia_semana', 'hora_dia',
            'promedio_fatiga_trab', 'promedio_coste_h_trab',
            'promedio_fatiga_maq', 'promedio_coste_h_maq',
            'coste_total_subt', 'beneficio_total_subt', 'promedio_duracion_subt',
            'num_asignaciones_trab', 'num_asignaciones_maq'
        ]

        objetivos = ['costes', 'beneficios']
        df_modelo = df[caracteristicas + objetivos]
    except Exception as ex:
        print(ex)