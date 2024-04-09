 # Formularios de Flask-WTF
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, DateTimeField
from wtforms.validators import DataRequired, EqualTo, Length
from wtforms_components import DateTimeLocalField

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

class TrabajadorRegistrationForm(FlaskForm):
    name = StringField('Nombre', validators=[DataRequired()])
    surname = StringField('Apellidos', validators=[DataRequired()])
    '''
    birthday = DateTimeLocalField('Fecha de Nacimiento', format='%Y-%m-%dT%H:%M', validators=[DataRequired()])
    job_title = StringField('Cargo', validators=[DataRequired()])
    '''
    submit = SubmitField('Registrar Trabajador')


'''
class TareaRegistrationForm(FlaskForm):
    title = StringField('Título', validators=[DataRequired()])
    description = TextAreaField('Descripción', validators=[DataRequired()])
    deadline = DateField('Fecha Límite', format='%Y-%m-%d', validators=[DataRequired()])
    submit = SubmitField('Registrar Tarea')

class MaquinaRegistrationForm(FlaskForm):
    name = StringField('Nombre', validators=[DataRequired()])
    model = StringField('Modelo', validators=[DataRequired()])
    submit = SubmitField('Registrar Máquina')
'''