const express = require('express');
const mysql = require('mysql');

const app = express();

//creating a localhost database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'touchworld'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ', err);
    return;
  }
  console.log('Connected to the database!');
});


//creating first table
app.get('/createEmployeeTable', (req, res) => {
  const createEmployeeTable = `
    CREATE TABLE employee (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100),
      phone VARCHAR(20)
    )
  `

  connection.query(createEmployeeTable, (err) => {
    if (err) {
      res.send("Employee table already exists")
    } else {
      res.send("Employee table created")
    }
  });
});

//creating second table
app.get('/createEmployeeStatus', (req, res) => {
  const createEmployeeJobStatusTable = `
    CREATE TABLE employee_job_status (
      id INT AUTO_INCREMENT PRIMARY KEY,
      empId INT,
      jobsts ENUM('complete', 'cancel', 'pending'),
      FOREIGN KEY (empId) REFERENCES employee(id)
    )
  `
  connection.query(createEmployeeJobStatusTable, (err) => {
    if (err) {
      res.send("Employee job status table already exists")
    } else {
      res.send("Employee job status table created")
    }
  });
});

//inserting sample data to first table
app.get('/insertSampleEmployees', (req, res) => {
  const employees = [
    { name: 'Arun', email: 'Arun@example.com', phone: '1234567890' },
    { name: 'Jithin', email: 'Jithin@example.com', phone: '9876543210' },
    { name: 'Vinod', email: 'alice@example.com', phone: '5555234755' },
    { name: 'Manu', email: 'Vinod@example.com', phone: '9998679999' },
    { name: 'Aswin', email: 'Aswin@example.com', phone: '1119181111' }
  ];

  const insertQuery = 'INSERT INTO employee (name, email, phone) VALUES ?';
  const values = employees.map(employee => [employee.name, employee.email, employee.phone]);

  connection.query(insertQuery, [values], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error inserting sample employees' });
    }
    return res.status(200).json({ message: 'Sample employees inserted successfully' });
  });
});

//inserting some sample data to second table
app.get('/insertSampleJobStatus', (req, res) => {
  const jobStatus = [
    { empId: 1, status: 'complete' },
    { empId: 1, status: 'pending' },
    { empId: 1, status: 'cancel' },
    { empId: 2, status: 'cancel' },
    { empId: 2, status: 'complete' },
    { empId: 2, status: 'pending' },
    { empId: 3, status: 'pending' },
    { empId: 3, status: 'cancel' },
    { empId: 3, status: 'complete' },
    { empId: 4, status: 'complete' },
    { empId: 4, status: 'pending' },
    { empId: 4, status: 'cancel' },
    { empId: 5, status: 'cancel' },
    { empId: 5, status: 'complete' },
    { empId: 5, status: 'pending' },
  ];

  const insertQuery = 'INSERT INTO employee_job_status (empId, jobsts) VALUES ?';
  const values = jobStatus.map(status => [status.empId, status.status]);

  connection.query(insertQuery, [values], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error inserting sample job status' });
    }
    return res.status(200).json({ message: 'Sample job status inserted successfully' });
  });
});

//fetching data from both tables and join together
app.get('/getEmployeeStatus', (req, res) => {
  const query = `
    SELECT e.id, e.name, e.email, e.phone, s.jobsts AS job_status
    FROM employee e
    JOIN employee_job_status s ON e.id = s.empId
    JOIN (
      SELECT empId, MAX(id) AS max_id
      FROM employee_job_status
      GROUP BY empId
    ) t ON s.empId = t.empId AND s.id = t.max_id
  `;

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error retrieving employee status' });
    }
    return res.status(200).json({ data: results });
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

