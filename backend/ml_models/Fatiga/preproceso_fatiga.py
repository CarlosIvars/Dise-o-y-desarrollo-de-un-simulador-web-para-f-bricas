import pandas as pd
import json
import  numpy as np

def afinidad():
    
    datos = sum()





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

        df['afinidad'] = df.apply(lambda row: afinidad(row['trabajadores'], row['subtasks']), axis=1)
        df['distribucion_skills_trab'] = df['trabajadores'].apply(lambda x: caracteristicas_trabajadores(x)[2])
        print(df[['promedio_fatiga_trab', 'promedio_coste_h_trab', 'distribucion_skills_trab']].head())

        df['promedio_fatiga_maq'] = df['maquinas'].apply(lambda x: caracteristicas_maquinas(x)[0])
        df['promedio_coste_h_maq'] = df['maquinas'].apply(lambda x: caracteristicas_maquinas(x)[1])
        df['distribucion_skills_maq'] = df['maquinas'].apply(lambda x: caracteristicas_maquinas(x)[2])
        print(df[['promedio_fatiga_maq', 'promedio_coste_h_maq', 'distribucion_skills_maq']].head())

        df['coste_total_subt'] = df['subtasks'].apply(lambda x: caracteristicas_subtareas(x)[0])
        df['beneficio_total_subt'] = df['subtasks'].apply(lambda x: caracteristicas_subtareas(x)[1])
        df['promedio_duracion_subt'] = df['subtasks'].apply(lambda x: caracteristicas_subtareas(x)[2])
        df['distribucion_skills_subt'] = df['subtasks'].apply(lambda x: caracteristicas_subtareas(x)[3])
        print(df[['coste_total_subt', 'beneficio_total_subt', 'promedio_duracion_subt', 'distribucion_skills_subt']].head())

        df['num_asignaciones_trab'] = df['asignaciones'].apply(lambda x: contar_asignaciones(x)[0])
        df['num_asignaciones_maq'] = df['asignaciones'].apply(lambda x: contar_asignaciones(x)[1])
        print(df[['num_asignaciones_trab', 'num_asignaciones_maq']].head())

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