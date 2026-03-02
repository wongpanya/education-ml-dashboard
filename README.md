# Education ML Dashboard (GitHub Pages)

หน้าเว็บตัวอย่างสำหรับเรียก Render API ของ Education ML (Flask) จาก GitHub Pages

## ไฟล์หลัก
- `index.html`
- `style.css`
- `script.js`
- `up_logo.png`

## วิธีใช้
1. อัปโหลดไฟล์ทั้งหมดขึ้น GitHub repo ใหม่
2. ไปที่ **Settings > Pages**
3. เลือก **Deploy from a branch**
4. เลือก branch `main` และ folder `/ (root)`
5. เปิด URL ที่ GitHub Pages ให้มา
6. ตรวจสอบช่อง `Render API URL` ให้ตรงกับของคุณ แล้วกด `Check API Health`

## หมายเหตุ
- ต้องเปิด CORS ฝั่ง Render API (ใน Flask)
- ถ้า Render Free plan sleep อยู่ ครั้งแรกอาจช้าเล็กน้อย
