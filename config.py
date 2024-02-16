#Configuracion de la aplicación Flask
class DevelopmentConfig():
    DEBUG = True
    SECRET_KEY = '7263918639123691'
    MYSQL_HOST ='158.42.250.56'
    MYSQL_USER= 'midela_civafer'
    MYSQL_PASSWORD = '%@%JL6XYJvk9z6_'
    MYSQL_DB = 'midela_simulador_fabrica'




config = {
    'development' : DevelopmentConfig
}