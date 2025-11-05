// Test login API
const testUsername = process.argv[2] || 'HR-EMP-00001';

console.log(`Testing login with username: ${testUsername}`);

fetch('http://localhost:3001/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: testUsername })
})
  .then(res => {
    console.log('Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('Response:', data);
  })
  .catch(err => {
    console.error('Error:', err);
  });
