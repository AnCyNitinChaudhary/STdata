const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const { Employee } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/employeeDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer();

// Route to handle form submission
app.post('/submit', upload.none(), async (req, res) => {
  const { name, department, dob, email, mobile } = req.body;
  const newEmployee = new Employee({ name, department, dob, email, mobile });
  await newEmployee.save();
  res.redirect('/');
});

// Route to handle file download
app.get('/download', async (req, res) => {
  const employees = await Employee.find({});
  const data = employees.map(emp => [
    emp.name, emp.department, emp.dob.toISOString().split('T')[0], emp.email, emp.mobile
  ]);

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.aoa_to_sheet([
    ['Employee Name', 'Department Name', 'Date of Birth', 'Email ID', 'Mobile Number'],
    ...data
  ]);
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const filePath = path.join(__dirname, 'data', 'employee_details.xlsx');
  xlsx.writeFile(workbook, filePath);

  res.download(filePath, 'employee_details.xlsx');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
