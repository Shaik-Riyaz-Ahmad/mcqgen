from setuptools import setup, find_packages,setup
setup(
    name='pygpt4all',
    version='0.0.1',
    author='riyaz ahmad', # Replace with your name        
    author_email='riyazahmadshaik09@gmail.com',
    install_requires=[
        'openai',
        'langchain',
        'streamlit',
        'python-dotenv',
        'pyPDF2'],
    packages=find_packages()
) 