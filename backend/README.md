# 🚀 Pixelora Backend (FastAPI + Python)

خادم بايثون السريع لمعالجة الصور والتكامل مع خوارزميات الذكاء الاصطناعي وإزالة الخلفيات وتطبيق الفلاتر المتقدمة.

## 📦 التثبيت والتشغيل

1. إنشاء بيئة افتراضية:
```bash
python3 -m venv venv
source venv/bin/activate  # في لينكس/ماك
# أو venv\Scripts\activate في ويندوز
```

2. تثبيت الحزم:
```bash
pip install -r requirements.txt
```

3. تشغيل خادم FastAPI:
```bash
uvicorn main:app --reload --port 8000
```

4. استعراض التوثيق التفاعلي Swagger:
افتح المتصفح على: `http://localhost:8000/docs`
