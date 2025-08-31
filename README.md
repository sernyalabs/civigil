# civigil
Civigil is an anonymous complaint reporting website.

# CIVIGIL - Backend (Django + DRF)

CIVIGIL is a web-based platform for **anonymous civic reporting**.  
This repository contains the **backend API**, built using **Django Rest Framework (DRF)**.

---

## 🚀 Features
- Anonymous incident reporting (no login required)
- Structured location details (building, floor, landmark, etc.)
- Optional phone number for follow-up
- Optional image evidence upload
- REST API endpoints for creating and viewing incidents
- Ready for future integration with frontend (map + dashboard)

---

## ⚙️ Installation Guide

### 1. Clone the repository
```bash
git clone https://github.com/sernyalabs/civigil.git
cd civigil

python -m venv env
# Activate on Windows:
env\Scripts\activate
# Activate on Mac/Linux:
source env/bin/activate

pip install -r requirements.txt

pip install django djangorestframework pillow

python manage.py makemigrations
python manage.py migrate

python manage.py createsuperuser #optional django supports default admin panel for that you can create a super user or simply just run the api .

python manage.py runserver #Run the project 

http://127.0.0.1:8000/api/incidents/ #apis example


