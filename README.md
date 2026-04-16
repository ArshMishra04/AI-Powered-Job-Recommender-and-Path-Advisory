# 🚀 AI-Powered Job Recommender & Career Path Advisory

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![Machine Learning](https://img.shields.io/badge/ML-Recommendation-orange)
![License](https://img.shields.io/badge/License-Apache%202.0-blue)
![Status](https://img.shields.io/badge/Status-Active-success)

---

## 📌 Overview
An **AI-powered career recommendation system** designed to help students and freshers discover the most suitable career paths based on their **skills, interests, and background**.

This platform provides:
- 🎯 Personalized job recommendations  
- 📊 Skill gap analysis  
- 🧠 Intelligent career suggestions using ML  
- 🛣️ Structured career roadmaps  

---

## ✨ Key Features

🔹 **AI-Based Career Recommendations**  
Suggests best-fit careers using machine learning models  

🔹 **Skill Gap Analysis**  
Identifies missing skills required for target roles  

🔹 **Career Roadmap Generator**  
Step-by-step guidance to achieve career goals  

🔹 **User Profile System**  
Stores user preferences and history  

🔹 **Comparison Engine**  
Compare multiple career paths  

🔹 **Confidence Scoring System**  
Shows how well a career matches user profile  

---

## 🏗️ Project Architecture

```bash
📦 AI-Powered-Job-Recommender-and-Path-Advisory
│
├── 🔙 Backend  (👨‍💻 Developed by Abhijit More)
│   ├── 📁 app
│   │   ├── 📁 routes        # API endpoints (recommendation, roadmap, etc.)
│   │   ├── 📁 models        # Data models & schemas
│   │   ├── 📁 ml            # ML logic (classification, similarity, TF-IDF)
│   │   ├── 📁 utils         # Core engines & helper functions
│   │   ├── 📁 database      # DB connection & handling
│   │   └── 📁 data          # Datasets (CSV/JSON)
│   │
│   └── 🚀 main.py           # Entry point of FastAPI app
│
├── 🎨 Frontend  (👨‍💻 Developed by Arsh Mishra)
│   ├── 🌐 UI Components
│   ├── 🔗 API Integration
│   └── 📱 Responsive Design
│
├── 📄 README.md             # Project documentation
└── 📜 LICENSE               # Apache 2.0 License
```
## 🧠 Tech Stack

### 🔹 Backend (By Abhijit More)
- ⚡ FastAPI  
- 🐍 Python  
- 🤖 Machine Learning (TF-IDF, Classification, Similarity)  
- 🗄️ JSON / CSV Data Handling  
- 🔐 JWT Authentication  

### 🔹 Frontend (By Arsh Mishra)
- 🌐 Modern UI (React / Web Tech)
- 🎨 Responsive Design
- 🔗 API Integration

---

## ⚙️ Installation & Setup

### 🔹 Clone the Repository
```
git clone https://github.com/ArshMishra04/AI-Powered-Job-Recommender-and-Path-Advisory.git
cd AI-Powered-Job-Recommender-and-Path-Advisory
```
🔹 Backend Setup
```
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload
```
➡️ Backend will run on: http://127.0.0.1:8000

🔹 Frontend Setup
```
cd Frontend
npm install
npm start
🔌 API Features
/recommend → Get career recommendations
/roadmap → Generate career roadmap
/compare → Compare careers
/profile → Manage user data
/confidence → Match score
```

🎯 Use Cases
🎓 Students confused about career choices
💼 Freshers exploring job roles
🔄 Career switchers
📊 Data-driven career planning
👨‍💻 Contributors
🔹 Backend Developer

**Abhijit More**

Built complete backend architecture
Developed ML recommendation system
Designed APIs and logic

🔹 Frontend Developer

**Arsh Mishra**

Designed and developed UI
Integrated frontend with backend APIs

📈 Future Improvements:
🔍 Resume parsing
🤖 AI chatbot career assistant
🌐 Deployment (AWS / Vercel)
📊 Real-time job market data integration
📜 License

This project is licensed under the Apache 2.0 License

⭐ Support

If you found this project useful:
👉 Star this repository
👉 Share with others

💡 Author Note

This project showcases a real-world AI application combining:

Machine Learning
Backend Engineering
Frontend Development

Built with the goal of helping people make better career decisions using data 🚀
