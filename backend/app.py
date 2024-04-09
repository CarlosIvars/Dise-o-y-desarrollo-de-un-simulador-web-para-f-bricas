#Script para ejecutar la apliación Flask
from flask import Flask
from config import config
from app import app

if __name__ == '__main__':
    app.config.from_object(config['development'])
    app.run()