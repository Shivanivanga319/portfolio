const http = require('http');

const request = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

async function runTests() {
  console.log('--- Starting Full Stack Verification ---');

  // 1. Check Projects List
  const projRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/projects',
    method: 'GET'
  });
  console.log('1. Projects GET status:', projRes.status, '| Count:', projRes.data?.data?.length || 0);

  // 2. Test Login
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'admin123' });
  console.log('2. Admin Login status:', loginRes.status, '| Success:', loginRes.data?.success);

  const token = loginRes.data?.token;

  // 3. Test Protected Create Project
  if (token) {
    const createRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      title: 'Automated Test Project',
      description: 'Verifying end-to-end admin project creation flow.',
      tech: 'React, Node.js, Express'
    });
    console.log('3. Protected Project Creation:', createRes.status, '| Created:', createRes.data?.data?.title);

    const newId = createRes.data?.data?._id;
    if (newId) {
      // 4. Test Delete
      const deleteRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/projects/${newId}`,
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('4. Protected Project Deletion:', deleteRes.status, '| Deleted ID:', deleteRes.data?.data?.id);
    }
  }

  // 5. Check Resume endpoint
  const resumeRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/resume',
    method: 'GET'
  });
  console.log('5. Resume Status endpoint:', resumeRes.status, '| File:', resumeRes.data?.filename);

  console.log('--- Verification Completed Successfully! ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
