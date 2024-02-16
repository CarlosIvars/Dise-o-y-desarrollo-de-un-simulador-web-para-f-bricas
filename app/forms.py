 # Formularios de Flask-WTF
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, EqualTo, Length

class RegistrationForm(FlaskForm):
    name = StringField('Nombre', validators=[DataRequired()])
    surname = StringField('Apellidos', validators=[DataRequired()])
    username = StringField('Nombre de Usuario', validators=[DataRequired(), Length(min=4, max=25)])
    password = PasswordField('Contraseña', validators=[
        DataRequired(),
        EqualTo('confirm_password', message='Las contraseñas deben coincidir.')
    ])
    confirm_password = PasswordField('Repetir Contraseña')
    submit = SubmitField('Registrarse')