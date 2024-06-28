import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold, RandomizedSearchCV
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
from ast import literal_eval
import tensorflow as tf
from tensorflow import keras
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os

plot_dir = './SavedPlots'
if not os.path.exists(plot_dir):
    os.makedirs(plot_dir)
    
model_dir = './MejoresModelos'
if not os.path.exists(model_dir):
    os.makedirs(model_dir)

def expand_list_columns(df, column_name):
    expanded_df = pd.DataFrame(df[column_name].to_list(), index=df.index)
    expanded_df.columns = [f"{column_name}_{i}" for i in range(expanded_df.shape[1])]
    return expanded_df

def verificar_distribucion_clases(df, nombre):
    print(f"Distribución de clases en {nombre}:")
    print(df['clase_fatiga'].value_counts())
    print("\n")

def balancear_clases_smote(X, y):
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X, y)
    return X_resampled, y_resampled

def train_ann(X_train, y_train):
    model = keras.Sequential([
        keras.layers.Dense(32, activation='selu'),
        keras.layers.Dense(32, activation='selu'),
        keras.layers.Dense(32, activation='selu'),
        keras.layers.Dense(32, activation='selu'),
        keras.layers.Dense(5, activation='softmax')  # Ajustar para la cantidad de clases
    ])
    model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])
    model.fit(X_train, y_train, epochs=15, batch_size=10, verbose=0)
    return model

def modelosML():
    df_modelo = pd.read_csv('./df_modelo.csv')

    # Convertir las columnas que contienen listas como cadenas a listas reales
    df_modelo['t_skills'] = df_modelo['t_skills'].apply(literal_eval)
    df_modelo['m_skills'] = df_modelo['m_skills'].apply(literal_eval)
    df_modelo['s_skills'] = df_modelo['s_skills'].apply(literal_eval)

    # Expandir las columnas que contienen listas
    t_skills_expanded = expand_list_columns(df_modelo, 't_skills')
    m_skills_expanded = expand_list_columns(df_modelo, 'm_skills')
    s_skills_expanded = expand_list_columns(df_modelo, 's_skills')

    # Unir las columnas expandidas al DataFrame original
    df_modelo = pd.concat([df_modelo, t_skills_expanded, m_skills_expanded, s_skills_expanded], axis=1)

    # Eliminar las columnas originales de listas
    df_modelo.drop(columns=['t_skills', 'm_skills', 's_skills'], inplace=True)

    # Convertir todas las características a numéricas
    df_modelo = df_modelo.apply(pd.to_numeric, errors='coerce')

    # Eliminar filas con valores NaN en clase_fatiga
    df_modelo = df_modelo.dropna(subset=['clase_fatiga'])

    # Verificar distribución de clases antes del balanceo
    verificar_distribucion_clases(df_modelo, "conjunto de datos completo")

    # Dividir los datos en características (X) y objetivo (y)
    X = df_modelo.drop('clase_fatiga', axis=1)
    y = df_modelo['clase_fatiga']

    # Imputar valores faltantes
    imputer = SimpleImputer(strategy='mean')
    X = imputer.fit_transform(X)

    # Balancear las clases usando SMOTE
    X_resampled, y_resampled = balancear_clases_smote(X, y)

    # Verificar distribución de clases después del balanceo
    df_resampled = pd.DataFrame(X_resampled, columns=df_modelo.drop('clase_fatiga', axis=1).columns)
    df_resampled['clase_fatiga'] = y_resampled
    verificar_distribucion_clases(df_resampled, "conjunto de datos balanceado")

    # Escalar las características
    scaler = StandardScaler()
    X_resampled_scaled = scaler.fit_transform(X_resampled)

    # Dividir los datos en conjunto de entrenamiento y prueba
    X_train, X_test, y_train, y_test = train_test_split(X_resampled_scaled, y_resampled, test_size=0.2, random_state=42)
    
    # Definir los modelos
    models = {
        'SVM': SVC(random_state=42),
        'Random Forest': RandomForestClassifier(random_state=42),
        'XGBoost': XGBClassifier(random_state=42, use_label_encoder=False, eval_metric='mlogloss', tree_method='gpu_hist'),
        'ANN': train_ann
    }

    results = []
    # Entrenar y evaluar los modelos en el conjunto de entrenamiento y prueba
    for name, model in models.items():
        if name == 'ANN':
            best_model = train_ann(X_train, y_train)
            predictions = np.argmax(best_model.predict(X_test), axis=1)
        else:
            best_model = model
            best_model.fit(X_train, y_train)
            predictions = best_model.predict(X_test)

        # Guardar el mejor modelo
        model_path = os.path.join(model_dir, f'{name}_best_model.pkl')
        joblib.dump(best_model, model_path)
        print(f"Modelo {name} guardado en: {model_path}")

        # Calcular métricas
        accuracy = accuracy_score(y_test, predictions)
        precision = precision_score(y_test, predictions, average='weighted', zero_division=1)
        recall = recall_score(y_test, predictions, average='weighted', zero_division=1)
        f1 = f1_score(y_test, predictions, average='weighted', zero_division=1)

        results.append({
            'model': name,
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1
        })

        # Imprimir las métricas en el conjunto de prueba
        print(f"{name} Accuracy en el conjunto de prueba: {accuracy:.2f}")
        print(f"{name} Precision en el conjunto de prueba: {precision:.2f}")
        print(f"{name} Recall en el conjunto de prueba: {recall:.2f}")
        print(f"{name} F1 en el conjunto de prueba: {f1:.2f}")
        print(f"{name} Classification Report en el conjunto de prueba:")
        print(classification_report(y_test, predictions, zero_division=1))
        print(f"{name} Confusion Matrix en el conjunto de prueba:")
        print(confusion_matrix(y_test, predictions))

        # Matriz de confusión
        con_mat = confusion_matrix(y_test, predictions)
        con_mat_norm = np.around(con_mat.astype('float') / con_mat.sum(axis=1)[:, np.newaxis], decimals=2)
        con_mat_df = pd.DataFrame(con_mat_norm,
                                  index=[f'Class {i}' for i in range(con_mat.shape[0])],
                                  columns=[f'Class {i}' for i in range(con_mat.shape[1])])

        sns.set(font_scale=1.2)
        plt.figure(figsize=(10, 8))
        sns.heatmap(con_mat_df, annot=True, cmap=plt.cm.Blues)
        plt.tight_layout()
        plt.ylabel('Etiqueta real')
        plt.xlabel('Etiqueta inferida')
        plt.title(f'Matriz de Confusión Normalizada - {name}')
        plt.show()

    # Crear el plot de resultados en el conjunto de prueba
    model_names = [result['model'] for result in results]
    accuracies = [result['accuracy'] for result in results]
    precisions = [result['precision'] for result in results]
    recalls = [result['recall'] for result in results]
    f1_scores = [result['f1'] for result in results]

    x = np.arange(len(model_names))
    width = 0.2

    fig, ax = plt.subplots(figsize=(12, 8))
    rects1 = ax.bar(x - width*1.5, accuracies, width, label='Accuracy')
    rects2 = ax.bar(x - width/2, precisions, width, label='Precision')
    rects3 = ax.bar(x + width/2, recalls, width, label='Recall')
    rects4 = ax.bar(x + width*1.5, f1_scores, width, label='F1 Score')

    ax.set_xlabel('Models')
    ax.set_title('Performance Metrics by Model')
    ax.set_xticks(x)
    ax.set_xticklabels(model_names)
    ax.legend()

    fig.tight_layout()
    plt.show()
